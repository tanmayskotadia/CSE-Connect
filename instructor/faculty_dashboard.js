/* =========================================================
   faculty_dashboard.js — Faculty dynamic dashboard
   ========================================================= */

(function () {
    'use strict';

    // 1. Session Guard
    const session = getSession();
    if (!session) {
        window.location.href = '../home/index.html';
        return;
    }
    if (session.role !== 'faculty') {
        window.location.href = '../student/student_dashboard.html';
        return;
    }

    // 2. Display User Info
    const welcome = document.getElementById('facultyWelcome');
    if (welcome) welcome.textContent = `Welcome, ${session.name}`;

    // Handle Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutUser();
            window.location.href = '../home/index.html';
        });
    }

    // 3. Load Courses and Submissions
    const assignedCourseIds = session.assignedCourses || [];
    const allSubmissions = getSubmissions();
    const pendingCount = allSubmissions.filter(s => s.status === 'pending' && assignedCourseIds.includes(s.courseId)).length;

    fetch('../data/courses.json')
        .then(res => res.json())
        .then(allCourses => {
            const myCourses = allCourses.filter(c => assignedCourseIds.includes(c.id));
            renderDashboard(myCourses, pendingCount);
        })
        .catch(err => console.error('Error loading courses:', err));

    function renderDashboard(courses, pending) {
        // Stats
        document.getElementById('statAssigned').textContent = courses.length;
        document.getElementById('statPending').textContent = pending;

        let totalLec = 0;
        courses.forEach(c => {
            if (c.modules) {
                c.modules.forEach(m => totalLec += m.lectures.length);
            }
        });
        document.getElementById('statLectures').textContent = totalLec;

        // Grid
        const grid = document.getElementById('facultyCourseGrid');
        grid.innerHTML = '';

        if (courses.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding:40px; color:#64748b;">No courses assigned yet.</p>';
            return;
        }

        courses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';

            const iconMap = {
                'data-structures': 'fa-book',
                'database-management': 'fa-database',
                'operating-systems': 'fa-brands fa-ubuntu',
                'computer-networks': 'fa-network-wired',
                'software-engineering': 'fa-laptop-code',
                'web-programming': 'fa-globe',
                'artificial-intelligence': 'fa-microchip',
                'machine-learning': 'fa-brain'
            };

            const iconClass = iconMap[course.id] || 'fa-graduation-cap';
            const farBrand = iconClass.includes('fa-brands') ? '' : 'fa-solid';

            card.innerHTML = `
        <div class="icon"><i class="${farBrand} ${iconClass}"></i></div>
        <h4>${course.title}</h4>
        <p>${course.duration || '12 Weeks'} · ${course.credits || '3'} Credits</p>
        <a href="manage_course.html?courseId=${course.id}" class="manage-btn">Manage Course</a>
      `;
            grid.appendChild(card);
        });
    }

})();
