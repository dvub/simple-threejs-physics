import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module";
import * as Physics from '../src/index.ts'

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
const stats = new Stats();

renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.y = -5;
camera.lookAt(new THREE.Vector3(0, 0, -10));
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

document.body.appendChild(renderer.domElement);
document.body.appendChild(stats.dom);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

const cube = new THREE.Mesh(cubeGeometry, new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
cube.position.set(0,10,-10);
/*
const cube1 = new THREE.Mesh(cubeGeometry, new THREE.MeshLambertMaterial({ color: 0xff0000 }));
cube1.position = new THREE.Vector3(3, 0, -10);
*/
const floorGeometry = new THREE.BoxGeometry(10, 0.1, 5);
const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xff00ff });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.set(0,-3,-10);

const wall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5, 5), floorMaterial);
wall.position.set(2.5,-3,10);

const light = new THREE.AmbientLight(0x404040); // soft white light
const pl = new THREE.PointLight(0xffffff, 1, 100);
pl.position.set(0, 5, -10);

// declare rigid bodies
const cb = new Physics.RigidBody(
  cube,
  1,
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  false
);
const fb = new Physics.RigidBody(
  floor,
  1,
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  true,
  0.5
);


/*
const wb = new RigidBody(wall, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
const wb1 = new RigidBody(wall2, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
*/

scene.add(cube);

scene.add(floor);

scene.add(light);
scene.add(pl);

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  Physics.update(deltaTime);

  // render, update shit
  renderer.render(scene, camera);
  stats.update();
}
// bodies.map((x) => x.update(0.08));
// ------------------------------------- //

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
  var keyCode = event.which;
  if (keyCode == 32) {
    cb.velocity.x = 5;
  }
}
animate();