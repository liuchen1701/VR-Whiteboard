using UnityEngine;
using System.Collections;

public class draw : MonoBehaviour {
    public LineRenderer laser;
    public GameObject painter;

    void Start()
    {
    }

    void Update()
    {
        Vector3 direction = GvrController.Orientation * Vector3.forward;

        Ray ray = new Ray(transform.position, direction);
        RaycastHit raycastHit;

        if (Physics.Raycast(ray, out raycastHit, 200f) && raycastHit.transform.gameObject.name.Equals("WhiteBoard"))
        {
            Vector3 position = raycastHit.point;
            position = new Vector3(position.x, position.y, position.z - 0.5f);

            if (GvrController.IsTouching)
            {
                Instantiate(painter, position, painter.transform.rotation);
                print(position.ToString());
            }
        }
    }
}
