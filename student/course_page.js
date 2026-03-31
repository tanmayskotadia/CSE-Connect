/* =========================================================
   course_page.js — Courses listing with purchase integration
   ========================================================= */

// Course ID → folder path mapping
const coursePaths = {
  "data-structures": "courses/data structure/course_detail.html",
  "artificial-intelligence": "courses/ai/course_detail.html",
  "computer-networks": "courses/cn/course_detail.html",
  "database-management": "courses/dbms/course_detail.html",
  "machine-learning": "courses/ml/course_detail.html",
  "operating-systems": "courses/os/course_detail.html",
  "software-engineering": "courses/software engg/course_detail.html",
  "web-programming": "courses/web prog/course_detail.html"
};

// Session guard
const session = getSession();
if (!session) {
  window.location.href = '../home/index.html';
}

// Update nav logout to clear session
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.textContent.trim() === 'Logout') {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      logoutUser();
      window.location.href = '../home/index.html';
    });
  }
});

// --- Initialize course card buttons ---
function initButtons() {
  document.querySelectorAll('.course-card').forEach(card => {
    const courseId = card.dataset.courseId;
    const btn = card.querySelector('.course-btn');
    if (!courseId || !btn) return;

    updateButton(btn, courseId);

    btn.addEventListener('click', () => {
      if (hasPurchased(courseId)) {
        window.location.href = coursePaths[courseId];
      } else {
        purchaseCourse(courseId);
        updateButton(btn, courseId);
        showToast('Enrolled successfully! <i class="fa-solid fa-check"></i>');
      }
    });
  });
}

function updateButton(btn, courseId) {
  if (hasPurchased(courseId)) {
    btn.textContent = 'Go to Course →';
    btn.classList.add('purchased');
  } else {
    btn.textContent = 'Buy Now';
    btn.classList.remove('purchased');
    btn.classList.add('buy-now');
  }
}

// --- Toast notification ---
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerHTML = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// --- Search ---
const searchInput = document.getElementById("courseSearch");
const courses = document.querySelectorAll(".course-card");

searchInput.addEventListener("keyup", function () {
  const value = searchInput.value.toLowerCase();
  courses.forEach(course => {
    const title = course.querySelector("h3").textContent.toLowerCase();
    course.style.display = title.includes(value) ? "block" : "none";
  });
});

// Initialize on load
initButtons();