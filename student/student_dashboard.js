/* =========================================================
   student_dashboard.js — Student dynamic dashboard
   ========================================================= */

(function () {
    'use strict';

    // 1. Session Guard
    const session = getSession();
    if (!session) {
        window.location.href = '../home/index.html';
        return;
    }
    if (session.role !== 'student') {
        window.location.href = '../instructor/faculty_dashboard.html';
        return;
    }

    // 2. Display User Info
    document.getElementById('userNameDisplay').textContent = session.name;
    document.getElementById('userIdDisplay').textContent = session.id;
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        avatar.textContent = session.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // Handle Logout
    document.querySelectorAll('.nav-links a').forEach(a => {
        if (a.textContent.trim() === 'Logout') {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                logoutUser();
                window.location.href = '../home/index.html';
            });
        }
    });

    // 3. Load Courses and Progress
    const purchasedIds = getPurchasedCourses();
    const progressMap = JSON.parse(localStorage.getItem('cseconnect_progress') || '{}');

    fetch('../data/courses.json')
        .then(res => res.json())
        .then(allCourses => {
            const enrolledCourses = allCourses.filter(c => purchasedIds.includes(c.id));
            renderDashboard(enrolledCourses, allCourses, progressMap);
        })
        .catch(err => console.error('Error loading courses:', err));

    function renderDashboard(enrolled, allCourses, progressMap) {
        // Stats
        document.getElementById('statEnrolled').textContent = enrolled.length;

        let totalLectures = 0;
        let completedLectures = 0;

        enrolled.forEach(c => {
            const courseProgress = progressMap[c.id] || {};
            c.modules.forEach(m => {
                m.lectures.forEach(l => {
                    totalLectures++;
                    if (courseProgress[l.id]) completedLectures++;
                });
            });
        });

        document.getElementById('statCompleted').textContent = completedLectures;
        document.getElementById('statTotal').textContent = totalLectures;

        // Pending Assignments (mock logic: check lectures with assignments that haven't been submitted)
        const allSubmissions = getSubmissions();
        let pendingAssignments = 0;
        enrolled.forEach(c => {
            c.modules.forEach(m => {
                m.lectures.forEach(l => {
                    if (l.hasAssignment) {
                        const submitted = allSubmissions.some(s => s.studentId === session.id && s.courseId === c.id && s.lectureId === l.id);
                        if (!submitted) pendingAssignments++;
                    }
                });
            });
        });
        document.getElementById('statPending').textContent = pendingAssignments;

        // Overall Progress
        const perc = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
        const fill = document.getElementById('overallProgressBar');
        if (fill) fill.style.width = perc + '%';
        const text = document.getElementById('overallProgressText');
        if (text) text.textContent = perc + '%';

        // Enrolled Courses Grid
        const grid = document.getElementById('enrolledCoursesGrid');
        grid.innerHTML = '';

        if (enrolled.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 40px;">You are not enrolled in any courses yet.</p>';
            return;
        }

        enrolled.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            card.style.cursor = 'pointer';

            // Map icons based on IDs (from course_page.html original)
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
        <p>${course.instructor || 'College Faculty'}</p>
        <span>${course.duration || '12 Weeks'} · ${course.credits || '3'} Credits</span>
      `;

            card.onclick = () => {
                // Find path
                const pathMap = {
                    "data-structures": "courses/data structure/course_detail.html",
                    "artificial-intelligence": "courses/ai/course_detail.html",
                    "computer-networks": "courses/cn/course_detail.html",
                    "database-management": "courses/dbms/course_detail.html",
                    "machine-learning": "courses/ml/course_detail.html",
                    "operating-systems": "courses/os/course_detail.html",
                    "software-engineering": "courses/software engg/course_detail.html",
                    "web-programming": "courses/web prog/course_detail.html"
                };
                window.location.href = pathMap[course.id];
            };

            grid.appendChild(card);
        });
    }

})();
