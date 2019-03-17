const apiKey = '2e54b529c7b84dd695baedfefa0f49fc';
const defaultSource = 'the-washington-post';
const sourceSelector = document.querySelector('#sources');
const newsArticles = document.querySelector('main');
var db;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('sw.js')
      .then(registration => console.log('Service Worker registered'))
      .catch(err => 'SW registration failed'));
}

window.addEventListener('load', e => {
  createDB();
  sourceSelector.addEventListener('change', evt => updateNews(evt.target.value));
  updateNewsSources().then(() => {
    sourceSelector.value = defaultSource;
    updateNews();
  });
});

window.addEventListener('online', () => updateNews(sourceSelector.value));

async function updateNewsSources() {
  const response = await fetch(`https://newsapi.org/v2/sources?apiKey=${apiKey}`);
  const json = await response.json();

  addDB(json,`https://newsapi.org/v2/sources?apiKey=${apiKey}`);
  sourceSelector.innerHTML =
    json.sources
      .map(source => `<option value="${source.id}">${source.name}</option>`)
      .join('\n');
}

async function updateNews(source = defaultSource) {
  newsArticles.innerHTML = '';
  var json;
  var url=`https://newsapik.org/v2/top-headlines?sources=${source}&sortBy=top&apiKey=${apiKey}`;
  try{
    const response = await fetch(url);
     json = await response.json();
     if(json.articles[0].title==='Dog fails to fetch articles, finds ball'){
      json = await readDB(source) ;
      console.log('read db value!');
     }
    addDB(json,source);
  }catch(err){
     json = await readDB(source) ;
     console.log('read db value!');
  }
  newsArticles.innerHTML =
    json.articles.map(createArticle).join('\n');
}

function createArticle(article) {
  return `
    <div class="article">
      <a href="${article.url}">
        <h2>${article.title}</h2>
        <img src="${article.urlToImage}" alt="${article.title}">
        <p>${article.description}</p>
      </a>
    </div>
  `;
}

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
 
 function readDB(source) {
     var tx = db.transaction(['news'], 'readonly');
     var store = tx.objectStore('news');
     //return store.get(source);

     var cursorRequest = store.openCursor();
 
     cursorRequest.onerror = function(error) {
         console.log(error);
     };
    var cValue;
     cursorRequest.onsuccess = function(evt) {                    
         var cursor = evt.target.result;
         if (cursor.key==source) {
          cValue=cursor.value;
             cursor.continue();
         }
     };
   return cValue;
 }
 function addDB(res,source) {
   console.log('adddb!');
     var tx = db.transaction(['news'], 'readwrite');
     var store = tx.objectStore('news');
     return store.add(res,source);
   
 }