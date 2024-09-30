const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const rankingScreen = document.getElementById('ranking-screen');
const board = document.getElementById('game-board');
const resetButton = document.getElementById('reset-game');
const easyModeButton = document.getElementById('easy-mode');
const hardModeButton = document.getElementById('hard-mode');
const backToStartButton = document.getElementById('back-to-start');
const backToGameButton = document.getElementById('back-to-game');
const playerNameInput = document.getElementById('player-name');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const multiplierDisplay = document.getElementById('multiplier');
const rankingList = document.getElementById('ranking-list');

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchCount = 0;
let totalPairs = 0;
let score = 0;
let playerName = '';
let timeLeft = 60;
let timer;
let multiplier = 1;
let resetMultiplierTimeout;
let gameActive = false;

const images = [
    'images/bellsprout.svg',
    'images/bullbasaur.svg',
    'images/caterpie.svg',
    'images/charmander.svg',
    'images/dratini.svg',
    'images/eevee.svg',
    'images/egg.svg',
    'images/mankey.svg',
    'images/mew.svg',
    'images/mewoth.svg',
    'images/pikachu.svg',
    'images/psyduck.svg',
    'images/ratata.svg',
    'images/snorlax.svg',
    'images/squirtle.svg',
    'images/venonat.svg'
];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createBoard(size) {
    const totalCards = size === 16 ? 8 : 18;
    const selectedImages = images.slice(0, totalCards);
    const allCards = [...selectedImages, ...selectedImages];
    shuffle(allCards);
    board.className = size === 16 ? 'easy-mode' : 'hard-mode';
    board.innerHTML = '';
    allCards.forEach((imageSrc) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.emoji = emoji;
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">
                    <img src="${imageSrc}" alt="Imagem de Carta">
                </div>
            </div>
        `;
        cardElement.addEventListener('click', flipCard);
        board.appendChild(cardElement);
    });
    totalPairs = size === 16 ? 8 : 18;
    resetTimer();
}

function flipCard() {
    if (lockBoard || this === firstCard) return;

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        clearTimeout(resetMultiplierTimeout);
        return;
    }

    secondCard = this;
    clearTimeout(resetMultiplierTimeout);
    checkForMatch();
}

function checkForMatch() {
    if (firstCard.querySelector('.card-back img').src === secondCard.querySelector('.card-back img').src) {
        disableCards();
        score += 10 * multiplier;
        scoreDisplay.textContent = score;

        multiplier = Math.min(multiplier + 0.5, 2.5);
        multiplierDisplay.textContent = multiplier.toFixed(1);

        matchCount += 1;
        if (matchCount === totalPairs) {
            clearInterval(timer);
            setTimeout(() => {
                alert(`Parabéns, ${playerName}! Você encontrou todos os pares!`);
                saveScore();
            }, 500);
        }

        // Reinicia o timeout após um acerto
        clearTimeout(resetMultiplierTimeout);
        resetMultiplierTimeout = setTimeout(() => {
            multiplier = 1; // Retorna o multiplicador a 1 após 5 segundos
            multiplierDisplay.textContent = multiplier.toFixed(1);
        }, 5000); // Reinicia o multiplicador após 5 segundos

    } else {
        unflipCards();
        resetMultiplier();
    }
}

function resetMultiplier() {
    clearTimeout(resetMultiplierTimeout);
    resetMultiplierTimeout = setTimeout(() => {
        multiplier = 1;
        multiplierDisplay.textContent = multiplier.toFixed(1);
    }, 5000);
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = 60;
    timerDisplay.textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert(`Tempo esgotado! Sua pontuação final é ${score}.`);
            saveScore();
        }
    }, 1000);
}

function saveScore() {
    const scoreEntry = `${playerName} - ${score}`;
    const li = document.createElement('li');
    li.textContent = scoreEntry;
    rankingList.appendChild(li);
    resetGame();
}

function resetGame() {
    score = 0;
    matchCount = 0;
    multiplier = 1;
    scoreDisplay.textContent = score;
    multiplierDisplay.textContent = multiplier.toFixed(1);
    resetBoard();
    gameActive = false;
}

easyModeButton.addEventListener('click', () => {
    playerName = playerNameInput.value || 'Jogador';
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    createBoard(16);
    gameActive = true;
});

hardModeButton.addEventListener('click', () => {
    playerName = playerNameInput.value || 'Jogador';
    startScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    createBoard(36);
    gameActive = true;
});
backToStartButton.addEventListener('click', () => {
    resetGame();
    startScreen.style.display = 'block';
    gameScreen.style.display = 'none';
});

backToGameButton.addEventListener('click', () => {
    resetGame();
    gameScreen.style.display = 'block';
    rankingScreen.style.display = 'none';
});

resetButton.addEventListener('click', resetGame);
