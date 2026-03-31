/* =========================================================
   manage_course.js — Faculty management logic
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

    // 2. Get Course ID
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('courseId');
    if (!courseId) {
        window.location.href = 'faculty_dashboard.html';
        return;
    }

    // 3. Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // 4. Data Loading
    let currentCourse = null;
    loadCourseData();

    async function loadCourseData() {
        try {
            const res = await fetch('../data/courses.json');
            const allCourses = await res.json();
            currentCourse = allCourses.find(c => c.id === courseId);

            if (!currentCourse) return;

            if (typeof injectExtraLectures === 'function') injectExtraLectures(allCourses);
            if (typeof filterDeletedLectures === 'function') filterDeletedLectures(courseId, allCourses);
            currentCourse = allCourses.find(c => c.id === courseId);

            document.getElementById('courseTitle').textContent = `Manage: ${currentCourse.title}`;

            populateLectures();
            populateSelects();
            populateSubmissions();
        } catch (e) { console.error(e); }
    }

    function populateLectures() {
        const tbody = document.getElementById('lectureTableBody');
        tbody.innerHTML = '';

        currentCourse.modules.forEach(mod => {
            mod.lectures.forEach(lec => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${lec.id}</td>
          <td>${lec.title}</td>
          <td>${lec.hasQuiz ? '✅' : '❌'}</td>
          <td>${lec.hasAssignment ? '✅' : '❌'}</td>
          <td>
            <button class="secondary-btn" style="padding:4px 8px; font-size:12px; background:#ef4444; color:white; border:none;" onclick="deleteLecture('${lec.id}')">Delete</button>
          </td>
        `;
                tbody.appendChild(tr);
            });
        });
    }

    function populateSelects() {
        const qSelect = document.getElementById('quizLecSelect');
        const aSelect = document.getElementById('asgnLecSelect');
        if (!qSelect || !aSelect) return;
        [qSelect, aSelect].forEach(s => s.innerHTML = '');

        currentCourse.modules.forEach(mod => {
            mod.lectures.forEach(lec => {
                const opt = `<option value="${lec.id}">${lec.title}</option>`;
                qSelect.innerHTML += opt;
                aSelect.innerHTML += opt;
            });
        });
    }

    function populateSubmissions() {
        const tbody = document.getElementById('submissionTableBody');
        tbody.innerHTML = '';

        const submissions = getSubmissions().filter(s => s.courseId === courseId);

        if (submissions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">No submissions yet.</td></tr>';
            return;
        }

        submissions.forEach((sub, localIndex) => {
            // Find global index in the full submissions array for grading
            const fullList = getSubmissions();
            const globalIndex = fullList.findIndex(s => s.studentId === sub.studentId && s.lectureId === sub.lectureId && s.submittedAt === sub.submittedAt);

            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td>${sub.studentName || sub.studentId}</td>
        <td>${sub.lectureId}</td>
        <td><i style="color:#64748b;">"${sub.content.substring(0, 30)}${sub.content.length > 30 ? '...' : ''}"</i></td>
        <td><span class="status-badge ${sub.status}">${sub.status}</span></td>
        <td>
          ${sub.status === 'pending'
                    ? `<button class="secondary-btn" style="padding:4px 8px; font-size:12px;" onclick="grade(${globalIndex})">Grade</button>`
                    : '---'}
        </td>
      `;
            tbody.appendChild(tr);
        });
    }

    // 5. Global Actions
    window.grade = (globalIndex) => {
        gradeSubmission(globalIndex);
        populateSubmissions();
        showStickyNotification('Submission marked as Graded!');
    };

    window.deleteLecture = (lecId) => {
        if (!confirm('Are you sure you want to delete this lecture? This will hide it for all students.')) return;

        // Check if it's an extra lecture
        const extraKey = 'cseconnect_extra_lectures_' + courseId;
        const extraLecs = JSON.parse(localStorage.getItem(extraKey) || '[]');
        const extraIdx = extraLecs.findIndex(l => l.id === lecId);

        if (extraIdx !== -1) {
            extraLecs.splice(extraIdx, 1);
            localStorage.setItem(extraKey, JSON.stringify(extraLecs));
        } else {
            // It's a core lecture, add to deleted list
            const deletedKey = 'cseconnect_deleted_lectures_' + courseId;
            const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]');
            if (!deletedIds.includes(lecId)) {
                deletedIds.push(lecId);
                localStorage.setItem(deletedKey, JSON.stringify(deletedIds));
            }
        }
        
        showStickyNotification('Lecture deleted successfully.');
        loadCourseData();
    };

    window.saveQuiz = () => {
        const lecId = document.getElementById('quizLecSelect').value;
        const question = document.getElementById('quizQuestion').value.trim();
        if (!question) return alert('Enter a question.');

        const extraKey = 'cseconnect_extra_quizzes_' + courseId;
        const quizzes = JSON.parse(localStorage.getItem(extraKey) || '[]');
        quizzes.push({ courseId, lecId, question, id: Date.now() });
        localStorage.setItem(extraKey, JSON.stringify(quizzes));

        document.getElementById('quizQuestion').value = '';
        showStickyNotification('Quiz added to lecture.');
    };

    window.saveAssignment = () => {
        const lecId = document.getElementById('asgnLecSelect').value;
        const title = document.getElementById('asgnTitle').value.trim();
        const desc = document.getElementById('asgnDesc').value.trim();
        if (!title || !desc) return alert('Enter title and description.');

        const extraKey = 'cseconnect_extra_assignments_' + courseId;
        const assignments = JSON.parse(localStorage.getItem(extraKey) || '[]');
        assignments.push({ courseId, lecId, title, desc, id: Date.now() });
        localStorage.setItem(extraKey, JSON.stringify(assignments));

        document.getElementById('asgnTitle').value = '';
        document.getElementById('asgnDesc').value = '';
        showStickyNotification('Assignment assigned to lecture.');
    };

    // 6. Modal Functions
    const modal = document.getElementById('lectureModal');
    window.openLectureModal = () => { modal.style.display = 'flex'; };
    window.closeLectureModal = () => { modal.style.display = 'none'; };

    window.handleLectureSave = () => {
        const title = document.getElementById('lecTitleInput').value.trim();
        const videoUrl = document.getElementById('lecVideoInput').value.trim();
        const hasQuiz = document.getElementById('lecQuizCheck').checked;
        const hasAssignment = document.getElementById('lecAsgnCheck').checked;
        
        if (!title) return alert('Enter title.');

        const extraKey = 'cseconnect_extra_lectures_' + courseId;
        const extraLecs = JSON.parse(localStorage.getItem(extraKey) || '[]');
        const newLec = {
            id: 'extra_' + Date.now(),
            title: title,
            videoUrl: videoUrl,
            hasQuiz: hasQuiz,
            hasAssignment: hasAssignment
        };
        extraLecs.push(newLec);
        localStorage.setItem(extraKey, JSON.stringify(extraLecs));

        showStickyNotification('New lecture uploaded.');
        loadCourseData();
        closeLectureModal();
    };

    function showStickyNotification(msg) {
        let container = document.getElementById('notifContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifContainer';
            container.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:9999; display:flex; flex-direction:column; gap:10px; pointer-events:none;';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.style.cssText = 'background:#1e293b; color:white; padding:12px 24px; border-radius:8px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border-left:4px solid #3b82f6; font-size:14px; font-weight:500; animation:slideDown 0.3s ease-out, fadeOut 0.3s ease-in 2.7s forwards; pointer-events:auto;';
        toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#3b82f6; margin-right:8px;"></i> ${msg}`;
        
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Add CSS animations for the notification
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slideDown { 
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

})();
