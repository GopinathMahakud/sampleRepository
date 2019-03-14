const cacheName = 'news-v1';
var db;
const staticAssets = [
  './',
  './app.js',
  './styles.css',
  './fallback.json',
  './images/fetch-dog.jpg'
];

self.addEventListener('install', async function () {
  const cache = await caches.open(cacheName);
  cache.addAll(staticAssets);
});

self.addEventListener('activate', event => {
  event.waitUntil(createDB());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
 try{
  const networkResponse =  fetch(request);
  event.respondWith(networkResponse);
 }catch(err){

 }
 
  
});




function createDB() {
 let openRequest= indexedDB.open('news-db', 1);

 openRequest.onupgradeneeded = function(e) {
  var db = e.target.result;
  console.log('running onupgradeneeded');
  if (!db.objectStoreNames.contains('news')) {
    var storeOS = db.createObjectStore('news');
  }
};
openRequest.onsuccess = function(e) {
  console.log('running onsuccess');
  db = e.target.result;
};
openRequest.onerror = function(e) {
  console.log('onerror!');
  console.dir(e);
};
}

function readDB(url) {
    var tx = db.transaction(['news'], 'readonly');
    var store = tx.objectStore('news');
    return store.get(url);
 
}
function addDB(res,request) {
  console.log('adddb!');
    var tx = db.transaction(['news'], 'readwrite');
    var store = tx.objectStore('news');
    return store.add(res,request.url);
  
}