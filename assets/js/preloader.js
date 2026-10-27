// Register SplitText if GSAP is loaded
if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined') {
    gsap.registerPlugin(SplitText);
}

document.body.classList.add('is-loading');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const preloaderEl = document.querySelector('.site-preloader');

if (preloaderEl) {
    if (prefersReducedMotion) {
        // Reduced motion: simple fade out
        gsap.to(preloaderEl, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
                document.body.classList.remove('is-loading');
                preloaderEl.remove();
                window.dispatchEvent(new CustomEvent('preloader:complete'));
                window.dispatchEvent(new CustomEvent('preloader:hero-reveal'));
            }
        });
    } else {
        // Query param to force preloader check (for testing ease)
        const urlParams = new URLSearchParams(window.location.search);
        const forcePreloader = urlParams.get('force-preloader') === 'true' || urlParams.get('reloader') === 'true';
        const isFirstLoad = !sessionStorage.getItem('acumen_preloader_shown') || forcePreloader;

        if (isFirstLoad) {
            sessionStorage.setItem('acumen_preloader_shown', 'true');

            // 1. Split text for wordmark characters
            let logoChars = [];
            if (typeof SplitText !== 'undefined') {
                const logoSplit = new SplitText('.site-preloader__text', { type: 'chars' });
                logoChars = logoSplit.chars;
            }

            const dot = document.querySelector('.site-preloader__progress-dot');
            const track = document.querySelector('.site-preloader__progress');
            const trackHeight = track ? track.offsetHeight : 90;
            const dotHeight = dot ? dot.offsetHeight : 10;

            const tl = gsap.timeline({
                onComplete: () => {
                    document.body.classList.remove('is-loading');
                    preloaderEl.remove();
                    window.dispatchEvent(new CustomEvent('preloader:complete'));
                }
            });

            // Phase 1: Progress dot travel
            if (dot) {
                tl.to(dot, { 
                    y: trackHeight - dotHeight, 
                    duration: 2.2, 
                    ease: 'power1.inOut' 
                }, 0);
            }

            // Phase 1.5: Logo image reveal (starts at 0.15s)
            const logoImg = document.querySelector('.site-preloader__logo img');
            if (logoImg) {
                tl.fromTo(logoImg, {
                    opacity: 0,
                    scale: 0.8
                }, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    ease: 'back.out(1.5)'
                }, 0.15);
            }

            // Phase 2: Logo wordmark reveal (starts at 0.25s)
            if (logoChars.length > 0) {
                tl.set('.site-preloader__text', { opacity: 1 }, 0.25);
                tl.fromTo(logoChars, { 
                    opacity: 0, 
                    y: 12 
                }, {
                    opacity: 1,
                    y: 0,
                    duration: 0.7, 
                    stagger: 0.03, 
                    ease: 'power2.out' 
                }, 0.25);
            } else {
                tl.fromTo('.site-preloader__text', { 
                    opacity: 0, 
                    y: 12 
                }, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8, 
                    ease: 'power2.out' 
                }, 0.25);
            }

            // Phase 3: Logo fades away slowly (starts at 2.2s, duration 0.9s)
            tl.to('.site-preloader__logo', {
                opacity: 0,
                scale: 0.93,
                duration: 0.9,
                ease: 'power2.inOut'
            }, 2.2);

            // Phase 4: Tagline reveal (Beyond gets scale-up) (starts at 2.9s)
            tl.fromTo('.site-preloader__word', { 
                opacity: 0, 
                y: 20 
            }, {
                opacity: 1,
                y: 0,
                duration: 0.9, 
                stagger: 0.22, 
                ease: 'power3.out' 
            }, 2.9);

            tl.fromTo('.site-preloader__word--accent', {
                scale: 0.8
            }, {
                scale: 1,
                duration: 0.7,
                ease: 'back.out(1.5)'
            }, 3.34); // overlap with the accent word's fade stagger

            // Phase 5: Hold (duration 1.2s)
            tl.to({}, { duration: 1.2 });

            // Phase 6: Exit tagline (fades/slides out)
            tl.to('.site-preloader__tagline', { 
                opacity: 0, 
                y: -20, 
                duration: 0.8, 
                ease: 'power2.in' 
            });

            // Phase 7: Overlay dissolve
            tl.to(preloaderEl, { 
                opacity: 0, 
                duration: 0.9, 
                ease: 'power2.inOut',
                pointerEvents: 'none'
            }, '-=0.2');

            // Phase 8: Trigger Hero Reveal 0.9s before timeline completes
            tl.add(() => {
                window.dispatchEvent(new CustomEvent('preloader:hero-reveal'));
            }, '-=0.9');

        } else {
            // Subsequent loads in the same session: fast fade out
            gsap.to(preloaderEl, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                    document.body.classList.remove('is-loading');
                    preloaderEl.remove();
                    window.dispatchEvent(new CustomEvent('preloader:complete'));
                    window.dispatchEvent(new CustomEvent('preloader:hero-reveal'));
                }
            });
        }
    }
}
