<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F6HS71HWC1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-F6HS71HWC1');
</script>

const board = document.getElementById("board");
const timerDisplay = document.getElementById("timer");
const correctDisplay = document.getElementById("correct");
const wrongDisplay = document.getElementById("wrong");
const title = document.getElementById("game-title");
title.textContent = "🎯 Quiz Tamyiz";
const levelSelect = document.getElementById("level-select");
const leaderboardScreen = document.getElementById("leaderboard-screen");
const leaderboardBody = document.getElementById("leaderboard-body");
let firstCard,
  secondCard,
  lock = false;
let correct = 0,
  wrong = 0,
  timer = 0,
  timerInterval;

// =======================
// 🔥 LOAD LEVEL
// =======================

function loadLevels() {
  // Tambahkan opsi default
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "-- Pilih Kolom --";
  defaultOption.disabled = true;
  defaultOption.selected = true;

  levelSelect.appendChild(defaultOption);

  // Tambahkan level dari questionSets
  for (let key in questionSets) {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    levelSelect.appendChild(option);
  }
}

levelSelect.addEventListener("change", startGame);

// =======================
// GAME
// =======================

function startGame() {
  const selectedLevel = levelSelect.value;
  if (!selectedLevel) return;

  title.textContent = "🎯 " + selectedLevel;

  const pairs = questionSets[selectedLevel];

  let gameCards = [];
  pairs.forEach((p) => {
    gameCards.push({ type: "latin", value: p.latin, match: p.latin });
    gameCards.push({ type: "arab", value: p.arab, match: p.latin });
  });

  board.innerHTML = "";
  shuffle(gameCards).forEach((cardData, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">${index + 1}</div>
        <div class="card-back ${cardData.type}">
          ${cardData.value}
        </div>
      </div>
    `;
    card._data = cardData;
    card.addEventListener("click", () => flipCard(card, pairs.length));
    board.appendChild(card);
  });

  resetStats();
}

function flipCard(card, totalPairs) {
  if (lock || card.classList.contains("flip")) return;
  card.classList.add("flip");

  if (!firstCard) firstCard = card;
  else {
    secondCard = card;
    checkMatch(totalPairs);
  }
}

function checkMatch(totalPairs) {
  lock = true;

  const d1 = firstCard._data;
  const d2 = secondCard._data;

  const isPair = d1.type !== d2.type && d1.match === d2.match;

  if (isPair) {
    correct++;
    correctDisplay.textContent = correct;

    setTimeout(() => {
      firstCard.style.visibility = "hidden";
      secondCard.style.visibility = "hidden";
      resetTurn();

      if (correct === totalPairs) {
        clearInterval(timerInterval);
        setTimeout(showLeaderboardInput, 300);
      }
    }, 400);
  } else {
    wrong++;
    wrongDisplay.textContent = wrong;

    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");
      resetTurn();
    }, 800);
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lock = false;
}

function resetStats() {
  correct = 0;
  wrong = 0;
  timer = 0;
  correctDisplay.textContent = 0;
  wrongDisplay.textContent = 0;
  timerDisplay.textContent = 0;

  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    timerDisplay.textContent = timer;
  }, 1000);
}

function restartGame() {

  currentQuestion = 0;
  score = 0;

  // kalau ada array soal
  if (typeof questions !== "undefined") {
    questions = [];
  }

  startGame();
}

function exitGame() {
  if (confirm("Keluar game?")) {
    window.location.href = "index.html";
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// =======================
// 🏆 LEADERBOARD SYSTEM
// =======================

function showLeaderboardInput() {
  const name = prompt("🎉 Semua pasangan cocok! Masukkan nama Anda:");
  if (name) saveScore(name, timer);
}

function saveScore(name, time) {
  const levelName = levelSelect.value;

  let allScores = JSON.parse(localStorage.getItem("memoryScores")) || {};

  if (!allScores[levelName]) {
    allScores[levelName] = [];
  }

  allScores[levelName].push({ name, time });

  // Urutkan berdasarkan waktu tercepat
  allScores[levelName].sort((a, b) => a.time - b.time);

  // Ambil 5 terbaik saja
  allScores[levelName] = allScores[levelName].slice(0, 5);

  localStorage.setItem("memoryScores", JSON.stringify(allScores));

  displayLeaderboard(allScores[levelName]);
  leaderboardScreen.style.display = "block";
}

function displayLeaderboard(data) {
  leaderboardBody.innerHTML = "";

  data.forEach((player, index) => {
    let medal = index + 1;
    let medalClass = "";

    if (index === 0) {
      medal = "🥇";
      medalClass = "gold";
    } else if (index === 1) {
      medal = "🥈";
      medalClass = "silver";
    } else if (index === 2) {
      medal = "🥉";
      medalClass = "bronze";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="${medalClass}">${medal}</td>
      <td>${escapeHtml(player.name)}</td>
      <td>${player.time}</td>
    `;
    leaderboardBody.appendChild(row);
  });
}

function closeLeaderboard() {
  leaderboardScreen.style.display = "none";
  restartGame();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// =======================
// 🗑 RESET LEADERBOARD
// =======================

function resetLeaderboard() {
  const levelName = levelSelect.value;

  let allScores = JSON.parse(localStorage.getItem("memoryScores")) || {};

  if (!allScores[levelName] || allScores[levelName].length === 0) {
    alert("Leaderboard sudah kosong.");
    return;
  }

  if (confirm("Yakin ingin menghapus leaderboard level ini?")) {
    delete allScores[levelName];

    localStorage.setItem("memoryScores", JSON.stringify(allScores));

    leaderboardBody.innerHTML = "";

    alert("Leaderboard berhasil direset.");
  }
}

function openFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
}

// START
loadLevels();
levelSelect.selectedIndex = 0;
startGame();

