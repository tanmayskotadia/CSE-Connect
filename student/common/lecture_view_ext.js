/* =========================================================
   lecture_view_ext.js — Shared logic for lec, watch, quiz, assignment
   ========================================================= */

(function () {
    'use strict';

    // 1. Session and Purchase Gate
    const session = getSession();
    if (!session) {
        window.location.href = '../../../home/index.html';
        return;
    }
    if (session.role !== 'student') {
        window.location.href = '../../../instructor/faculty_dashboard.html';
        return;
    }

    // Get courseId and lecId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const lecId = urlParams.get('lecId');

    // Map folder names to courses.json IDs
    const folderToId = {
        "ai": "artificial-intelligence",
        "cn": "computer-networks",
        "data structure": "data-structures",
        "dbms": "database-management",
        "ml": "machine-learning",
        "os": "operating-systems",
        "software engg": "software-engineering",
        "web prog": "web-programming"
    };

    const pathParts = window.location.pathname.split('/');
    const folderName = decodeURIComponent(pathParts[pathParts.length - 2]);
    const inferredId = folderToId[folderName] || folderName.replace(/\s+/g, '-').toLowerCase();

    const courseId = window.COURSE_ID || inferredId;

    if (!hasPurchased(courseId)) {
        // Show full-page locked overlay as per Phase 13
        document.body.innerHTML = `
      <div style="background:#0f172a; color:#fff; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; font-family:system-ui;">
        <span style="font-size:64px; margin-bottom:20px;">🔒</span>
        <h1 style="font-size:24px; margin-bottom:12px;">Course Locked</h1>
        <p style="opacity:0.8; max-width:400px; margin-bottom:24px;">This content is part of a premium course. Please purchase the course to access lectures, quizzes, and assignments.</p>
        <button onclick="window.location.href='course_detail.html'" style="background:#1d4ed8; color:#fff; border:none; padding:12px 28px; border-radius:12px; font-weight:600; cursor:pointer;">Back to Course Page</button>
      </div>
    `;
        return;
    }

    // 2. Global Logout
    document.querySelectorAll('.nav-links a').forEach(a => {
        if (a.textContent.trim() === 'Logout') {
            a.addEventListener('click', e => {
                e.preventDefault();
                logoutUser();
                window.location.href = '../../../home/index.html';
            });
        }
    });

    // 3. Dynamic content loading for lec.html
    if (window.location.pathname.endsWith('lec.html')) {
        initLecPage(courseId);
    }

    // 4. Dynamic content loading for watch.html
    if (window.location.pathname.endsWith('watch.html')) {
        initWatchPage(courseId, lecId);
    }

    // 5. Dynamic content loading for assignment.html
    if (window.location.pathname.endsWith('assignment.html')) {
        initAssignmentPage(courseId, lecId);
    }

    // 6. Dynamic content loading for quiz.html
    if (window.location.pathname.endsWith('quiz.html')) {
        initQuizPage(courseId, lecId);
    }

    async function initLecPage(cid) {
        const list = document.querySelector('.lecture-list');
        if (!list) return;

        try {
            const res = await fetch('../../../data/courses.json');
            const courses = await res.json();
            const course = courses.find(c => c.id === cid || c.id === cid.replace('-', ' '));
            if (!course) return;

            list.innerHTML = '';
            course.modules.forEach(mod => {
                const accordion = document.createElement('div');
                accordion.className = 'module-accordion open'; // default open for lectures page

                accordion.innerHTML = `
          <div class="module-header">
            <h3><span class="mod-num">${mod.moduleNumber}</span> ${mod.title}</h3>
            <i class="fa-solid fa-chevron-down chevron"></i>
          </div>
          <div class="module-body"></div>
        `;

                const header = accordion.querySelector('.module-header');
                header.onclick = () => accordion.classList.toggle('open');

                const body = accordion.querySelector('.module-body');

                mod.lectures.forEach(lec => {
                    const card = document.createElement('div');
                    card.className = 'lecture-card';

                    const progressMap = JSON.parse(localStorage.getItem('cseconnect_progress') || '{}');
                    const isComp = progressMap[course.id] && progressMap[course.id][lec.id];

                    card.innerHTML = `
            <div class="lecture-left">
              <input type="checkbox" class="lecture-check" ${isComp ? 'checked' : ''} onclick="return false;">
              <div class="info">
                <h4>${lec.title}</h4>
                <div class="lec-meta">
                  <span class="status ${isComp ? 'completed' : 'pending'}">${isComp ? 'Completed' : 'Not Completed'}</span>
                </div>
              </div>
            </div>
            <div class="actions">
              <button class="action-btn watch" onclick="window.location.href='watch.html?lecId=${lec.id}'"><i class="fa-solid fa-play"></i> Watch</button>
              ${lec.hasQuiz ? `<button class="action-btn quiz" onclick="window.location.href='quiz.html?lecId=${lec.id}'"><i class="fa-solid fa-question"></i> Quiz</button>` : ''}
              ${lec.hasAssignment ? `<button class="action-btn assignment" onclick="window.location.href='assignment.html?lecId=${lec.id}'"><i class="fa-solid fa-file-lines"></i> Assignment</button>` : ''}
            </div>
          `;
                    body.appendChild(card);
                });

                list.appendChild(accordion);
            });

            const subtitle = document.querySelector('.subtitle');
            if (subtitle) {
                const total = course.modules.reduce((acc, m) => acc + m.lectures.length, 0);
                subtitle.textContent = `${total} lectures available`;
            }
        } catch (e) { console.error(e); }
    }

    async function initWatchPage(cid, lid) {
        if (!lid) return;

        try {
            const res = await fetch('../../../data/courses.json');
            const courses = await res.json();
            const course = courses.find(c => c.id === cid || c.id === cid.replace('-', ' '));
            if (!course) return;

            let lecture = null;
            course.modules.forEach(m => {
                const found = m.lectures.find(l => l.id === lid);
                if (found) lecture = found;
            });

            if (lecture) {
                // Update Title
                const h1 = document.querySelector('h1');
                if (h1) h1.textContent = lecture.title;
                document.title = `CSEConnect | ${lecture.title}`;

                // Update Video if provided
                if (lecture.videoUrl) {
                    const iframe = document.querySelector('iframe');
                    if (iframe) iframe.src = lecture.videoUrl;
                }

                // Mark as completed in progressMap
                let progressMap = JSON.parse(localStorage.getItem('cseconnect_progress') || '{}');
                if (!progressMap[course.id]) progressMap[course.id] = {};
                progressMap[course.id][lid] = true;
                localStorage.setItem('cseconnect_progress', JSON.stringify(progressMap));
            }
        } catch (e) { console.error(e); }
    }

    async function initAssignmentPage(cid, lid) {
        if (!lid) return;

        // Get lecture info to show title
        try {
            const res = await fetch('../../../data/courses.json');
            const courses = await res.json();
            const course = courses.find(c => c.id === cid || c.id === cid.replace('-', ' '));
            if (!course) return;

            let lecture = null;
            course.modules.forEach(m => {
                const found = m.lectures.find(l => l.id === lid);
                if (found) lecture = found;
            });

            if (lecture) {
                const h1 = document.querySelector('h1');
                if (h1) h1.textContent = `Assignment: ${lecture.title}`;
            }

            // Check if already submitted
            const submissions = getSubmissionsByStudent(session.id);
            const prev = submissions.find(s => s.lectureId === lid);

            const btn = document.querySelector('.submit-btn');
            const textarea = document.querySelector('textarea');

            if (prev) {
                if (textarea) {
                    textarea.value = prev.content;
                    textarea.disabled = true;
                }
                if (btn) {
                    btn.textContent = 'Submitted ✓';
                    btn.disabled = true;
                    btn.style.background = '#10b981';
                }
            } else {
                // Wire up the submit button
                if (btn && textarea) {
                    btn.onclick = () => {
                        const content = textarea.value.trim();
                        if (!content) return alert('Please enter your answer.');

                        saveSubmission(session.id, session.name, course.id, lid, content);

                        btn.textContent = 'Submitted ✓';
                        btn.disabled = true;
                        btn.style.background = '#10b981';
                        textarea.disabled = true;

                        showToast('Assignment submitted successfully!');
                    };
                }
            }
        } catch (e) { console.error(e); }
    }

    async function initQuizPage(cid, lid) {
        if (!lid) return;

        try {
            const res = await fetch('../../../data/courses.json');
            const courses = await res.json();
            const course = courses.find(c => c.id === cid || c.id === cid.replace('-', ' '));
            if (!course) return;

            let lecture = null;
            course.modules.forEach(m => {
                const found = m.lectures.find(l => l.id === lid);
                if (found) lecture = found;
            });

            if (lecture) {
                const h1 = document.querySelector('h1');
                if (h1) h1.textContent = `Quiz: ${lecture.title}`;
                document.title = `CSEConnect | Quiz — ${lecture.title}`;
            }

            // The original quiz.js handles the quiz logic. 
            // We just ensure the purchase gate passed at the top.
        } catch (e) { console.error(e); }
    }

    function showToast(msg) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

})();
