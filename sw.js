const CACHE = 'farmacia-v1';

const ARCHIVOS = [
    './',
    'index.html',
    'style.css',
    'app.js',
    'manifest.json',
    'img1.jpg',
    'img2.jpg',    
];

self.addEventListener( 'install', ( e ) => {
    e.waitUntil(
        caches.open( CACHE )
            .then( c => c.addAll( ARCHIVOS ) )
            .catch( err => console.log( err ) )
        );
    self.skipWaiting();
});

self.addEventListener( 'activate', ( e ) => {
    e.waitUntil(
        caches.keys()
            .then( keys => Promise.all( keys.filter( k => k !== CACHE).map( k => caches.delete( k ) ) ) )
            .then( () => self.clients.claim() )
    );
});

self.addEventListener( 'fetch', ( e ) => {
    if( e.request.method !== 'GET' ) {
        return;
    }
    e.respondWith(
        caches.match( e.request )
            .then( cacheado => cacheado || fetch( e.request )
                .then(res =>{
                    const copia = res.clone();
                    caches.open( CACHE )
                        .then( c => c.put( e.request, copia ) );
                    return res;
                }).catch(()=> caches.match('index.html')) )
    );
});
