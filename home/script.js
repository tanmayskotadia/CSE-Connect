let role = "student"

const studentTab = document.getElementById("studentTab")
const facultyTab = document.getElementById("facultyTab")
const idLabel = document.getElementById("idLabel")
const idInput = document.getElementById("idInput")
const passInput = document.getElementById("passInput")
const loginBtn = document.getElementById("loginBtn")
const loginError = document.getElementById("loginError")

studentTab.onclick = () => {
    role = "student"
    studentTab.classList.add("active")
    facultyTab.classList.remove("active")
    idLabel.textContent = "Student ID"
    idInput.placeholder = "e.g. 24BCE1000"
    loginBtn.textContent = "Sign in as Student →"
    loginError.style.display = "none"
}

facultyTab.onclick = () => {
    role = "faculty"
    facultyTab.classList.add("active")
    studentTab.classList.remove("active")
    idLabel.textContent = "Faculty ID"
    idInput.placeholder = "e.g. 55555"
    loginBtn.textContent = "Sign in as Faculty →"
    loginError.style.display = "none"
}

loginBtn.onclick = async () => {
    const id = idInput.value.trim()
    const pass = passInput.value

    if (!id || !pass) {
        loginError.textContent = "Please enter both ID and password."
        loginError.style.display = "block"
        return
    }

    loginBtn.disabled = true
    loginBtn.textContent = "Signing in..."

    const user = await loginUser(id, pass)

    if (!user) {
        loginError.textContent = "Invalid credentials. Please try again."
        loginError.style.display = "block"
        loginBtn.disabled = false
        loginBtn.textContent = role === "student" ? "Sign in as Student →" : "Sign in as Faculty →"
        return
    }

    // Check role matches tab
    if (user.role !== role) {
        loginError.textContent = `This ID belongs to a ${user.role} account. Switch to the ${user.role} tab.`
        loginError.style.display = "block"
        loginBtn.disabled = false
        loginBtn.textContent = role === "student" ? "Sign in as Student →" : "Sign in as Faculty →"
        return
    }

    saveSession(user)
    loginError.style.display = "none"

    if (user.role === "student") {
        window.location.href = "../student/course_page.html"
    } else {
        window.location.href = "../instructor/faculty_dashboard.html"
    }
}

function handleCredentialResponse(response) {

    const data = parseJwt(response.credential)

    localStorage.setItem("userName", data.name)
    localStorage.setItem("userEmail", data.email)

    // Save a basic session for Google users using selected role
    saveSession({ id: data.email, name: data.name, role: role })

    if (role === "student") {
        window.location.href = "../student/course_page.html"
    } else {
        window.location.href = "../instructor/faculty_dashboard.html"
    }

}

function parseJwt(token) {
    var base64Url = token.split('.')[1]
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))

    return JSON.parse(jsonPayload)
}