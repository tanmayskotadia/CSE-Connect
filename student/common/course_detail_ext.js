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
            const course = courses.find(c => c.id === courseId);
            if (!course || !course.modules) return;

            buildAccordion(course, purchased);

            if (!purchased) {
                addLockedOverlay();
            }
        })
        .catch(err => console.error('Failed to load courses.json', err));

    function buildAccordion(course, isPurchased) {
        // Find or create modules section
        let section = document.querySelector('.modules-section');
        if (!section) {
            section = document.createElement('section');
            section.className = 'modules-section';

            const heading = document.createElement('h2');
            heading.innerHTML = '<i class="fa-solid fa-layer-group"></i> Course Modules';
            section.appendChild(heading);

            // Insert before the footer or at end of container
            const container = document.querySelector('.container');
            const footer = document.querySelector('.footer');
            if (footer && container) {
                container.appendChild(section);
            } else if (container) {
                container.appendChild(section);
            }
        }

        course.modules.forEach(mod => {
            const accordion = document.createElement('div');
            accordion.className = 'module-accordion';

            // Header
            const header = document.createElement('div');
            header.className = 'module-header';
            header.innerHTML = `
        <h3>
          <span class="mod-num">${mod.moduleNumber}</span>
          ${mod.title}
        </h3>
        <i class="fa-solid fa-chevron-down chevron"></i>
      `;
            header.addEventListener('click', () => {
                accordion.classList.toggle('open');
            });
            accordion.appendChild(header);

            // Body
            const body = document.createElement('div');
            body.className = 'module-body';

            mod.lectures.forEach(lec => {
                const row = document.createElement('div');
                row.className = 'accordion-lecture';

                const titleDiv = document.createElement('div');
                titleDiv.className = 'lec-title' + (!isPurchased ? ' locked' : '');

                if (!isPurchased) {
                    titleDiv.innerHTML = `<i class="fa-solid fa-lock lock-sm"></i> ${lec.title}`;
                } else {
                    titleDiv.textContent = lec.title;
                    row.style.cursor = 'pointer';
                    row.onclick = () => {
                        window.location.href = `watch.html?lecId=${lec.id}`;
                    };
                }

                const badges = document.createElement('div');
                badges.className = 'lec-badges';
                if (lec.hasQuiz) {
                    badges.innerHTML += '<span class="lec-badge quiz">Quiz</span>';
                }
                if (lec.hasAssignment) {
                    badges.innerHTML += '<span class="lec-badge assignment">Assignment</span>';
                }

                row.appendChild(titleDiv);
                row.appendChild(badges);
                body.appendChild(row);
            });

            accordion.appendChild(body);
            section.appendChild(accordion);
        });
    }

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
