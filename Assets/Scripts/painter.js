#pragma strict
import GUIControls;

var baseTex : Texture2D;

private var dragStart : Vector2;
private var dragEnd : Vector2;
enum Tool {
	None,
	Line,
	Brush,
	Eraser,
	Vector
}
private var tool2 : int = 1;
var AntiAlias : Samples = Samples.Samples4;
var tool : Tool = Tool.Line;
var toolimgs : Texture[];
var colorCircle : Texture2D;
var lineWidth : float = 1;
var strokeWidth : float = 1;
var col : Color = Color.white;
var col2 : Color = Color.white;
var gskin : GUISkin;
var lineTool : LineTool;
var brush : BrushTool;
var eraser : EraserTool;
var stroke : Stroke;
var zoom : int = 1;
var BezierPoints : BezierPoint[];
function OnGUI () {
	GUI.skin = gskin;
	
	GUILayout.BeginArea (Rect (5,5,100+baseTex.width*zoom,baseTex.height*zoom),"","Box");
	GUILayout.BeginArea (Rect (0,0,100,baseTex.height*zoom));
	tool2 = GUILayout.Toolbar (tool2,toolimgs,"Tool");
	tool = System.Enum.Parse (Tool,tool2.ToString ());
	GUILayout.Label ("Drawing Options");
	GUILayout.Space (10);
	switch (tool) {
		case Tool.Line:
			GUILayout.Label ("Size "+ Mathf.Round (lineTool.width*10)/10);
			lineTool.width = GUILayout.HorizontalSlider (lineTool.width,0,40);
			col = RGBCircle (col,"",colorCircle);
			break;
		case Tool.Brush:
			GUILayout.Label ("Size "+ Mathf.Round (brush.width*10)/10);
			brush.width = GUILayout.HorizontalSlider (brush.width,0,40);
			GUILayout.Label ("Hardness " + Mathf.Round (brush.hardness*10)/10);
			brush.hardness = GUILayout.HorizontalSlider (brush.hardness,0.1,50);
			col = RGBCircle (col,"",colorCircle);
			break;
		case Tool.Eraser:
			GUILayout.Label ("Size "+ Mathf.Round (eraser.width*10)/10);
			eraser.width = GUILayout.HorizontalSlider (eraser.width,0,50);
			GUILayout.Label ("Hardness " + Mathf.Round (eraser.hardness*10)/10);
			eraser.hardness = GUILayout.HorizontalSlider (eraser.hardness,1,50);
			break;
		break;
	}
	
	if (tool==Tool.Line) {
		stroke.enabled = GUILayout.Toggle (stroke.enabled,"Stroke");
		GUILayout.Label ("Stroke Width "+ Mathf.Round (stroke.width*10)/10);
		stroke.width = GUILayout.HorizontalSlider (stroke.width,0,lineWidth);
		GUILayout.Label ("Secondary Color");
		col2 = RGBCircle (col2,"",colorCircle);
	}
	
	GUILayout.EndArea ();
	GUI.DrawTexture (Rect (100,0,baseTex.width*zoom,baseTex.height*zoom),baseTex);
	GUILayout.EndArea ();
}
private var preDrag : Vector2;
function Update () {
	var imgRect : Rect = Rect (5+100,5,baseTex.width*zoom,baseTex.height*zoom);
	var mouse : Vector2 = Input.mousePosition;
	mouse.y = Screen.height-mouse.y;
	
	if (Input.GetKeyDown ("t")) {
		test ();
	}
	if (Input.GetKeyDown ("mouse 0")) {
		
		if (imgRect.Contains (mouse)) {
			if (tool==Tool.Vector) {
				m2 = mouse-Vector2(imgRect.x,imgRect.y);
				m2.y = imgRect.height-m2.y;
				bz = new Array (BezierPoints);
				bz.Add (BezierPoint (m2,m2-Vector2(50,10),m2+Vector2(50,10)));
				BezierPoints = bz.ToBuiltin (BezierPoint);
				Drawing.DrawBezier (BezierPoints,lineTool.width,col,baseTex);
			}
			
			dragStart = mouse - Vector2 (imgRect.x,imgRect.y);
			dragStart.y =imgRect.height-dragStart.y;
			dragStart.x = Mathf.Round (dragStart.x/zoom);
			dragStart.y = Mathf.Round (dragStart.y/zoom);
			//LineStart (mouse - Vector2 (imgRect.x,imgRect.y));
			
			dragEnd = mouse - Vector2 (imgRect.x,imgRect.y);
			dragEnd.x = Mathf.Clamp (dragEnd.x,0,imgRect.width);
			dragEnd.y = imgRect.height-Mathf.Clamp (dragEnd.y,0,imgRect.height);
			dragEnd.x = Mathf.Round ( dragEnd.x/zoom);
			dragEnd.y = Mathf.Round ( dragEnd.y/zoom);
		} else {
			dragStart=Vector3.zero;
		}
		
	}
	if (Input.GetKey ("mouse 0")) {
		if (dragStart==Vector3.zero) {
			return;
		}
		dragEnd = mouse - Vector2 (imgRect.x,imgRect.y);
		dragEnd.x = Mathf.Clamp (dragEnd.x,0,imgRect.width);
		dragEnd.y = imgRect.height-Mathf.Clamp (dragEnd.y,0,imgRect.height);
		dragEnd.x = Mathf.Round ( dragEnd.x/zoom);
		dragEnd.y = Mathf.Round ( dragEnd.y/zoom);
		
		if (tool==Tool.Brush) {
			Brush (dragEnd,preDrag);
		}
		if (tool==Tool.Eraser) {
			Eraser (dragEnd,preDrag);
		}
		
	}
	if (Input.GetKeyUp ("mouse 0") && dragStart != Vector2.zero) {
		if (tool==Tool.Line) {
			dragEnd = mouse - Vector2 (imgRect.x,imgRect.y);
			dragEnd.x = Mathf.Clamp (dragEnd.x,0,imgRect.width);
			dragEnd.y = imgRect.height-Mathf.Clamp (dragEnd.y,0,imgRect.height);
			dragEnd.x = Mathf.Round ( dragEnd.x/zoom);
			dragEnd.y = Mathf.Round ( dragEnd.y/zoom);
			Debug.Log ("Draw Line");
			Drawing.NumSamples=AntiAlias;
			if (stroke.enabled) {
				baseTex = Drawing.DrawLine (dragStart,dragEnd,lineTool.width,col,baseTex,true,col2,stroke.width);
			} else {
				baseTex = Drawing.DrawLine (dragStart,dragEnd,lineTool.width,col,baseTex);
			}
		}
		dragStart=Vector2.zero;
		dragEnd=Vector2.zero;
	}
	preDrag = dragEnd;
}

function Brush (p1 : Vector2,p2 : Vector2) {
	Drawing.NumSamples=AntiAlias;
	if (p2 == Vector3.zero) {
		p2 = p1;
	}
	Drawing.PaintLine (p1,p2,brush.width,col,brush.hardness,baseTex);
	baseTex.Apply ();
}

function Eraser (p1 : Vector2,p2 : Vector2) {
	Drawing.NumSamples=AntiAlias;
	if (p2 == Vector3.zero) {
		p2 = p1;
	}
	Drawing.PaintLine (p1,p2,eraser.width,Color.white,eraser.hardness,baseTex);
	baseTex.Apply ();
}

function test () {
	var startTime : float = Time.realtimeSinceStartup;
	w = 100;
	h = 100;
	p1 = new BezierPoint (Vector2(10,0),Vector2(5,20),Vector2(20,0));
	p2 = new BezierPoint (Vector2(50,10),Vector2(40,20),Vector2(60,-10));
	c = new BezierCurve (p1.main,p1.control2,p2.control1,p2.main);
	p1.curve2=c;
	p2.curve1=c;
	var elapsedTime : Vector2 = Vector2 ((Time.realtimeSinceStartup-startTime)*10,0);
	var startTime2 : float = Time.realtimeSinceStartup;
	for (i=0;i<w*h;i++) {
		Mathfx.IsNearBezier (Vector2(Random.value*80,Random.value*30),p1,p2,10);
	}
	
	var elapsedTime2 : Vector2 = Vector2 ((Time.realtimeSinceStartup-startTime2)*10,0);
	Debug.Log ("Drawing took " + elapsedTime.ToString () + "  "+ elapsedTime2.ToString ());
	
}

class LineTool {
	var width : float = 1;
}
class EraserTool {
	var width : float = 1;
	var hardness : float = 1;
}
class BrushTool {
	var width : float = 1;
	var hardness : float = 0;
	var spacing : float = 10;
}
class Stroke {
	var enabled = false;
	var width : float = 1;
}