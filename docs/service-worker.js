var CACHE_NAME = 'my-fable-app-cache-0.1';

var resourcesToCache = [
    '/',
    'icons/android-icon-144x144.png',
    'icons/android-icon-192x192.png',
    'icons/android-icon-36x36.png',
    'icons/android-icon-48x48.png',
    'icons/android-icon-72x72.png',
    'icons/android-icon-96x96.png',
    'icons/apple-icon-114x114.png',
    'icons/apple-icon-120x120.png',
    'icons/apple-icon-144x144.png',
    'icons/apple-icon-152x152.png',
    'icons/apple-icon-180x180.png',
    'icons/apple-icon-57x57.png',
    'icons/apple-icon-60x60.png',
    'icons/apple-icon-72x72.png',
    'icons/apple-icon-76x76.png',
    'icons/apple-icon-precomposed.png',
    'icons/apple-icon.png',
    'icons/ms-icon-144x144.png',
    'icons/ms-icon-144x144.png',
    'icons/ms-icon-150x150.png',
    'icons/ms-icon-310x310.png',
    'icons/ms-icon-70x70.png',
    '/index.html',
    '/bundle.js'
];

self.addEventListener('install', function(event) {
    console.info('installing service worker');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.info('cache opened');
                return cache.addAll(resourcesToCache);
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys()//it will return all the keys in the cache as an array
      .then(function(keyList) {
              //run everything in parallel using Promise.all()
              Promise.all(keyList.map(function(key) {
                      if (key !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache ', key);
                        //if key doesn`t matches with present key
                        return caches.delete(key);
                      }
                  })
              );
          })
  );
});

self.addEventListener('fetch', function(event) {
    console.log("METHOD: "+ event.request.method +" and URL: "+ event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                console.log('request:', event.request);

                if (response) {
                    console.info('cache hit');
                    return response;
                } else {
                    console.info(event.request.url+" not found in cache fetching from network.");
                    //return promise that resolves to Response object
                    return fetch(event.request,{mode:"cors"});
                }
            })
    );
});
