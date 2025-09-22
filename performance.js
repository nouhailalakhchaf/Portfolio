// ===== GESTIONNAIRE D'OPTIMISATION DES PERFORMANCES =====

class PerformanceOptimizer {
    constructor() {
        this.init();
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupCriticalResourceHints();
        this.setupIntersectionObserver();
        this.setupReducedMotionSupport();
        this.monitorPerformance();
    }

    init() {
        // Détection des capacités de l'appareil
        this.deviceCapabilities = this.analyzeDeviceCapabilities();
        this.networkInfo = this.getNetworkInfo();
        this.isLowEndDevice = this.detectLowEndDevice();
        
        // Configuration d'optimisation
        this.config = {
            lazyLoadingOffset: '50px',
            debounceDelay: 16, // 60fps
            throttleDelay: 100,
            maxConcurrentRequests: 6,
            preloadPriority: ['hero-images', 'critical-css', 'fonts'],
            performanceBudget: {
                maxScriptDuration: 50, // ms
                maxPaintTime: 16, // ms pour 60fps
                maxMemoryUsage: 50 * 1024 * 1024 // 50MB
            }
        };
        
        // Optimisations basées sur l'appareil
        this.applyDeviceOptimizations();
        
        console.log('🚀 Optimiseur de performances initialisé', {
            isLowEndDevice: this.isLowEndDevice,
            networkType: this.networkInfo.type,
            deviceCapabilities: this.deviceCapabilities
        });
    }

    analyzeDeviceCapabilities() {
        const capabilities = {
            cores: navigator.hardwareConcurrency || 2,
            memory: navigator.deviceMemory || 2,
            connection: navigator.connection || null,
            webgl: this.checkWebGLSupport(),
            intersectionObserver: 'IntersectionObserver' in window,
            passiveListeners: this.checkPassiveListenerSupport(),
            webp: this.checkWebPSupport()
        };
        
        return capabilities;
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            return false;
        }
    }

    checkPassiveListenerSupport() {
        let supportsPassive = false;
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get() {
                    supportsPassive = true;
                    return false;
                }
            });
            window.addEventListener('test', null, opts);
            window.removeEventListener('test', null, opts);
        } catch (e) {}
        return supportsPassive;
    }

    checkWebPSupport() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = () => resolve(webP.height === 2);
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        return {
            type: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || 10,
            rtt: connection?.rtt || 100,
            saveData: connection?.saveData || false
        };
    }

    detectLowEndDevice() {
        const memory = this.deviceCapabilities.memory;
        const cores = this.deviceCapabilities.cores;
        const connection = this.networkInfo;
        
        // Critères pour détecter un appareil bas de gamme
        return (
            memory < 4 ||
            cores < 4 ||
            connection.type === 'slow-2g' ||
            connection.type === '2g' ||
            connection.saveData
        );
    }

    applyDeviceOptimizations() {
        if (this.isLowEndDevice) {
            // Optimisations pour appareils bas de gamme
            this.enableLowEndMode();
        }
        
        if (this.networkInfo.saveData || this.networkInfo.type === '2g' || this.networkInfo.type === 'slow-2g') {
            // Mode économie de données
            this.enableDataSavingMode();
        }
        
        // Optimisations spécifiques au navigateur
        this.applyBrowserOptimizations();
    }

    enableLowEndMode() {
        document.documentElement.classList.add('low-end-device');
        
        // Réduire les animations
        const style = document.createElement('style');
        style.textContent = `
            .low-end-device * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            .low-end-device .morphing-shape,
            .low-end-device .glass-particle,
            .low-end-device .float-element {
                display: none !important;
            }
            .low-end-device .glass-card {
                backdrop-filter: blur(5px) !important;
            }
        `;
        document.head.appendChild(style);
        
        console.log('🔧 Mode appareil bas de gamme activé');
    }

    enableDataSavingMode() {
        document.documentElement.classList.add('data-saving');
        
        // Désactiver les images non critiques
        const nonCriticalImages = document.querySelectorAll('img:not([data-critical])');
        nonCriticalImages.forEach(img => {
            img.loading = 'lazy';
        });
        
        // Réduire la qualité des effets visuels
        const style = document.createElement('style');
        style.textContent = `
            .data-saving .glass-card {
                backdrop-filter: blur(3px) !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
            }
            .data-saving .gradient-animation {
                background: #667eea !important;
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
        
        console.log('📱 Mode économie de données activé');
    }

    applyBrowserOptimizations() {
        // Optimisations spécifiques Safari
        if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            document.documentElement.classList.add('safari');
            this.optimizeForSafari();
        }
        
        // Optimisations spécifiques Firefox
        if (navigator.userAgent.indexOf('Firefox') !== -1) {
            document.documentElement.classList.add('firefox');
            this.optimizeForFirefox();
        }
    }

    optimizeForSafari() {
        // Corrections spécifiques pour Safari
        const style = document.createElement('style');
        style.textContent = `
            .safari .glass-card {
                -webkit-backdrop-filter: blur(20px);
            }
            .safari .morphing-shape {
                will-change: transform;
            }
        `;
        document.head.appendChild(style);
    }

    optimizeForFirefox() {
        // Optimisations pour Firefox
        const style = document.createElement('style');
        style.textContent = `
            .firefox .glass-card {
                background: rgba(255, 255, 255, 0.15);
            }
        `;
        document.head.appendChild(style);
    }

    setupLazyLoading() {
        // Lazy loading avancé avec Intersection Observer
        const imageObserverOptions = {
            root: null,
            rootMargin: this.config.lazyLoadingOffset,
            threshold: 0.1
        };

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                }
            });
        }, imageObserverOptions);

        // Observer toutes les images avec data-src
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.imageObserver.observe(img));
    }

    loadImage(img) {
        return new Promise((resolve, reject) => {
            const imageLoader = new Image();
            
            imageLoader.onload = () => {
                img.src = img.dataset.src;
                img.classList.add('loaded');
                delete img.dataset.src;
                resolve(img);
            };
            
            imageLoader.onerror = reject;
            imageLoader.src = img.dataset.src;
        });
    }

    setupImageOptimization() {
        // Optimisation automatique des images
        this.optimizeImages();
        
        // Preload des images critiques
        this.preloadCriticalImages();
    }

    optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Ajouter le loading lazy par défaut
            if (!img.hasAttribute('loading') && !img.hasAttribute('data-critical')) {
                img.loading = 'lazy';
            }
            
            // Optimiser les dimensions
            if (!img.width || !img.height) {
                img.addEventListener('load', () => {
                    this.setOptimalImageDimensions(img);
                });
            }
        });
    }

    setOptimalImageDimensions(img) {
        const rect = img.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Calculer les dimensions optimales
        const optimalWidth = Math.ceil(rect.width * dpr);
        const optimalHeight = Math.ceil(rect.height * dpr);
        
        // Ajouter des attributs pour l'optimisation
        img.setAttribute('data-optimal-width', optimalWidth);
        img.setAttribute('data-optimal-height', optimalHeight);
    }

    preloadCriticalImages() {
        const criticalImages = document.querySelectorAll('img[data-critical]');
        
        criticalImages.forEach(img => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.src || img.dataset.src;
            document.head.appendChild(link);
        });
    }

    setupCriticalResourceHints() {
        // DNS prefetch pour domaines externes
        const externalDomains = [
            'fonts.googleapis.com',
            'fonts.gstatic.com',
            'cdn.jsdelivr.net'
        ];
        
        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = `//${domain}`;
            document.head.appendChild(link);
        });
        
        // Preconnect pour ressources critiques
        const criticalDomains = ['fonts.googleapis.com'];
        criticalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = `https://${domain}`;
            link.crossOrigin = '';
            document.head.appendChild(link);
        });
    }

    setupIntersectionObserver() {
        // Observer optimisé pour les animations
        const animationObserverOptions = {
            root: null,
            rootMargin: '50px',
            threshold: [0.1, 0.5]
        };

        this.animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.handleElementVisibility(entry);
            });
        }, animationObserverOptions);

        // Observer les éléments animés
        const animatedElements = document.querySelectorAll('.glass-card, .animate-on-scroll');
        animatedElements.forEach(el => this.animationObserver.observe(el));
    }

    handleElementVisibility(entry) {
        const element = entry.target;
        
        if (entry.isIntersecting) {
            // Élément visible - démarrer les animations
            if (!element.classList.contains('visible')) {
                element.classList.add('visible');
                this.startElementAnimations(element);
            }
        } else {
            // Élément hors de vue - nettoyer si nécessaire
            if (entry.boundingClientRect.top > window.innerHeight) {
                this.cleanupElementAnimations(element);
            }
        }
    }

    startElementAnimations(element) {
        // Démarrer les animations uniquement pour les éléments visibles
        requestAnimationFrame(() => {
            element.style.animationPlayState = 'running';
        });
    }

    cleanupElementAnimations(element) {
        // Pauser les animations pour économiser les ressources
        if (!this.isLowEndDevice) return;
        
        element.style.animationPlayState = 'paused';
    }

    setupReducedMotionSupport() {
        // Respecter les préférences d'accessibilité
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            this.enableReducedMotionMode();
        }
        
        // Écouter les changements de préférences
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                this.enableReducedMotionMode();
            } else {
                this.disableReducedMotionMode();
            }
        });
    }

    enableReducedMotionMode() {
        document.documentElement.classList.add('reduced-motion');
        
        const style = document.createElement('style');
        style.textContent = `
            .reduced-motion *,
            .reduced-motion *::before,
            .reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
        
        console.log('♿ Mode mouvement réduit activé');
    }

    disableReducedMotionMode() {
        document.documentElement.classList.remove('reduced-motion');
        // Retirer le style réduit si ajouté
    }

    // Méthodes de monitoring des performances
    monitorPerformance() {
        if (typeof performance === 'undefined') return;
        
        // Observer les métriques de performance
        this.observeNavigationTiming();
        this.observePaintMetrics();
        this.observeResourceTiming();
        this.observeLongTasks();
        this.monitorMemoryUsage();
    }

    observeNavigationTiming() {
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            
            const metrics = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstByte: navigation.responseStart - navigation.requestStart,
                domInteractive: navigation.domInteractive - navigation.navigationStart
            };
            
            console.log('📊 Métriques de navigation:', metrics);
            
            // Alerter si les métriques dépassent les seuils
            if (metrics.domContentLoaded > 3000) {
                console.warn('⚠️ DOMContentLoaded lent:', metrics.domContentLoaded + 'ms');
            }
        });
    }

    observePaintMetrics() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log(`🎨 ${entry.name}:`, entry.startTime + 'ms');
                }
            });
            
            observer.observe({ entryTypes: ['paint'] });
        }
    }

    observeResourceTiming() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 1000) {
                        console.warn('🐌 Ressource lente:', entry.name, entry.duration + 'ms');
                    }
                }
            });
            
            observer.observe({ entryTypes: ['resource'] });
        }
    }

    observeLongTasks() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.warn('🚨 Tâche longue détectée:', entry.duration + 'ms');
                }
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        }
    }

    monitorMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                const usedMB = memory.usedJSHeapSize / (1024 * 1024);
                
                if (usedMB > this.config.performanceBudget.maxMemoryUsage / (1024 * 1024)) {
                    console.warn('💾 Utilisation mémoire élevée:', usedMB.toFixed(2) + 'MB');
                }
            }, 30000); // Vérifier toutes les 30 secondes
        }
    }

    // Méthodes utilitaires d'optimisation
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
    }

    requestIdleCallback(callback, options = {}) {
        if ('requestIdleCallback' in window) {
            return window.requestIdleCallback(callback, options);
        } else {
            // Fallback pour les navigateurs non supportés
            return setTimeout(() => {
                callback({
                    didTimeout: false,
                    timeRemaining: () => 16.67 // Simule 60fps
                });
            }, 1);
        }
    }

    // Nettoyage
    dispose() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        
        if (this.animationObserver) {
            this.animationObserver.disconnect();
        }
    }
}

// ===== SERVICE WORKER POUR LA MISE EN CACHE =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('📦 Service Worker enregistré:', registration);
        } catch (error) {
            console.log('❌ Échec de l\'enregistrement du Service Worker:', error);
        }
    });
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    const performanceOptimizer = new PerformanceOptimizer();
    
    // Exposer globalement pour le debugging
    window.performanceOptimizer = performanceOptimizer;
    
    console.log('⚡ Optimiseur de performances initialisé');
});

// ===== MONITORING GLOBAL DES ERREURS =====
window.addEventListener('error', (event) => {
    console.error('🚨 Erreur JavaScript:', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
    });
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Promise rejetée:', event.reason);
});

// ===== EXPORT POUR MODULES =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}