/* NARA HR telah berpindah ke https://nara.sofwah.my/hr/ — service worker lama dipadam. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (x) { return x.indexOf('prism-hr') === 0; }).map(function (x) { return caches.delete(x); }));
  }).then(function () { return self.registration.unregister(); })
    .then(function () { return self.clients.matchAll({ type: 'window' }); })
    .then(function (cs) { cs.forEach(function (c) { if (c.url.indexOf('/hr/') >= 0 && c.navigate) c.navigate(c.url); }); }));
});
