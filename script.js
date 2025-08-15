// --- Elements ---
const squares = Array.from(document.querySelectorAll('.grid__square'));
const btnStart = document.getElementById('instructions__btn');
const btnResetScores = document.getElementById('reset__scores_btn');

const infoName1 = document.getElementById('info__player__name1');
const infoName2 = document.getElementById('info__player__name2');
const infoScore1 = document.getElementById('info__player__score1');
const infoScore2 = document.getElementById('info__player__score2');
const infoText = document.getElementById('instructions__text');

const modal = document.getElementById('modal');
const nameForm = document.getElementById('name__form');
const inputP1 = document.getElementById('player1');
const inputP2 = document.getElementById('player2');


// Sounds
const sClick = document.getElementById('s-click');
const sWin   = document.getElementById('s-win');
const sDraw  = document.getElementById('s-draw');

// --- Game State ---
const X = 'X';
const O = 'O';
const icons = {
  [X]: 'assets/cross.png',
  [O]: 'assets/circle.png',
};

let board;               // 0..8 -> '', 'X', 'O'
let currentPlayer;       // 'X' or 'O'
let gameOver = false;
let gameActive = false;  // <-- Add this flag
let scores = { X: 0, O: 0 };
let players = { X: 'Player 1', O: 'Player 2' };
let lastMoveIndex = null;

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diagonals
];

// --- Helpers ---
function openModal() { modal.classList.add('show'); }
function closeModal() { modal.classList.remove('show'); }

function resetBoard() {
  board = Array(9).fill('');
  currentPlayer = X; // X starts each round
  gameOver = false;
  gameActive = true; // <-- Enable game on start
  lastMoveIndex = null;

  squares.forEach((sq) => {
    sq.innerHTML = '';
    sq.classList.remove('square--disabled', 'square--win', 'square--last');
  });

  infoText.textContent = `${players.X}'s turn (X)`;
  btnStart.textContent = 'Restart Round';
}

function updateScoresUI() {
  infoScore1.textContent = String(scores[X]);
  infoScore2.textContent = String(scores[O]);
}

function placeMark(index) {
  if (!gameActive || gameOver || board[index]) return; // <-- Only allow if gameActive

  // Sound
  try { sClick.currentTime = 0; sClick.play(); } catch(e){}

  board[index] = currentPlayer;

  // Render icon
  const img = document.createElement('img');
  img.src = icons[currentPlayer];
  img.alt = currentPlayer === X ? 'X' : 'O';
  img.setAttribute('aria-hidden', 'true');

  squares[index].appendChild(img);

  // Last move highlight
  if (lastMoveIndex !== null) squares[lastMoveIndex].classList.remove('square--last');
  squares[index].classList.add('square--last');
  lastMoveIndex = index;

  // Check result
  const result = getResult();
  if (result.type === 'win') {
    handleWin(result.line, currentPlayer);
    return;
  }
  if (result.type === 'draw') {
    handleDraw();
    return;
  }

  // Switch player
  currentPlayer = currentPlayer === X ? O : X;
  infoText.textContent = `${players[currentPlayer]}'s turn (${currentPlayer})`;
}

function getResult() {
  for (const line of WIN_LINES) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { type: 'win', line };
    }
  }
  if (board.every(Boolean)) return { type: 'draw' };
  return { type: 'ongoing' };
}

function handleWin(line, winner) {
  gameOver = true;
  gameActive = false; // <-- Disable game after win
  scores[winner] += 1;
  updateScoresUI();

  // Win visuals
  line.forEach(i => squares[i].classList.add('square--win'));
  squares.forEach(sq => sq.classList.add('square--disabled'));

  infoText.textContent = `${players[winner]} wins! 🎉`;
  btnStart.textContent = 'Play Again';

  try { sWin.currentTime = 0; sWin.play(); } catch(e){}
}

function handleDraw() {
  gameOver = true;
  gameActive = false; // <-- Disable game after draw
  squares.forEach(sq => sq.classList.add('square--disabled'));
  infoText.textContent = `It's a draw. 🤝`;
  btnStart.textContent = 'Play Again';

  try { sDraw.currentTime = 0; sDraw.play(); } catch(e){}
}

// --- Event Wiring ---
squares.forEach((sq, idx) => {
  sq.addEventListener('click', () => placeMark(idx));
});

// Start / Restart button
btnStart.addEventListener('click', () => {
  // If no names yet, ask for them first.
  if (!players._set) {
    inputP1.value = players[X];
    inputP2.value = players[O];
    openModal();
    return;
  }
  resetBoard();
});

// Reset scores
btnResetScores.addEventListener('click', () => {
  scores = { X: 0, O: 0 };
  updateScoresUI();
  resetBoard();
  infoText.textContent = 'Scores reset. New round — ' + `${players.X}'s turn (X)`;
});

// Modal submit
nameForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const p1 = inputP1.value.trim() || 'Player 1';
  const p2 = inputP2.value.trim() || 'Player 2';

  players = { X: p1, O: p2, _set: true };

  infoName1.textContent = p1;
  infoName2.textContent = p2;

  closeModal();
  resetBoard();
});

// Close modal when clicking outside the content
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// --- Initial ---
(function init() {
  // Prepare a fresh inactive board until user starts
  board = Array(9).fill('');
  gameActive = false; // <-- Game is inactive until start
  infoText.textContent = 'Click the button to start';
})();
