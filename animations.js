// ===== GESTIONNAIRE D'ANIMATIONS AVANCÉES =====

class AdvancedAnimationManager {
    constructor() {
        this.init();
        this.setupIntersectionObserver();
        this.setupMouseEffects();
        this.setupParallaxEffects();
        this.setupMorphingShapes();
    }

    init() {
        this.animationQueue = [];
        this.isPerformanceMode = this.checkPerformance();
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Configuration des animations
        this.config = {
            duration: {
                fast: 0.3,
                medium: 0.6,
                slow: 1.2
            },
            easing: {
                smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                sharp: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }
        };

        console.log('Animation Manager initialisé');
    }

    checkPerformance() {
        // Détection basique des performances de l'appareil
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return false;
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        
        // Mode performance réduite pour appareils moins puissants
        return !renderer.includes('Mali') && !renderer.includes('Adreno 3');
    }

    setupIntersectionObserver() {
        // Observer pour animations au scroll optimisé
        const observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: [0.1, 0.5, 0.9]
        };

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => this.handleScrollAnimation(entry));
        }, observerOptions);

        // Observer les éléments avec animations
        const animatedElements = document.querySelectorAll(
            '.glass-card, .result-card, .offer-card, .solution-card, ' +
            '.testimonial-card, .review-card, .authority-card, ' +
            '.section-header, .hero-stats, .skills-grid'
        );

        animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            this.scrollObserver.observe(el);
        });
    }

    handleScrollAnimation(entry) {
        const element = entry.target;
        const rect = entry.boundingClientRect;
        const windowHeight = window.innerHeight;
        
        if (entry.isIntersecting) {
            // Calculer le pourcentage de visibilité
            const visibilityRatio = entry.intersectionRatio;
            
            // Animations basées sur la visibilité
            if (visibilityRatio > 0.1 && !element.classList.contains('animated')) {
                this.triggerEntryAnimation(element);
            }
            
            // Parallax en fonction du scroll
            if (visibilityRatio > 0.3) {
                this.updateParallaxPosition(element, rect, windowHeight);
            }
        } else {
            // Réinitialiser les animations si nécessaire
            if (element.classList.contains('reset-on-exit')) {
                this.resetAnimation(element);
            }
        }
    }

    triggerEntryAnimation(element) {
        if (this.prefersReducedMotion) return;
        
        element.classList.add('animated');
        
        // Différents types d'animations selon la classe
        if (element.classList.contains('glass-card')) {
            this.animateGlassCard(element);
        } else if (element.classList.contains('section-header')) {
            this.animateSectionHeader(element);
        } else if (element.classList.contains('hero-stats')) {
            this.animateHeroStats(element);
        } else if (element.classList.contains('skills-grid')) {
            this.animateSkillsGrid(element);
        } else {
            this.animateDefault(element);
        }
    }

    animateGlassCard(element) {
        // Animation sophistiquée pour les cartes en verre
        element.style.transform = 'translateY(60px) scale(0.8) rotateX(15deg)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.transition = `all ${this.config.duration.medium}s ${this.config.easing.bounce}`;
            element.style.transform = 'translateY(0) scale(1) rotateX(0deg)';
            element.style.opacity = '1';
            
            // Effet de brillance après l'animation
            setTimeout(() => this.addGlowEffect(element), 300);
        }, Math.random() * 200);
    }

    animateSectionHeader(element) {
        const title = element.querySelector('.section-title');
        const subtitle = element.querySelector('.section-subtitle');
        
        if (title) {
            this.animateTextReveal(title);
        }
        
        if (subtitle) {
            setTimeout(() => this.animateTextReveal(subtitle), 200);
        }
    }

    animateHeroStats(element) {
        const statItems = element.querySelectorAll('.stat-item');
        
        statItems.forEach((item, index) => {
            item.style.transform = 'translateY(40px)';
            item.style.opacity = '0';
            
            setTimeout(() => {
                item.style.transition = `all ${this.config.duration.medium}s ${this.config.easing.smooth}`;
                item.style.transform = 'translateY(0)';
                item.style.opacity = '1';
            }, index * 100 + 300);
        });
    }

    animateSkillsGrid(element) {
        const skillItems = element.querySelectorAll('.skill-item');
        
        skillItems.forEach((item, index) => {
            const skillBar = item.querySelector('.skill-progress');
            const skillName = item.querySelector('.skill-name');
            
            // Animation du nom
            if (skillName) {
                skillName.style.transform = 'translateX(-30px)';
                skillName.style.opacity = '0';
                
                setTimeout(() => {
                    skillName.style.transition = `all ${this.config.duration.fast}s ${this.config.easing.smooth}`;
                    skillName.style.transform = 'translateX(0)';
                    skillName.style.opacity = '1';
                }, index * 100);
            }
            
            // Animation de la barre
            if (skillBar) {
                const targetWidth = skillBar.style.width;
                skillBar.style.width = '0%';
                
                setTimeout(() => {
                    skillBar.style.transition = `width ${this.config.duration.slow}s ${this.config.easing.smooth}`;
                    skillBar.style.width = targetWidth;
                }, index * 150 + 200);
            }
        });
    }

    animateDefault(element) {
        element.style.transform = 'translateY(40px)';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.transition = `all ${this.config.duration.medium}s ${this.config.easing.smooth}`;
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        }, 100);
    }

    animateTextReveal(element) {
        const text = element.textContent;
        const words = text.split(' ');
        
        element.innerHTML = words.map(word => 
            `<span class="word-reveal" style="opacity: 0; transform: translateY(20px);">${word}</span>`
        ).join(' ');
        
        const wordElements = element.querySelectorAll('.word-reveal');
        
        wordElements.forEach((word, index) => {
            setTimeout(() => {
                word.style.transition = `all ${this.config.duration.fast}s ${this.config.easing.smooth}`;
                word.style.opacity = '1';
                word.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    addGlowEffect(element) {
        if (!this.isPerformanceMode) return;
        
        element.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.3)';
        
        setTimeout(() => {
            element.style.transition = 'box-shadow 0.5s ease-out';
            element.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        }, 500);
    }

    setupMouseEffects() {
        if (!this.isPerformanceMode || this.prefersReducedMotion) return;
        
        const glassElements = document.querySelectorAll('.glass-card, .glass-btn');
        
        glassElements.forEach(element => {
            element.addEventListener('mousemove', (e) => this.handleMouseMove(e, element));
            element.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, element));
        });
    }

    handleMouseMove(e, element) {
        const rect = element.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        
        const rotateX = y * 10;
        const rotateY = -x * 10;
        const translateZ = Math.abs(x) + Math.abs(y);
        
        element.style.transform = 
            `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ * 10}px)`;
        
        // Effet de surbrillance suivant la souris
        const glowX = (x + 1) * 50;
        const glowY = (y + 1) * 50;
        
        element.style.background = `
            radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            ${element.style.background || 'rgba(255, 255, 255, 0.08)'}
        `;
    }

    handleMouseLeave(e, element) {
        element.style.transition = 'all 0.3s ease-out';
        element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        element.style.background = 'rgba(255, 255, 255, 0.08)';
        
        setTimeout(() => {
            element.style.transition = '';
        }, 300);
    }

    updateParallaxPosition(element, rect, windowHeight) {
        if (!this.isPerformanceMode || this.prefersReducedMotion) return;
        
        const speed = element.dataset.parallaxSpeed || 0.1;
        const yPos = -(rect.top - windowHeight / 2) * speed;
        
        element.style.transform = `translateY(${yPos}px)`;
    }

    setupParallaxEffects() {
        if (!this.isPerformanceMode) return;
        
        // Parallax sur les éléments flottants
        const floatingElements = document.querySelectorAll('.float-element');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            floatingElements.forEach((element, index) => {
                const speed = (index + 1) * 0.3;
                const yPos = scrolled * speed;
                const rotation = scrolled * 0.1;
                
                element.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
            });
        });
    }

    setupMorphingShapes() {
        if (!this.isPerformanceMode) return;
        
        // Créer des formes morphantes dynamiques
        this.createMorphingBackground();
        this.animateMorphingShapes();
    }

    createMorphingBackground() {
        const morphContainer = document.createElement('div');
        morphContainer.className = 'morphing-container';
        morphContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            overflow: hidden;
        `;
        
        // Créer plusieurs formes morphantes
        for (let i = 0; i < 5; i++) {
            const shape = document.createElement('div');
            shape.className = 'morphing-shape';
            shape.style.cssText = `
                position: absolute;
                width: ${100 + Math.random() * 200}px;
                height: ${100 + Math.random() * 200}px;
                background: linear-gradient(45deg, 
                    rgba(102, 126, 234, 0.1), 
                    rgba(240, 147, 251, 0.1));
                border-radius: ${30 + Math.random() * 40}% ${70 - Math.random() * 40}% 
                               ${70 - Math.random() * 40}% ${30 + Math.random() * 40}% / 
                               ${30 + Math.random() * 40}% ${30 + Math.random() * 40}% 
                               ${70 - Math.random() * 40}% ${70 - Math.random() * 40}%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: morph-float ${20 + Math.random() * 10}s ease-in-out infinite;
                animation-delay: ${i * 4}s;
            `;
            
            morphContainer.appendChild(shape);
        }
        
        document.body.appendChild(morphContainer);
    }

    animateMorphingShapes() {
        // Animation CSS pour les formes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes morph-float {
                0%, 100% {
                    transform: translate(0, 0) rotate(0deg) scale(1);
                    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
                }
                25% {
                    transform: translate(30px, -30px) rotate(90deg) scale(1.1);
                    border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%;
                }
                50% {
                    transform: translate(-20px, 40px) rotate(180deg) scale(0.9);
                    border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%;
                }
                75% {
                    transform: translate(-40px, -20px) rotate(270deg) scale(1.05);
                    border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Méthodes utilitaires pour les animations personnalisées
    animateElement(element, fromProps, toProps, duration = 0.6, easing = 'smooth') {
        if (this.prefersReducedMotion) return Promise.resolve();
        
        return new Promise(resolve => {
            // Appliquer les propriétés initiales
            Object.assign(element.style, fromProps);
            
            // Forcer le repaint
            element.offsetHeight;
            
            // Appliquer la transition et les propriétés finales
            element.style.transition = `all ${duration}s ${this.config.easing[easing]}`;
            Object.assign(element.style, toProps);
            
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration * 1000);
        });
    }

    staggerAnimation(elements, animationFn, delay = 100) {
        if (this.prefersReducedMotion) return Promise.resolve();
        
        return Promise.all(
            Array.from(elements).map((element, index) => 
                new Promise(resolve => {
                    setTimeout(() => {
                        animationFn(element).then(resolve);
                    }, index * delay);
                })
            )
        );
    }

    resetAnimation(element) {
        element.classList.remove('animated');
        element.style.transform = '';
        element.style.opacity = '';
        element.style.transition = '';
    }

    // Nettoyage et optimisation
    dispose() {
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }
        
        // Nettoyer les event listeners
        window.removeEventListener('scroll', this.handleScroll);
    }
}

// ===== INITIALISATION DES ANIMATIONS =====

// Démarrer le gestionnaire d'animations quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    const animationManager = new AdvancedAnimationManager();
    
    // Exposer globalement pour le debugging
    window.animationManager = animationManager;
    
    console.log('🎨 Gestionnaire d\'animations avancées initialisé');
});

// Performance monitoring
if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('animations-start');
    
    window.addEventListener('load', () => {
        performance.mark('animations-end');
        performance.measure('animations-duration', 'animations-start', 'animations-end');
        
        const measure = performance.getEntriesByName('animations-duration')[0];
        console.log(`⚡ Animations chargées en ${measure.duration.toFixed(2)}ms`);
    });
}