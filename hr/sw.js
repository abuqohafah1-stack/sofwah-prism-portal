/* PRISM HR PWA 008a929bd1
 * Cache: kerangka app (HTML, ikon, fon) sahaja, stale-while-revalidate → buka serta-merta.
 * TIDAK cache data: semua panggilan API (POST ke Apps Script) terus ke rangkaian.
 * Push: papar notifikasi FCM (Web Push) dan buka app bila ditekan. */
var V = 'prism-hr-008a929bd1';
var SHELL = ['/hr/', '/hr/manifest.webmanifest', '/hr/icons/icon-192.png', '/hr/icons/icon-512.png', '/hr/icons/icon-180.png', '/hr/icons/icon-32.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (x) { return x !== V && x.indexOf('prism-hr') === 0; }).map(function (x) { return caches.delete(x); }));
  }).then(function () { return self.clients.claim(); }));
});
function swr(req, key) {
  return caches.open(V).then(function (c) {
    return c.match(key || req).then(function (hit) {
      var net = fetch(req).then(function (res) { if (res && (res.ok || res.type === 'opaque')) c.put(key || req, res.clone()); return res; });
      return hit ? (net.catch(function () {}), hit) : net;
    });
  });
}
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (u.origin === location.origin && u.pathname.indexOf('/hr/') === 0) {
    if (r.mode === 'navigate') { e.respondWith(swr(r, '/hr/')); return; }
    if (u.pathname !== '/hr/sw.js') e.respondWith(swr(r));
    return;
  }
  if (u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') e.respondWith(swr(r));
});
self.addEventListener('push', function (e) {
  var d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { notification: { body: e.data && e.data.text() } }; }
  var n = d.notification || {};
  var link = (d.fcmOptions && d.fcmOptions.link) || (d.data && d.data.link) || '/hr/';
  e.waitUntil(self.registration.showNotification(n.title || 'PRISM HR', {
    body: n.body || '', icon: n.icon || '/hr/icons/icon-192.png', badge: '/hr/icons/icon-32.png',
    tag: n.tag || undefined, data: { link: link },
    vibrate: [120, 60, 120, 60, 320] // corak getar PRISM (Android): dua ketuk pendek + satu panjang
  }));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var link = (e.notification.data && e.notification.data.link) || '/hr/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) if (list[i].url.indexOf('/hr/') >= 0 && 'focus' in list[i]) return list[i].focus();
    return self.clients.openWindow(link);
  }));
});
