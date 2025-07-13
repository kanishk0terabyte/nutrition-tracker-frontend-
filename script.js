// Set your backend API URL  
const API_URL = 'https://nutrition-tracker-backend-bxb5.onrender.com/api';

// -------------------- Register --------------------
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = registerForm[0].value;
    const email = registerForm[1].value;
    const password = registerForm[2].value;
    const confirm = registerForm[3].value;

    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("Registered successfully!");
        window.location.href = "pantry.html";
      } else {
        alert(data.message || "Registration failed!");
      }
    } catch (err) {
      alert("Server error!");
      console.error(err);
    }
  });
}

// -------------------- Login --------------------
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginForm[0].value;
    const password = loginForm[1].value;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        window.location.href = "pantry.html";
      } else {
        alert(data.message || "Login failed!");
      }
    } catch (err) {
      alert("Server error!");
      console.error(err);
    }
  });
}

// -------------------- Pantry --------------------
const token = localStorage.getItem("token");
if (window.location.pathname.includes("pantry.html") && !token) {
  window.location.href = "login.html";
}

const addForm = document.getElementById("addIngredientForm");
const pantryList = document.getElementById("pantryList");

function renderPantry() {
  if (!pantryList) return;
  pantryList.innerHTML = "";
  const pantry = JSON.parse(localStorage.getItem("pantry")) || [];

  pantry.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${item.ingredient} - ${item.quantity} <button class='delete-btn' data-index='${index}'>❌</button>`;
    pantryList.appendChild(li);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      const pantry = JSON.parse(localStorage.getItem("pantry")) || [];
      pantry.splice(index, 1);
      localStorage.setItem("pantry", JSON.stringify(pantry));
      renderPantry();
    });
  });
}

if (addForm) {
  renderPantry();
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const ingredient = document.getElementById("ingredient").value;
    const quantity = document.getElementById("quantity").value;

    const pantry = JSON.parse(localStorage.getItem("pantry")) || [];
    pantry.push({ ingredient, quantity });
    localStorage.setItem("pantry", JSON.stringify(pantry));

    addForm.reset();
    renderPantry();
  });
}

// -------------------- Logout --------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pantry");
    alert("Logged out!");
    window.location.href = "login.html";
  });
}

// -------------------- Go to Recipes --------------------
const submitBtn = document.getElementById("submitBtn");
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    window.location.href = "recipes.html";
  });
}

// -------------------- Recipes --------------------
const recipeResults = document.getElementById("recipeResults");
if (recipeResults) {
  const pantry = JSON.parse(localStorage.getItem("pantry")) || [];
  const ingredients = pantry.map(item => item.ingredient).join(",");

  fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=10&ranking=1&ignorePantry=true&apiKey=fbef567962a54a2faf62c8b6ff833370`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        recipeResults.innerHTML = "<p>No recipes found. Try adding more ingredients.</p>";
        return;
      }

      recipeResults.innerHTML = "<div class='recipe-list'>" +
        data.map((recipe, index) => `
          <div class='recipe-card' onclick="window.location.href='recipe-detail.html?id=${recipe.id}'">
            <strong>${index + 1}. ${recipe.title}</strong>
            <img src="${recipe.image}" alt="${recipe.title}"/>
          </div>
        `).join("") + "</div>";
    })
    .catch(err => {
      console.error("API Error:", err);
      recipeResults.innerHTML = "<p>Failed to fetch recipes. Please try again.</p>";
    });
}

// -------------------- Recipe Details Page --------------------
const recipeDetailDiv = document.getElementById("recipeDetail");

if (recipeDetailDiv) {
  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get("id");

  if (!recipeId) {
    recipeDetailDiv.innerHTML = "<p>Invalid recipe ID.</p>";
  } else {
    fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=fbef567962a54a2faf62c8b6ff833370`)
      .then((res) => res.json())
      .then((data) => {
        recipeDetailDiv.innerHTML = `
          <div class="recipe-detail-card">
            <h2>${data.title}</h2>
            <img src="${data.image}" alt="${data.title}" />
            <p><strong>⏱ Ready in:</strong> ${data.readyInMinutes} minutes</p>
            <p><strong>🍽 Servings:</strong> ${data.servings}</p>

            <h3>🧂 Ingredients:</h3>
            <ul>
              ${data.extendedIngredients.map((ing) => `<li>${ing.original}</li>`).join("")}
            </ul>

            <h3>👨‍🍳 Instructions:</h3>
            <p>${data.instructions || "No instructions provided."}</p>

            <button onclick="window.history.back()" class="back-btn">⬅ Back to Recipes</button>
          </div>
        `;
      })
      .catch((err) => {
        console.error("Error fetching recipe:", err);
        recipeDetailDiv.innerHTML = "<p>Failed to load recipe.</p>";
      });
  }
}
