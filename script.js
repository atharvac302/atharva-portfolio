/**
 * Atharva Prashant Chavan - Portfolio script.js
 * Premium Dark SaaS inspired design animations
 */

document.addEventListener('DOMContentLoaded', () => {
    // Utilities
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    const isTouchDevice = () => {
        return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
    };

    // 1. PARTICLE ANIMATION CANVAS
    const initParticles = () => {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let width, height;
        
        let mouse = {
            x: null,
            y: null,
            radius: 150
        };

        const resizeCanvas = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', debounce(() => {
            resizeCanvas();
            init();
        }, 200));

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });
        
        window.addEventListener('mouseout', () => {
            mouse.x = undefined;
            mouse.y = undefined;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1; // 1-3px
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
                this.velocityX = (Math.random() - 0.5) * 0.5;
                this.velocityY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.4 + 0.1; // 0.1 to 0.5
            }

            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }

            update() {
                // Natural drift
                this.x += this.velocityX;
                this.y += this.velocityY;

                // Bounce off edges
                if (this.x > width || this.x < 0) this.velocityX = -this.velocityX;
                if (this.y > height || this.y < 0) this.velocityY = -this.velocityY;

                // Mouse interaction
                if (mouse.x && mouse.y) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;

                    if (distance < mouse.radius) {
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                        if (this.x !== this.baseX) {
                            let dx = this.x - this.baseX;
                            this.x -= dx / 50;
                        }
                        if (this.y !== this.baseY) {
                            let dy = this.y - this.baseY;
                            this.y -= dy / 50;
                        }
                    }
                }
                
                this.draw();
            }
        }

        const init = () => {
            particles = [];
            let numberOfParticles = (width * height) / 9000; 
            numberOfParticles = Math.min(Math.max(numberOfParticles, 80), 120); // 80-120 particles
            
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle());
            }
        }

        const connect = () => {
            let opacityValue = 1;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                                 + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));
                    
                    if (distance < (150 * 150)) { // distance < 150px
                        opacityValue = 1 - (distance / (150 * 150));
                        ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.2})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
            }
            connect();
            requestAnimationFrame(animate);
        }

        resizeCanvas();
        init();
        animate();
    };

    // 2. SCROLL ANIMATIONS (Intersection Observer)
    const initScrollAnimations = () => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    
                    // Delay logic
                    const delay = el.getAttribute('data-delay');
                    if (delay) {
                        el.style.transitionDelay = `${delay}ms`;
                    }
                    
                    el.classList.add('visible');
                    observer.unobserve(el);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            // Apply animation class based on data attribute
            const animationType = el.getAttribute('data-animation') || 'fade-up';
            el.classList.add(`anim-${animationType}`);
            observer.observe(el);
        });
    };

    // 3. NAVIGATION
    const initNavigation = () => {
        const navbar = document.querySelector('.navbar');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navLinksContainer = document.querySelector('.nav-links');
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section');

        // Scroll background effect
        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 50) {
                navbar?.classList.add('scrolled');
            } else {
                navbar?.classList.remove('scrolled');
            }
            
            // Active section highlighting
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        }, 10));

        // Mobile Menu Toggle
        if (mobileToggle && navLinksContainer) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('active');
                navLinksContainer.classList.toggle('active');
            });
        }

        // Close mobile menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mobileToggle?.classList.contains('active')) {
                    mobileToggle.classList.remove('active');
                    navLinksContainer?.classList.remove('active');
                }
            });
        });
    };

    // 4. TECH STACK MARQUEE
    const initMarquee = () => {
        const marquees = document.querySelectorAll('.marquee-content');
        marquees.forEach(marquee => {
            // Clone the content for seamless looping
            const content = marquee.innerHTML;
            marquee.innerHTML = content + content;
        });
    };

    // 5. COUNTER ANIMATION
    const initCounters = () => {
        const counters = document.querySelectorAll('.counter');
        const speed = 2000; // 2 seconds

        const observerOptions = {
            threshold: 0.5
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = +counter.getAttribute('data-target');
                    const start = 0;
                    const increment = target / (speed / 16); // 60fps
                    let current = start;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.innerText = target;
                        }
                    };

                    updateCounter();
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);

        counters.forEach(counter => counterObserver.observe(counter));
    };

    // 6. TYPING EFFECT
    const initTypingEffect = () => {
        const typingElements = document.querySelectorAll('.typing-text');
        
        typingElements.forEach(el => {
            const text = el.getAttribute('data-text') || el.innerText;
            el.innerText = '';
            let i = 0;
            
            const typeWriter = () => {
                if (i < text.length) {
                    el.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };
            
            // Start typing after a short delay
            setTimeout(typeWriter, 500);
        });
    };

    // 7. SMOOTH SCROLL (Native smooth scroll via CSS html { scroll-behavior: smooth; } is preferred, 
    // but JS handling helps with fixed header offset)
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = 80; // Approximate fixed header height
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                    window.scrollTo({
                         top: offsetPosition,
                         behavior: "smooth"
                    });
                }
            });
        });
    };

    // 8. CONTACT FORM
    const initContactForm = () => {
        const form = document.getElementById('contact-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            
            // Basic validation
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('error');
                } else {
                    input.classList.remove('error');
                }
            });

            if (!isValid) return;

            // Actual form submission using FormSubmit AJAX
            submitBtn.innerText = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            fetch("https://formsubmit.co/ajax/atharvac302@gmail.com", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: document.getElementById('contact-name').value,
                    email: document.getElementById('contact-email').value,
                    message: document.getElementById('contact-message').value
                })
            })
            .then(response => response.json())
            .then(data => {
                form.reset();
                submitBtn.innerText = 'Message Sent Successfully!';
                submitBtn.classList.add('success');
                
                setTimeout(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.classList.remove('success');
                }, 3000);
            })
            .catch(error => {
                console.error(error);
                submitBtn.innerText = 'Error! Try Again.';
                
                setTimeout(() => {
                    submitBtn.innerText = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                }, 3000);
            });
        });
    };

    // 10. CURSOR GLOW EFFECT
    const initCursorGlow = () => {
        if (isTouchDevice()) return;

        const cursorGlow = document.createElement('div');
        cursorGlow.className = 'cursor-glow';
        document.body.appendChild(cursorGlow);

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = mouseX;
        let glowY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Use lerp for smooth following
        const lerp = (start, end, factor) => start + (end - start) * factor;

        const animateCursor = () => {
            glowX = lerp(glowX, mouseX, 0.15);
            glowY = lerp(glowY, mouseY, 0.15);
            
            cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
            
            requestAnimationFrame(animateCursor);
        };
        
        animateCursor();
    };

    // 11. PARALLAX SCROLL EFFECTS
    const initParallax = () => {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        window.addEventListener('scroll', () => {
            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                parallaxElements.forEach(el => {
                    const speed = el.getAttribute('data-speed') || 0.3;
                    const yPos = -(scrolled * speed);
                    el.style.transform = `translateY(${yPos}px)`;
                });
            });
        });
    };

    // 12. BACK TO TOP BUTTON
    const initBackToTop = () => {
        const backToTopBtn = document.getElementById('back-to-top');
        if (!backToTopBtn) return;

        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }, 50));

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    };

    // Initialize all modules
    initParticles();
    initScrollAnimations();
    initNavigation();
    initMarquee();
    initCounters();
    initTypingEffect();
    initSmoothScroll();
    initContactForm();
    initCursorGlow();
    initParallax();
    initBackToTop();
});
