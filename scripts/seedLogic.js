// Seed-based logic for games and generator pages

function getSeed() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('seed') || '';
}

function filterGamesBySeed(games, seed) {
    if (!seed) return games;
    return games.filter(game => game.title.toLowerCase().includes(seed.toLowerCase()));
}

function generateRandomGames(games, seed, count = 25) {
    const rng = seededRandom(seed);
    const shuffled = games.slice().sort(() => rng() - 0.5); // Shuffle using the seeded random function
    return shuffled.slice(0, Math.min(count, shuffled.length)); // Return up to 'count' games
}

// Simple seeded random number generator
function seededRandom(seed) {
    let m = 0x80000000; // 2^31
    let a = 1103515245;
    let c = 12345;
    let state = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % m;

    return function() {
        state = (a * state + c) % m;
        return state / m; // Returns a number between 0 and 1
    };
}

function fetchGames() {
    return fetch('games.xml')
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            return Array.from(data.getElementsByTagName('game')).map(game => ({
                title: game.getElementsByTagName('title')[0].textContent,
                link: game.getElementsByTagName('link')[0].textContent,
                description: game.getElementsByTagName('description')[0].textContent
            }));
        })
        .catch(error => {
            console.error('Error loading games:', error);
            throw error; // Rethrow the error for handling in the calling function
        });
}

function updateGamesList(gamesList, games, completedGames, clearCompleted = false) {
    gamesList.innerHTML = '';
    games.forEach(game => {
        const gameElement = document.createElement('div');
        gameElement.className = 'game-container';
        const gameId = game.title.toLowerCase().replace(/\s+/g, '-');
        
        // Create the HTML structure
        gameElement.innerHTML = `
            <label class="star-checkbox">
                <input type="checkbox" id="${gameId}" 
                    ${(!clearCompleted && completedGames[gameId]) ? 'checked' : ''}>
                <span class="star"></span>
            </label>
            <a href="${game.link}" target="_blank" rel="noopener noreferrer" class="game-item">
                <div class="game-content">
                    <h2 class="game-title">${game.title}</h2>
                    <p class="game-description">${game.description}</p>
                </div>
            </a>
        `;

        // Get elements for event handling
        const checkbox = gameElement.querySelector('input[type="checkbox"]');
        const gameLink = gameElement.querySelector('.game-item');

        // Function to update completion status
        const updateCompletion = (completed) => {
            completedGames[gameId] = completed;
            checkbox.checked = completed;
            localStorage.setItem('completedGames', JSON.stringify(completedGames));
        };

        // Handle checkbox click
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            updateCompletion(e.target.checked);
        });

        // Handle game link click
        gameLink.addEventListener('click', () => {
            updateCompletion(true);
        });

        gamesList.appendChild(gameElement);
    });
}

// New function to export the seed
function exportSeed(games) {
    return games.map(game => ({ name: game.title }));
}

// Add this new function to create grid items
function createGridItem(game = null) {
    const gridItem = document.createElement('div');
    gridItem.className = 'grid-item';
    
    if (game) {
        gridItem.classList.add('filled');
        gridItem.innerHTML = `
            <a href="${game.link}" target="_blank" rel="noopener noreferrer" class="game-link">
                ${game.title}
            </a>
        `;
    }
    
    return gridItem;
}

// Add this new function to create the game grid
function createGameGrid(container, games) {
    container.innerHTML = '';
    
    // Create 5x5 grid
    for (let i = 0; i < 25; i++) {
        const gridItem = createGridItem(i < games.length ? games[i] : null);
        container.appendChild(gridItem);
    }
}

// Export the new functions
export { 
    getSeed, 
    filterGamesBySeed, 
    generateRandomGames, 
    updateGamesList, 
    fetchGames, 
    exportSeed,
    createGameGrid 
};