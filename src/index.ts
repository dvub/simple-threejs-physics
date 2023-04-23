import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

class RigidBody {
    #obj: THREE.Mesh;
    #mass: number;
    #velocity: THREE.Vector3;
    #acceleration: THREE.Vector3;
    #isStationary: boolean;
    #friction: number | undefined;
    #frictionApplied: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    #isColliding: boolean = false;

    constructor(
        obj: THREE.Mesh = new THREE.Mesh(undefined, undefined),
        mass: number = 0,
        velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
        acceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
        isStationary: boolean = false,
        friction: number | undefined = undefined,
    ) {
        this.#obj = obj;
        this.#mass = mass;
        this.#velocity = velocity;
        this.#acceleration = acceleration;
        this.#isStationary = isStationary;
        this.#friction = friction;
    }
    // setters
    public set obj(obj: THREE.Mesh) { this.#obj = obj }
    public set mass(mass: number) { this.#mass = mass }
    public set velocity(velocity: THREE.Vector3) { this.#velocity = velocity }
    public set acceleration(acceleration: THREE.Vector3) {this.#acceleration = acceleration  }
    public set isStationary(isStationary: boolean) { this.#isStationary = isStationary }
    public set friction(friction: number) { this.#friction = friction }
    // getters
    public get obj() { return this.#obj }
    public get mass() { return this.#mass }
    public get velocity() { return this.#velocity }
    public get acceleration() { return this.#acceleration }
    public get isStationary() { return this.#isStationary }
    public get friction(): number | undefined { return this.#friction }

    public update(deltaTime: number) {
        this.#isColliding = false;

        if (this.isStationary) return;

        // accel due to grav
        this.acceleration.y = -9.81;
        // v = v0 + at
        // velocity += acceleration * time
        this.velocity.add(this.#acceleration.clone().multiplyScalar(this.mass * deltaTime));

        // collision response implementation, extra dynamics due to collision go here
        detectCollision(this.#obj, bodies, (result, r) => {
            this.#isColliding = true;

            if (r.isStationary) {

                if ((result.normal.y > 0 && this.velocity.y < 0) || (result.normal.y < 0 && this.velocity.y > 0)) this.velocity.y = 0;

                if ((result.normal.x > 0 && this.velocity.x < 0) || (result.normal.x < 0 && this.velocity.x > 0)) this.velocity.x = 0;

                if ((result.normal.z > 0 && this.velocity.z < 0) || (result.normal.z < 0 && this.velocity.z > 0)) this.velocity.z = 0;
            }


            if (r.friction) {

                // Ff  = U * Fn
                // Ff = Umg
                const frictionForce = Math.abs(this.acceleration.y * this.mass * r.friction);

                if (this.#frictionApplied.x === 0 && Math.abs(this.velocity.x) > 0) {

                    if (Math.abs(this.velocity.x) >= frictionForce) {

                        this.velocity.x += (this.velocity.x > 0 ? -frictionForce : frictionForce);

                    } else {

                        this.velocity.x = 0;
                    }
                    this.#frictionApplied.x = 1;
                }
                if (this.velocity.x === 0) this.#frictionApplied.x = 0;

                
                if (this.#frictionApplied.z === 0 && Math.abs(this.velocity.z) > 0) {

                    if (Math.abs(this.velocity.z) >= frictionForce) {

                        this.velocity.z += (this.velocity.z > 0 ? -frictionForce : frictionForce);

                    } else {

                        this.velocity.z = 0;
                    }
                    this.#frictionApplied.z = 1;
                }
                if (this.velocity.z === 0) this.#frictionApplied.z = 0;
            }


        });

        // transform
        this.obj.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    }
}
const bodies: RigidBody[] = [];

// ------------------------------------- //

// idk

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const stats = new Stats();
const controls = new OrbitControls(camera, renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.y = -5;

controls.update();

document.body.appendChild(renderer.domElement);
document.body.appendChild(stats.dom);


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.z = -10;


const floorGeometry = new THREE.BoxGeometry(10, 0.1, 5);
const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xff00ff });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -3;
floor.position.z = -10;


const wall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5, 5), floorMaterial);
wall.position.y = -3;
wall.position.z = -10;
wall.position.x = 2.5;
const wall2 = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 0.1), floorMaterial);
wall2.position.y = -3;
wall2.position.z = -12.5;
wall2.position.x = 0;

const light = new THREE.AmbientLight(0x404040); // soft white light
const pl = new THREE.PointLight(0xFFFFFF, 1, 100);
pl.position.set(0, 5, -10);

// declare rigid bodies
const cb = new RigidBody(cube, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), false);
const fb = new RigidBody(floor, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
const wb = new RigidBody(wall, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
const wb1 = new RigidBody(wall2, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);

scene.add(cube);
scene.add(floor);
//scene.add(wall);
//scene.add(wall2);
scene.add(light);
scene.add(pl);


bodies.push(cb);
bodies.push(fb);
//bodies.push(wb);
//bodies.push(wb1);

function animate() {

    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    for (let i = 0; i < bodies.length; i++) {
        bodies[i].update(deltaTime);
    }

    renderer.render(scene, camera);
    stats.update();

}

// ------------------------------------- //

// code adapted from @Kartheyan's updated answer
// https://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
// takes a callback for what to do in case of a collision
const detectCollision = (
    obj: THREE.Mesh,
    bodies: RigidBody[],
    onCollision: (
        result: any,
        rb: RigidBody
    ) => void
) => {
    const meshes = bodies.map(x => x.obj);
    const n = obj.geometry.attributes.position.count;
    for (let i = 0; i < n; i++) {
        const local: THREE.Vector3 = new THREE.Vector3().fromBufferAttribute(obj.geometry.attributes.position as THREE.BufferAttribute, i).clone();
        const global: THREE.Vector3 = local.applyMatrix4(obj.matrix);
        const direction: THREE.Vector3 = global.sub(obj.position);
        const ray: THREE.Raycaster = new THREE.Raycaster(obj.position, direction.clone().normalize());
        const results = ray.intersectObjects(meshes);
        const result = results[0];
        if (results.length > 0 && result.distance < direction.length()) {
            const r = bodies.find(x => x.obj.uuid === result.object.uuid);
            onCollision(result, r!);
        }
    }
};

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event: any) {
    var keyCode = event.which;
    if (keyCode == 32) {
        cb.velocity.x = -5;

    }
};
document.addEventListener("keyup", onDocumentKeyUp, false);
function onDocumentKeyUp(event: any) {
    var keyCode = event.which;
    if (keyCode == 32) {
        cb.velocity.x = 0;

    }
};


animate();