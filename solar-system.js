
//-----Import Modules-----//
import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.157.0/examples/jsm/loaders/RGBELoader.js';             //For HDRis
import { PMREMGenerator } from 'three';       //HDRIs didn't worked without it







//-----Scene Set-up-----//
const scene = new THREE.Scene();                        //creates scene
scene.background = new THREE.Color(0x000000);           //sets background

//------Tweaks For error-----//
    function calculateOrbitRadius(index) 
    {
        let baseDistance = 50;  // Adjust this value as needed
        return baseDistance + index * 30;
    }

    // Correctly assigning values to pivot and radius
    let pivot = new THREE.Object3D();
    let radius = calculateOrbitRadius(2); // Example index for testing

    scene.add(pivot);

//-----Camera Setup-----//
    const camera = new THREE.PerspectiveCamera(
        75, window.innerWidth/window.innerHeight, 0.1, 1000
    );

    camera.position.set(0, 20,  40);


//-----Rendering-----//
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth,window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.outputColorSpace = THREE.sRGBColorSpace;
    renderer.outputEncoding = THREE.sRGBEncoding;


//-----Texture Loader-----//
    const textureLoader = new THREE.TextureLoader();


//-----Background Basic-----//
    //const starTexture = textureLoader.load('textures/2k_stars.webp');       //loading BG
    //scene.background = starTexture;                     //implementing BG


//-----HDRI Background-----//

    const rgbeLoader = new RGBELoader();
    rgbeLoader.load('textures/HDR_galactic_plane_hazy_nebulae.hdr', function(hdrTexture) 
    {
        hdrTexture.mapping = THREE.EquirectangularReflectionMapping;

        const pmremGenerator = new PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        const envMap = pmremGenerator.fromEquirectangular(hdrTexture).texture;

        scene.environment = envMap;  // Use environment for reflection-based effects
        scene.background = envMap;   // Set as background

        hdrTexture.dispose();
        pmremGenerator.dispose();
    });




//-----Orbit Controls-----//
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;


//-----Let there be -> Sun-----//
    const sunTexture = textureLoader.load('textures/2k_sun.webp');
    const sunNormalMap = textureLoader.load('normal-map/2k_sun_normal.webp')
    const sunMaterial = new THREE.MeshStandardMaterial
    ({
        map: sunTexture,
        normalMap : sunNormalMap,
    // Glow Effect
        emissive: 0xffaa00,
        emissiveIntensity: 1.0,
        blending: THREE.AdditiveBlending,
        // transparent: true,
        opacity: 1.05,  //Raise for sprite visibility 'OR' Slightly lower opacity to give a soft glow
        roughness : 0.4,
        metalness : 0.2,

    });
    const sunGeometry = new THREE.SphereGeometry(4, 32 ,32);
    // const sunMaterial = new THREE.MeshBasicMaterial({color : 0xffff00});
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    
//------Sun Corona------//
// ----- Sun Halo (Corona) -----
    const haloTexture = textureLoader.load('textures/corona.png');

    const haloMaterial = new THREE.SpriteMaterial({
        map: haloTexture,
        color: 0xffaa00,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,         // Makes sure it blends properly
        blending: THREE.AdditiveBlending
    });

    const haloSprite = new THREE.Sprite(haloMaterial);
    haloSprite.scale.set(12, 12, 1); // Must be larger than the sun sphere
    sun.add(haloSprite); // Attach halo to sun so it moves with it
    


//-----Lighting-----//
    const pointLight = new THREE.PointLight(0xffffff, 750, 500, 2);
    pointLight.position.copy(sun.position);
    scene.add(pointLight)
        //ambient light to brighten up shadows
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // Lower intensity to avoid washing out details
    scene.add(ambientLight);
        // for dramatic effect
    pointLight.position.copy(sun.position);

    

//-----planets_Holder-----//
    const planetGroup = [];
    const planetPivots = [];


//-----Planets Data-----//

    //Planet data: [name, size, distance from sun, speed, color]//

    const planetData = [
        ["Mercury", 0.5, 8, 0xaaaaaa, 0.04],
        ["Venus",   0.9, 12, 0xffcc66, 0.015],
        ["Earth",   1.0, 16, 0x3399ff, 0.01],
        ["Mars",    0.7, 20, 0xff3300, 0.008],
        ["Jupiter", 2.5, 26, 0xff9966, 0.002],
        ["Saturn",  2.0, 32, 0xffcc99, 0.001],
        ["Uranus",  1.5, 38, 0x66ccff, 0.0005],
        ["Neptune", 1.5, 44, 0x3333ff, 0.0003],
    ]


//-----Creating Planets-----//

    planetData.forEach(([name, radius, distance, fallbackColor = 0xffffff, speed]) => 
    {
        //Textures for planets
        // paths for the planet's diffuse texture and its normal map:
        const texturePath = `textures/${name.toLowerCase()}.webp`;
        const normalMapPath = `normal-map/${name.toLowerCase()}_normal.webp`;
  
        const planetTexture = textureLoader.load(texturePath);
        const planetNormalMap = textureLoader.load(normalMapPath);

          const material = new THREE.MeshStandardMaterial
        ({
            map: planetTexture,
            normalMap: planetNormalMap,
            // The fallback color can be used in cases where textures don't load properly.
            color: fallbackColor
        });

        //initialize planets sphere
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        // const material = new THREE.MeshStandardMaterial({color});
        const mesh = new THREE.Mesh(geometry, material);
        
        //placing planet on x axis
        const pivot = new THREE.Object3D();
        mesh.position.x = distance;

        // Create canvas for text
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 64;

        const ctx = canvas.getContext("2d");
        ctx.font = "28px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(name, canvas.width / 2, 45);

        // Create texture from canvas
        const labelTexture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({
          map: labelTexture,
          transparent: true,
          depthWrite: false
        });
        const labelSprite = new THREE.Sprite(labelMaterial);

        // Position the label above the planet
        labelSprite.scale.set(4, 1.5, 1);
        labelSprite.position.set(0, radius + 1.5, 0);

        mesh.add(labelSprite);
        pivot.add(mesh);                    //adding to scene
        scene.add(pivot);                   //adding to scene

        // If this is Saturn, add rings.
        if (name.toLowerCase() === "saturn") {
            // Load ring textures
            const ringsTexture = textureLoader.load('textures/2k_saturn_ring_alpha.png');
            const ringsNormal = textureLoader.load('normal-map/saturnRings_normal.webp');

            // Create Ring geometry
            const innerRadius = radius * 1.2;
            const outerRadius = radius * 2.0;
            const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64);

            // Create material for rings
            const ringMaterial = new THREE.MeshStandardMaterial({
              map: ringsTexture,
              normalMap: ringsNormal,
              side: THREE.DoubleSide, // Visible from both sides
              transparent: true,
              opacity: 0.8
            });

            // Create rings mesh: (geometry, material)
            const rings = new THREE.Mesh(ringGeometry, ringMaterial);

            // Rotate the rings so they lie flat
            rings.rotation.x = Math.PI / 2;
            rings.rotation.z = 0.4;

            // Attach rings to Saturn's mesh
            mesh.add(rings);
    }   

        //Earth Clouds
        if (name.toLowerCase() === 'earth') 
        {
            //loading cloud textures
            const cloudTexture = textureLoader.load('textures/2k_earth_clouds.png');

            const cloudGeometry = new THREE.SphereGeometry( radius * 1.01 , 32 , 32);
            const cloudMaterial = new THREE.MeshStandardMaterial({
                map : cloudTexture,
                transparent : true,
                opacity : 0.8,
                depthWrite : false
            });

            //Implementing Clouds
            const cloudMesh  = new THREE.Mesh(cloudGeometry, cloudMaterial);
            mesh.add(cloudMesh);            //attach to earth
        }


        //Venus atmosphere
        if (name.toLowerCase() === 'venus') 
        {
            //Load venus Atmosphere
            const atmosphereTexture = textureLoader.load('textures/2k_venus_atmosphere.webp')

            const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.05, 32, 32 );
            const atmosphereMaterial = new THREE.MeshBasicMaterial({

                map : atmosphereTexture,
                transparent : true,
                opacity : 0.3,
                blending : THREE.AdditiveBlending,
                depthWrite : false

            });
            
            const atmosphereMesh = new THREE.Mesh( atmosphereGeometry, atmosphereMaterial);
            mesh.add(atmosphereMesh);
        }

        //setting pivot points for orbit
        planetGroup.push({name, mesh, speed, pivot, speedRef : {value:speed} });
        planetPivots.push(pivot);
    
    });


// --- Orbit Rings --- //
    planetData.forEach(([name, radius, distance, color, speed]) => 
    {
        const ringGeometry = new THREE.RingGeometry(distance - 0.05, distance + 0.05, 64);
        const ringMaterial = new THREE.MeshBasicMaterial
        ({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2
        });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2; // make it flat (XY plane)
      scene.add(ring);
    });



//-----Handling Resize-----//
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });


//------ Create label canvas-----//
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;

    const ctx = canvas.getContext("2d");
    ctx.font = "28px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(name, canvas.width / 2, 45);

    const labelTexture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        depthWrite: false
    });
    const labelSprite = new THREE.Sprite(labelMaterial);

    // Position above the planet
    labelSprite.scale.set(4, 1, 1);
    labelSprite.position.set(0, radius + 1.5, 0);

    // Add to planet pivot so it follows the orbit
    pivot.add(labelSprite);



//------Speed Slider Controls------//
const controlPanel = document.getElementById("controls");

planetGroup.forEach((planet) => {
  const container = document.createElement("div");
  container.style.marginBottom = "10px";

  const label = document.createElement("label");
  label.textContent = `${planet.name}: `;
  label.htmlFor = `slider-${planet.name}`;

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "0.1";
  slider.step = "0.001";
  slider.value = planet.speedRef.value;
  slider.id = `slider-${planet.name}`;

  slider.oninput = () => {
    planet.speedRef.value = parseFloat(slider.value);
  };

  container.appendChild(label);
  container.appendChild(slider);
  controlPanel.insertBefore(container, document.getElementById("toggleAnimation"));
});




//----- Pause / Resume Button-----//
let isPaused = false;
const toggleBtn = document.getElementById("toggleAnimation");
toggleBtn.addEventListener("click", () => {
  isPaused = !isPaused;
  toggleBtn.textContent = isPaused ? "Resume" : "Pause";
});



//-----Animating Cosmos-----//
    function animate() 
    {
        requestAnimationFrame(animate);

        if (!isPaused) 
        {
                planetGroup.forEach((planet) => 
            {
                planet.pivot.rotation.y += planet.speedRef.value;
                planet.mesh.rotation.y += 0.02;
            });
        }

        controls.update();
        renderer.render(scene, camera);
        if (name.toLowerCase() === "earth") 
            {
                const cloudLayer = planet.mesh.children.find(child => child.material?.map?.image?.src?.includes("cloud"));
                if (cloudLayer) 
                {
                    cloudLayer.rotation.y += 0.001; // slow spin
                }
            }
    
        if (name.toLowerCase() === "venus") 
            {
                const atmosphere = planet.mesh.children.find(child => child.material?.map?.image?.src?.includes("venus"));
                if (atmosphere) 
                    {
                        atmosphere.rotation.y += 0.0005; // very subtle haze movement
                    }
            }
        
        // Animate corona flicker
        haloSprite.material.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.1;
    }

    animate();