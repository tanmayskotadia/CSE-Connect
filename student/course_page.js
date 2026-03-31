
function openCourse(courseName) {
  const coursePaths = {
    "Data Structures": "courses/data structure/course_detail.html",
    "Artificial Intelligence": "courses/ai/course_detail.html",
    "Computer Networks": "courses/cn/course_detail.html",
    "Database Management Systems": "courses/dbms/course_detail.html",
    "Machine Learning": "courses/ml/course_detail.html",
    "Operating Systems": "courses/os/course_detail.html",
    "Software Engineering": "courses/software engg/course_detail.html",
    "Web Programming": "courses/web prog/course_detail.html"
  }

  window.location.href = coursePaths[courseName]
}

const searchInput = document.getElementById("courseSearch")
const courses = document.querySelectorAll(".course-card")

searchInput.addEventListener("keyup", function () {
  const value = searchInput.value.toLowerCase()

  courses.forEach(course => {
    const title = course.querySelector("h3").textContent.toLowerCase()

    if (title.includes(value)) {
      course.style.display = "block"
    } else {
      course.style.display = "none"
    }
  })
})