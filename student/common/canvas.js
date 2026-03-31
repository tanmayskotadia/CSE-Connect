const canvas = document.getElementById("board")
const ctx = canvas.getContext("2d")

function resizeCanvas(){
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight
}

resizeCanvas()
window.addEventListener("resize", resizeCanvas)

let drawing=false
let lastX=0
let lastY=0

/* NEW: tool system */
let tool="pen"
let startX=0
let startY=0

function setTool(t){
tool=t
}

canvas.addEventListener("mousedown",(e)=>{

drawing=true
lastX=e.offsetX
lastY=e.offsetY

startX=e.offsetX
startY=e.offsetY

})

canvas.addEventListener("mouseup",(e)=>{

drawing=false

/* NEW: shape drawing */

if(tool==="line"){
ctx.beginPath()
ctx.moveTo(startX,startY)
ctx.lineTo(e.offsetX,e.offsetY)
ctx.stroke()
}

if(tool==="circle"){
const radius=Math.sqrt((e.offsetX-startX)**2+(e.offsetY-startY)**2)

ctx.beginPath()
ctx.arc(startX,startY,radius,0,Math.PI*2)
ctx.stroke()
}

if(tool==="rect"){
ctx.beginPath()
ctx.rect(startX,startY,e.offsetX-startX,e.offsetY-startY)
ctx.stroke()
}

})

canvas.addEventListener("mouseleave",()=>drawing=false)

canvas.addEventListener("mousemove",draw)

function draw(e){

/* keep your original pen drawing */

if(!drawing || tool!=="pen") return

ctx.lineWidth=3
ctx.lineCap="round"
ctx.lineJoin="round"

ctx.beginPath()
ctx.moveTo(lastX,lastY)
ctx.lineTo(e.offsetX,e.offsetY)
ctx.stroke()

lastX=e.offsetX
lastY=e.offsetY
}

function clearBoard(){
ctx.clearRect(0,0,canvas.width,canvas.height)
}

function saveBoard(){
const link=document.createElement("a")
link.download="whiteboard.png"
link.href=canvas.toDataURL()
link.click()
}