import * as THREE from "https://esm.sh/three@0.160.0"

import { OrbitControls } from "https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js"

import { RGBELoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/RGBELoader.js"

import { PMREMGenerator } from "https://esm.sh/three@0.160.0"

import { createPlanets } from "./planet.js"
import { setupUI } from "./interaction.js"

// SCENE
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)


// CAMERA
const camera = new THREE.PerspectiveCamera(
75,
window.innerWidth / window.innerHeight,
0.1,
1000
)

camera.position.set(0,20,40)


// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias:true })
renderer.setSize(window.innerWidth, window.innerHeight)

renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.outputColorSpace = THREE.SRGBColorSpace

document.body.appendChild(renderer.domElement)


// HDRI ENVIRONMENT
const rgbeLoader = new RGBELoader()

rgbeLoader.load(
'textures/HDR_galactic_plane_hazy_nebulae.hdr',
(hdrTexture)=>{

 hdrTexture.mapping = THREE.EquirectangularReflectionMapping

 const pmremGenerator = new PMREMGenerator(renderer)
 pmremGenerator.compileEquirectangularShader()

 const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture

 scene.environment = envMap
 scene.background = envMap

 hdrTexture.dispose()
 pmremGenerator.dispose()

}
)


// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true


// LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff,0.25)
scene.add(ambientLight)
// SUN LIGHT
const sunLight = new THREE.PointLight(0xffffff, 150.0, 10000)
sunLight.position.set(0,0,0)
scene.add(sunLight)


// CREATE PLANETS
const planetGroup = createPlanets(scene)


// SETUP UI
setupUI(planetGroup)


// RESIZE HANDLING
window.addEventListener('resize',()=>{
 camera.aspect = window.innerWidth / window.innerHeight
 camera.updateProjectionMatrix()
 renderer.setSize(window.innerWidth, window.innerHeight)
})


// ANIMATION LOOP
function animate(){

 requestAnimationFrame(animate)

 planetGroup.forEach((planet)=>{

  planet.pivot.rotation.y += planet.speedRef.value
  planet.mesh.rotation.y += 0.02

 })

 controls.update()
 renderer.render(scene,camera)

}

animate()

document.getElementById("loading-screen").style.display = "none"