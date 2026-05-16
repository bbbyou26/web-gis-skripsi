document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.querySelector('.nav-menu');

    if (toggle) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }

    // Toggle dropdown on mobile click
    const dropdownToggles = document.querySelectorAll('.nav-item > .nav-link');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (window.innerWidth < 1100) {
                const content = toggle.nextElementSibling;
                if (content && content.classList.contains('dropdown-content')) {
                    e.preventDefault(); // Only prevent default if it has a dropdown
                    content.classList.toggle('active');

                    // Toggle chevron icon if it exists
                    const icon = toggle.querySelector('i');
                    if (icon) {
                        icon.style.transform = content.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
                    }
                }
            }
        });
    });

    // Scroll reveal animation for feature cards
    const featureCards = document.querySelectorAll('.feature-mini-card');
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        observer.observe(card);
    });

    // Typewriter Effect for Hero Title
    const titleElements = document.querySelectorAll('.hero-title, .splash-title');
    titleElements.forEach(titleElement => {
        const fullText = titleElement.innerText;
        titleElement.innerHTML = '';
        titleElement.classList.add('typing');

        let i = 0;
        function typeWriter() {
            if (i < fullText.length) {
                const char = fullText.charAt(i);
                if (char === '\n') {
                    titleElement.innerHTML += '<br>';
                } else {
                    titleElement.innerHTML += char;
                }
                i++;
                setTimeout(typeWriter, 40); // 40ms per char speed
            } else {
                // Restart after 7 seconds (total ~10s cycle)
                setTimeout(() => {
                    titleElement.innerHTML = '';
                    i = 0;
                    typeWriter();
                }, 7000);
            }
        }
        typeWriter();
    });

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile menu if open
                if (menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                }
            }
        });
    });

    // Feature Card Flip
    const cards = document.querySelectorAll('.feature-mini-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });
    });
});
