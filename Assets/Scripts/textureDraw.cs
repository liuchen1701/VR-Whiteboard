using UnityEngine;
using System.Collections;

public class textureDraw : MonoBehaviour {
    

    void Start()
    {
        
    }

    void Update()
    {        
        Texture2D texture = Texture2D.whiteTexture;

        //Texture2D texture = new Texture2D(1, 1);

        GetComponent<Renderer>().material.mainTexture = texture;

        //Vector3 pointerPos = GvrController.Orientation * Vector3.forward;

        Vector3 pointerPos = GvrController.ArmModel.pointerPosition;

        if (GvrController.IsTouching)
        {
            int x = (int)pointerPos.x;
            int y = (int)pointerPos.y;

            Debug.Log("x: " + x + " y: " + y);

            texture.SetPixel(x, y, Color.black);
            texture.Apply();
        }

        // Clear board
        if (GvrController.AppButton)
        {
            for (int y = 0; y < texture.height; y++)
            {
                for (int x = 0; x < texture.width; x++)
                {
                    Color color = Color.white;
                    texture.SetPixel(x, y, color);
                }
            }
            texture.Apply();
        }
    }

    /* Mouse Draw
	void Update ()
    {
        Texture2D texture = Texture2D.whiteTexture;

        GetComponent<Renderer>().material.mainTexture = texture;

        if (Input.GetMouseButtonDown(0))
        {
            Vector3 mousePos = Input.mousePosition;
            int x = (int)mousePos.x;
            int y = (int)mousePos.y;

            texture.SetPixel(x, y, Color.black);
            texture.Apply();
        }

        if ( Input.GetMouseButtonDown(1) )
        {
            for (int y = 0; y < texture.height; y++)
            {
                for (int x = 0; x < texture.width; x++)
                {
                    Color color = Color.white;
                    texture.SetPixel(x, y, color);
                }
            }
            texture.Apply();
            Debug.Log("Mouse Clicked");
        }
    }
    */

}
