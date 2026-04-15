import * as THREE from "https://esm.sh/three@0.160.0"

export function createPlanets(scene, loadingManager) {

    const textureLoader = new THREE.TextureLoader(loadingManager)

    const planetGroup = []


    // SUN
    const sunGeometry = new THREE.SphereGeometry(4, 34, 34)

    const sunMaterial = new THREE.MeshStandardMaterial({
        map: textureLoader.load('./textures/2k_sun.webp'),
        emissive: 0xffcc66,
        emissiveIntensity: 1
    })

    const sun = new THREE.Mesh(sunGeometry, sunMaterial)

    scene.add(sun)


    // PLANET DATA
    const planetData = [

        { name: 'Mercury', size: 0.5, distance:10,speed: 0.004, texture: 'mercury.webp' },
        { name: 'Venus', size: 1.0, distance: 14, speed: 0.003, texture: 'venus.webp' },
        { name: 'Earth', size: 1.0, distance: 18, speed: 0.002, texture: 'earth.webp' },
        { name: 'Mars', size: 0.8, distance: 22, speed: 0.0016, texture: 'mars.webp' },
        { name: 'Jupiter', size: 2.1, distance: 32, speed: 0.0009, texture: 'jupiter.webp' },
        { name: 'Saturn', size: 1.8, distance: 44, speed: 0.0004, texture: 'saturn.webp' },
        { name: 'Uranus', size: 1.5, distance: 58, speed: 0.0004, texture: 'uranus.webp' },
        { name: 'Neptune', size: 1.4, distance: 72, speed: 0.0003, texture: 'neptune.webp' }

    ]


    planetData.forEach((planet) => {

        // PIVOT
        const pivot = new THREE.Object3D()
        scene.add(pivot)


        // GEOMETRY
        const geometry = new THREE.SphereGeometry(planet.size, 32, 32)


        // MATERIAL
        const material = new THREE.MeshStandardMaterial({

            map: textureLoader.load(`./textures/${planet.texture}`),

            normalMap: textureLoader.load(`./normal-map/${planet.name.toLowerCase()}_normal.webp`),

            roughness: 1,
            metalness: 0

        })


        // MESH
        const mesh = new THREE.Mesh(geometry, material)

        mesh.position.x = planet.distance

        pivot.add(mesh)

        // EARTH CLOUDS
        if (planet.name === "Earth") {

            const cloudGeo = new THREE.SphereGeometry(planet.size * 1.02, 32, 32)

            const cloudMat = new THREE.MeshStandardMaterial({
                map: textureLoader.load("./textures/2k_earth_clouds.png"),
                transparent: true
            })

            const clouds = new THREE.Mesh(cloudGeo, cloudMat)

            mesh.add(clouds)


            // ATMOSPHERE
            const atmosphereGeo = new THREE.SphereGeometry(planet.size * 1.08, 32, 32)

            const atmosphereMat = new THREE.MeshBasicMaterial({
                color: 0x4da6ff,
                transparent: true,
                opacity: 0.25,
                side: THREE.BackSide
            })

            const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat)

            mesh.add(atmosphere)

        }


        // STORE PLANET
        planetGroup.push({

            name: planet.name,
            mesh: mesh,
            pivot: pivot,
            speedRef: { value: planet.speed }

        })

    })

    return planetGroup

}