const CACHE_NAME = 'ranchillo-cache-v10';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './icon.png',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Instalando caché...');
                return cache.addAll(ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Borrando caché antiguo...');
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Devuelve del caché
                }
                
                // Si no está en caché, va a la red
                return fetch(event.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }
                    
                    // Permitimos guardar en caché recursos locales (basic), cors (como fuentes) y opaque (no-cors)
                    const tiposPermitidos = ['basic', 'cors', 'opaque'];
                    if (tiposPermitidos.includes(networkResponse.type)) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    
                    return networkResponse;
                }).catch(() => {
                    // Fallback para cuando esté offline y no haya caché
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
