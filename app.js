 // Custom Http Module
 function customHttp() {
   return {
     get(url, cb) {
       try {
         const xhr = new XMLHttpRequest();
         xhr.open('GET', url);
         xhr.addEventListener('load', () => {
           if (Math.floor(xhr.status / 100) !== 2) {
             cb(`Error. Status code: ${xhr.status}`, xhr);
             return;
           }
           const response = JSON.parse(xhr.responseText);
           cb(null, response);
         });

         xhr.addEventListener('error', () => {
           cb(`Error. Status code: ${xhr.status}`, xhr);
         });

         xhr.send();
       } catch (error) {
         cb(error);
       }
     },
     post(url, body, headers, cb) {
       try {
         const xhr = new XMLHttpRequest();
         xhr.open('POST', url);
         xhr.addEventListener('load', () => {
           if (Math.floor(xhr.status / 100) !== 2) {
             cb(`Error. Status code: ${xhr.status}`, xhr);
             return;
           }
           const response = JSON.parse(xhr.responseText);
           cb(null, response);
         });

         xhr.addEventListener('error', () => {
           cb(`Error. Status code: ${xhr.status}`, xhr);
         });

         if (headers) {
           Object.entries(headers).forEach(([key, value]) => {
             xhr.setRequestHeader(key, value);
           });
         }

         xhr.send(JSON.stringify(body));
       } catch (error) {
         cb(error);
       }
     },
   };
 }
 // Init http module
 const http = customHttp();

 const newsService = (() => {
   const apiKey = 'e6997ee34e694849937232ec11161de7';
   const apiUrl = 'https://news-api-v2.herokuapp.com';

   return {
     topHeadlines(country = 'cz', cb) {
       http.get(`${apiUrl}/top-headlines?country=${country}&apiKey=${apiKey}`, cb);
     },
     topCategory(country = 'cz', cb, category) {
       http.get(`${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`, cb);
     },
     everything(query, cb) {
       http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
     }
   }
 })();

 //  init selects
 document.addEventListener('DOMContentLoaded', function () {
   M.AutoInit();
   loadNews();
 });

 const form = document.querySelector('form');
 const input__country = form.elements['country'];
 const input__word = form.elements['search'];
 const input__category = form.elements['category'];

 //listen Form
 form.addEventListener('submit', (e) => {
   e.preventDefault();
   loadNews();
   input__word.value = '';
 });


 //listen input Country
 input__country.addEventListener('change', (e) => {
   hideInput(e.target.value);
   hideInputCat(input__category.value)
 })

 //listen input Category
 input__category.addEventListener('change', (e) => {
   hideInputCat(e.target.value);
 });

 //hide Input
 function hideInput(input) {
   if (input === 'cz') {
     document.querySelector('.search__input').style.display = 'none';
   } else {
     document.querySelector('.search__input').style.display = 'block';
   }
 }

 //hide Input Cat
 function hideInputCat(input) {
   if (input != '') {
     document.querySelector('.search__input').style.display = 'none';
   } else {
     document.querySelector('.search__input').style.display = 'block';
   }
 }

 //Reset Form
 function reseteForm() {
   form.reset();
 }
 reseteForm();
 hideInput(input__country.value);

 //Load News function
 function loadNews() {
   showLoader();
   if (input__category.value) {
     newsService.topCategory(input__country.value, onGetResponse, input__category.value);
   } else if (!input__word.value) {
     newsService.topHeadlines(input__country.value, onGetResponse);
   } else {
     newsService.everything(input__word.value, onGetResponse);
   }
 }

 //function on get response from server callback
 function onGetResponse(err, res) {
   removePreLoader();
   if (err) {
     showAlert(err, 'error-msg');
     return;
   }
   renderNews(res.articles);
   if (!res.articles.length) {
     showAlert('nothing was found');
     return;
   }
 }

 // Function clear container News
 function clearContainer(conatiner) {
   conatiner.innerHTML = '';
 }

 //show res Error
 function showAlert(msg, type = 'success') {
   M.toast({
     html: msg,
     classes: type
   })
 }

 //Function render News
 function renderNews(news) {
   const newsContainer = document.querySelector('.news-container .row');
   if (newsContainer.children.length) {
     clearContainer(newsContainer);
   }
   let fragment = '';
   news.forEach((e) => {
     const el = newsTemplate(e);
     fragment += el
   });
   newsContainer.insertAdjacentHTML('afterbegin', fragment)
 }

 //Loader
 function showLoader() {
   document.body.insertAdjacentHTML('afterend', `
   <div class="progress">
      <div class="indeterminate"></div>
  </div>
   `)
 }

 //remove Loader
 function removePreLoader() {
   const loader = document.querySelector('.progress');
   if (loader) {
     loader.remove();
   }
 }

 //News Item template fucntion
 function newsTemplate({
   urlToImage = 'https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png',
   title,
   url,
   description
 }) {
   return `
  <div class="col s12">
    <div class="card">
      <div class="card-image">
        <img src="${urlToImage || ''}">
        <span class="card-title">${title || ''}</span>
      </div>
      <div class="card-content">
        <p>${description || ''}</p>
      </div>
      <div class="card-action">
        <a href="${url}" target="_blank">Read more</a>
      </div>
    </div>
  </div>
  `;
 }