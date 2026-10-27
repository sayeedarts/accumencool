document.addEventListener('DOMContentLoaded', () => {
    const siteMenu = document.querySelector('.site-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const menuClose = document.querySelector('.site-menu__close');

    if (!siteMenu || !menuToggle || typeof gsap === 'undefined') return;

    // Create GSAP Timeline for opening and closing the menu
    const menuTl = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
            gsap.set(siteMenu, { visibility: 'hidden' });
        }
    });

    menuTl.set(siteMenu, { visibility: 'visible' })
        .to(siteMenu, { opacity: 1, duration: 0.3 })
        .fromTo('.site-menu__pane--contact', { xPercent: -100 }, { xPercent: 0, duration: 0.5, ease: 'power3.out' }, '-=0.1')
        .fromTo('.site-menu__pane--menu', { yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: 'power3.out' }, '<')
        .fromTo('.site-menu__item', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out' }, '-=0.2')
        .fromTo('.site-menu__banner', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, '-=0.1');

    // Accessibility Selector
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    // Focus Trap Logic
    function trapFocus(e) {
        if (e.key !== 'Tab') return;
        const focusable = siteMenu.querySelectorAll(focusableSelector);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === first) {
                last.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === last) {
                first.focus();
                e.preventDefault();
            }
        }
    }

    // Escape Key logic
    function handleEscape(e) {
        if (e.key === 'Escape') {
            const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                toggleMenu();
            }
        }
    }

    // Toggle Menu State
    function toggleMenu() {
        const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
        const nextState = !isOpen;

        // Toggle trigger classes
        menuToggle.classList.toggle('is-active', nextState);
        menuToggle.setAttribute('aria-expanded', String(nextState));
        siteMenu.setAttribute('aria-hidden', String(!nextState));

        // Lock / Unlock Page Scroll
        if (nextState) {
            document.body.classList.add('menu-open');
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            if (typeof ScrollSmoother !== 'undefined' && ScrollSmoother.get()) {
                ScrollSmoother.get().paused(true);
            }

            // Play Timeline & Trap Focus
            menuTl.play();
            document.addEventListener('keydown', trapFocus);
            document.addEventListener('keydown', handleEscape);

            // Shift focus to close button
            setTimeout(() => {
                if (menuClose) menuClose.focus();
            }, 100);
        } else {
            document.body.classList.remove('menu-open');
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            if (typeof ScrollSmoother !== 'undefined' && ScrollSmoother.get()) {
                ScrollSmoother.get().paused(false);
            }

            // Reverse Timeline & Release Focus
            menuTl.reverse();
            document.removeEventListener('keydown', trapFocus);
            document.removeEventListener('keydown', handleEscape);

            // Return focus to trigger button
            setTimeout(() => {
                menuToggle.focus();
            }, 100);
        }
    }

    // Event Binds
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    if (menuClose) {
        menuClose.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Close menu when clicking backdrop of contact pane
    siteMenu.addEventListener('click', (e) => {
        if (e.target === siteMenu) {
            toggleMenu();
        }
    });

    // Expandable Menu Item (Accordion) Logic
    const expandableItems = siteMenu.querySelectorAll('.site-menu__item--expandable');
    expandableItems.forEach((item, index) => {
        const sublist = item.querySelector('.site-menu__sublist');
        const indicator = item.querySelector('.site-menu__plus');

        // Accessibility attributes
        const listId = `site-menu-sublist-${index}`;
        if (sublist) {
            sublist.setAttribute('id', listId);
            item.setAttribute('aria-controls', listId);
        }

        item.addEventListener('click', (e) => {
            // Allow nested links to navigate normally
            if (e.target.closest('a')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            const isExpanded = item.getAttribute('aria-expanded') === 'true';
            const newState = !isExpanded;

            item.setAttribute('aria-expanded', String(newState));

            if (newState) {
                if (sublist) {
                    sublist.style.maxHeight = `${sublist.scrollHeight}px`;
                    sublist.style.opacity = '1';
                    sublist.style.marginTop = '16px';
                }
                if (indicator) {
                    gsap.to(indicator, { rotation: 45, duration: 0.3 });
                }
            } else {
                if (sublist) {
                    sublist.style.maxHeight = '0';
                    sublist.style.opacity = '0';
                    sublist.style.marginTop = '0';
                }
                if (indicator) {
                    gsap.to(indicator, { rotation: 0, duration: 0.3 });
                }
            }
        });
    });
});
