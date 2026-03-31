/* =========================================================
   auth.js — CSEConnect Authentication Helpers
   ========================================================= */

/**
 * Attempt to log a user in.
 * Fetches /data/users.json, matches id + password.
 * Returns the user object on success, null on failure.
 */
async function loginUser(id, password) {
    try {
        const res = await fetch('../data/users.json');
        const users = await res.json();
        const user = users.find(
            u => u.id === id.trim() && u.password === password
        );
        return user || null;
    } catch (e) {
        console.error('Login fetch error:', e);
        return null;
    }
}

/** Save user session to localStorage */
function saveSession(user) {
    const session = {
        id: user.id,
        name: user.name,
        role: user.role
    };
    if (user.assignedCourses) session.assignedCourses = user.assignedCourses;
    localStorage.setItem('cseconnect_user', JSON.stringify(session));
}

/** Get current session (or null) */
function getSession() {
    try {
        const raw = localStorage.getItem('cseconnect_user');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

/** Clear session */
function logoutUser() {
    localStorage.removeItem('cseconnect_user');
}

/** Role checks */
function isStudent() {
    const s = getSession();
    return s && s.role === 'student';
}

function isFaculty() {
    const s = getSession();
    return s && s.role === 'faculty';
}

/**
 * Guard helper — call at the top of protected pages.
 * requiredRole: 'student' | 'faculty' | null (any logged-in)
 * loginPath: relative path to the login page from current page
 */
function requireAuth(requiredRole, loginPath) {
    const session = getSession();
    if (!session) {
        window.location.href = loginPath || '../home/index.html';
        return null;
    }
    if (requiredRole && session.role !== requiredRole) {
        // Redirect to correct dashboard
        if (session.role === 'student') {
            window.location.href = loginPath.replace('home/index.html', 'student/course_page.html');
        } else {
            window.location.href = loginPath.replace('home/index.html', 'instructor/faculty_dashboard.html');
        }
        return null;
    }
    return session;
}
