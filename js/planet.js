import * as THREE from "https://esm.sh/three@0.160.0"

export function createPlanets(scene) {

    const textureLoader = new THREE.TextureLoader()

    const planetGroup = []


    // SUN
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32)

    const sunMaterial = new THREE.MeshBasicMaterial({
        map: textureLoader.load('../textures/2k_sun.webp')
    })

    const sun = new THREE.Mesh(sunGeometry, sunMaterial)

    scene.add(sun)


    // PLANET DATA
    const planetData = [

        { name: 'Mercury', size: 0.4, distance: 6, speed: 0.02, texture: 'mercury.webp' },
        { name: 'Venus', size: 0.9, distance: 9, speed: 0.015, texture: 'venus.webp' },
        { name: 'Earth', size: 1, distance: 12, speed: 0.01, texture: 'earth.webp' },
        { name: 'Mars', size: 0.7, distance: 15, speed: 0.008, texture: 'mars.webp' },
        { name: 'Jupiter', size: 2, distance: 20, speed: 0.006, texture: 'jupiter.webp' },
        { name: 'Saturn', size: 1.7, distance: 25, speed: 0.005, texture: 'saturn.webp' },
        { name: 'Uranus', size: 1.4, distance: 30, speed: 0.004, texture: 'uranus.webp' },
        { name: 'Neptune', size: 1.3, distance: 35, speed: 0.003, texture: 'neptune.webp' }

    ]


    planetData.forEach((planet) => {

        // PIVOT
        const pivot = new THREE.Object3D()
        scene.add(pivot)


        // GEOMETRY
        const geometry = new THREE.SphereGeometry(planet.size, 32, 32)


        // MATERIAL
        const material = new THREE.MeshStandardMaterial({

            map: textureLoader.load(`../textures/${planet.texture}`),

            normalMap: textureLoader.load(`../normal-map/${planet.name.toLowerCase()}_normal.webp`),

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
                map: textureLoader.load("../textures/2k_earth_clouds.png"),
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