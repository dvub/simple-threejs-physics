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
var _RigidBody_obj, _RigidBody_mass, _RigidBody_velocity, _RigidBody_acceleration, _RigidBody_isStationary, _RigidBody_friction, _RigidBody_frictionApplied;
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
        _RigidBody_frictionApplied.set(this, false);
        __classPrivateFieldSet(this, _RigidBody_obj, obj, "f");
        __classPrivateFieldSet(this, _RigidBody_mass, mass, "f");
        __classPrivateFieldSet(this, _RigidBody_velocity, velocity, "f");
        __classPrivateFieldSet(this, _RigidBody_acceleration, acceleration, "f");
        __classPrivateFieldSet(this, _RigidBody_isStationary, isStationary, "f");
        __classPrivateFieldSet(this, _RigidBody_friction, friction, "f");
    }
    get obj() {
        return __classPrivateFieldGet(this, _RigidBody_obj, "f");
    }
    set obj(obj) {
        __classPrivateFieldSet(this, _RigidBody_obj, obj, "f");
    }
    get mass() {
        return __classPrivateFieldGet(this, _RigidBody_mass, "f");
    }
    set mass(mass) {
        __classPrivateFieldSet(this, _RigidBody_mass, mass, "f");
    }
    get velocity() {
        return __classPrivateFieldGet(this, _RigidBody_velocity, "f");
    }
    set velocity(velocity) {
        __classPrivateFieldSet(this, _RigidBody_velocity, velocity, "f");
    }
    get acceleration() {
        return __classPrivateFieldGet(this, _RigidBody_acceleration, "f");
    }
    set acceleration(acceleration) {
        __classPrivateFieldSet(this, _RigidBody_acceleration, acceleration, "f");
    }
    get isStationary() {
        return __classPrivateFieldGet(this, _RigidBody_isStationary, "f");
    }
    set isStationary(isStationary) {
        __classPrivateFieldSet(this, _RigidBody_isStationary, isStationary, "f");
    }
    get friction() {
        return __classPrivateFieldGet(this, _RigidBody_friction, "f");
    }
    set friction(friction) {
        __classPrivateFieldSet(this, _RigidBody_friction, friction, "f");
    }
    update(deltaTime) {
        if (this.isStationary)
            return;
        // gravity implementation
        this.acceleration.y = -9.81;
        // v = v0 + at
        // velocity += acceleration * time
        this.velocity.add(__classPrivateFieldGet(this, _RigidBody_acceleration, "f").clone().multiplyScalar(this.mass * deltaTime));
        detectCollision(__classPrivateFieldGet(this, _RigidBody_obj, "f"), bodies, (result, r) => {
            // Ff  = U * Fn
            // Ff = U * mg
            if (r.friction) {
                const frictionForce = Math.abs(this.acceleration.y * this.mass * r.friction);
                if (!__classPrivateFieldGet(this, _RigidBody_frictionApplied, "f")) {
                    if (Math.abs(this.velocity.x) >= frictionForce) {
                        this.velocity.x += (this.velocity.x > 0 ? -frictionForce : frictionForce);
                    }
                    else {
                        this.velocity.x = 0;
                    }
                    if (Math.abs(this.velocity.y) >= frictionForce) {
                        this.velocity.z += (this.velocity.z > 0 ? -frictionForce : frictionForce);
                    }
                    else {
                        this.velocity.z = 0;
                    }
                    __classPrivateFieldSet(this, _RigidBody_frictionApplied, true, "f");
                }
            }
            if (r.isStationary) {
                if (Math.abs(result.normal.y) > 0) {
                    this.velocity.y = 0;
                }
                if (Math.abs(result.normal.x) > 0) {
                    this.velocity.x = 0;
                }
                if (Math.abs(result.normal.z) > 0) {
                    this.velocity.z = 0;
                }
            }
            else {
            }
        });
        // transform
        this.obj.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    }
}
_RigidBody_obj = new WeakMap(), _RigidBody_mass = new WeakMap(), _RigidBody_velocity = new WeakMap(), _RigidBody_acceleration = new WeakMap(), _RigidBody_isStationary = new WeakMap(), _RigidBody_friction = new WeakMap(), _RigidBody_frictionApplied = new WeakMap();
const bodies = [];
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
const floorGeometry = new THREE.BoxGeometry(25, 0.1, 25);
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
const cb = new RigidBody(cube, 1, new THREE.Vector3(5, 0, 0), new THREE.Vector3(0, 0, 0), false);
const fb = new RigidBody(floor, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true, 1);
const wb = new RigidBody(wall, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
const wb1 = new RigidBody(wall2, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
scene.add(cube);
scene.add(floor);
scene.add(wall);
scene.add(wall2);
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
        bodies[i].update(0.008);
    }
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
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 32) {
        cb.obj.position.set(0, 5, -10);
    }
}
;
animate();
