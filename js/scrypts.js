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
let multiplier = 1; // Multiplicador inicial
let resetMultiplierTimeout; // Timeout para reiniciar o multiplicador após 5 segundos
let gameActive = false; // Controle para saber se o jogo está ativo

const emojis = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🍑', '🍋', '🍈', '🥥', '🍏', '🥝', '🍊', '🍐', '🍭', '🍬', '🍫'];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createBoard(size) {
    const totalCards = size === 16 ? 8 : 18;
    const selectedEmojis = emojis.slice(0, totalCards);
    const allCards = [...selectedEmojis, ...selectedEmojis];
    shuffle(allCards);
    board.className = size === 16 ? 'easy-mode' : 'hard-mode';
    board.innerHTML = '';
    allCards.forEach((emoji) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.emoji = emoji;
        cardElement.innerHTML = `
            <div class="card-inner">
                <div class="card-front">?</div>
                <div class="card-back">${emoji}</div>
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
        clearTimeout(resetMultiplierTimeout); // Limpa o timeout anterior
        return;
    }

    secondCard = this;
    clearTimeout(resetMultiplierTimeout); // Limpa o timeout se uma segunda carta for virada
    checkForMatch();
}

function checkForMatch() {
    if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
        disableCards();
        score += 10 * multiplier; // Adiciona pontos ao score por par encontrado considerando o multiplicador
        scoreDisplay.textContent = score;

        // Atualiza o multiplicador e exibe se houver uma combinação
        multiplier = Math.min(multiplier + 0.5, 2.5); // Aumenta o multiplicador até 2.5
        multiplierDisplay.textContent = multiplier.toFixed(1); // Mostra o novo multiplicador

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
    clearTimeout(resetMultiplierTimeout); // Limpa o timeout se uma combinação não for encontrada
    resetMultiplierTimeout = setTimeout(() => {
        multiplier = 1; // Retorna o multiplicador a 1 após 5 segundos
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
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

resetButton.addEventListener('click', resetGame);

function resetGame() {
    matchCount = 0;
    score = 0;
    scoreDisplay.textContent = score;
    multiplier = 1; // Reseta o multiplicador ao reiniciar
    multiplierDisplay.textContent = multiplier.toFixed(1); // Atualiza a exibição do multiplicador
    const currentMode = board.classList.contains('easy-mode') ? 16 : 36;
    createBoard(currentMode);
}

function startGame(mode) {
    playerName = playerNameInput.value;
    if (!playerName) {
        alert("Por favor, insira seu nome!");
        return;
    }
    startScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    matchCount = 0;
    score = 0;
    scoreDisplay.textContent = score;
    multiplier = 1; // Reseta o multiplicador ao iniciar
    multiplierDisplay.textContent = multiplier.toFixed(1); // Mostra o multiplicador resetado
    gameActive = true; // Marca o jogo como ativo
    createBoard(mode);
}

function saveScore() {
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.push({ name: playerName, score: score });
    localStorage.setItem('scores', JSON.stringify(scores));
    showRanking();
}

function showRanking() {
    rankingScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    rankingList.innerHTML = '';
    const scores = JSON.parse(localStorage.getItem('scores')) || [];
    scores.sort((a, b) => b.score - a.score);
    scores.forEach(({ name, score }) => {
        const li = document.createElement('li');
        li.textContent = `${name}: ${score}`;
        rankingList.appendChild(li);
    });
}

easyModeButton.addEventListener('click', () => startGame(16));
hardModeButton.addEventListener('click', () => startGame(36));
backToStartButton.addEventListener('click', () => {
    startScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    rankingScreen.style.display = 'none';
    
    // Se o jogo estava ativo, não exibe a mensagem de pontuação final
    if (gameActive) {
        clearInterval(timer);
        gameActive = false; // Reseta o status do jogo
    }
});

backToGameButton.addEventListener('click', () => {
    rankingScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
});

function resetTimer() {
    timeLeft = 60;
    timerDisplay.textContent = timeLeft;
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            alert(`Tempo esgotado! Sua pontuação final é: ${score}`);
            saveScore();
        }
    }, 1000);
}
