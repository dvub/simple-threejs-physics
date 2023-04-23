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
    #frictionApplied: boolean = false;

    constructor(
        obj: THREE.Mesh = new THREE.Mesh(undefined, undefined), 
        mass: number = 0, 
        velocity: THREE.Vector3 = new THREE.Vector3(0,0,0),
        acceleration: THREE.Vector3 = new THREE.Vector3(0,0,0),
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

    public get obj() {
        return this.#obj;
    }
    public set obj(obj: THREE.Mesh) {
        this.#obj = obj;
    }
    public get mass() {
        return this.#mass;

    }
    public set mass(mass: number) {
        this.#mass = mass;
    }
    public get velocity() {
        return this.#velocity;
    }
    public set velocity(velocity: THREE.Vector3) {
        this.#velocity = velocity;
    }
    public get acceleration() {
        return this.#acceleration;
    }
    public set acceleration(acceleration: THREE.Vector3) {

        this.#acceleration = acceleration;
    }
    public get isStationary() {
        return this.#isStationary;

    }
    public set isStationary(isStationary: boolean) {
        this.#isStationary = isStationary;
    }
    public get friction(): number | undefined {
        return this.#friction;

    }
    public set friction(friction: number) {
        this.#friction = friction;
    }

    public update(deltaTime: number) {
        
        if (this.isStationary) return;

        // gravity implementation
        this.acceleration.y = - 9.81;
        
        // v = v0 + at
        // velocity += acceleration * time
        this.velocity.add(this.#acceleration.clone().multiplyScalar(this.mass * deltaTime));

        

        detectCollision(this.#obj, bodies, (result, r) => {
            // Ff  = U * Fn
            // Ff = U * mg
            if (r.friction) {
                const Ff = Math.abs(this.acceleration.y * this.mass * r.friction);
                if (!this.#frictionApplied) {
                    this.velocity.x += (this.velocity.x > 0 ? -Ff : Ff);
                    
                    this.velocity.z += (this.velocity.z > 0 ? -Ff : Ff);
                    this.#frictionApplied = true;
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
            } else {

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
const controls = new OrbitControls( camera, renderer.domElement );

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

const light = new THREE.AmbientLight( 0x404040 ); // soft white light
const pl = new THREE.PointLight( 0xFFFFFF, 1, 100 );
pl.position.set( 0, 5, -10 );

// declare rigid bodies
const cb = new RigidBody(cube, 1, new THREE.Vector3(9.81,0,0), new THREE.Vector3(0,0,0), false);
const fb = new RigidBody(floor, 1, new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), true, 1);
const wb = new RigidBody(wall, 1, new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), true);
const wb1 = new RigidBody(wall2, 1, new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0), true);

scene.add(cube);
scene.add(floor);
scene.add(wall);
scene.add(wall2);
scene.add( light );
scene.add( pl );


bodies.push(cb);
bodies.push(fb);
//bodies.push(wb);
//bodies.push(wb1);

function animate() {
    
    requestAnimationFrame( animate );
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
const detectCollision = (
    obj: THREE.Mesh, 
    bodies: RigidBody[], 
    onCollision: (
        result: THREE.Intersection, 
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
        cb.obj.position.set(0,5, -10);

    }
};

animate();