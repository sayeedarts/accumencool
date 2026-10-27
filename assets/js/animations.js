// Register ScrollTrigger and SplitText if GSAP is loaded
if (typeof gsap !== 'undefined') {
    if (typeof SplitText !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger, SplitText);
    } else {
        gsap.registerPlugin(ScrollTrigger);
    }
}

// Reusable counter animation function
window.animateCounter = function (el, target, suffix = '', prefix = '', duration = 2.0) {
    if (!el) return;
    const countObj = { val: 0 };
    gsap.to(countObj, {
        val: target,
        duration: duration,
        ease: 'power2.out',
        onUpdate: () => {
            el.innerText = prefix + Math.floor(countObj.val) + suffix;
        },
        onComplete: () => {
            el.innerText = prefix + target + suffix;
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // If user prefers reduced motion, do not load heavy animations
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof gsap === 'undefined') {
        // Fallback for all counters
        const allCounters = document.querySelectorAll('.stat-counter, .intro-stats__stat-number, .proof-collage__stat-number, .company-intro__stat-number, .execution-capacity__number');
        allCounters.forEach(counter => {
            const staticText = counter.getAttribute('data-static');
            if (staticText === 'true') {
                return;
            }
            const target = counter.getAttribute('data-target') || counter.getAttribute('data-count') || '0';
            const suffix = counter.getAttribute('data-suffix') || '';
            const prefix = counter.getAttribute('data-prefix') || '';
            counter.innerText = prefix + target + suffix;
        });

        // Make timeline items visible directly
        const nodes = document.querySelectorAll('.timeline-node');
        nodes.forEach(node => node.classList.add('timeline-node--active'));
        const progressLine = document.querySelector('.timeline__progress-line');
        if (progressLine) progressLine.style.width = '100%';

        // Resolve active horizontal accordion tags instantly
        const activePanel = document.querySelector('.service-accordion-h__panel--active');
        if (activePanel) {
            const activeTags = activePanel.querySelectorAll('.service-accordion-h__tag');
            activeTags.forEach(tag => {
                tag.style.opacity = '1';
                tag.style.transform = 'none';
            });
        }
        return;
    }

    // Reusable block reveal scroll-animation utility
    function initBlockReveal(triggerSelector, itemSelector, options = {}) {
        document.querySelectorAll(triggerSelector).forEach((trigger) => {
            const items = trigger.querySelectorAll(itemSelector);
            if (!items.length) return;
            gsap.from(items, {
                scrollTrigger: {
                    trigger: trigger,
                    start: options.start || 'top 90%'
                },
                opacity: 0,
                y: options.y ?? 50,
                stagger: options.stagger ?? 0.08,
                duration: options.duration ?? 0.8,
                ease: 'power3.out'
            });
        });
    }

    // ==========================================================================
    // 1. HERO ANIMATIONS
    // ==========================================================================
    function playHeroReveal() {
        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Hero background zoom/fade in
        heroTl.from('.hero__bg', { scale: 1.1, duration: 1.5, ease: 'sine.out' });

        // Line-by-line heading reveal using SplitText lines mask
        if (typeof SplitText !== 'undefined') {
            const heroSplit = new SplitText('.hero__title', { type: 'lines', mask: 'lines' });
            heroTl.from(heroSplit.lines, {
                opacity: 0,
                y: '100%',
                duration: 0.9,
                stagger: 0.12
            }, '-=1.2');
        } else {
            heroTl.from('.hero__title', {
                opacity: 0,
                y: 40,
                duration: 0.9
            }, '-=1.2');
        }

        // Badge row, description, CTA actions, and scroll indicator
        heroTl.from('.hero__badge-row', { opacity: 0, y: 30, duration: 0.8 }, '-=0.75')
            .from('.hero__description', { opacity: 0, y: 30, duration: 0.8 }, '-=0.6')
            .from('.hero__actions', { opacity: 0, y: 20, duration: 0.8 }, '-=0.45')
            .from('.hero__scroll-indicator', { opacity: 0, y: -20, duration: 0.8 }, '-=0.3');
    }

    // Bind reveal to custom preloader event
    window.addEventListener('preloader:hero-reveal', playHeroReveal);

    // Fallback in case preloader element is not present on current page
    if (!document.querySelector('.site-preloader') || prefersReducedMotion) {
        playHeroReveal();
    }

    // Staggered floating stat cards
    gsap.from('.hero__stat-card', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top 80%'
        },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
    });

    gsap.from('.hero__badge-circle', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top 80%'
        },
        opacity: 0,
        scale: 0.8,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.7)',
        delay: 0.3
    });

    // ==========================================================================
    // 1B. PAGE HEADER TIMELINE
    // ==========================================================================
    const pageHeader = document.querySelector('.page-header');
    if (pageHeader && !prefersReducedMotion) {
        const phTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
        phTl.from('.page-header__bg', { scale: 1.05, opacity: 0, duration: 1.5, ease: 'sine.out' })
            .from('.page-header__breadcrumb', { opacity: 0, y: 15 }, '-=1.2')
            .from('.page-header__heading-bold', { opacity: 0, y: 30 }, '-=1.0')
            .from('.page-header__heading-accent', { opacity: 0, y: 30 }, '-=0.85')
            .from('.page-header__description', { opacity: 0, y: 20 }, '-=0.8')
            .from('.page-header__actions', { opacity: 0, y: 15 }, '-=0.6')
            .from('.page-header__stats', { opacity: 0, y: 20 }, '-=0.5');
    }

    // ==========================================================================
    // 2. SCROLL REVEALS
    // ==========================================================================


    // Grayscale trust strip logos stagger
    gsap.from('.trust-strip__logo', {
        scrollTrigger: {
            trigger: '.trust-strip',
            start: 'top 90%'
        },
        opacity: 0,
        y: 50,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out'
    });

    // Clients marquee intro reveal
    const clientsMarquee = document.querySelector('.clients-marquee');
    if (clientsMarquee) {
        gsap.from(clientsMarquee.querySelectorAll('.clients-marquee__intro > *'), {
            scrollTrigger: {
                trigger: clientsMarquee,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power3.out'
        });
    }



    // General section header reveals
    const sections = ['why-intro', 'process', 'services', 'testimonials-strip', 'company-teaser', 'final-cta', 'about-intro', 'services-full', 'projects-header', 'featured-project', 'contact-split', 'faq-accordion'];
    sections.forEach(secClass => {
        const el = document.querySelector(`.${secClass}`);
        if (el) {
            gsap.from(el.querySelectorAll('h2:not(.reveal-title), .badge, .section-header, p'), {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                opacity: 0,
                y: 30,
                stagger: 0.1,
                duration: 0.8,
                ease: 'power3.out'
            });
        }
    });

    // Why Choose Us Collage reveal
    gsap.from('.why-intro__collage figure', {
        scrollTrigger: {
            trigger: '.why-intro__collage',
            start: 'top 85%'
        },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
    });



    // Process step cards reveal
    gsap.from('.process-step', {
        scrollTrigger: {
            trigger: '.process__grid',
            start: 'top 85%'
        },
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out'
    });

    // ==========================================================================
    // 3. STATS TICKER ANIMATION (Refactored)
    // ==========================================================================
    const counters = document.querySelectorAll('.stat-counter');
    counters.forEach(counter => {
        const targetValue = parseInt(counter.getAttribute('data-target'), 10);
        const suffix = counter.getAttribute('data-suffix') || '';

        ScrollTrigger.create({
            trigger: counter,
            start: 'top 90%',
            once: true,
            onEnter: () => {
                window.animateCounter(counter, targetValue, suffix, '', 2.0);
            }
        });
    });

    // ==========================================================================
    // 4. TIMELINE DRAWING ANIMATION
    // ==========================================================================
    const timeline = document.querySelector('.timeline');
    if (timeline) {
        // Draw progress line
        gsap.to('.timeline__progress-line', {
            scrollTrigger: {
                trigger: timeline,
                start: 'top 60%',
                end: 'bottom 40%',
                scrub: true
            },
            width: '100%',
            ease: 'none'
        });

        // Activate dots and cards as scroll progresses
        const nodes = document.querySelectorAll('.timeline-node');
        nodes.forEach(node => {
            gsap.to(node, {
                scrollTrigger: {
                    trigger: node,
                    start: 'top 60%',
                    once: true,
                    onEnter: () => node.classList.add('timeline-node--active')
                }
            });


        });
    }

    // ==========================================================================
    // 5. INTRO + STATS WITH UP-COUNTER (NEW SECTION 1)
    // ==========================================================================
    const introHeader = document.querySelector('.intro-stats__header');
    if (introHeader) {
        gsap.from(introHeader.querySelectorAll('.intro-stats__col-left, .intro-stats__col-right'), {
            scrollTrigger: {
                trigger: introHeader,
                start: 'top 85%',
                once: true
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out'
        });
    }

    const introStatsRow = document.querySelector('.intro-stats__stats');
    if (introStatsRow) {
        ScrollTrigger.create({
            trigger: introStatsRow,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                const statNums = introStatsRow.querySelectorAll('.intro-stats__stat-number');
                statNums.forEach((numEl, idx) => {
                    const target = parseInt(numEl.getAttribute('data-count'), 10);
                    const suffix = numEl.getAttribute('data-suffix') || '';
                    gsap.delayedCall(idx * 0.15, () => {
                        window.animateCounter(numEl, target, suffix, '', 2.0);
                    });
                });
            }
        });
    }

    // ==========================================================================
    // 6. ACCORDION SERVICE LIST REVEAL (NEW SECTION 2)
    // ==========================================================================
    const accordionList = document.querySelector('.service-accordion__list');
    if (accordionList) {
        gsap.from(accordionList.querySelectorAll('.service-accordion__item'), {
            scrollTrigger: {
                trigger: accordionList,
                start: 'top 85%',
                once: true
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out'
        });
    }

    // ==========================================================================
    // 7. BENTO COLLAGE GRID REVEAL (NEW SECTION 3)
    // ==========================================================================
    const collageGrid = document.querySelector('.proof-collage__grid');
    if (collageGrid) {
        const tilesOrder = [
            collageGrid.querySelector('.proof-collage__tile--col1-top'),
            collageGrid.querySelector('.proof-collage__tile--tall'),
            collageGrid.querySelector('.proof-collage__tile--col3-top'),
            collageGrid.querySelector('.proof-collage__tile--col1-bottom'),
            collageGrid.querySelector('.proof-collage__tile--col3-bottom')
        ].filter(Boolean);

        if (tilesOrder.length > 0) {
            gsap.from(tilesOrder, {
                scrollTrigger: {
                    trigger: collageGrid,
                    start: 'top 80%',
                    once: true
                },
                opacity: 0,
                scale: 0.96,
                duration: 0.7,
                stagger: 0.1,
                ease: 'power3.out'
            });
        }

        const collageCounters = collageGrid.querySelectorAll('.proof-collage__stat-number');
        collageCounters.forEach(counter => {
            ScrollTrigger.create({
                trigger: counter,
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    const target = parseInt(counter.getAttribute('data-count'), 10);
                    const suffix = counter.getAttribute('data-suffix') || '';
                    window.animateCounter(counter, target, suffix, '', 2.0);
                }
            });
        });
    }

    // ==========================================================================
    // 8. VISION & MISSION + STAT GRID (NEW ABOUT SECTION A)
    // ==========================================================================
    const introSection = document.querySelector('.company-intro');
    if (introSection) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: introSection,
                start: 'top 85%',
                once: true
            }
        });

        tl.from(introSection.querySelectorAll('.company-intro__eyebrow, .company-intro__heading'), {
            opacity: 0,
            y: 20,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out'
        })
            .from(introSection.querySelectorAll('.company-intro__pillar'), {
                opacity: 0,
                y: 20,
                duration: 0.7,
                stagger: 0.15,
                ease: 'power3.out'
            }, '-=0.3')
            .from(introSection.querySelector('.company-intro__photo'), {
                opacity: 0,
                scale: 1.06,
                duration: 1.0,
                ease: 'power3.out'
            }, '-=0.5')
            .from(introSection.querySelectorAll('.company-intro__stat'), {
                opacity: 0,
                y: 20,
                duration: 0.7,
                stagger: 0.12,
                ease: 'power3.out'
            }, '-=0.8');

        const introSectionCounters = introSection.querySelectorAll('.company-intro__stat-number');
        introSectionCounters.forEach(counter => {
            ScrollTrigger.create({
                trigger: counter,
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    const target = parseInt(counter.getAttribute('data-count'), 10);
                    const suffix = counter.getAttribute('data-suffix') || '';
                    const prefix = counter.getAttribute('data-prefix') || '';
                    window.animateCounter(counter, target, suffix, prefix, 2.0);
                }
            });
        });
    }

    // ==========================================================================
    // 9. WHY CHOOSE US ICON CARDS (NEW HOMEPAGE SECTION B)
    // ==========================================================================
    const whyUsSection = document.querySelector('.why-us-cards');
    if (whyUsSection) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: whyUsSection,
                start: 'top 85%',
                once: true
            }
        });

        tl.from(whyUsSection.querySelector('.why-us-cards__panel'), {
            opacity: 0,
            y: 40,
            duration: 0.7,
            ease: 'power3.out'
        })
            .from(whyUsSection.querySelectorAll('.why-us-cards__header > div, .why-us-cards__header > .why-us-cards__cta'), {
                opacity: 0,
                y: 20,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out'
            }, '-=0.4')
            .from(whyUsSection.querySelectorAll('.why-us-cards__card'), {
                opacity: 0,
                y: 20,
                duration: 0.6,
                stagger: 0.12,
                ease: 'power3.out'
            }, '-=0.35');
    }

    // ==========================================================================
    // 10. PROVEN EXECUTION & CAPACITY (NEW HOMEPAGE SECTION C)
    // ==========================================================================
    const executionSection = document.querySelector('.execution-capacity');
    if (executionSection) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: executionSection,
                start: 'top 80%',
                once: true
            }
        });

        tl.from(executionSection.querySelectorAll('.execution-capacity__header > .badge, .execution-capacity__header > p'), {
            opacity: 0,
            y: 20,
            duration: 0.7,
            stagger: 0.15,
            ease: 'power3.out'
        });

        const executionCounters = executionSection.querySelectorAll('.execution-capacity__number');
        executionCounters.forEach(counter => {
            if (counter.getAttribute('data-static') === 'true') return;
            ScrollTrigger.create({
                trigger: counter,
                start: 'top 90%',
                once: true,
                onEnter: () => {
                    const target = parseInt(counter.getAttribute('data-count'), 10);
                    const suffix = counter.getAttribute('data-suffix') || '';
                    const prefix = counter.getAttribute('data-prefix') || '';
                    window.animateCounter(counter, target, suffix, prefix, 2.0);
                }
            });
        });
    }

    // ==========================================================================
    // 13. BLOCK REVEAL INITIALIZATIONS (HOMEPAGE & INNER PAGES)
    // ==========================================================================
    // Homepage
    initBlockReveal('.execution-capacity__grid', '.execution-capacity__stat');
    initBlockReveal('.service-accordion-h__row', '.service-accordion-h__panel', { stagger: 0.12 });
    initBlockReveal('.segments-grid', '.segments-grid > div', { stagger: 0.05 });
    initBlockReveal('.benefit-list', '.benefit-row', { stagger: 0.12 });
    //initBlockReveal('.why-us-cards__grid', '.why-us-cards__card', { stagger: 0.12 });
    initBlockReveal('.company-teaser__stats', '.company-teaser__stat', { y: 30, stagger: 0.1 });
    initBlockReveal('.final-cta__container', '.final-cta__content, .final-cta__glass-card', { stagger: 0.15, y: 40 });
    initBlockReveal('.project-showcase__header', '.project-showcase__heading, .button--primary', { stagger: 0.1 });

    gsap.from('.project-showcase__swiper', {
        scrollTrigger: { trigger: '.project-showcase__swiper', start: 'top 90%' },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out'
    });

    // Inner Pages - about.html
    initBlockReveal('.core-values-grid', '.core-value-card');
    initBlockReveal('.timeline', '.timeline-node', { stagger: 0.15 });
    initBlockReveal('.certifications-grid', '.cert-card', { stagger: 0.05 });
    initBlockReveal('.office-cards', '.office-card', { stagger: 0.12 });
    initBlockReveal('.gallery-grid', '.gallery-item', { stagger: 0.06 });

    // Inner Pages - services.html
    initBlockReveal('.services-full-grid', '.service-card-full');

    // Inner Pages - projects.html
    initBlockReveal('.grid-3', '.project-card-container');

    // Inner Pages - contact.html
    initBlockReveal('.faq-accordion', '.faq-item', { stagger: 0.1 });
    initBlockReveal('.contact-card-info', 'h3, .office-card__details, .site-footer__social', { stagger: 0.1, y: 30 });

    // Dark Footer reveal
    const footer = document.querySelector('.site-footer--dark');
    if (footer && !prefersReducedMotion) {
        gsap.from(footer, {
            scrollTrigger: {
                trigger: footer,
                start: 'top 95%',
                once: true
            },
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out'
        });
    }

    // Initialize Clients Marquee vertical scrolling
    if (typeof window.initClientsMarquee === 'function') {
        window.initClientsMarquee();
    }
});

// Reusable horizontal service accordion animation function
window.animateHorizontalPanel = function (targetPanel, activePanel) {
    if (typeof gsap === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Tag chip fallback settings
        if (activePanel) {
            const oldTags = activePanel.querySelectorAll('.service-accordion-h__tag');
            oldTags.forEach(tag => {
                tag.style.opacity = '0';
                tag.style.transform = 'translateY(-8px)';
            });
        }
        const newTags = targetPanel.querySelectorAll('.service-accordion-h__tag');
        newTags.forEach(tag => {
            tag.style.opacity = '1';
            tag.style.transform = 'none';
        });
        return;
    }

    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
        if (activePanel) {
            gsap.to(activePanel, { flexGrow: 1, duration: 0.9, ease: "power2.out" });
            const oldTags = activePanel.querySelectorAll('.service-accordion-h__tag');
            if (oldTags.length) {
                gsap.to(oldTags, { opacity: 0, y: -8, duration: 0.2, ease: "power2.in" });
            }
        }

        gsap.to(targetPanel, { flexGrow: 3.2, duration: 0.9, ease: "power2.out" });

        const bgImg = targetPanel.querySelector('.service-accordion-h__bg');
        if (bgImg) {
            gsap.fromTo(bgImg, { scale: 1.08 }, { scale: 1.02, duration: 8, ease: "sine.out" });
        }

        const newTags = targetPanel.querySelectorAll('.service-accordion-h__tag');
        if (newTags.length) {
            gsap.killTweensOf(newTags);
            gsap.fromTo(newTags,
                { opacity: 0, y: -8 },
                { opacity: 1, y: 0, duration: 0.25, stagger: 0.05, delay: 0.15, ease: "power2.out" }
            );
        }
    } else {
        // Tablet / Mobile Layout: Tag chips slide and fade
        if (activePanel) {
            const oldTags = activePanel.querySelectorAll('.service-accordion-h__tag');
            if (oldTags.length) {
                gsap.to(oldTags, { opacity: 0, y: -8, duration: 0.2, ease: "power2.in" });
            }
        }

        const newTags = targetPanel.querySelectorAll('.service-accordion-h__tag');
        if (newTags.length) {
            gsap.killTweensOf(newTags);
            gsap.fromTo(newTags,
                { opacity: 0, y: -8 },
                { opacity: 1, y: 0, duration: 0.25, stagger: 0.05, delay: 0.15, ease: "power2.out" }
            );
        }
    }
};
