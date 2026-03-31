/* =========================================================
   purchaseUtils.js — CSEConnect Purchase Helpers
   ========================================================= */

function getPurchasedKey() {
    const s = typeof getSession === 'function' ? getSession() : null;
    return s ? `cseconnect_purchased_${s.id}` : 'cseconnect_purchased';
}

function getProgressKey() {
    const s = typeof getSession === 'function' ? getSession() : null;
    return s ? `cseconnect_progress_${s.id}` : 'cseconnect_progress';
}

/** Get array of purchased course IDs */
function getPurchasedCourses() {
    try {
        const raw = localStorage.getItem(getPurchasedKey());
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

/** Purchase a course (no-op if already purchased) */
function purchaseCourse(courseId) {
    const list = getPurchasedCourses();
    if (!list.includes(courseId)) {
        list.push(courseId);
        localStorage.setItem(getPurchasedKey(), JSON.stringify(list));
    }
}

/** Check if a course is purchased */
function hasPurchased(courseId) {
    return getPurchasedCourses().includes(courseId);
}

/** Get progress object { courseId: { lecId: true/false } } */
function getProgress() {
    try {
        const raw = localStorage.getItem(getProgressKey());
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

/** Mark a lecture as completed or not */
function markLectureComplete(courseId, lectureId, complete = true) {
    const progress = getProgress();
    if (!progress[courseId]) progress[courseId] = {};
    if (complete) {
        progress[courseId][lectureId] = true;
    } else {
        delete progress[courseId][lectureId];
    }
    localStorage.setItem(getProgressKey(), JSON.stringify(progress));
}

/** Calculate completion percentage for a course */
function getCourseProgress(courseId, totalLectures) {
    const progress = getProgress();
    const courseProgress = progress[courseId] || {};
    const completed = Object.values(courseProgress).filter(Boolean).length;
    // Formula: completed / total * 100
    return totalLectures > 0 ? Math.round((completed / totalLectures) * 100) : 0;
}

/** Helper to inject extra lectures added by faculty */
function injectExtraLectures(courses) {
    if(!Array.isArray(courses)) return;
    courses.forEach(course => {
        const extraKey = 'cseconnect_extra_lectures_' + course.id;
        const extraLecs = JSON.parse(localStorage.getItem(extraKey) || '[]');
        if (extraLecs.length > 0) {
            if (!course.modules || course.modules.length === 0) {
                course.modules = [{ 
                    title: 'Additional Lectures', 
                    moduleNumber: 1, 
                    lectures: [] 
                }];
            }
            // Check if we already injected them to avoid duplicates (though usually fetch runs once)
            const lastMod = course.modules[course.modules.length - 1];
            extraLecs.forEach(el => {
                if (!lastMod.lectures.find(l => l.id === el.id)) {
                    lastMod.lectures.push(el);
                }
            });
        }
    });
}

/** Filter out lectures that the faculty marked as 'deleted' */
function filterDeletedLectures(courseId, courses) {
    if (!Array.isArray(courses)) return;
    const deletedKey = 'cseconnect_deleted_lectures_' + courseId;
    const deletedIds = JSON.parse(localStorage.getItem(deletedKey) || '[]');
    
    if (deletedIds.length === 0) return;

    courses.forEach(c => {
        if (c.id === courseId) {
            c.modules.forEach(m => {
                m.lectures = m.lectures.filter(l => !deletedIds.includes(l.id));
            });
        }
    });
}
