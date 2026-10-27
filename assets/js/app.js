document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header Functionality
    const header = document.querySelector('.site-header');

    function checkScroll() {
        if (window.scrollY > 250) {
            header.classList.add('site-header--sticky');
        } else {
            header.classList.remove('site-header--sticky');
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Initial check in case of page reload/restored scroll position



    // 3. Skip to Content Link Accessibility
    const skipLink = document.querySelector('.skip-to-content');
    if (skipLink) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(skipLink.getAttribute('href'));
            if (target) {
                target.setAttribute('tabindex', '-1');
                target.focus();
            }
        });
    }
});
