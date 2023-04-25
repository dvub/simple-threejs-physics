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

        bodies.push(this);
    }
    // setters
    public set obj(obj: THREE.Mesh) { this.#obj = obj }
    public set mass(mass: number) { this.#mass = mass }
    public set velocity(velocity: THREE.Vector3) { this.#velocity = velocity }
    public set acceleration(acceleration: THREE.Vector3) { this.#acceleration = acceleration }
    public set isStationary(isStationary: boolean) { this.#isStationary = isStationary }
    public set friction(friction: number | undefined) { this.#friction = friction }
    // getters
    public get obj() { return this.#obj }
    public get mass() { return this.#mass }
    public get velocity() { return this.#velocity }
    public get acceleration() { return this.#acceleration }
    public get isStationary() { return this.#isStationary }
    public get friction(): number | undefined { return this.#friction }

    public update(deltaTime: number) {

        if (this.isStationary) return;

        // accel due to grav
        this.acceleration.y = -9.81;

        const i = rk4(this.obj.position, this.velocity, (x,v,dt) => {
            const g = this.acceleration.y * this.mass;
            return new THREE.Vector3(0,g,0);
        }, deltaTime);
        
        detectCollision(this.obj, bodies, (result, r) => {
            
            if (r.isStationary) {

                if ((result.normal.y > 0 && this.velocity.y < 0) || (result.normal.y < 0 && this.velocity.y > 0)) {

                    i.velocity.y = 0;
                }
                if ((result.normal.x > 0 && this.velocity.x < 0) || (result.normal.x < 0 && this.velocity.x > 0)) {
                    i.velocity.x = 0;
                } 

                if ((result.normal.z > 0 && this.velocity.z < 0) || (result.normal.z < 0 && this.velocity.z > 0)) {
                    i.velocity.z = 0;
                }
            }
        });

        this.velocity  = i.velocity;

        this.obj.position.set(i.position.x, i.position.y, i.position.z);

                    /*
            if (r.friction) {

                // Ff  = U * Fn
                // Ff = Umg
                const frictionForce = Math.abs(this.acceleration.y * this.mass * r.friction * deltaTime);

                if (Math.abs(this.velocity.x) > 0) {

                    if (Math.abs(this.velocity.x) >= frictionForce) {

                        this.velocity.x += (this.velocity.x > 0 ? -frictionForce : frictionForce);

                    } else {

                        this.velocity.x = 0;
                    }
                }
            }
            */
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


renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.y = -5;
camera.lookAt(new THREE.Vector3(0, 0, -10));
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

document.body.appendChild(renderer.domElement);
document.body.appendChild(stats.dom);


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.z = -10;

/*
const material1 = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const cube1 = new THREE.Mesh(geometry, material1);
cube1.position.z = -10;
cube1.position.x = 3;
cube1.position.y = -2;
*/


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
wall2.position.x = 2;

const light = new THREE.AmbientLight(0x404040); // soft white light
const pl = new THREE.PointLight(0xFFFFFF, 1, 100);
pl.position.set(0, 5, -10);

// declare rigid bodies
const cb = new RigidBody(cube, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), false);
const fb = new RigidBody(floor, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true, 0.25);
// const cb1 = new RigidBody(cube1, 2, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), false);
/*
const wb = new RigidBody(wall, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
const wb1 = new RigidBody(wall2, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
*/

scene.add(cube);
// scene.add(cube1);
scene.add(floor);
//scene.add(wall);
//scene.add(wall2);
scene.add(light);
scene.add(pl);


function animate() {

    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();
    for (let i = 0; i < bodies.length; i++) {
        bodies[i].update(deltaTime);
    }

    // render, update shit
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

// code adapted from: https://mtdevans.com/index.html

// Converted from Python version: http://doswa.com/2009/01/02/fourth-order-runge-kutta-numerical-integration.html
function rk4(
    x: THREE.Vector3,
    v: THREE.Vector3,
    a: (_x: THREE.Vector3, _v: THREE.Vector3, _dt: number) => THREE.Vector3,
    dt: number
) {
    // Returns final (position, velocity) array after time dt has passed.
    //        x: initial position
    //        v: initial velocity
    //        a: acceleration function a(x,v,dt) (must be callable)
    //        dt: timestep
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

    const xf = x.clone().add((v1.clone().add(v2.clone().multiplyScalar(2)).add(v3.clone().multiplyScalar(2)).add(v4.clone())).multiplyScalar(dt / 6));
    const vf = v.clone().add((a1.clone().add(a2.clone().multiplyScalar(2)).add(a3.clone().multiplyScalar(2)).add(a4.clone())).multiplyScalar(dt / 6));

    return {
        position: xf,
        velocity: vf,
    };
}


document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event: any) {
    var keyCode = event.which;
    if (keyCode == 32) {
        cb.velocity.x = 5;

    }
};
animate();