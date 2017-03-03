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
		float angle = Vector3.Angle (direction, Vector3.forward);
		float distance = 9.5f / Mathf.Cos(angle);
		print (distance.ToString ());
		GameObject.Find ("Laser").GetComponent<GvrLaserPointer> ().maxReticleDistance = distance;

		if (-15 < GameObject.Find ("Reticle").transform.position.x &&
			GameObject.Find ("Reticle").transform.position.x < 15 &&
			-5 < GameObject.Find ("Reticle").transform.position.y &&
			GameObject.Find ("Reticle").transform.position.x < 5)
        {
			Vector3 position = GameObject.Find ("Reticle").transform.position;
			//position = new Vector3 (position.x, position.y, position.z - 0.5f);

            if (GvrController.IsTouching)
            {
                Instantiate(painter, position, painter.transform.rotation);
                //print(position.ToString());
            }
        }
    }
}
