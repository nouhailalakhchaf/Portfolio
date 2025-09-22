// ===== SERVICE WORKER POUR CACHE ET OPTIMISATIONS =====

const CACHE_NAME = 'nouhaila-portfolio-v1.0.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/glassmorphism.css',
    '/css/animations.css',
    '/css/responsive.css',
    '/js/performance.js',
    '/js/main.js',
    '/js/animations.js',
    '/js/form-handler.js'
];

const CDN_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
    'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
    'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
];

// Installation du Service Worker
self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Installation');
    
    event.waitUntil(
        Promise.all([
            // Cache des assets statiques
            caches.open(CACHE_NAME).then(cache => {
                return cache.addAll(STATIC_ASSETS);
            }),
            // Pré-cache des assets CDN
            caches.open(CACHE_NAME + '-cdn').then(cache => {
                return cache.addAll(CDN_ASSETS);
            })
        ]).then(() => {
            // Forcer l'activation immédiate
            return self.skipWaiting();
        })
    );
});

// Activation du Service Worker
self.addEventListener('activate', event => {
    console.log('✅ Service Worker: Activation');
    
    event.waitUntil(
        Promise.all([
            // Nettoyer les anciens caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && cacheName !== CACHE_NAME + '-cdn') {
                            console.log('🗑️ Suppression ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Prendre le contrôle de tous les clients
            self.clients.claim()
        ])
    );
});

// Stratégie de fetch
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignorer les requêtes non-HTTP
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Stratégie différenciée selon le type de ressource
    if (isStaticAsset(request)) {
        // Cache First pour les assets statiques
        event.respondWith(cacheFirst(request));
    } else if (isCDNAsset(request)) {
        // Stale While Revalidate pour les CDN
        event.respondWith(staleWhileRevalidate(request));
    } else if (isAPIRequest(request)) {
        // Network First pour les API
        event.respondWith(networkFirst(request));
    } else {
        // Network Only pour le reste
        event.respondWith(fetch(request));
    }
});

// ===== STRATÉGIES DE CACHE =====

// Cache First - Pour assets statiques
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Cache First Error:', error);
        return new Response('Asset non disponible', { status: 503 });
    }
}

// Stale While Revalidate - Pour CDN et fonts
async function staleWhileRevalidate(request) {
    try {
        const cachedResponse = await caches.match(request);
        const networkResponsePromise = fetch(request).then(response => {
            if (response.ok) {
                const cache = caches.open(CACHE_NAME + '-cdn');
                cache.then(c => c.put(request, response.clone()));
            }
            return response;
        });
        
        return cachedResponse || await networkResponsePromise;
    } catch (error) {
        console.error('Stale While Revalidate Error:', error);
        return await caches.match(request);
    }
}

// Network First - Pour API calls
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME + '-api');
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('Network First Error:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response(JSON.stringify({ error: 'Service indisponible' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ===== UTILITAIRES DE DÉTECTION =====

function isStaticAsset(request) {
    const url = new URL(request.url);
    return STATIC_ASSETS.some(asset => url.pathname === asset) ||
           url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf)$/);
}

function isCDNAsset(request) {
    const url = new URL(request.url);
    return CDN_ASSETS.some(asset => request.url.includes(asset)) ||
           url.hostname.includes('googleapis.com') ||
           url.hostname.includes('gstatic.com') ||
           url.hostname.includes('jsdelivr.net') ||
           url.hostname.includes('fontawesome.com');
}

function isAPIRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') ||
           request.method === 'POST' ||
           request.method === 'PUT' ||
           request.method === 'DELETE';
}

// ===== GESTION DES MESSAGES =====

self.addEventListener('message', event => {
    const { type, payload } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_URLS':
            cacheUrls(payload.urls);
            break;
            
        case 'CLEAR_CACHE':
            clearCache(payload.cacheName);
            break;
            
        case 'GET_CACHE_STATUS':
            getCacheStatus().then(status => {
                event.ports[0].postMessage(status);
            });
            break;
    }
});

// Cache des URLs spécifiques
async function cacheUrls(urls) {
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urls);
        console.log('✅ URLs mises en cache:', urls);
    } catch (error) {
        console.error('❌ Erreur cache URLs:', error);
    }
}

// Nettoyage de cache
async function clearCache(cacheName = CACHE_NAME) {
    try {
        const deleted = await caches.delete(cacheName);
        console.log('🗑️ Cache nettoyé:', cacheName, deleted);
    } catch (error) {
        console.error('❌ Erreur nettoyage cache:', error);
    }
}

// Status du cache
async function getCacheStatus() {
    try {
        const cacheNames = await caches.keys();
        const status = {};
        
        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            status[cacheName] = keys.length;
        }
        
        return status;
    } catch (error) {
        console.error('❌ Erreur status cache:', error);
        return {};
    }
}

// ===== NOTIFICATIONS PUSH (Optionnel) =====

self.addEventListener('push', event => {
    if (!event.data) return;
    
    const options = {
        body: event.data.text(),
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: 'Ouvrir',
                icon: '/icons/action-open.png'
            },
            {
                action: 'close',
                title: 'Fermer',
                icon: '/icons/action-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Portfolio Nouhaila', options)
    );
});

// Gestion des clics sur notifications
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// ===== SYNC EN ARRIÈRE-PLAN (Optionnel) =====

self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    try {
        // Synchronisation des données en attente
        console.log('🔄 Synchronisation en arrière-plan');
        
        // Ici on pourrait synchroniser les formulaires sauvegardés
        // quand la connexion revient
        
    } catch (error) {
        console.error('❌ Erreur sync arrière-plan:', error);
    }
}

// ===== MONITORING ET ANALYTICS =====

// Capturer les erreurs du Service Worker
self.addEventListener('error', event => {
    console.error('🚨 Service Worker Error:', event.error);
    
    // Optionnel: Envoyer les erreurs à un service d'analytics
    // sendErrorToAnalytics(event.error);
});

// Performance monitoring
self.addEventListener('fetch', event => {
    const startTime = performance.now();
    
    event.respondWith(
        handleFetch(event.request).then(response => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Log des requêtes lentes
            if (duration > 1000) {
                console.warn('🐌 Requête lente:', event.request.url, duration + 'ms');
            }
            
            return response;
        })
    );
});

async function handleFetch(request) {
    // Logique de fetch existante
    return fetch(request);
}

console.log('📦 Service Worker chargé - Version:', CACHE_NAME);