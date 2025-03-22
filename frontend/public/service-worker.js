/* eslint-disable no-restricted-globals */

// Tên cache và URL
const CACHE_NAME = 'vehicle-management-cache-v3';
const OFFLINE_URL = '/offline.html';
const NOT_FOUND_URL = '/404.html';
const DEBUG_URL = '/debug.html';

// Danh sách tài nguyên chính cần cache ngay khi cài đặt
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  OFFLINE_URL,
  NOT_FOUND_URL,
  DEBUG_URL,
  '/debug-vercel.html'
];

// Thời gian cache mặc định cho tài nguyên tĩnh (24 giờ)
const DEFAULT_CACHE_TIME = 24 * 60 * 60 * 1000;

// Biến theo dõi số lỗi message port
let messagePortErrorCount = 0;
const MAX_MESSAGE_PORT_ERRORS = 5;

// Log lỗi một cách an toàn
function logError(error, source) {
  let errorMessage;
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = `${error.name}: ${error.message}`;
  } else {
    try {
      errorMessage = JSON.stringify(error);
    } catch (e) {
      errorMessage = 'Không thể ghi log lỗi không rõ loại';
    }
  }
  
  console.error(`[SW:${source || 'error'}] ${errorMessage}`);
}

// Hàm kiểm tra nếu là lỗi message port
function isMessagePortError(error) {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  return errorMessage.includes('message port closed') || 
         errorMessage.includes('port closed') ||
         errorMessage.includes('extension context invalidated');
}

// Khi service worker được cài đặt
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Đang cài đặt');
  
  // Kích hoạt ngay lập tức không đợi làm mới trang
  self.skipWaiting();
  
  // Cache tài nguyên cần thiết
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Đang cache tài nguyên');
        return cache.addAll(CACHE_ASSETS);
      })
      .catch(error => {
        logError(error, 'install');
        // Vẫn tiếp tục cài đặt ngay cả khi cache thất bại
      })
  );
});

// Khi service worker được kích hoạt
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Đã kích hoạt');
  
  // Xóa cache cũ
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('vehicle-management-cache') && 
                 cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('[ServiceWorker] Xóa cache cũ:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
    .then(() => {
      console.log('[ServiceWorker] Claim clients');
      return self.clients.claim();
    })
    .catch(error => {
      logError(error, 'activate');
    })
  );
});

// Xử lý fetch request
self.addEventListener('fetch', (event) => {
  try {
    // Bỏ qua URLs từ bên thứ 3
    if (!event.request.url.startsWith(self.location.origin)) {
      return;
    }

    // Bỏ qua yêu cầu không phải GET
    if (event.request.method !== 'GET') {
      return;
    }
    
    // Phân tích URL để xác định loại tài nguyên
    const url = new URL(event.request.url);
    const pathname = url.pathname;
    
    // Xử lý đặc biệt cho trang debug
    if (pathname.endsWith('/debug.html') || pathname.endsWith('/debug-vercel.html')) {
      event.respondWith(
        fetch(event.request)
          .catch(() => caches.match(event.request)
            .then(cachedResponse => cachedResponse || caches.match(OFFLINE_URL)))
      );
      return;
    }

    // Xử lý riêng cho yêu cầu trang (navigate)
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request)
          .then(response => {
            // Nếu là 404, trả về trang 404.html
            if (response.status === 404) {
              return caches.match(NOT_FOUND_URL);
            }
            return response;
          })
          .catch(error => {
            // Xử lý lỗi message port
            if (isMessagePortError(error)) {
              messagePortErrorCount++;
              console.log(`[SW] Message port error #${messagePortErrorCount}`);
              
              // Nếu số lượng lỗi message port vượt ngưỡng, tự reload SW
              if (messagePortErrorCount >= MAX_MESSAGE_PORT_ERRORS) {
                console.log('[SW] Quá nhiều lỗi message port, tự làm mới');
                self.registration.update();
                messagePortErrorCount = 0;
              }
            }
            
            // Trả về trang offline nếu là navigation request
            return caches.match(OFFLINE_URL)
              .then(response => {
                if (response) return response;
                
                // Trường hợp hiếm gặp: không tìm thấy offline.html trong cache
                const offlineResponse = new Response(
                  '<html><body><h1>Không có kết nối</h1><p>Vui lòng kiểm tra mạng.</p></body></html>',
                  { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
                );
                return offlineResponse;
              });
          })
      );
      return;
    }

    // Chiến lược cache-first cho tài nguyên tĩnh
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Nếu có trong cache và là tài nguyên thông thường, trả về từ cache
          if (cachedResponse) {
            return cachedResponse;
          }

          // Nếu không có trong cache, fetch từ network
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

              // Clone response để cache
              const responseToCache = response.clone();
              
              // Cache tài nguyên mới không phải API
              if (!pathname.includes('/api/')) {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseToCache))
                  .catch(error => logError(error, 'cache-put'));
              }

              return response;
            })
            .catch(error => {
              logError(error, 'fetch');
              
              // Xử lý lỗi cho hình ảnh, CSS và script
              const extension = pathname.split('.').pop().toLowerCase();
              
              if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
                // Trả về placeholder cho hình ảnh
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
                  '<rect width="200" height="200" fill="#f0f0f0"/>' +
                  '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16">Hình ảnh không tải được</text>' +
                  '</svg>',
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                );
              } else if (['css'].includes(extension)) {
                // Trả về CSS trống cho stylesheet
                return new Response(
                  '/* Fallback CSS */',
                  { headers: { 'Content-Type': 'text/css' } }
                );
              } else if (['js'].includes(extension)) {
                // Trả về JS không làm gì cho script
                return new Response(
                  '// Fallback JS',
                  { headers: { 'Content-Type': 'application/javascript' } }
                );
              }
              
              // Kiểm tra nếu yêu cầu là JSON API
              if (pathname.includes('/api/') || 
                  event.request.headers.get('Accept')?.includes('application/json')) {
                return new Response(
                  JSON.stringify({ error: 'Không có kết nối internet', offline: true }),
                  { headers: { 'Content-Type': 'application/json' } }
                );
              }
              
              // Cho các tài nguyên khác, trả về response báo lỗi
              return new Response(
                'Không thể tải tài nguyên. Vui lòng kiểm tra kết nối mạng.',
                { headers: { 'Content-Type': 'text/plain' } }
              );
            });
        })
    );
  } catch (error) {
    // Bắt và xử lý các lỗi không mong muốn
    logError(error, 'fetch-handler');
    
    // Trả về response mặc định trong trường hợp lỗi nghiêm trọng
    event.respondWith(
      caches.match(OFFLINE_URL)
        .then(response => response || fetch(event.request))
        .catch(() => new Response('Lỗi không xác định', { 
          status: 500, 
          headers: { 'Content-Type': 'text/plain' } 
        }))
    );
  }
});

// Xử lý khi nhận push notification
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Đã nhận push');
  
  try {
    const title = 'Vehicle Management';
    let message = 'Có thông báo mới';
    
    if (event.data) {
      try {
        const data = event.data.json();
        if (data.title) title = data.title;
        if (data.message) message = data.message;
      } catch (e) {
        message = event.data.text();
      }
    }
    
    const options = {
      body: message,
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: {
        url: '/',
        time: new Date().getTime()
      }
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    logError(error, 'push');
  }
});

// Xử lý khi click vào notification
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification đã được click');
  
  event.notification.close();
  
  // Xác định URL để mở
  let url = '/';
  if (event.notification.data && event.notification.data.url) {
    url = event.notification.data.url;
  }
  
  event.waitUntil(
    self.clients.matchAll({type: 'window'})
      .then(windowClients => {
        // Kiểm tra xem có cửa sổ đang mở không
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Mở cửa sổ mới nếu không tìm thấy
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
      .catch(error => logError(error, 'notificationclick'))
  );
});

// Kiểm tra kết nối mạng định kỳ
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_CONNECTIVITY') {
    fetch('/api/connectivity-check', { method: 'HEAD' })
      .then(() => {
        // Nếu thành công, báo lại cho client
        if (event.source) {
          event.source.postMessage({
            type: 'CONNECTIVITY_RESULT',
            status: 'online'
          });
        }
      })
      .catch(() => {
        // Nếu lỗi, báo lại cho client
        if (event.source) {
          event.source.postMessage({
            type: 'CONNECTIVITY_RESULT',
            status: 'offline'
          });
        }
      });
  }
}); 