import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

//making models - normal gltf file
// const gltfLoader = new GLTFLoader();
// gltfLoader.load("/models/Duck/glTF/Duck.gltf", (gltf) => {
//   scene.add(gltf.scene.children[0]);
//   console.log("success");
//   console.log(gltf);
// });
const loadingManager = new THREE.LoadingManager();

loadingManager.onStart = () => {
  console.log("onStart");
};

loadingManager.onProgress = () => {
  console.log("onProgess");
};

loadingManager.onError = () => {
  console.log("onError");
};

const textureLoader = new THREE.TextureLoader(loadingManager);
const grassTexture = textureLoader.load("/textures/grass.jpeg");
let mixer = null;

const gltfLoader = new GLTFLoader();
gltfLoader.load("/models/Human/glTF-Embedded/RiggedFigure.gltf", (gltf) => {
  //for animation the gltf object conains animations property composed of mutliple animation clips - they are classes
  //have to use three.js animation mixer, where it can play one or many animation clips
  mixer = new THREE.AnimationMixer(gltf.scene);
  const action = (mixer.clipAction = mixer.clipAction(gltf.animations[0]));
  action.play();
  console.log(action.play);
  // scene.add(gltf.scene.children[0]);
  // console.log("success");
  // console.log(gltf);
  // //one way of loading model
  // //   while (gltf.scene.children.length) {
  // //     scene.add(gltf.scene.children[0]);
  // //   }
  // //this duplicates the array so that it doesn't remove the inital array
  // const children = [...gltf.scene.children];
  // for (const child of children) {
  //   scene.add(child);
  // }

  //this by itself works as well adding the wholw thing
  gltf.scene.scale.set(1.2, 1.2, 1.2);
  scene.add(gltf.scene);
});

//to support draco compressed version - way to do this is have to decode by copying the three.js example in node module then writing code below with both draco loader and
// const dracoLoader = new DRACOLoader();
// dracoLoader.setDecoderPath("/draco/");

// const gltfLoader = new GLTFLoader();
// gltfLoader.setDRACOLoader(dracoLoader);
// gltfLoader.load("/models/Duck/glTF-Draco/Duck.gltf", (gltf) => {
//   scene.add(gltf.scene);
// });

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    // color: "#444444",
    metalness: 0,
    roughness: 0.5,
    map: grassTexture,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(2, 2, 2);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  //update animation mixer
  if (mixer !== null) {
    mixer.update(deltaTime);
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
