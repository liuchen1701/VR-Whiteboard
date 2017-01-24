using UnityEngine;
using System.Collections;

public class draw : MonoBehaviour {

    public Material material;

    void Start()
    {
    }

    void Update()
    {
        Texture2D texture = (Texture2D)material.GetTexture("white");

        Vector3 direction = GvrController.Orientation * Vector3.forward;

        Ray ray = new Ray(transform.position, direction);
        RaycastHit raycastHit;

        if (Physics.Raycast(ray, out raycastHit, 200f) && raycastHit.transform.gameObject.name.Equals("Whiteboard"))
        {
            Vector3 hitPosition = raycastHit.point;
            int x = (int)hitPosition.x;
            int y = (int)hitPosition.y;
            
            if (GvrController.IsTouching)
            {
                for(int i = -10; i <= 10; i++)
                {
                    for(int j = -10; j <= 10; j++)
                    {
                        texture.SetPixel(x + i, y + j, Color.black);
                    }
                    
                }
                
                texture.Apply();
                material.SetTexture("drawing", texture);
            }
        }
    }
}
