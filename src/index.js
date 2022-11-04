const THREE = window.THREE;

const clock = new THREE.Clock();

let velocity = 0.0;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

const floorGeometry = new THREE.BoxGeometry(5, 1, 5);
const floorMaterial = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -3;
scene.add(floor);


camera.position.z = 5;

class RigidBody {
    

    constructor(mesh) {

    }


}

function animate() {
    requestAnimationFrame( animate );

    const deltaTime = clock.getDelta();
    
    for (const vertexIndex in cube.geometry.vertices)
    {       
        var localVertex = cube.geometry.vertices[vertexIndex].clone();
        var globalVertex = cube.matrix.multiplyVector3(localVertex);
        var directionVector = globalVertex.subSelf( cube.position );
    
        var ray = new THREE.Ray( cube.position, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects( floor );
        if ( !(collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) ) 
        {
            const newVel = (0.5 * 9.8 * deltaTime);
            velocity += newVel;
            cube.position.y -= (velocity * deltaTime) + newVel;
        }
    }







    renderer.render( scene, camera );
};

animate();