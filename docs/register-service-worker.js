if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('https://whitetigle.github.io/fable-pwa/service-worker.js')
    .then(function() {
        console.info('service worker succesfully registered');
    }).catch(function(e) {
        console.error(e, 'service worker registration failed');
    });
}
