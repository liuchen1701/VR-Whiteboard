// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

Shader "Brush/Special/Toon" {
Properties {
	_MainTex ("Base (RGB) Trans (A)", 2D) = "white" {}
	_OutlineMax("Maximum outline size", Range(0, .5)) = .005
}

CGINCLUDE
	#include "UnityCG.cginc"
	#include "../../../Shaders/Brush.cginc"
	#include "Assets/ThirdParty/Noise/Shaders/Noise.cginc"
	#pragma multi_compile __ AUDIO_REACTIVE
	#pragma target 3.0
	sampler2D _MainTex;
	float4 _MainTex_ST;
	float _OutlineMax;

	struct appdata_t {
		float4 vertex : POSITION;
		fixed4 color : COLOR;
		float3 normal : NORMAL;
		float4 tangent : TANGENT;
		float2 texcoord : TEXCOORD0;
	};

	struct v2f {
		float4 vertex : SV_POSITION;
		fixed4 color : COLOR;
		float2 texcoord : TEXCOORD0;
	};
	 
	v2f vertInflate (appdata_t v, float inflate)
	{

		v2f o;
		float outlineEnabled = inflate;
		float radius = v.tangent.w * 0.1;  // TODO: Use raw secondary coordinates once supported
		v.tangent.w = 1.0;
		inflate *= radius * .4;
		float bulge = 0.0;

#ifdef AUDIO_REACTIVE
		float fft = tex2Dlod(_FFTTex, float4(_BeatOutputAccum.z*.25 + v.texcoord.x, 0,0,0)).g;
		bulge = fft * radius * 10.0;
#endif 

		//
		// Careful: perspective projection is non-afine, so math assumptions may not be valid here.
		//

		// Technically these are not yet in NDC because they haven't been divided by W, so their
		// range is currently [-W, W].
		o.vertex = mul(UNITY_MATRIX_MVP, float4(v.vertex.xyz + v.normal.xyz * bulge, v.vertex.w));
		float4 outline_NDC = mul(UNITY_MATRIX_MVP,
								 float4(v.vertex.xyz + v.normal.xyz * inflate, v.vertex.w));

		// Displacement in proper NDC coords (e.g. [-1, 1])
		float3 disp = outline_NDC.xyz / outline_NDC.w - o.vertex.xyz / o.vertex.w;

		// Magnitude is a scaling factor to shrink large outlines down to a max width, in NDC space.
		// Notice here we're only measuring 2D displacment in X and Y.
		float mag = length(disp.xy);
		mag = min(_OutlineMax, mag) / mag;

		// Ideally we would project back into world space to do the scaling, but the inverse
		// projection matrix is not currently available. So instead, we multiply back in the w
		// component so both sides of the += operator below are in the same space. Also note
		// that the w component is a function of depth, so modifying X and Y independent of Z
		// should mean that the original w value remains valid.
		o.vertex.xyz += float3(disp.xy * mag, disp.z) * o.vertex.w * outlineEnabled;
		
		// Push Z back to avoid z-fighting when scaled very small. This is not legit,
		// mathematically speaking and likely causes crazy surface derivitives.
		o.vertex.z -= disp.z * o.vertex.w * outlineEnabled;

		o.color = v.color;
	    o.color.a = 1;
	    o.color.xyz += v.normal.y *.2;
	    o.texcoord = TRANSFORM_TEX(v.texcoord,_MainTex);
		return o;
	}

	v2f vert (appdata_t v)
	{
		return vertInflate(v,0);
	}

	v2f vertEdge (appdata_t v)
	{
		return vertInflate(v, 1.0);
	}

	fixed4 fragBlack (v2f i) : SV_Target
	{			
		return float4(0,0,0,1);
	}

	fixed4 fragColor (v2f i) : SV_Target
	{
		return i.color;
	}

ENDCG



SubShader {
	Cull Back
	Pass{
		CGPROGRAM
		#pragma vertex vert
		#pragma fragment fragColor
		ENDCG
		}

	Cull Front
	Pass{
		CGPROGRAM
		#pragma vertex vertEdge
		#pragma fragment fragBlack
		ENDCG
		}
	}
Fallback "Diffuse"
}
