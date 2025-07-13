// API Endpoints
const API_URL = 'https://nutrition-tracker-backend-bxb5.onrender.com/api';
const SPOON_URL = 'https://api.spoonacular.com/recipes';
const SPOON_KEY = 'fbef567962a54a2faf62c8b6ff833370';

let pantry = [];

// — Auth (login/register pages must call these on form submit) —
function registerUser(e) {
  e.preventDefault();
  const name = e.target.name.value.trim();
  const email = e.target.email.value.trim();
  const pass = e.target.password.value;
  fetch(`${API_URL}/register`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({name,email,password:pass})
  })
  .then(r=>r.json()).then(d=>{
    if(d.token){ localStorage.setItem('token',d.token); window.location='pantry.html'; }
    else alert(d.message||'Register failed');
  });
}

function loginUser(e) {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const pass = e.target.password.value;
  fetch(`${API_URL}/login`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({email,password:pass})
  })
  .then(r=>r.json()).then(d=>{
    if(d.token){ localStorage.setItem('token',d.token); window.location='pantry.html'; }
    else alert(d.message||'Login failed');
  });
}

// — Logout button on all pages —
document.getElementById('logout')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location = 'login.html';
});

// — Pantry page functions —
function addIngredient(){
  const inp = document.getElementById('ingredientInput');
  const v = inp.value.trim();
  if(!v) return;
  pantry.push(v);
  localStorage.setItem('pantry',JSON.stringify(pantry));
  inp.value='';
  displayPantry();
}

function displayPantry(){
  const list = document.getElementById('pantryList');
  list.innerHTML = '';
  pantry.forEach((it,i)=>{
    const div = document.createElement('div');
    div.className='pantry-item';
    div.innerHTML = `${it} <button onclick="removeIngredient(${i})">x</button>`;
    list.appendChild(div);
  });
}

function removeIngredient(i){
  pantry.splice(i,1);
  localStorage.setItem('pantry',JSON.stringify(pantry));
  displayPantry();
}

function submitPantry(){
  if(pantry.length===0){ alert('Add ingredients first'); return; }
  window.location='recipes.html';
}

// — Recipes page —
function loadRecipes(){
  pantry = JSON.parse(localStorage.getItem('pantry'))||[];
  const ctr = document.getElementById('recipeContainer');
  if(!ctr) return;
  fetch(`${SPOON_URL}/findByIngredients?ingredients=${pantry.join(',')}&number=10&apiKey=${SPOON_KEY}`)
    .then(r=>r.json()).then(data=>{
      ctr.innerHTML='';
      data.forEach(r=>{
        const c = document.createElement('div');
        c.className='recipe-card';
        c.innerHTML = `<img src="${r.image}" alt="${r.title}"><h3>${r.title}</h3>`;
        c.onclick = ()=>{ 
          localStorage.setItem('selectedRecipeId',r.id);
          window.location='recipe-detail.html';
        };
        ctr.appendChild(c);
      });
    })
    .catch(e=>{ ctr.innerHTML='<p>Error loading recipes.</p>'; console.error(e); });
}

// — Recipe Detail page —
function loadRecipeDetails(){
  const id = localStorage.getItem('selectedRecipeId');
  const cont = document.getElementById('recipeDetails');
  if(!id||!cont) return;
  fetch(`${SPOON_URL}/${id}/information?apiKey=${SPOON_KEY}`)
    .then(r=>r.json()).then(d=>{
      cont.innerHTML=`
        <h2>${d.title}</h2>
        <img src="${d.image}" alt="${d.title}" class="detail-image"/>
        <p><strong>Ready in:</strong> ${d.readyInMinutes} minutes</p>
        <p><strong>Servings:</strong> ${d.servings}</p>
        <h3>Ingredients:</h3>
        <ul>${d.extendedIngredients.map(i=>`<li>${i.original}</li>`).join('')}</ul>
        <h3>Instructions:</h3>
        <p>${d.instructions||'No instructions.'}</p>
      `;
    })
    .catch(e=>{ cont.innerHTML='<p>Failed to load details.</p>'; console.error(e); });
}

// — Page init routing —
const page = window.location.pathname.split('/').pop();
const token = localStorage.getItem('token');
if(!['login.html','register.html'].includes(page) && !token) {
  window.location='login.html';
} else {
  if(page==='pantry.html'){
    pantry=JSON.parse(localStorage.getItem('pantry'))||[];
    displayPantry();
  }
  if(page==='recipes.html') loadRecipes();
  if(page==='recipe-detail.html') loadRecipeDetails();
  if(page==='login.html') document.querySelector('form')?.addEventListener('submit',loginUser);
  if(page==='register.html') document.querySelector('form')?.addEventListener('submit',registerUser);
}
