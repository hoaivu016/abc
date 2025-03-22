/* eslint-disable no-restricted-globals */

// Tên cache và URL
const CACHE_NAME = 'vehicle-management-cache-v2';
const OFFLINE_URL = '/offline.html';
const NOT_FOUND_URL = '/404.html';

// Tài nguyên cần cache khi khởi động
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  OFFLINE_URL,
  NOT_FOUND_URL,
  '/debug.html'
];

// Sự kiện cài đặt service worker
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Đang cài đặt');
  
  // Force active service worker để kiểm soát ngay lập tức
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Đang cache tài nguyên');
        return cache.addAll(CACHE_ASSETS);
      })
  );
});

// Sự kiện kích hoạt service worker
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Đã kích hoạt');
  
  // Xóa cache cũ
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('[ServiceWorker] Xóa cache cũ:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claim clients');
      return self.clients.claim();
    })
  );
});

// Xử lý fetch request
self.addEventListener('fetch', (event) => {
  // Bỏ qua URLs từ bên thứ 3
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Bỏ qua yêu cầu không phải GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Xử lý riêng cho yêu cầu trang chính
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Trả về trang offline nếu là navigation request
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Chiến lược cache-first cho yêu cầu tài nguyên tĩnh
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {
            // Kiểm tra kết quả hợp lệ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              // Nếu là 404, trả về trang 404.html
              if (response && response.status === 404) {
                return caches.match(NOT_FOUND_URL);
              }
              return response;
            }

            // Cache tài nguyên mới 
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                // Không cache API requests
                if (!event.request.url.includes('/api/')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(error => {
            console.log('[ServiceWorker] Lỗi fetch:', error);
            
            // Xử lý lỗi cho các yêu cầu hình ảnh
            if (event.request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
                '<rect width="200" height="200" fill="#f0f0f0"/>' +
                '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16">Hình ảnh không tải được</text>' +
                '</svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            // Trả về trang offline cho các yêu cầu khác
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Sự kiện push notification
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Đã nhận push');
  
  const title = 'Vehicle Management';
  const options = {
    body: event.data ? event.data.text() : 'Có thông báo mới',
    icon: '/logo192.png',
    badge: '/logo192.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Xử lý khi click vào notification
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification đã được click');
  
  event.notification.close();
  
  event.waitUntil(
    self.clients.openWindow('/')
  );
}); 