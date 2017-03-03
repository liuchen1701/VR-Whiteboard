using UnityEngine;
using System.Collections;

public class Demo : MonoBehaviour {
	public LineRenderer laser;

	void Start () {
		Vector3[] initLaserPositions = new Vector3[ 2 ] { Vector3.zero, Vector3.zero };
		laser.SetPositions( initLaserPositions );
		laser.SetWidth( 0.01f, 0.01f );
	}

	void Update () {
		Quaternion ori = GvrController.Orientation;
		gameObject.transform.localRotation = ori;

		Vector3 v = GvrController.Orientation * Vector3.forward;

		ShootLaserFromTargetPosition( transform.position, v, 200f );
		laser.enabled = true;
	}

	void ShootLaserFromTargetPosition( Vector3 targetPosition, Vector3 direction, float length )
	{
		Ray ray = new Ray( targetPosition, direction );
		RaycastHit raycastHit;

		if( Physics.Raycast( ray, out raycastHit, length ) ) {
			GameObject fruitObject = raycastHit.transform.gameObject;
			if (fruitObject.tag == "FruitTag") {
				Destroy (raycastHit.transform.gameObject);
			}
		}

		Vector3 endPosition = targetPosition + ( length * direction );
		laser.SetPosition( 0, targetPosition );
		laser.SetPosition( 1, endPosition );
	}
}
