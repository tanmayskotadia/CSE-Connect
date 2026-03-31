/* =========================================================
   view_sub.js — Faculty global submission viewer
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

    // 2. Populate Table
    const assignedCourses = session.assignedCourses || [];
    const submissions = getAllSubmissions().filter(s => assignedCourses.includes(s.courseId));

    const tbody = document.getElementById('globalSubTableBody');
    const subtitle = document.getElementById('subSubtitle');

    subtitle.textContent = `${submissions.length} submissions total across your courses`;

    tbody.innerHTML = '';
    if (submissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:#64748b;">No student submissions found.</td></tr>';
    } else {
        submissions.forEach(sub => {
            const tr = document.createElement('tr');

            const date = sub.submittedAt ? sub.submittedAt.split('T')[0] : '---';
            const statusClass = sub.status === 'graded' ? 'graded' : 'submitted';

            tr.innerHTML = `
        <td>${sub.studentName || sub.studentId}</td>
        <td>${sub.lectureId} (${sub.courseId})</td>
        <td><span class="badge ${statusClass}">${sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}</span></td>
        <td>${date}</td>
        <td>
          <span class="view" onclick="openSub('${sub.id}')" style="cursor:pointer; color:#1d4ed8; font-weight:600;">
            <i class="fa-solid fa-eye"></i> View
          </span>
        </td>
      `;
            tbody.appendChild(tr);
        });
    }

    window.openSub = (id) => {
        const sub = getAllSubmissions().find(s => s.id === id);
        if (!sub) return;
        alert(`Submission by ${sub.studentName}:\n\n${sub.content}`);
        // In a real app, this would open a modal for grading.
    };

})();
