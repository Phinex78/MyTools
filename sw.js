const appRoot = new URL('./', self.location.href);
const CACHE_PREFIX = 'equimeteo-' + encodeURIComponent(appRoot.pathname) + '-';
const CACHE_NAME = CACHE_PREFIX + '0c695a5a815165ab';
const ASSETS = ["./", "./INSTALLATION.md", "./THREE-LICENSE.txt", "./app.js", "./equestrian-news.json", "./icon-180.png", "./icon-192.png", "./icon-512.png", "./icons/LICENSE", "./icons/Phosphor.svg", "./icons/Phosphor.ttf", "./icons/Phosphor.woff", "./icons/Phosphor.woff2", "./icons/style.css", "./index.html", "./logo-coin.js", "./manifest.webmanifest", "./tailwind.css", "./three.module.min.js"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== appRoot.origin || !url.pathname.startsWith(appRoot.pathname)) return;
  if (url.pathname === new URL('equestrian-news.json', appRoot).pathname) {
    event.respondWith(caches.open(CACHE_NAME).then(async cache => {
      try {
        const response = await fetch(event.request);
        if (!response.ok) throw new Error('News unavailable');
        await cache.put(event.request, response.clone());
        return response;
      } catch {
        const cached = await cache.match(event.request, { ignoreSearch: true });
        return cached || Response.error();
      }
    }));
    return;
  }
  event.respondWith(caches.open(CACHE_NAME).then(async cache => {
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
    if (event.request.mode === 'navigate') return cache.match(new URL('index.html', appRoot).href);
    return fetch(event.request);
  }));
});