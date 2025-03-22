// Tên cache
const CACHE_NAME = 'vehicle-management-cache-v1';
const OFFLINE_URL = '/offline.html';

// Danh sách tài nguyên cần cache
const urlsToCache = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/static/js/main.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/404.html'
];

// Sự kiện install - cài đặt service worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Force service worker để activate ngay lập tức
  self.skipWaiting();
});

// Sự kiện activate - khi service worker được kích hoạt
self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Xóa các cache cũ
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Đảm bảo service worker kiểm soát tất cả các tab/windows
  self.clients.claim();
});

// Sự kiện fetch - xử lý request
self.addEventListener('fetch', function(event) {
  // Không xử lý các request không phải HTTP
  if (!event.request.url.startsWith('http')) return;
  
  // Không cache API requests
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase.co')) {
    return;
  }

  // Xử lý requests cho trang chủ/đường dẫn chính
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(function() {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Trả về response từ cache nếu có
        if (response) {
          return response;
        }

        // Clone request vì nó là stream và chỉ có thể sử dụng một lần
        const fetchRequest = event.request.clone();

        // Thực hiện network request
        return fetch(fetchRequest)
          .then(function(response) {
            // Kiểm tra nếu response hợp lệ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response vì nó cũng là stream
            const responseToCache = response.clone();
            
            // Thêm vào cache
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(function(error) {
            // Nếu là request cho image, trả về placeholder
            if (event.request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
                '<rect width="200" height="200" fill="#f0f0f0"/>' +
                '<text x="50%" y="50%" font-family="sans-serif" font-size="24" text-anchor="middle" fill="#999">Image</text>' +
                '</svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            // Nếu đang tìm kiếm trang, trả về trang offline
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // Các trường hợp khác trả về lỗi
            throw error;
          });
      })
  );
});

// Xử lý thông báo push
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Có thông báo mới',
      icon: '/logo192.png',
      badge: '/favicon.ico',
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Thông báo', options)
    );
  } catch (error) {
    console.error('Lỗi khi xử lý thông báo push:', error);
  }
});

// Khi người dùng click vào thông báo
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({type: 'window'})
      .then(function(clientList) {
        // Tìm window đang mở
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        // Mở window mới nếu không tìm thấy
        if (self.clients.openWindow) {
          return self.clients.openWindow(event.notification.data.url);
        }
      })
  );
}); 