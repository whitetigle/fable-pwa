// You can just toggle version names to force cache delete 
var CACHE_NAME = 'my-fable-app-cache-A';
//var CACHE_NAME = 'my-fable-app-cache-B';

var resourcesToCache = [
    '/fable-pwa/',
    '/fable-pwa/icons/android-icon-144x144.png',
    '/fable-pwa/icons/android-icon-192x192.png',
    '/fable-pwa/icons/android-icon-36x36.png',
    '/fable-pwa/icons/android-icon-48x48.png',
    '/fable-pwa/icons/android-icon-72x72.png',
    '/fable-pwa/icons/android-icon-96x96.png',
    '/fable-pwa/icons/apple-icon-114x114.png',
    '/fable-pwa/icons/apple-icon-120x120.png',
    '/fable-pwa/icons/apple-icon-144x144.png',
    '/fable-pwa/icons/apple-icon-152x152.png',
    '/fable-pwa/icons/apple-icon-180x180.png',
    '/fable-pwa/icons/apple-icon-57x57.png',
    '/fable-pwa/icons/apple-icon-60x60.png',
    '/fable-pwa/icons/apple-icon-72x72.png',
    '/fable-pwa/icons/apple-icon-76x76.png',
    '/fable-pwa/icons/apple-icon-precomposed.png',
    '/fable-pwa/icons/apple-icon.png',
    '/fable-pwa/icons/ms-icon-144x144.png',
    '/fable-pwa/icons/ms-icon-144x144.png',
    '/fable-pwa/icons/ms-icon-150x150.png',
    '/fable-pwa/icons/ms-icon-310x310.png',
    '/fable-pwa/icons/ms-icon-70x70.png',
    'https://cdn.polyfill.io/v2/polyfill.js?features=es6,fetch',
    '/fable-pwa/index.html',
    '/fable-pwa/bundle.js'
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
