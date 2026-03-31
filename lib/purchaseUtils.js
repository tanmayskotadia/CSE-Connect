/* =========================================================
   purchaseUtils.js — CSEConnect Purchase Helpers
   ========================================================= */

const PURCHASED_KEY = 'cseconnect_purchased';
const PROGRESS_KEY = 'cseconnect_progress';

/** Get array of purchased course IDs */
function getPurchasedCourses() {
    try {
        const raw = localStorage.getItem(PURCHASED_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

/** Purchase a course (no-op if already purchased) */
function purchaseCourse(courseId) {
    const list = getPurchasedCourses();
    if (!list.includes(courseId)) {
        list.push(courseId);
        localStorage.setItem(PURCHASED_KEY, JSON.stringify(list));
    }
}

/** Check if a course is purchased */
function hasPurchased(courseId) {
    return getPurchasedCourses().includes(courseId);
}

/** Get progress object { courseId: { lecId: true/false } } */
function getProgress() {
    try {
        const raw = localStorage.getItem(PROGRESS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

/** Mark a lecture as completed */
function markLectureComplete(courseId, lectureId) {
    const progress = getProgress();
    if (!progress[courseId]) progress[courseId] = {};
    progress[courseId][lectureId] = true;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

/** Calculate completion percentage for a course */
function getCourseProgress(courseId, totalLectures) {
    const progress = getProgress();
    const courseProgress = progress[courseId] || {};
    const completed = Object.values(courseProgress).filter(Boolean).length;
    return totalLectures > 0 ? Math.round((completed / totalLectures) * 100) : 0;
}
