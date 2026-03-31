/* =========================================================
   course_detail_ext.js — Purchase gate + module accordion
   Loaded on each course_detail.html page.
   Expects: auth.js, purchaseUtils.js loaded before this.
   Expects a global `COURSE_ID` string set in the page.
   ========================================================= */

(function () {
    'use strict';

    // ---- Session guard ----
    const session = getSession();
    if (!session) {
        window.location.href = '../../../home/index.html';
        return;
    }
    if (session.role !== 'student') {
        window.location.href = '../../../instructor/faculty_dashboard.html';
        return;
    }

    // Wire logout link
    document.querySelectorAll('.nav-links a').forEach(a => {
        if (a.textContent.trim() === 'Logout') {
            a.addEventListener('click', e => {
                e.preventDefault();
                logoutUser();
                window.location.href = '../../../home/index.html';
            });
        }
    });

    const courseId = window.COURSE_ID;
    if (!courseId) return;

    const purchased = hasPurchased(courseId);

    // ---- Build Module Accordion from courses.json ----
    fetch('../../../data/courses.json')
        .then(r => r.json())
        .then(courses => {
            if (!purchased) {
                addLockedOverlay();
            }
        })
        .catch(err => console.error('Failed to load courses.json', err));


    function addLockedOverlay() {
        // Add overlay on top of the modules section + existing content below header
        const modulesSection = document.querySelector('.modules-section');
        if (!modulesSection) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'locked-overlay';

        // Wrap existing modules section content
        modulesSection.parentNode.insertBefore(wrapper, modulesSection);
        wrapper.appendChild(modulesSection);

        const mask = document.createElement('div');
        mask.className = 'locked-mask';
        mask.innerHTML = `
      <div class="lock-icon">🔒</div>
      <p>Purchase this course to unlock lectures, quizzes, and assignments</p>
      <button class="unlock-btn" id="overlayBuyBtn">Buy Now</button>
    `;
        wrapper.insertBefore(mask, modulesSection);

        document.getElementById('overlayBuyBtn').addEventListener('click', () => {
            purchaseCourse(courseId);
            // Remove overlay and refresh style
            mask.remove();
            wrapper.classList.remove('locked-overlay');
            // Update lecture rows to unlocked
            document.querySelectorAll('.lec-title.locked').forEach(el => {
                el.classList.remove('locked');
                const lockIcon = el.querySelector('.lock-sm');
                if (lockIcon) lockIcon.remove();
            });
            showToast('Enrolled successfully! 🎉');
        });
    }

    // Also hide the "View Lectures" button in the header if not purchased
    if (!purchased) {
        const headerBtn = document.querySelector('.header-btn');
        if (headerBtn) {
            headerBtn.style.display = 'none';
        }
    }

})();

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
