document.addEventListener("DOMContentLoaded", function(){

const form = document.getElementById("quizForm")

form.addEventListener("submit", function(event){

event.preventDefault()

let score = 0
let total = 3

const answers = document.querySelectorAll("input[type='radio']:checked")

answers.forEach(answer=>{
score += Number(answer.value)
})

document.getElementById("result").innerText =
"Your Score: " + score + " / " + total

})

})