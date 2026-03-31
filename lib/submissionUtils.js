/* =========================================================
   submissionUtils.js — CSEConnect Submission Helpers
   ========================================================= */

const SUBMISSIONS_KEY = 'cseconnect_submissions';

/** Get all submissions */
function getSubmissions() {
    try {
        const raw = localStorage.getItem(SUBMISSIONS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

/** Add a new submission */
function addSubmission(submission) {
    const list = getSubmissions();
    list.push(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
}

/** Check if a student has already submitted for a specific lecture */
function hasSubmitted(studentId, courseId, lectureId) {
    return getSubmissions().some(
        s => s.studentId === studentId &&
            s.courseId === courseId &&
            s.lectureId === lectureId
    );
}

/** Mark a submission as graded by its index */
function gradeSubmission(index) {
    const list = getSubmissions();
    if (list[index]) {
        list[index].status = 'graded';
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
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
