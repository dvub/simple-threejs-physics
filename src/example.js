import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import Stats from "three/examples/jsm/libs/stats.module";
import { RigidBody } from './index';



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

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
cube.position.z = -10;
cube.position.y = 10;

const material1 = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const cube1 = new THREE.Mesh(geometry, material1);
cube1.position.z = -10;
cube1.position.x = 3;
cube1.position.y = 0;

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
const pl = new THREE.PointLight(0xffffff, 1, 100);
pl.position.set(0, 5, -10);

// declare rigid bodies
const cb = new RigidBody(
  cube,
  1,
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  false
);
const fb = new RigidBody(
  floor,
  1,
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  true,
  0.5
);

const cb1 = new RigidBody(
  cube1,
  2,
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  false
);

/*
const wb = new RigidBody(wall, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
const wb1 = new RigidBody(wall2, 1, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
*/

scene.add(cube);
scene.add(cube1);
scene.add(floor);
//scene.add(wall);
//scene.add(wall2);
scene.add(light);
scene.add(pl);

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  bodies.map((x) => x.update(deltaTime));

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