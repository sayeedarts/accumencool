document.addEventListener('DOMContentLoaded', () => {
    // Return early if GSAP or ScrollTrigger is not loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileQuery = window.matchMedia('(max-width: 767px)');
    
    let scrollTriggers = [];

    function initSectionStack() {
        // Clear existing stack triggers and inline styles
        killSectionStack();

        // Skip transitions for mobile viewports and prefers-reduced-motion contexts
        if (prefersReducedMotion || isMobileQuery.matches) {
            return;
        }

        const panels = gsap.utils.toArray('.pin-panel');
        
        panels.forEach((panel, i) => {
            const inner = panel.querySelector('.pin-panel__inner');
            if (!inner) return;

            const isLast = i === panels.length - 1;
            const windowHeight = window.innerHeight;
            const difference = Math.max(0, inner.offsetHeight - windowHeight);
            const pinDuration = difference + windowHeight;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: panel,
                    start: 'top top',
                    end: () => `+=${pinDuration}`,
                    pinSpacing: false,
                    pin: true,
                    scrub: true,
                    invalidateOnRefresh: true
                }
            });

            // If the inner content is taller than the viewport, fake-scroll it first
            if (difference > 0) {
                tl.to(inner, {
                    y: -difference,
                    duration: difference / pinDuration,
                    ease: 'none'
                });
            }

            // Stack deck transition: scale down and fade out the previous panel as next slides in
            if (!isLast) {
                const exitStart = difference > 0 ? (difference / pinDuration) : 0;
                const exitDuration = windowHeight / pinDuration;

                tl.fromTo(panel,
                    { scale: 1, opacity: 1 },
                    { scale: 0.5, opacity: 0, duration: exitDuration, ease: 'none' },
                    exitStart
                );
            }

            if (tl.scrollTrigger) {
                scrollTriggers.push(tl.scrollTrigger);
            }
        });
    }

    function killSectionStack() {
        scrollTriggers.forEach(t => t.kill(true));
        scrollTriggers = [];

        const panels = gsap.utils.toArray('.pin-panel');
        panels.forEach(panel => {
            panel.style.position = '';
            panel.style.top = '';
            panel.style.left = '';
            panel.style.width = '';
            panel.style.height = '';
            panel.style.marginBottom = '';
            const inner = panel.querySelector('.pin-panel__inner');
            if (inner) {
                inner.style.transform = '';
            }
        });
    }

    // Initialize the transitions
    initSectionStack();

    // Re-initialize on window load to ensure all dynamically sized content/images are loaded
    window.addEventListener('load', () => {
        initSectionStack();
        ScrollTrigger.refresh();
    });

    // GSAP ScrollTrigger Lifecycle Listeners for natural measurements on refresh/resize
    ScrollTrigger.addEventListener('refreshInit', () => {
        // Strip transforms so ScrollTrigger measures original elements sizes naturally
        const panels = gsap.utils.toArray('.pin-panel');
        panels.forEach(panel => {
            const inner = panel.querySelector('.pin-panel__inner');
            if (inner) inner.style.transform = '';
        });
    });

    // Handle mobile query changes or resized viewports
    isMobileQuery.addEventListener('change', (e) => {
        if (e.matches) {
            killSectionStack();
        } else {
            initSectionStack();
        }
        ScrollTrigger.refresh();
    });

    // Debounced window resize handler for viewport measurements
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (!isMobileQuery.matches) {
                initSectionStack();
            }
            ScrollTrigger.refresh();
        }, 250);
    });
});
