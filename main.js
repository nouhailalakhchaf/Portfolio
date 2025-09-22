// ===== GESTIONNAIRE PRINCIPAL DU SITE =====

class PortfolioManager {
    constructor() {
        this.init();
        this.bindEvents();
        this.startAnimations();
        this.setupParallax();
        this.setupScrollAnimations();
    }

    init() {
        this.navbar = document.querySelector('.glass-nav');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.scrollIndicator = document.querySelector('.scroll-indicator');
        
        // Variables pour le parallax
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseMoving = false;
        
        // Variables pour les animations
        this.animatedElements = document.querySelectorAll('.glass-card, .result-card, .offer-card, .solution-card');
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        console.log('Portfolio Manager initialisé');
    }

    bindEvents() {
        // Navigation
        this.hamburger?.addEventListener('click', () => this.toggleMobileMenu());
        
        // Scroll events
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Mouse events pour parallax
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Navigation links smooth scroll
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        // Resize event
        window.addEventListener('resize', () => this.handleResize());
        
        // Touch events pour mobile
        document.addEventListener('touchstart', (e) => this.handleTouch(e));
        
        console.log('Événements liés');
    }

    toggleMobileMenu() {
        this.navMenu?.classList.toggle('active');
        this.hamburger?.classList.toggle('active');
        
        // Animation des barres du hamburger
        const spans = this.hamburger?.querySelectorAll('span');
        spans?.forEach((span, index) => {
            span.style.transform = this.hamburger.classList.contains('active') 
                ? `rotate(${index === 0 ? '45deg' : index === 1 ? '0deg' : '-45deg'})` 
                : 'rotate(0deg)';
            span.style.opacity = index === 1 && this.hamburger.classList.contains('active') ? '0' : '1';
        });
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Navbar transparency
        if (scrolled > 50) {
            this.navbar?.classList.add('scrolled');
        } else {
            this.navbar?.classList.remove('scrolled');
        }
        
        // Parallax background
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.transform = `translateY(${rate}px)`;
        }
        
        // Hide scroll indicator
        if (this.scrollIndicator) {
            this.scrollIndicator.style.opacity = scrolled > 100 ? '0' : '1';
        }
        
        // Floating elements parallax
        const floatingElements = document.querySelectorAll('.float-element');
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.2;
            element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    }

    handleMouseMove(e) {
        this.mouseX = (e.clientX - window.innerWidth / 2) / 50;
        this.mouseY = (e.clientY - window.innerHeight / 2) / 50;
        this.isMouseMoving = true;
        
        // Parallax sur les cartes
        this.updateParallaxCards();
        
        // Reset après inactivité
        clearTimeout(this.mouseTimeout);
        this.mouseTimeout = setTimeout(() => {
            this.isMouseMoving = false;
        }, 100);
    }

    updateParallaxCards() {
        if (!this.isMouseMoving) return;
        
        const cards = document.querySelectorAll('.glass-card');
        cards.forEach((card, index) => {
            const speed = (index % 3 + 1) * 0.5;
            const x = this.mouseX * speed;
            const y = this.mouseY * speed;
            
            card.style.transform = `translate3d(${x}px, ${y}px, 0) rotateX(${y * 0.1}deg) rotateY(${x * 0.1}deg)`;
        });
    }

    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Fermer le menu mobile si ouvert
            this.navMenu?.classList.remove('active');
            this.hamburger?.classList.remove('active');
        }
    }

    handleResize() {
        // Recalculer les positions pour les animations
        this.setupScrollAnimations();
    }

    handleTouch(e) {
        // Ajouter des effets tactiles sur mobile
        const target = e.target.closest('.glass-card, .glass-btn');
        if (target) {
            target.classList.add('touched');
            setTimeout(() => {
                target.classList.remove('touched');
            }, 150);
        }
    }

    setupParallax() {
        // Configuration avancée du parallax pour les éléments 3D
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            element.style.willChange = 'transform';
        });
    }

    setupScrollAnimations() {
        // Intersection Observer pour les animations au scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed', 'animate-slide-up');
                    
                    // Animation en cascade pour les éléments enfants
                    const children = entry.target.querySelectorAll('.reveal-delay-1, .reveal-delay-2, .reveal-delay-3');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('revealed');
                        }, index * 100);
                    });
                }
            });
        }, this.observerOptions);

        // Observer les sections et cartes
        const sectionsToObserve = document.querySelectorAll('section, .glass-card, .result-card, .offer-card');
        sectionsToObserve.forEach(section => {
            observer.observe(section);
        });
    }

    startAnimations() {
        // Animation d'entrée pour le héro
        setTimeout(() => {
            const heroCard = document.querySelector('.hero-card');
            heroCard?.classList.add('animate-scale-in');
        }, 300);
        
        // Animation des éléments flottants
        this.animateFloatingElements();
        
        // Animation des particules
        this.createParticles();
        
        // Animation des barres de compétences
        this.animateSkillBars();
    }

    animateFloatingElements() {
        const floatingElements = document.querySelectorAll('.float-element');
        
        floatingElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 2}s`;
            element.classList.add('animate-float');
        });
    }

    createParticles() {
        const particleContainer = document.querySelector('.hero-background');
        if (!particleContainer) return;
        
        // Créer des particules dynamiques
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'glass-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 20 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
            particleContainer.appendChild(particle);
        }
    }

    animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const animateBar = (bar) => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 500);
        };
        
        // Observer pour animer quand visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target.querySelector('.skill-progress');
                    if (bar) animateBar(bar);
                }
            });
        });
        
        const skillItems = document.querySelectorAll('.skill-item');
        skillItems.forEach(item => observer.observe(item));
    }

    // Méthode utilitaire pour le smooth scroll
    smoothScroll(target, duration = 1000) {
        const targetPosition = target.offsetTop - 80;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }

    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
}

// ===== UTILITAIRES GLOBAUX =====

// Fonction pour le scroll vers une section
function scrollToSection(sectionId) {
    const section = document.querySelector(`#${sectionId}`);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Fonction pour ajouter des effets de hover dynamiques
function addHoverEffects() {
    const hoverElements = document.querySelectorAll('.glass-card, .glass-btn');
    
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        });
    });
}

// Fonction pour les effets de typing
function initTypingEffect() {
    const typingElements = document.querySelectorAll('.typing-effect');
    
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.borderRight = '2px solid #667eea';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                element.style.borderRight = 'none';
            }
        };
        
        // Démarrer l'effet quand l'élément devient visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    typeWriter();
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(element);
    });
}

// Fonction pour les animations de compteur
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateCounter();
                    observer.disconnect();
                }
            });
        });
        
        observer.observe(counter);
    });
}

// Fonction pour gérer les modales
function initModals() {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');
    const modalCloses = document.querySelectorAll('.modal-close');
    
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const modal = document.querySelector(`#${modalId}`);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    modalCloses.forEach(close => {
        close.addEventListener('click', () => {
            const modal = close.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });
    
    // Fermer les modales en cliquant à l'extérieur
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });
}

// Fonction pour le lazy loading des images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Fonction pour les notifications toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Suppression automatique
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ===== INITIALISATION =====

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    // Créer l'instance principale
    const portfolio = new PortfolioManager();
    
    // Initialiser les autres fonctionnalités
    addHoverEffects();
    initTypingEffect();
    animateCounters();
    initModals();
    initLazyLoading();
    
    // Log de confirmation
    console.log('🚀 Portfolio Nouhaila Lakhchaf - Chargé avec succès!');
    
    // Animation de chargement terminée
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
    console.error('Erreur détectée:', e.error);
});

// Optimisation des performances
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}