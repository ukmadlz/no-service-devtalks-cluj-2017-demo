(function () {
  "use strict";

  var cacheNameStatic = 'no-service-v1';

  var currentCacheNames = [ cacheNameStatic ];

  var cachedUrls = [
    // 3rd party CDN
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.2/css/materialize.min.css',
    'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/marked/0.3.6/marked.min.js',
    'https://code.jquery.com/jquery-2.1.1.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.2/js/materialize.min.js',
    'https://cdn.jsdelivr.net/pouchdb/6.2.0/pouchdb.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.2/fonts/roboto/Roboto-Regular.woff2',
    'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0',
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.98.2/fonts/roboto/Roboto-Light.woff2',
    'app.js'
  ];

  // A new ServiceWorker has been registered
  self.addEventListener("install", function (event) {
    console.log('Installing Service Worker');
    event.waitUntil(
      caches.delete(cacheNameStatic).then(function() {
        console.log('Delete cache: %s', cacheNameStatic);
        return caches.open(cacheNameStatic);
      }).then(function (cache) {
        console.log('Cache: %s', cachedUrls);
        return cache.addAll(cachedUrls);
      }).catch(function(e) {
      })
    );
  });

  // A new ServiceWorker is now active
  self.addEventListener("activate", function (event) {
    event.waitUntil(
      caches.keys()
        .then(function (cacheNames) {
          return Promise.all(
            cacheNames.map(function (cacheName) {
              if (currentCacheNames.indexOf(cacheName) === -1) {
                return caches.delete(cacheName);
              }
            })
          );
        })
    );
  });

  // Save thing to cache in process of use
  self.addEventListener("fetch", function (event) {
    console.log('Fetch item');
    event.respondWith(
      caches.open(cacheNameStatic).then(function(cache) {
        return cache.match(event.request.url).then(function(response) {
          var fetchPromise = fetch(event.request).then(function(networkResponse) {
            cache.put(event.request.url, networkResponse.clone());
            return networkResponse;
          })
          if(response) {
            console.log('Use Cache Version: %s', event.request.url);
          } else {
            console.log('Use Network Version: %s', event.request.url);
          }
          return response || fetchPromise;
        })
      })
    );
  });

})();
