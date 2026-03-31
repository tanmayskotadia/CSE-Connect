/* =========================================================
   submissionUtils.js — CSEConnect Submission Helpers
   ========================================================= */

function getSubmissionsKey() {
    const s = typeof getSession === 'function' ? getSession() : null;
    return s && s.role === 'student' ? `cseconnect_submissions_${s.id}` : 'cseconnect_submissions';
}

/** Get all submissions for the current student OR all students (if faculty) */
function getSubmissions() {
    const session = typeof getSession === 'function' ? getSession() : null;
    if (session && session.role === 'faculty') {
        // Faculty needs all submissions. We'll aggregate from all students.
        // For simplicity in this demo, we'll check common student IDs.
        // In a real DB, this wouldn't be an issue.
        const all = [];
        const students = ['24BCE1000', '24BCE1001']; // Known students from users.json
        students.forEach(id => {
            const raw = localStorage.getItem(`cseconnect_submissions_${id}`);
            if (raw) all.push(...JSON.parse(raw));
        });
        // Also check global just in case
        const globalRaw = localStorage.getItem('cseconnect_submissions');
        if (globalRaw) all.push(...JSON.parse(globalRaw));
        return all;
    }

    try {
        const raw = localStorage.getItem(getSubmissionsKey());
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

/** Add a new submission */
function addSubmission(submission) {
    const list = getSubmissions();
    list.push(submission);
    localStorage.setItem(getSubmissionsKey(), JSON.stringify(list));
}

/** Check if a student has already submitted for a specific lecture */
function hasSubmitted(studentId, courseId, lectureId) {
    return getSubmissions().some(
        s => s.studentId === studentId &&
            s.courseId === courseId &&
            s.lectureId === lectureId
    );
}

/** Mark a submission as graded */
function gradeSubmission(index) {
    const session = typeof getSession === 'function' ? getSession() : null;
    const all = getSubmissions();
    const sub = all[index];
    
    if (sub) {
        sub.status = 'graded';
        // Save back to the specific student's key
        const studentKey = `cseconnect_submissions_${sub.studentId}`;
        const studentRaw = localStorage.getItem(studentKey);
        if (studentRaw) {
            const studentList = JSON.parse(studentRaw);
            const idx = studentList.findIndex(s => s.id === sub.id);
            if (idx !== -1) {
                studentList[idx].status = 'graded';
                localStorage.setItem(studentKey, JSON.stringify(studentList));
            }
        } else {
            // If just in global for some reason
            const globalRaw = localStorage.getItem('cseconnect_submissions');
            if (globalRaw) {
                const globalList = JSON.parse(globalRaw);
                const idx = globalList.findIndex(s => s.id === sub.id);
                if (idx !== -1) {
                    globalList[idx].status = 'graded';
                    localStorage.setItem('cseconnect_submissions', JSON.stringify(globalList));
                }
            }
        }
    }
}

/** Get submissions filtered by courseId */
function getSubmissionsByCourse(courseId) {
    return getSubmissions().filter(s => s.courseId === courseId);
}

/** Count pending submissions */
function getPendingSubmissionsCount() {
    return getSubmissions().filter(s => s.status === 'pending').length;
}

/** Create and save a new submission */
function saveSubmission(studentId, studentName, courseId, lectureId, content) {
    const submission = {
        id: Date.now().toString(),
        studentId,
        studentName,
        courseId,
        lectureId,
        content,
        status: 'pending',
        submittedAt: new Date().toISOString()
    };
    addSubmission(submission);
}

/** Get all submissions by a student */
function getSubmissionsByStudent(studentId) {
    return getSubmissions().filter(s => s.studentId === studentId);
}
