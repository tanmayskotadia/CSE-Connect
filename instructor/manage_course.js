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
          <td><button class="secondary-btn" style="padding:4px 8px; font-size:12px;">Edit</button></td>
        `;
                tbody.appendChild(tr);
            });
        });
    }

    function populateSelects() {
        const qSelect = document.getElementById('quizLecSelect');
        const aSelect = document.getElementById('asgnLecSelect');
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
        showToast('Marked as Graded!');
    };

    window.saveQuiz = () => {
        const lecId = document.getElementById('quizLecSelect').value;
        const question = document.getElementById('quizQuestion').value.trim();
        if (!question) return alert('Enter a question.');

        // In a real app, we'd save this to a DB. For now, localStorage.
        const quizzes = JSON.parse(localStorage.getItem('cseconnect_quizzes') || '[]');
        quizzes.push({ courseId, lecId, question, id: Date.now() });
        localStorage.setItem('cseconnect_quizzes', JSON.stringify(quizzes));

        document.getElementById('quizQuestion').value = '';
        showToast('Quiz saved successfully!');
    };

    window.saveAssignment = () => {
        const lecId = document.getElementById('asgnLecSelect').value;
        const title = document.getElementById('asgnTitle').value.trim();
        const desc = document.getElementById('asgnDesc').value.trim();
        if (!title || !desc) return alert('Enter title and description.');

        const assignments = JSON.parse(localStorage.getItem('cseconnect_assignments') || '[]');
        assignments.push({ courseId, lecId, title, desc, id: Date.now() });
        localStorage.setItem('cseconnect_assignments', JSON.stringify(assignments));

        document.getElementById('asgnTitle').value = '';
        document.getElementById('asgnDesc').value = '';
        showToast('Assignment saved successfully!');
    };

    // 6. Modal Functions
    const modal = document.getElementById('lectureModal');
    window.openLectureModal = () => { modal.style.display = 'flex'; };
    window.closeLectureModal = () => { modal.style.display = 'none'; };

    window.handleLectureSave = () => {
        const title = document.getElementById('lecTitleInput').value.trim();
        if (!title) return alert('Enter title.');

        // Mirroring save logic (would update courses.json in real life)
        showToast('Lecture added (mirrored in local storage)');
        closeLectureModal();
    };

    function showToast(msg) {
        const t = document.getElementById('toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    }

})();
