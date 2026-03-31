
// create sliders
// connect sliders to planets
// pause/resume simulation
// future raycasting interaction

export function setupUI(planetGroup){

const controlPanel = document.getElementById("controls")

let isPaused = false


// PAUSE BUTTON
const pauseButton = document.createElement("button")
pauseButton.innerText = "Pause"

pauseButton.onclick = () => {

isPaused = !isPaused

pauseButton.innerText = isPaused ? "Resume" : "Pause"

planetGroup.forEach((planet)=>{
planet.speedRef.value = isPaused ? 0 : planet.speedRef.defaultSpeed
})

}

controlPanel.appendChild(pauseButton)

controlPanel.appendChild(document.createElement("hr"))


// SPEED SLIDERS
planetGroup.forEach((planet)=>{

planet.speedRef.defaultSpeed = planet.speedRef.value

const label = document.createElement("label")
label.innerText = planet.name

const slider = document.createElement("input")
slider.type = "range"

slider.min = 0
slider.max = 0.05
slider.step = 0.001

slider.value = planet.speedRef.value

slider.oninput = () => {
planet.speedRef.value = parseFloat(slider.value)
}

controlPanel.appendChild(label)
controlPanel.appendChild(slider)
controlPanel.appendChild(document.createElement("br"))

})

}