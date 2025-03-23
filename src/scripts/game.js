import { fetchPokemon, fetchPokedexByGeneration } from './api.js';

const guessInput = document.getElementById('guess');
const submitBtn = document.getElementById('submit');
const tableBody = document.querySelector('#clue-table tbody');
const result = document.getElementById('result');
const pokeImage = document.getElementById('pokemon-img');
const pokedexBtn = document.getElementById('pokedexBtn');
const pokedexModal = document.getElementById('pokedexModal');
const closeBtn = document.querySelector('.close');
const pokedexList = document.getElementById('pokedexList');
const genSelect = document.getElementById('genSelect');
const resetBtn = document.getElementById('resetBtn');

const errorModal = document.getElementById('errorModal');
const errorMessage = document.getElementById('errorMessage');
const errorClose = document.getElementById('errorClose');

let secretPokemon;
let previousGuesses = [];

function resetGame() {
    result.textContent = '';
    pokeImage.src = '';
    tableBody.innerHTML = '';
    submitBtn.disabled = false;
    guessInput.value = '';
    previousGuesses = [];
    setupGame();
}

async function setupGame() {
    const randomGen = Math.floor(Math.random() * 9) + 1;
    const genPokemons = await fetchPokedexByGeneration(randomGen);
    const randomPokemon = genPokemons[Math.floor(Math.random() * genPokemons.length)];

    secretPokemon = await fetchPokemon(randomPokemon.name);
    console.log("Secret Pokémon:", secretPokemon);
}

resetBtn.addEventListener('click', resetGame);
setupGame();

submitBtn.addEventListener('click', async () => {
    const userGuess = guessInput.value.toLowerCase().trim();
    if (!userGuess) return;

    if (previousGuesses.includes(userGuess)) {
        showError("You already guessed that Pokémon!");
        return;
    }

    try {
        const guessedPokemon = await fetchPokemon(userGuess);

        const genMatch = guessedPokemon.gen === secretPokemon.gen;
        const typeMatch = JSON.stringify(guessedPokemon.type.sort()) === JSON.stringify(secretPokemon.type.sort());
        const colorMatch = guessedPokemon.color === secretPokemon.color;
        const evolutionMatch = guessedPokemon.evolutionStage === secretPokemon.evolutionStage;

        const clueRow = `
        <tr>
          <td class="${genMatch ? 'correct' : 'wrong'}">${guessedPokemon.gen}</td>
          <td class="${typeMatch ? 'correct' : 'wrong'}">${guessedPokemon.type.join(', ')}</td>
          <td class="${colorMatch ? 'correct' : 'wrong'}">${guessedPokemon.color}</td>
          <td class="${evolutionMatch ? 'correct' : 'wrong'}">${guessedPokemon.evolutionStage}</td>
          <td><img src="${guessedPokemon.sprite}" width="50"></td>
        </tr>
      `;

        tableBody.innerHTML += clueRow;

        if (guessedPokemon.name === secretPokemon.name) {
            result.textContent = `🎉 Correct! It was ${capitalize(secretPokemon.name)}!`;
            pokeImage.src = secretPokemon.sprite;
            submitBtn.disabled = true;
        } else {
            result.textContent = `Keep guessing!`;
        }

        previousGuesses.push(userGuess);

        guessInput.value = "";
    } catch (error) {
        showError("That's not a Pokémon!");
    }
});

pokedexBtn.addEventListener('click', async () => {
    pokedexModal.style.display = 'block';
    loadPokedex(genSelect.value);
});

genSelect.addEventListener('change', async () => {
    loadPokedex(genSelect.value);
});

async function loadPokedex(gen) {
    pokedexList.innerHTML = '<p style="color:#333;">Loading Pokédex...</p>';
    try {
        const pokedex = await fetchPokedexByGeneration(gen);
        pokedexList.innerHTML = '';
        if (pokedex.length === 0) {
            pokedexList.innerHTML = '<p style="color:red;">No Pokémon found for this generation.</p>';
        }
        pokedex.forEach(pokemon => {
            const pokeDiv = document.createElement('div');
            pokeDiv.innerHTML = `
                <img src="${pokemon.sprite}" alt="${pokemon.name}">
                <p>${capitalize(pokemon.name)}</p>
            `;
            pokedexList.appendChild(pokeDiv);
        });
    } catch (error) {
        pokedexList.innerHTML = '<p style="color:red;">Failed to load Pokédex for this generation.</p>';
        console.error("Error loading Pokédex:", error);
    }
}

closeBtn.onclick = () => pokedexModal.style.display = 'none';
window.onclick = (event) => { if (event.target == pokedexModal) pokedexModal.style.display = 'none'; };

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function showError(message) {
    errorMessage.textContent = message;
    errorModal.style.display = 'block';
}

errorClose.onclick = () => {
    errorModal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == errorModal) {
        errorModal.style.display = 'none';
    }
};

