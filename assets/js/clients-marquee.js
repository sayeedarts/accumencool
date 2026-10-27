/**
 * clients-marquee.js
 * Infinite vertical scrolling logo waterfall with interactive hover pause/resume.
 */

window.initClientsMarquee = function () {
    if (typeof gsap === 'undefined') return;

    // Respect OS prefers-reduced-motion settings
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const columns = document.querySelectorAll('.clients-marquee__column');

    columns.forEach((column, idx) => {
        const track = column.querySelector('.clients-marquee__track');
        if (!track) return;

        let tween;
        // Vary durations to keep columns out of phase (waterfall effect)
        const duration = idx === 0 ? 28 : idx === 1 ? 34 : 24;

        if (idx === 1) {
            // Column 2 scrolls DOWN (offset start at -50% and animate to 0%)
            tween = gsap.fromTo(track, 
                { yPercent: -50 },
                { 
                    yPercent: 0, 
                    duration: duration, 
                    ease: "none", 
                    repeat: -1 
                }
            );
        } else {
            // Columns 1 and 3 scroll UP (animate from 0% to -50%)
            tween = gsap.to(track, {
                yPercent: -50,
                duration: duration,
                ease: "none",
                repeat: -1
            });
        }

        // Hover Column: Pause/Resume track scrolling
        column.addEventListener('mouseenter', () => {
            if (tween) tween.pause();
        });

        column.addEventListener('mouseleave', () => {
            if (tween) tween.play();
        });
    });
};
