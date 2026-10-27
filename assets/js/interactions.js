document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. SERVICES FEATURED CAROUSEL (HOMEPAGE)
    // ==========================================================================
    const serviceFeatures = document.querySelectorAll('.service-feature');
    const prevBtn = document.querySelector('.service-feature__nav-btn--prev');
    const nextBtn = document.querySelector('.service-feature__nav-btn--next');
    let currentServiceIndex = 0;

    if (serviceFeatures.length > 0 && prevBtn && nextBtn) {
        function showService(index, direction) {
            const currentFeature = serviceFeatures[currentServiceIndex];
            const nextFeature = serviceFeatures[index];

            // GSAP slide & fade transition if GSAP is available
            if (typeof gsap !== 'undefined') {
                const xOffset = direction === 'next' ? 40 : -40;

                gsap.timeline()
                    .to(currentFeature, {
                        opacity: 0,
                        x: -xOffset,
                        duration: 0.3,
                        onComplete: () => {
                            currentFeature.classList.remove('service-feature--active');
                            nextFeature.classList.add('service-feature--active');
                        }
                    })
                    .fromTo(nextFeature,
                        { opacity: 0, x: xOffset },
                        { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
                    );
            } else {
                currentFeature.classList.remove('service-feature--active');
                nextFeature.classList.add('service-feature--active');
            }

            currentServiceIndex = index;
        }

        prevBtn.addEventListener('click', () => {
            let index = currentServiceIndex - 1;
            if (index < 0) index = serviceFeatures.length - 1;
            showService(index, 'prev');
        });

        nextBtn.addEventListener('click', () => {
            let index = currentServiceIndex + 1;
            if (index >= serviceFeatures.length) index = 0;
            showService(index, 'next');
        });
    }

    // ==========================================================================
    // 2. DRAGGABLE TESTIMONIALS STRIP
    // ==========================================================================
    const testimonialCarousel = document.querySelector('.testimonial-carousel');
    const testimonialTrack = document.querySelector('.testimonial-track');

    if (testimonialCarousel && testimonialTrack) {
        let isDown = false;
        let startX;
        let scrollLeft;

        testimonialCarousel.addEventListener('mousedown', (e) => {
            isDown = true;
            testimonialTrack.classList.add('active');
            startX = e.pageX - testimonialCarousel.offsetLeft;
            scrollLeft = testimonialCarousel.scrollLeft;
        });

        testimonialCarousel.addEventListener('mouseleave', () => {
            isDown = false;
            testimonialTrack.classList.remove('active');
        });

        testimonialCarousel.addEventListener('mouseup', () => {
            isDown = false;
            testimonialTrack.classList.remove('active');
        });

        testimonialCarousel.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - testimonialCarousel.offsetLeft;
            const walk = (x - startX) * 2; // Scroll multiplier
            testimonialCarousel.scrollLeft = scrollLeft - walk;
        });

        // Style adjustment for drag carousel scrollbars
        testimonialCarousel.style.overflowX = 'hidden';
        testimonialCarousel.style.webkitOverflowScrolling = 'touch';
    }

    // ==========================================================================
    // 3. PROJECTS FILTERING (PROJECTS PAGE)
    // ==========================================================================
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card-container'); // wrapping container if needed or the card itself

    if (filterBtns.length > 0 && projectCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterBtns.forEach(b => {
                    b.classList.remove('filter-btn--active');
                    b.setAttribute('aria-pressed', 'false');
                });

                // Add active class to clicked button
                btn.classList.add('filter-btn--active');
                btn.setAttribute('aria-pressed', 'true');

                const filter = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');

                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        if (typeof gsap !== 'undefined') {
                            gsap.fromTo(card,
                                { opacity: 0, scale: 0.95 },
                                { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
                            );
                        } else {
                            card.style.opacity = '1';
                        }
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ==========================================================================
    // 4. FAQ ACCORDION (CONTACT PAGE)
    // ==========================================================================
    const faqItems = document.querySelectorAll('.faq-item');

    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const questionBtn = item.querySelector('.faq-question');

            questionBtn.addEventListener('click', () => {
                const isActive = item.classList.contains('faq-item--active');

                // Close all other items
                faqItems.forEach(i => {
                    i.classList.remove('faq-item--active');
                    i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                });

                // Toggle current item
                if (!isActive) {
                    item.classList.add('faq-item--active');
                    questionBtn.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // ==========================================================================
    // 5. IMAGE GALLERY LIGHTBOX (ABOUT / PROJECTS / DETAILS)
    // ==========================================================================
    const galleryItems = document.querySelectorAll('[data-lightbox-src]');

    if (galleryItems.length > 0) {
        // Create Lightbox Markup dynamically if it doesn't exist
        let lightbox = document.querySelector('.lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox__content">
                    <button class="lightbox__close" aria-label="Close lightbox">&times;</button>
                    <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">&#10094;</button>
                    <img class="lightbox__image" src="" alt="Enlarged project view" />
                    <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">&#10095;</button>
                </div>
            `;
            document.body.appendChild(lightbox);
        }

        const lightboxImage = lightbox.querySelector('.lightbox__image');
        const closeBtn = lightbox.querySelector('.lightbox__close');
        const prevNavBtn = lightbox.querySelector('.lightbox__nav--prev');
        const nextNavBtn = lightbox.querySelector('.lightbox__nav--next');
        let activeGalleryIndex = 0;
        let activeGalleryList = [];

        function openLightbox(index, list) {
            activeGalleryIndex = index;
            activeGalleryList = list;
            lightboxImage.src = list[index];
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            closeBtn.focus();

            // Hide navigation arrows if there's only one image
            if (list.length <= 1) {
                prevNavBtn.style.display = 'none';
                nextNavBtn.style.display = 'none';
            } else {
                prevNavBtn.style.display = 'block';
                nextNavBtn.style.display = 'block';
            }
        }

        function closeLightbox() {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }

        function navigateLightbox(dir) {
            if (dir === 'next') {
                activeGalleryIndex = (activeGalleryIndex + 1) % activeGalleryList.length;
            } else {
                activeGalleryIndex = (activeGalleryIndex - 1 + activeGalleryList.length) % activeGalleryList.length;
            }
            lightboxImage.src = activeGalleryList[activeGalleryIndex];
        }

        // Attach click triggers to all registered gallery items
        galleryItems.forEach((item, idx) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                // Determine list of image sources in the same gallery group
                const groupName = item.getAttribute('data-gallery-group');
                const groupItems = document.querySelectorAll(`[data-gallery-group="${groupName}"]`);
                const srcList = Array.from(groupItems).map(i => i.getAttribute('data-lightbox-src'));
                const listIdx = srcList.indexOf(item.getAttribute('data-lightbox-src'));

                openLightbox(listIdx, srcList);
            });
        });

        // Close events
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        // Prev/Next Nav
        prevNavBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox('prev');
        });
        nextNavBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateLightbox('next');
        });

        // Keyboard Support
        document.addEventListener('keydown', (e) => {
            if (lightbox.style.display === 'flex') {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight' && activeGalleryList.length > 1) navigateLightbox('next');
                if (e.key === 'ArrowLeft' && activeGalleryList.length > 1) navigateLightbox('prev');
            }
        });
    }

    // ==========================================================================
    // 6. CONTACT FORM VALIDATION & SUCCESS TOGGLE (CONTACT PAGE / FINAL CTA)
    // ==========================================================================
    const contactForms = document.querySelectorAll('.validated-form');

    contactForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            let isValid = true;

            // Clean old errors
            form.querySelectorAll('.form-error').forEach(err => err.remove());

            // Validate Name
            const nameInput = form.querySelector('[name="name"]');
            if (nameInput && nameInput.value.trim().length < 2) {
                showError(nameInput, 'Please enter your full name (at least 2 letters).');
                isValid = false;
            }

            // Validate Phone
            const phoneInput = form.querySelector('[name="phone"]');
            const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
            if (phoneInput && !phoneRegex.test(phoneInput.value.replace(/\s+/g, ''))) {
                showError(phoneInput, 'Please enter a valid phone number (7 to 15 digits).');
                isValid = false;
            }

            // Validate Email (if present)
            const emailInput = form.querySelector('[name="email"]');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailInput && !emailRegex.test(emailInput.value.trim())) {
                showError(emailInput, 'Please enter a valid email address.');
                isValid = false;
            }

            // Validate Message (if present, min 20 chars)
            const msgInput = form.querySelector('[name="message"]');
            if (msgInput && msgInput.value.trim().length < 20) {
                showError(msgInput, 'Your message is too short. Please provide at least 20 characters.');
                isValid = false;
            }

            // Validate Consent Box (if present)
            const consentCheckbox = form.querySelector('[name="consent"]');
            if (consentCheckbox && !consentCheckbox.checked) {
                showError(consentCheckbox, 'You must agree to our privacy conditions.');
                isValid = false;
            }

            if (isValid) {
                // Toggle success state
                const successDiv = form.parentElement.querySelector('.form-success-message');
                if (successDiv) {
                    form.style.display = 'none';
                    successDiv.style.display = 'block';

                    // Trigger scroll-into-view for success message
                    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    alert('Thank you! Your inquiry has been submitted successfully.');
                    form.reset();
                }
            }
        });

        function showError(inputEl, message) {
            const errSpan = document.createElement('span');
            errSpan.className = 'form-error';
            errSpan.setAttribute('aria-live', 'assertive');
            errSpan.innerText = message;

            // Check if element is a checkbox/custom container
            if (inputEl.type === 'checkbox') {
                inputEl.parentElement.parentElement.appendChild(errSpan);
            } else {
                inputEl.parentElement.appendChild(errSpan);
            }
        }
    });

    // ==========================================================================
    // 7. FLOATING ACTIONS SCROLL VISIBILITY (CONTACT / GLOBAL)
    // ==========================================================================
    const floatingActions = document.querySelector('.floating-actions');
    if (floatingActions) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                floatingActions.style.opacity = '1';
                floatingActions.style.visibility = 'visible';
            } else {
                floatingActions.style.opacity = '0';
                floatingActions.style.visibility = 'hidden';
            }
        });
    }

    // ==========================================================================
    // 8. HORIZONTAL SERVICE ACCORDION (HOMEPAGE)
    // ==========================================================================
    const serviceAccordionH = document.querySelector('.service-accordion-h');
    if (serviceAccordionH) {
        const row = serviceAccordionH.querySelector('.service-accordion-h__row');
        const panels = Array.from(serviceAccordionH.querySelectorAll('.service-accordion-h__panel'));

        let hoverTimeout = null;

        function activatePanel(targetPanel) {
            const activePanel = serviceAccordionH.querySelector('.service-accordion-h__panel--active');
            if (activePanel === targetPanel) return;

            // 1. Deactivate current active panel
            if (activePanel) {
                activePanel.classList.remove('service-accordion-h__panel--active');
                activePanel.setAttribute('aria-selected', 'false');
                activePanel.setAttribute('tabindex', '-1');
            }

            // 2. Activate target panel
            targetPanel.classList.add('service-accordion-h__panel--active');
            targetPanel.setAttribute('aria-selected', 'true');
            targetPanel.setAttribute('tabindex', '0');

            // 3. Trigger GSAP animation if defined
            if (typeof window.animateHorizontalPanel === 'function') {
                window.animateHorizontalPanel(targetPanel, activePanel);
            }
        }

        // Initialize state: Panel 0 (HVAC) is active and focusable, others are not
        panels.forEach((panel, index) => {
            if (index === 0) {
                panel.classList.add('service-accordion-h__panel--active');
                panel.setAttribute('aria-selected', 'true');
                panel.setAttribute('tabindex', '0');
                panel.style.flexGrow = '3.2';
                // Ensure initial tags are visible immediately on load
                const initialTags = panel.querySelectorAll('.service-accordion-h__tag');
                initialTags.forEach(tag => {
                    tag.style.opacity = '1';
                    tag.style.transform = 'translateY(0)';
                });
            } else {
                panel.classList.remove('service-accordion-h__panel--active');
                panel.setAttribute('aria-selected', 'false');
                panel.setAttribute('tabindex', '-1');
                panel.style.flexGrow = '1';
                const collapsedTags = panel.querySelectorAll('.service-accordion-h__tag');
                collapsedTags.forEach(tag => {
                    tag.style.opacity = '0';
                    tag.style.transform = 'translateY(-8px)';
                });
            }

            // Handle panel click
            panel.addEventListener('click', (e) => {
                const isActive = panel.classList.contains('service-accordion-h__panel--active');

                if (!isActive) {
                    // Clicked collapsed panel -> prevent link default, activate panel
                    e.preventDefault();
                    activatePanel(panel);
                }
                // If it is active, arrow behaves as a regular link and clicks navigate normally.
            });

            // Hover delay enhancement for desktop
            panel.addEventListener('mouseenter', () => {
                if (window.innerWidth >= 1024) {
                    if (hoverTimeout) clearTimeout(hoverTimeout);
                    hoverTimeout = setTimeout(() => {
                        activatePanel(panel);
                    }, 180);
                }
            });

            panel.addEventListener('mouseleave', () => {
                if (hoverTimeout) clearTimeout(hoverTimeout);
            });
        });

        // Roving Tabindex & Keyboard Navigation
        row.addEventListener('keydown', (e) => {
            const activePanel = document.activeElement;
            const focusIdx = panels.indexOf(activePanel);
            if (focusIdx === -1) return;

            let nextIdx = null;

            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                nextIdx = (focusIdx + 1) % panels.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                nextIdx = (focusIdx - 1 + panels.length) % panels.length;
            } else if (e.key === ' ' || e.key === 'Enter') {
                const isActive = activePanel.classList.contains('service-accordion-h__panel--active');
                if (!isActive) {
                    e.preventDefault();
                    activatePanel(activePanel);
                } else {
                    // Already active, trigger link
                    const arrow = activePanel.querySelector('.service-accordion-h__arrow');
                    if (arrow && e.target !== arrow) {
                        arrow.click();
                    }
                }
            }

            if (nextIdx !== null) {
                panels[nextIdx].focus();
                activatePanel(panels[nextIdx]);
            }
        });
    }

    // ==========================================================================
    // 9. PROJECT SHOWCASE CAROUSEL (HOMEPAGE)
    // ==========================================================================
    const projectShowcaseSwiper = document.querySelector('.project-showcase__swiper');
    if (projectShowcaseSwiper && typeof Swiper !== 'undefined') {
        const swiper = new Swiper('.project-showcase__swiper', {
            slidesPerView: 1.05,
            centeredSlides: true,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 20000,
                disableOnInteraction: false,
            },
            speed: 600,
            watchSlidesProgress: true,

            // Navigation arrows
            navigation: {
                nextEl: '.project-showcase__nav--next',
                prevEl: '.project-showcase__nav--prev',
            },

            // Pagination dots
            pagination: {
                el: '.project-showcase__pagination',
                clickable: true,
                renderBullet: function (index, className) {
                    return '<button class="' + className + '" aria-label="Go to slide ' + (index + 1) + '"></button>';
                }
            },

            // Responsive breakpoints
            breakpoints: {
                // When window width is >= 768px (tablet)
                768: {
                    slidesPerView: 1.3,
                    spaceBetween: 30
                },
                // When window width is >= 1024px (desktop)
                1024: {
                    slidesPerView: 1.7,
                    spaceBetween: 40
                }
            },

            // Smooth progress-based fade/scale logic for adjacent slides
            on: {
                progress: function (s) {
                    s.slides.forEach(function (slide) {
                        const progress = slide.progress;
                        const absProgress = Math.abs(progress);

                        // Calculate scale and opacity based on distance from center (active slide progress = 0)
                        let scale = 1 - (absProgress * 0.06);
                        let opacity = 1 - (absProgress * 0.7);
                        let saturate = 1 - (absProgress * 0.3);

                        // Clamp values to keep visual consistency
                        scale = Math.max(0.94, Math.min(1, scale));
                        opacity = Math.max(0.3, Math.min(1, opacity));
                        saturate = Math.max(0.7, Math.min(1, saturate));

                        // Apply CSS transforms & filters
                        slide.style.opacity = opacity;
                        slide.style.transform = 'scale(' + scale + ')';
                        slide.style.filter = 'saturate(' + saturate + ')';
                    });
                },
                setTransition: function (s, duration) {
                    s.slides.forEach(function (slide) {
                        slide.style.transition = 'opacity ' + duration + 'ms ease, transform ' + duration + 'ms ease, filter ' + duration + 'ms ease';
                    });
                }
            }
        });
    }



    // ==========================================================================
    // 10. TRUST STRIP LOGO CAROUSEL MARQUEE (HOMEPAGE)
    // ==========================================================================
    const trustStripMarquee = document.querySelector('.trust-strip__marquee');
    if (trustStripMarquee && typeof gsap !== 'undefined') {
        const tracks = trustStripMarquee.querySelectorAll('.trust-strip__track');
        if (tracks.length > 0) {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (!prefersReducedMotion) {
                const tween = gsap.to(tracks, {
                    xPercent: -100,
                    duration: 45,
                    ease: 'none',
                    repeat: -1
                });

                // Pause on Hover
                trustStripMarquee.addEventListener('mouseenter', () => {
                    tween.pause();
                });

                // Resume on Leave
                trustStripMarquee.addEventListener('mouseleave', () => {
                    tween.play();
                });
            }
        }
    }

    // ==========================================================================
    // 11. SCROLL-TO-TOP PROGRESS RING BUTTON
    // ==========================================================================
    const scrollProgressEl = document.querySelector('.scroll-progress');
    const ring = document.querySelector('.scroll-progress__ring path.scroll-progress__bar');
    
    if (scrollProgressEl && ring && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        const pathLength = ring.getTotalLength();
        ring.style.strokeDasharray = `${pathLength} ${pathLength}`;
        ring.style.strokeDashoffset = pathLength;

        function updateProgress(progress) {
            const offset = pathLength - (progress * pathLength);
            ring.style.strokeDashoffset = offset;
        }

        // Use ScrollTrigger to monitor scroll and toggle active class & ring progress
        ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: (self) => {
                updateProgress(self.progress);
                const scrollTop = self.scroll();
                if (scrollTop > 50) {
                    scrollProgressEl.classList.add('scroll-progress--active');
                } else {
                    scrollProgressEl.classList.remove('scroll-progress--active');
                }
            }
        });

        // Click handler with accessibility support
        const handleScrollToTop = (e) => {
            e.preventDefault();
            // Fire scroll-to-top action through smooth-scroll system if ScrollSmoother is loaded
            if (typeof ScrollSmoother !== 'undefined' && ScrollSmoother.get()) {
                ScrollSmoother.get().scrollTo(0, true, "power2.inOut");
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        };

        scrollProgressEl.addEventListener('click', handleScrollToTop);
        scrollProgressEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleScrollToTop(e);
            }
        });
    }

});
