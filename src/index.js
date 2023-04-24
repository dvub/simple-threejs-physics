var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RigidBody_obj, _RigidBody_mass, _RigidBody_velocity, _RigidBody_acceleration, _RigidBody_isStationary, _RigidBody_friction, _RigidBody_frictionApplied, _RigidBody_isColliding;
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
class RigidBody {
    constructor(obj = new THREE.Mesh(undefined, undefined), mass = 0, velocity = new THREE.Vector3(0, 0, 0), acceleration = new THREE.Vector3(0, 0, 0), isStationary = false, friction = undefined) {
        _RigidBody_obj.set(this, void 0);
        _RigidBody_mass.set(this, void 0);
        _RigidBody_velocity.set(this, void 0);
        _RigidBody_acceleration.set(this, void 0);
        _RigidBody_isStationary.set(this, void 0);
        _RigidBody_friction.set(this, void 0);
        _RigidBody_frictionApplied.set(this, new THREE.Vector3(0, 0, 0));
        _RigidBody_isColliding.set(this, false);
        __classPrivateFieldSet(this, _RigidBody_obj, obj, "f");
        __classPrivateFieldSet(this, _RigidBody_mass, mass, "f");
        __classPrivateFieldSet(this, _RigidBody_velocity, velocity, "f");
        __classPrivateFieldSet(this, _RigidBody_acceleration, acceleration, "f");
        __classPrivateFieldSet(this, _RigidBody_isStationary, isStationary, "f");
        __classPrivateFieldSet(this, _RigidBody_friction, friction, "f");
        bodies.push(this);
    }
    // setters
    set obj(obj) { __classPrivateFieldSet(this, _RigidBody_obj, obj, "f"); }
    set mass(mass) { __classPrivateFieldSet(this, _RigidBody_mass, mass, "f"); }
    set velocity(velocity) { __classPrivateFieldSet(this, _RigidBody_velocity, velocity, "f"); }
    set acceleration(acceleration) { __classPrivateFieldSet(this, _RigidBody_acceleration, acceleration, "f"); }
    set isStationary(isStationary) { __classPrivateFieldSet(this, _RigidBody_isStationary, isStationary, "f"); }
    set friction(friction) { __classPrivateFieldSet(this, _RigidBody_friction, friction, "f"); }
    // getters
    get obj() { return __classPrivateFieldGet(this, _RigidBody_obj, "f"); }
    get mass() { return __classPrivateFieldGet(this, _RigidBody_mass, "f"); }
    get velocity() { return __classPrivateFieldGet(this, _RigidBody_velocity, "f"); }
    get acceleration() { return __classPrivateFieldGet(this, _RigidBody_acceleration, "f"); }
    get isStationary() { return __classPrivateFieldGet(this, _RigidBody_isStationary, "f"); }
    get friction() { return __classPrivateFieldGet(this, _RigidBody_friction, "f"); }
    update(deltaTime) {
        __classPrivateFieldSet(this, _RigidBody_isColliding, false, "f");
        if (this.isStationary)
            return;
        // accel due to grav
        this.acceleration.y = -9.81;
        // v = v0 + at
        // velocity += acceleration * time
        const o = rk4(this.obj.position.x, __classPrivateFieldGet(this, _RigidBody_velocity, "f").x, (x, v, dt) => {
            return 0;
        }, deltaTime);
        const t = rk4(this.obj.position.y, __classPrivateFieldGet(this, _RigidBody_velocity, "f").y, (x, v, dt) => {
            return this.acceleration.y * this.mass;
        }, deltaTime);
        const y = rk4(this.obj.position.z, __classPrivateFieldGet(this, _RigidBody_velocity, "f").z, (x, v, dt) => {
            return 0;
        }, deltaTime);
        this.velocity.x = o.velocity;
        this.velocity.y = t.velocity;
        this.velocity.z = y.velocity;
        // collision response implementation, extra dynamics due to collision go here
        detectCollision(__classPrivateFieldGet(this, _RigidBody_obj, "f"), bodies, (result, r) => {
            __classPrivateFieldSet(this, _RigidBody_isColliding, true, "f");
            if (r.isStationary) {
                if ((result.normal.y > 0 && this.velocity.y < 0) || (result.normal.y < 0 && this.velocity.y > 0)) {
                    this.velocity.y = 0;
                }
                if ((result.normal.x > 0 && this.velocity.x < 0) || (result.normal.x < 0 && this.velocity.x > 0)) {
                    this.velocity.x = 0;
                }
                if ((result.normal.z > 0 && this.velocity.z < 0) || (result.normal.z < 0 && this.velocity.z > 0)) {
                    this.velocity.z = 0;
                }
            }
            else {
            }
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
        });
        this.obj.position.x = o.position;
        this.obj.position.y = t.position;
        this.obj.position.z = y.position;
    }
}
_RigidBody_obj = new WeakMap(), _RigidBody_mass = new WeakMap(), _RigidBody_velocity = new WeakMap(), _RigidBody_acceleration = new WeakMap(), _RigidBody_isStationary = new WeakMap(), _RigidBody_friction = new WeakMap(), _RigidBody_frictionApplied = new WeakMap(), _RigidBody_isColliding = new WeakMap();
const bodies = [];
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
// const cb1 = new RigidBody(cube1, 2, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), false);
const fb = new RigidBody(floor, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true, 0.25);
const wb = new RigidBody(wall, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
const wb1 = new RigidBody(wall2, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
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
const detectCollision = (obj, bodies, onCollision) => {
    const meshes = bodies.map(x => x.obj);
    const n = obj.geometry.attributes.position.count;
    for (let i = 0; i < n; i++) {
        const local = new THREE.Vector3().fromBufferAttribute(obj.geometry.attributes.position, i).clone();
        const global = local.applyMatrix4(obj.matrix);
        const direction = global.sub(obj.position);
        const ray = new THREE.Raycaster(obj.position, direction.clone().normalize());
        const results = ray.intersectObjects(meshes);
        const result = results[0];
        if (results.length > 0 && result.distance < direction.length()) {
            const r = bodies.find(x => x.obj.uuid === result.object.uuid);
            onCollision(result, r);
        }
    }
};
// code adapted from: https://mtdevans.com/index.html
// Converted from Python version: http://doswa.com/2009/01/02/fourth-order-runge-kutta-numerical-integration.html
function rk4(x, v, a, dt) {
    // Returns final (position, velocity) array after time dt has passed.
    //        x: initial position
    //        v: initial velocity
    //        a: acceleration function a(x,v,dt) (must be callable)
    //        dt: timestep
    var x1 = x;
    var v1 = v;
    var a1 = a(x1, v1, 0);
    var x2 = x + 0.5 * v1 * dt;
    var v2 = v + 0.5 * a1 * dt;
    var a2 = a(x2, v2, dt / 2);
    var x3 = x + 0.5 * v2 * dt;
    var v3 = v + 0.5 * a2 * dt;
    var a3 = a(x3, v3, dt / 2);
    var x4 = x + v3 * dt;
    var v4 = v + a3 * dt;
    var a4 = a(x4, v4, dt);
    var xf = x + (dt / 6) * (v1 + 2 * v2 + 2 * v3 + v4);
    var vf = v + (dt / 6) * (a1 + 2 * a2 + 2 * a3 + a4);
    return {
        position: xf,
        velocity: vf,
    };
}
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 32) {
        cb.velocity.x = 5;
    }
}
;
animate();
