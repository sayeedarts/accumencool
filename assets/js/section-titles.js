/**
 * section-titles.js
 * Sitewide character-level SplitText scroll-reveal animation for section headings (.reveal-title).
 */

(function () {
    // Check dependencies
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitText === 'undefined') {
        console.warn('SplitText or ScrollTrigger not loaded. Section title reveals skipped.');
        return;
    }

    gsap.registerPlugin(SplitText, ScrollTrigger);

    function setupTitleSplits() {
        const titles = document.querySelectorAll(".reveal-title");
        titles.forEach((title) => {
            // Teardown previous split/animation to prevent layout bugs on resize
            if (title._splitAnim) {
                title._splitAnim.progress(1).kill();
                title._splitAnim = null;
            }
            if (title._split) {
                title._split.revert();
                title._split = null;
            }

            // Set aria-label to preserve plaintext reading for assistive technology
            if (!title.getAttribute("aria-label")) {
                title.setAttribute("aria-label", title.textContent.trim());
            }

            // Respect prefers-reduced-motion settings
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReducedMotion) {
                // Simplified simple fade reveal
                title._splitAnim = gsap.from(title, {
                    scrollTrigger: {
                        trigger: title,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    },
                    duration: 0.6,
                    opacity: 0,
                    ease: "power2.out"
                });
                return;
            }

            // Create character and word splits
            title._split = new SplitText(title, { type: "words,chars" });
            const chars = title._split.chars;

            // Accessibility: hide the fragmented DOM elements from screen readers
            title.querySelectorAll('*').forEach(el => {
                el.setAttribute('aria-hidden', 'true');
            });

            // Animate character reveals (moving from 80px down, transparent, staggered)
            title._splitAnim = gsap.from(chars, {
                scrollTrigger: {
                    trigger: title,
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                duration: 0.6,
                ease: "circ.out",
                y: 80,
                opacity: 0,
                stagger: 0.02
            });
        });
    }

    // Bind to window load to make sure typography coordinates are final before splitting
    window.addEventListener("load", () => {
        setupTitleSplits();
        
        // Re-calculate and rebuild on ScrollTrigger layout refreshes (such as window resizing)
        ScrollTrigger.addEventListener("refresh", setupTitleSplits);
    });
})();
