import * as THREE from 'three';
// TODO: 
// don't calculate integrations at all in update() if no acceleration..?
const GRAVITATIONAL_ACCEL = -9.81;
const ZERO = new THREE.Vector3(0,0,0);
//
function update(deltaTime: number): void {
  bodies.map((x) => x.update(deltaTime));
}

class RigidBody {

  // constants
  obj: THREE.Mesh;
  mass: number;
  // some dynamics /response stuff
  isStationary: boolean;
  friction: number | undefined;
  // secondary
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3; 
  // primary translational/linear value
  force: THREE.Vector3;
  momentum: THREE.Vector3;

  // primary rot value
  orientation: THREE.Quaternion;
  angularMomentum: THREE.Vector3;
  // secondary rot values
  spin: THREE.Quaternion;
  angularVelocity: THREE.Vector3;
  // constant rotational value
  inertia: number;

  // i am so sorry

  constructor(
    obj = new THREE.Mesh(undefined, undefined),
    mass = 0.0,
    velocity = ZERO,
    acceleration = ZERO,
    isStationary = false,
    friction: number | undefined = undefined,
    force = ZERO,
    momentum = ZERO,
    orientation = new THREE.Quaternion(0,0,0,0),
    angularMomentum = ZERO,
    spin = new THREE.Quaternion(0,0,0,0),
    angularVelocity = ZERO,
    inertia = 0.0,

  ) {
    
    this.obj = obj;
    this.mass = mass;
    this.velocity = velocity;
    this.acceleration = acceleration;
    this.isStationary = isStationary;
    this.friction = friction;
    this.force = force;
    this.momentum = momentum;
    this.orientation = orientation;
    this.angularMomentum = angularMomentum;
    this.spin = spin;
    this.angularVelocity = angularVelocity;
    this.inertia = inertia;

    bodies.push(this);
    
  }

  // function to update the state of the rigidbody
  // a HUGE thanks to Glenn Fiedler and their resources on physics:
  // https://gafferongames.com/post/physics_in_3d/
  //
  /**
   *
   * @param {number} deltaTime - The timestep (in seconds) by which to simulate future state.
   */
  public update(deltaTime: number): void {
    // stationary objects will not have any dynamics
    if (this.isStationary) return;

    // grav constant is 9.81 m/s^2
    this.acceleration = new THREE.Vector3(0, GRAVITATIONAL_ACCEL, 0);

    // collision response
    const collision = detectCollision(this.obj);
    if (collision) {
      const { result, rb } = collision;

      // if the object in collision is stationary,
      // we need to stop movement and acceleration (?) in the particular axis

      if (rb.isStationary) {
        if (
          (result.normal.y > 0 && this.velocity.y <= 0) ||
          (result.normal.y < 0 && this.velocity.y >= 0)
        ) {
          this.velocity.y = 0;
          this.acceleration.y = 0;
        }
        if (
          (result.normal.x > 0 && this.velocity.x <= 0) ||
          (result.normal.x < 0 && this.velocity.x >= 0)
        ) {
          this.velocity.x = 0;
          this.acceleration.x = 0;
        }
        if (
          (result.normal.z > 0 && this.velocity.z <= 0) ||
          (result.normal.z < 0 && this.velocity.z >= 0)
        ) {
          this.velocity.z = 0;
          this.acceleration.z = 0;
        }
      }
      // if the colliding object is NOT stationary,
      // we need to do some calculations for collisions
      if (!rb.isStationary) {
        // derived from elastic collision equation
        // as well as conserved energy derived equation

        // m1v1i + m2v2i = m1v1f + m2v2f
        // v1i + v1f = v2i + v2f

        // we can build a system to solve for v1f and v2f

        const m1v1i = this.velocity.clone().multiplyScalar(this.mass * 2);
        const m2v2i = rb.velocity.clone().multiplyScalar(rb.mass);
        const m1v2i = rb.velocity.clone().multiplyScalar(this.mass);

        const v2f = m1v1i
          .add(m2v2i)
          .sub(m1v2i)
          .divideScalar(this.mass + rb.mass);
        const v1f = rb.velocity.clone().add(v2f).sub(this.velocity.clone());

        this.velocity = v1f;
        rb.velocity = v2f;
      }

      if (rb.friction) {
        /*
        // Ff  = U * Fn
        // Ff = Umg
        
        const frictionForce = Math.abs(this.acceleration.y * this.mass * rb.friction) * deltaTime;

        if (Math.abs(this.velocity.x) > 0) {
            if (Math.abs(this.velocity.x) >= frictionForce) {
                this.velocity.x += (this.velocity.x > 0 ? -frictionForce : frictionForce);

            } else {
                this.velocity.x = 0;
            }
        }
        

        // const frictionForce = (-9.81 * this.mass * rb.friction)* deltaTime;
        const f = new THREE.Vector3(0,-9.81, 0).clone().multiplyScalar(this.mass * rb.friction * deltaTime);


        const p = new THREE.Vector3(0, 0, -(f.x + f.y) / f.z);

        const len = Math.abs(this.velocity.length());
        if (len > 0) {
            if (len >= Math.abs(f.length())) {
                this.velocity.add(p);
            } else {
                this.velocity.set(0,0,0);
            }
        }
        */
      }
    }

    // momentum is defined as p = mv
    // our first integration takes force and momentum
    // F = dp/dt
    
    const newMomentum = rk4(
      this.momentum,
      this.force,
      (x, v, dt) => {
        return this.acceleration.clone();
      },
      deltaTime
    );

    // momentum has changed, thus, we have to update velocity
    if (!this.momentum.equals(newMomentum.x)) {
      // now, recalculate velocity given our integrated force/momentum
      this.velocity = newMomentum.x.divideScalar(this.mass);
    }

    // second integration take place to get new position and velocity
    const i = rk4(
      this.obj.position,
      this.velocity,
      (x, v, dt) => {

        return this.acceleration.clone();
      },
      deltaTime
    );
    
    // if the updated values are different, then we update velocity and position
    if (!this.velocity.equals(i.y)) {
      this.velocity = i.y;
    }
    if (!this.obj.position.equals(i.x)) {
      this.obj.position.set(i.x.x, i.x.y, i.x.z);
    }
    
  }
}

// code adapted from @Kartheyan's updated answer
// https://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
// takes a callback for what to do in case of a collision

// this method uses raycasting to detect collisions
// TODO: implement better collision detection
const detectCollision = (
  obj: THREE.Mesh
): { result: any; rb: RigidBody } | undefined => {
  const meshes = bodies.map((x) => x.obj);

  const n = obj.geometry.attributes.position.count;

  for (let i = 0; i < n; i++) {
    const local: THREE.Vector3 = new THREE.Vector3()
      .fromBufferAttribute(
        obj.geometry.attributes.position as THREE.BufferAttribute,
        i
      )
      .clone();
    const global: THREE.Vector3 = local.applyMatrix4(obj.matrix);
    const direction: THREE.Vector3 = global.sub(obj.position);

    const ray: THREE.Raycaster = new THREE.Raycaster(
      obj.position,
      direction.clone().normalize()
    );

    const results = ray.intersectObjects(meshes);
    const result = results[0];

    if (results.length > 0 && result.distance < direction.length()) {
      //
      // THIS COULD BE A PROBLEM
      //
      // find the colliding body by uuid
      const rb = bodies.find((x) => x.obj.uuid === result.object.uuid)!;
      return {
        result: result,
        rb: rb,
      };
    }
  }
  return undefined;
};
// RK4 function
// code adapted from: https://mtdevans.com/index.html
// altered to support vector3's

// Converted from Python version: http://doswa.com/2009/01/02/fourth-order-runge-kutta-numerical-integration.html
const rk4 = (
  x: THREE.Vector3,
  v: THREE.Vector3,
  a: (_x: THREE.Vector3, _v: THREE.Vector3, _dt: number) => THREE.Vector3,
  dt: number
) => {
  // ... original comments removed
  const x1 = x.clone();
  const v1 = v.clone();
  const a1 = a(x1.clone(), v1.clone(), 0);

  const x2 = x.clone().add(v1.clone().multiplyScalar(0.5 * dt));
  const v2 = v.clone().add(a1.clone().multiplyScalar(0.5 * dt));

  const a2 = a(x2.clone(), v2.clone(), dt / 2);

  const x3 = x.clone().add(v2.clone().multiplyScalar(0.5 * dt));
  const v3 = v.clone().add(a2.clone().multiplyScalar(0.5 * dt));
  const a3 = a(x3.clone(), v3.clone(), dt / 2);

  const x4 = x.clone().add(v3.multiplyScalar(dt));
  const v4 = v.clone().add(a3.multiplyScalar(dt));
  const a4 = a(x4.clone(), v4.clone(), dt);

  const xf = x.clone().add(
    v1
      .clone()
      .add(v2.clone().multiplyScalar(2))
      .add(v3.clone().multiplyScalar(2))
      .add(v4.clone())
      .multiplyScalar(dt / 6)
  );
  const vf = v.clone().add(
    a1
      .clone()
      .add(a2.clone().multiplyScalar(2))
      .add(a3.clone().multiplyScalar(2))
      .add(a4.clone())
      .multiplyScalar(dt / 6)
  );

  return { y: vf, x: xf };
};

const bodies: RigidBody[] = [];

export { RigidBody, update }