import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

class RigidBody {
    obj: THREE.Mesh;
    mass: number;
    velocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    isStationary: boolean;
    friction: number | undefined;
    isColliding: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    constructor(
        obj: THREE.Mesh = new THREE.Mesh(undefined, undefined),
        mass: number = 0,
        velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
        acceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0),
        isStationary: boolean = false,
        friction: number | undefined = undefined,
    ) {
        this.obj = obj;
        this.mass = mass;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.isStationary = isStationary;
        this.friction = friction;

        bodies.push(this);
    }

    public update(deltaTime: number): void {

        if (this.isStationary) return;

        // accel due to grav
        this.acceleration.y = -9.81;

        const collision = detectCollision(this.obj);
        if (collision) {
            const { result, rb } = collision;
            if (rb.isStationary) {
                if ((result.normal.y > 0 && this.velocity.y <= 0) || (result.normal.y < 0 && this.velocity.y >= 0)) {
                    this.velocity.y = 0;
                    this.acceleration.y = 0;


                }
                if ((result.normal.x > 0 && this.velocity.x <= 0) || (result.normal.x < 0 && this.velocity.x >= 0)) {
                    this.velocity.x = 0;
                    this.acceleration.x = 0;


                }
                if ((result.normal.z > 0 && this.velocity.z <= 0) || (result.normal.z < 0 && this.velocity.z >= 0)) {
                    this.velocity.z = 0;
                    this.acceleration.z = 0;


                }
            }
            if (rb.friction) {

                // Ff  = U * Fn
                // Ff = Umg
                /*
                const frictionForce = Math.abs(this.acceleration.y * this.mass * rb.friction) * deltaTime;

                if (Math.abs(this.velocity.x) > 0) {
                    if (Math.abs(this.velocity.x) >= frictionForce) {
                        this.velocity.x += (this.velocity.x > 0 ? -frictionForce : frictionForce);

                    } else {
                        this.velocity.x = 0;
                    }
                }
                */
                const f = new THREE.Vector3(0,-9.81, 0).clone().multiplyScalar(this.mass * rb.friction);
                const len = Math.abs(this.velocity.length());
                if (len > 0) {
                    if (len >= Math.abs(f.length())) {
                        console.log(f);
                        this.velocity.add(f);
                    } else {
                        this.velocity.set(0,0,0);
                    }
                }

            }
        }
        const i = rk4(this.obj.position, this.velocity, (x, v, dt) => {
            const g = this.acceleration.clone().multiplyScalar(this.mass);
            return g;
        }, deltaTime);
        this.velocity = i.velocity;
        this.obj.position.set(i.position.x, i.position.y, i.position.z)

    }
}

// code adapted from @Kartheyan's updated answer
// https://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
// takes a callback for what to do in case of a collision
const detectCollision = (obj: THREE.Mesh): ({ result: any, rb: RigidBody } | undefined) => {
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
            //
            // THIS COULD BE A PROBLEM
            //
            const rb = bodies.find(x => x.obj.uuid === result.object.uuid)!;
            return {
                result: result,
                rb: rb,
            }
        }
    }
    return undefined

};
// RK4 function
// code adapted from: https://mtdevans.com/index.html

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

    const xf = x.clone().add((v1.clone().add(v2.clone().multiplyScalar(2)).add(v3.clone().multiplyScalar(2)).add(v4.clone())).multiplyScalar(dt / 6));
    const vf = v.clone().add((a1.clone().add(a2.clone().multiplyScalar(2)).add(a3.clone().multiplyScalar(2)).add(a4.clone())).multiplyScalar(dt / 6));

    return { velocity: vf, position: xf }
}

const bodies: RigidBody[] = [];


// ------------------------------------- //

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
const fb = new RigidBody(floor, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true, 0.5);
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
    bodies.map(x => x.update(deltaTime));

    // render, update shit
    renderer.render(scene, camera);
    stats.update();

}

// ------------------------------------- //

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event: any) {
    var keyCode = event.which;
    if (keyCode == 32) {
        cb.velocity.x = 5;

    }
};
animate();