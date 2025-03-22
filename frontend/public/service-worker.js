/* eslint-disable no-restricted-globals */

// Tên cache và URL
const CACHE_NAME = 'vehicle-management-cache-v4';
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
let lastRefreshTime = 0;

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
  
  const errorStr = error.toString();
  return errorStr.includes('message port closed') || 
         errorStr.includes('The message port closed before a response was received');
}

// Xử lý khi gặp lỗi message port
function handleMessagePortError() {
  messagePortErrorCount++;
  
  // Nếu gặp quá nhiều lỗi message port trong thời gian ngắn
  const now = Date.now();
  if (messagePortErrorCount >= MAX_MESSAGE_PORT_ERRORS && (now - lastRefreshTime > 60000)) {
    lastRefreshTime = now;
    messagePortErrorCount = 0;
    
    // Thử unregister và register lại service worker
    self.registration.unregister()
      .then(() => {
        logError('Service worker đã được gỡ bỏ và sẽ được đăng ký lại sau', 'refresh');
        return self.clients.matchAll();
      })
      .then(clients => {
        clients.forEach(client => {
          if (client.url && client.type === 'window') {
            client.postMessage({
              type: 'REFRESH_SERVICE_WORKER',
              timestamp: Date.now()
            });
          }
        });
      })
      .catch(err => {
        logError(err, 'refresh-failed');
      });
  }
}

// Sự kiện cài đặt Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Đang cache tài nguyên ban đầu');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        logError(error, 'install');
      })
  );
});

// Sự kiện kích hoạt Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName.startsWith('vehicle-management-cache-') && 
                   cacheName !== CACHE_NAME;
          }).map(cacheName => {
            console.log('[SW] Xóa cache cũ:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker đã được kích hoạt!');
        return self.clients.claim();
      })
      .catch(error => {
        logError(error, 'activate');
      })
  );
});

// Sự kiện fetch
self.addEventListener('fetch', event => {
  // Bỏ qua các yêu cầu không phải HTTP/HTTPS
  if (!event.request.url.startsWith('http')) return;
  
  // Xử lý các yêu cầu API riêng biệt
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase.co') ||
      event.request.url.includes('/rest/v1/')) {
    // Không cache các yêu cầu API
    return;
  }
  
  // Chiến lược cache trước, sau đó mạng cho các tài nguyên tĩnh
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Trả về từ cache nếu có
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Không tìm thấy trong cache, tiếp tục tải từ mạng
        return fetch(event.request)
          .then(response => {
            // Kiểm tra nếu nhận được phản hồi hợp lệ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              // Nếu là lỗi 404, trả về trang 404 từ cache
              if (response.status === 404) {
                return caches.match(NOT_FOUND_URL);
              }
              return response;
            }
            
            // Cache lại phản hồi mới
            const responseToCache = response.clone();
            
            // Chỉ cache các tài nguyên tĩnh phổ biến
            if (shouldCache(event.request.url)) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                })
                .catch(err => {
                  logError(err, 'cache-put');
                });
            }
            
            return response;
          })
          .catch(error => {
            // Nếu lỗi message port, xử lý đặc biệt
            if (isMessagePortError(error)) {
              handleMessagePortError();
              return new Response(
                JSON.stringify({ error: 'Lỗi kết nối tạm thời. Vui lòng thử lại.' }),
                { 
                  status: 503, 
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            
            // Nếu lỗi mạng, trả về trang offline
            console.log('[SW] Lỗi fetch, trả về trang offline', error);
            return caches.match(OFFLINE_URL);
          });
      })
  );
});

// Kiểm tra xem URL có nên được cache hay không
function shouldCache(url) {
  // Cache các tệp tĩnh như images, css, js, và fonts
  return url.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)(\?.*)?$/) ||
         url.endsWith('/') || 
         url.endsWith('.html');
}

// Lắng nghe tin nhắn từ trang
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Đặt lại bộ đếm lỗi message port
  if (event.data && event.data.type === 'RESET_ERROR_COUNTER') {
    messagePortErrorCount = 0;
    console.log('[SW] Đã đặt lại bộ đếm lỗi');
  }
});

// Xử lý lỗi không lường trước
self.addEventListener('error', event => {
  logError(event.error || event.message, 'global-error');
  
  // Nếu là lỗi message port
  if (isMessagePortError(event.error || event.message)) {
    handleMessagePortError();
  }
});

// Xử lý promise rejection không được bắt
self.addEventListener('unhandledrejection', event => {
  logError(event.reason, 'unhandled-rejection');
  
  // Nếu là lỗi message port
  if (isMessagePortError(event.reason)) {
    handleMessagePortError();
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