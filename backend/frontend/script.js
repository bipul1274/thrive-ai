document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const hubBtn = document.getElementById('btn-hub');
    const feedBtn = document.getElementById('btn-feed');
    const hubContent = document.getElementById('hub-content');
    const feedContent = document.getElementById('feed-content');
    const recipeForm = document.getElementById('recipe-form');
    const recipeResultDiv = document.getElementById('recipe-result');
    const feedContainer = document.getElementById('feed-container');

    const API_BASE_URL = 'http://127.0.0.1:5001';

    // --- Tab Navigation ---
    hubBtn.addEventListener('click', () => {
        hubBtn.classList.add('active');
        feedBtn.classList.remove('active');
        hubContent.classList.add('active');
        feedContent.classList.remove('active');
    });

    feedBtn.addEventListener('click', () => {
        feedBtn.classList.add('active');
        hubBtn.classList.remove('active');
        feedContent.classList.add('active');
        hubContent.classList.remove('active');
        loadFeed(); // Load feed when tab is clicked
    });

    // --- AI Hub Logic ---
    recipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        recipeResultDiv.innerHTML = `<p class="loading">🤖 AI is thinking... please wait.</p>`;

        const formData = {
            goal: document.getElementById('goal').value,
            restrictions: document.getElementById('restrictions').value
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/generate-recipe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const recipe = await response.json();
            displayRecipe(recipe);
        } catch (error) {
            console.error("Failed to fetch recipe:", error);
            recipeResultDiv.innerHTML = `<p class="error">Sorry, something went wrong. Please try again.</p>`;
        }
    });

    function displayRecipe(recipe) {
        const ingredientsList = recipe.ingredients.map(item => `<li>${item}</li>`).join('');
        const instructionsList = recipe.instructions.map(item => `<li>${item}</li>`).join('');

        recipeResultDiv.innerHTML = `
            <div class="recipe-card">
                <h3>${recipe.recipeName}</h3>
                <p>${recipe.description}</p>
                <h4>Macros</h4>
                <div class="macros-grid">
                    <div class="macro-item"><span>${recipe.macros.calories}</span>Calories</div>
                    <div class="macro-item"><span>${recipe.macros.protein}</span>Protein</div>
                    <div class="macro-item"><span>${recipe.macros.carbs}</span>Carbs</div>
                    <div class="macro-item"><span>${recipe.macros.fat}</span>Fat</div>
                </div>
                <h4>Ingredients</h4>
                <ul>${ingredientsList}</ul>
                <h4>Instructions</h4>
                <ol>${instructionsList}</ol>
            </div>
        `;
    }

    // --- The Feed Logic ---
    async function loadFeed() {
        feedContainer.innerHTML = `<p class="loading">Loading community feed...</p>`;
        try {
            const response = await fetch(`${API_BASE_URL}/api/feed`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const posts = await response.json();
            displayFeed(posts);
        } catch (error) {
            console.error("Failed to fetch feed:", error);
            feedContainer.innerHTML = `<p class="error">Could not load the feed. Please try again later.</p>`;
        }
    }

    function displayFeed(posts) {
        if (posts.length === 0) {
            feedContainer.innerHTML = `<p>The feed is empty. Be the first to post!</p>`;
            return;
        }

        feedContainer.innerHTML = ''; // Clear loading message
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'feed-post';
            postElement.innerHTML = `
                <div class="post-header">
                    <img src="${post.user_avatar}" alt="${post.username}'s avatar">
                    <span>${post.username}</span>
                </div>
                <div class="post-body">
                    <p>${post.content}</p>
                    ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
                </div>
                <div class="post-footer">
                    <span>❤️ ${post.likes} Likes</span>    <span>💬 ${post.comments} Comments</span>
                </div>
            `;
            feedContainer.appendChild(postElement);
        });
    }

    // Initial load for the default view
    // Since feed is not active by default, we can choose to load it on tab click
    // or load it in the background on page load. We'll stick to on-click for efficiency.
});
