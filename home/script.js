let role = "student"

const studentTab = document.getElementById("studentTab")
const facultyTab = document.getElementById("facultyTab")
const idLabel = document.getElementById("idLabel")
const idInput = document.getElementById("idInput")
const loginBtn = document.getElementById("loginBtn")

studentTab.onclick = () => {
role = "student"
studentTab.classList.add("active")
facultyTab.classList.remove("active")
idLabel.textContent = "Student ID"
idInput.placeholder = "e.g. 24BCE1000"
loginBtn.textContent = "Sign in as Student →"
}

facultyTab.onclick = () => {
role = "faculty"
facultyTab.classList.add("active")
studentTab.classList.remove("active")
idLabel.textContent = "Faculty ID"
idInput.placeholder = "e.g. 55555"
loginBtn.textContent = "Sign in as Faculty →"
}

loginBtn.onclick = () => {
if(role === "student"){
window.location.href = "../student/course_page.html"
}else{
window.location.href = "../instructor/faculty_dashboard.html"
}
}

function handleCredentialResponse(response){

const data = parseJwt(response.credential)

localStorage.setItem("userName",data.name)
localStorage.setItem("userEmail",data.email)

if(role === "student"){
window.location.href = "../student/course_page.html"
}else{
window.location.href = "../instructor/faculty_dashboard.html"
}

}

function parseJwt(token){
var base64Url = token.split('.')[1]
var base64 = base64Url.replace(/-/g,'+').replace(/_/g,'/')
var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c){
return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
}).join(''))

return JSON.parse(jsonPayload)
}