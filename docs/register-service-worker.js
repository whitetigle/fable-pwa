//   This is not used since we register the service worker directly from bundle.js (check App.fs)

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('https://whitetigle.github.io/fable-pwa/service-worker.js')        
    .then(function() {
        console.info('service worker succesfully registered');
    }).catch(function(e) {
        console.error(e, 'service worker registration failed');
    });
}
