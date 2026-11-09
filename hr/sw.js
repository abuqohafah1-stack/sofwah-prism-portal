/* PRISM HR portal SW: kerangka luar talian sahaja (app sebenar dalam iframe Apps Script, tidak dicache). */
var C = 'prism-hr-portal-v1', F = ['/hr/', '/hr/index.html', '/hr/manifest.webmanifest', '/hr/icons/icon-192.png'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(C).then(function (c) { return c.addAll(F); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== C; }).map(function (x) { return caches.delete(x); })); })); self.clients.claim(); });
self.addEventListener('fetch', function (e) { var u = new URL(e.request.url); if (u.origin !== location.origin || u.pathname.indexOf('/hr/') !== 0) return; e.respondWith(fetch(e.request).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match('/hr/'); }); })); });
