let ws;
let digits = [];
let heat = Array(10).fill(0);
let signalHistory = [];
let stats = {
  totalSignals: 0,
  strongSignals: 0,
  blockSignals: 0,
  waitSignals: 0
};

// ===============================
// START LIVE CONNECTION
// ===============================
function start() {

  ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");

  ws.onopen = () => {
    let status = document.getElementById("status");
    status.innerText = "🟢 CONNECTED";
    status.classList.remove("disconnected");
    status.classList.add("connected");

    document.getElementById("learning").innerText = "ANALYZING";

    ws.send(JSON.stringify({
      ticks: "R_25",
      subscribe: 1
    }));
  };

  ws.onmessage = (msg) => {
    try {
      let data = JSON.parse(msg.data);

      if (data.tick) {
        let price = data.tick.quote;
        let lastDigit = parseInt(price.toString().slice(-1));

        // store digits
        digits.push(lastDigit);
        if (digits.length > 50) digits.shift();

        // update heatmap
        heat[lastDigit]++;

        runEngine();
        renderHeatmap();
      }
    } catch (e) {
      console.error("Error processing message:", e);
    }
  };

  ws.onclose = () => {
    let status = document.getElementById("status");
    status.innerText = "🔴 DISCONNECTED";
    status.classList.add("disconnected");
    status.classList.remove("connected");
    document.getElementById("learning").innerText = "STOPPED";
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    let status = document.getElementById("status");
    status.innerText = "⚠️ ERROR";
  };
}

// ===============================
// STOP CONNECTION
// ===============================
function stop() {
  if (ws) ws.close();
  heat = Array(10).fill(0);
  digits = [];
  document.getElementById("sampleSize").innerText = "0/50";
}

// ===============================
// AI FUSION ENGINE
// ===============================
function runEngine() {

  if (digits.length === 0) return;

  let total = digits.length;

  // Calculate counts
  let over = digits.filter(d => [1,2,3].includes(d)).length;
  let under = digits.filter(d => [6,7,8,9].includes(d)).length;

  let even = digits.filter(d => d % 2 === 0).length;
  let odd = digits.filter(d => d % 2 !== 0).length;

  let match = over - under;

  // Calculate normalized percentages (0-100 scale)
  let overPct = (over / total) * 100;
  let underPct = (under / total) * 100;
  let evenPct = (even / total) * 100;
  let oddPct = (odd / total) * 100;

  // Calculate directional strength (how strong the bias is)
  let ouStrength = Math.abs(overPct - underPct); // 0-100 (higher = stronger OU bias)
  let eoStrength = Math.abs(evenPct - oddPct);   // 0-100 (higher = stronger EO bias)

  // Calculate momentum (change from previous tick)
  let momentum = 0;
  if (digits.length > 1) {
    for (let i = 1; i < digits.length; i++) {
      momentum += (digits[i] > digits[i - 1]) ? 1 : -1;
    }
    momentum = (momentum / (total || 1)) * 100;
  }

  // Composite score: balance of all factors
  let score = Math.round((ouStrength * 0.4) + (eoStrength * 0.3) + (Math.abs(momentum) * 0.3));

  // SIGNAL LOGIC
  let signal = "WAIT ⏳";
  let signalType = "wait";

  // OVER signal: Over > Under AND Even > Odd
  if (score >= 70 && over > under && even > odd) {
    signal = "OVER 🟢 STRONG";
    signalType = "over";
  }
  // UNDER signal: Under > Over AND Odd > Even
  else if (score >= 70 && under > over && odd > even) {
    signal = "UNDER 🔴 STRONG";
    signalType = "under";
  }
  // BLOCK: Weak signals (low confidence)
  else if (score < 45) {
    signal = "BLOCK ❌";
    signalType = "block";
  }

  // Track signal history
  signalHistory.push({
    signal: signalType,
    score: score,
    timestamp: new Date().toLocaleTimeString()
  });
  if (signalHistory.length > 100) signalHistory.shift();

  // Update stats
  stats.totalSignals++;
  if (signalType === "over" || signalType === "under") stats.strongSignals++;
  if (signalType === "block") stats.blockSignals++;
  if (signalType === "wait") stats.waitSignals++;

  // UI UPDATE
  let signalEl = document.getElementById("signal");
  if (signalEl) signalEl.innerText = signal;

  let scoreEl = document.getElementById("score");
  if (scoreEl) scoreEl.innerText = score.toFixed(0);

  let sampleEl = document.getElementById("sampleSize");
  if (sampleEl) sampleEl.innerText = total + "/50";

  let ouEl = document.getElementById("ou");
  if (ouEl) ouEl.innerText = over + " / " + under;

  let eoEl = document.getElementById("eo");
  if (eoEl) eoEl.innerText = even + " / " + odd;

  let ouStrengthEl = document.getElementById("ouStrength");
  if (ouStrengthEl) ouStrengthEl.innerText = ouStrength.toFixed(1) + "%";

  let eoStrengthEl = document.getElementById("eoStrength");
  if (eoStrengthEl) eoStrengthEl.innerText = eoStrength.toFixed(1) + "%";

  let momentumEl = document.getElementById("momentum");
  if (momentumEl) momentumEl.innerText = momentum.toFixed(1) + "%";
}

// ===============================
// HEATMAP RENDER
// ===============================
function renderHeatmap() {

  let box = document.getElementById("heatmap");
  if (!box) return;

  box.innerHTML = "";

  let maxHeat = Math.max(...heat);

  for (let i = 0; i < 10; i++) {

    let div = document.createElement("div");
    div.className = "cell";

    // Color based on frequency
    if (maxHeat > 0) {
      if (heat[i] > maxHeat * 0.7) {
        div.classList.add("hot");
      } else if (heat[i] > maxHeat * 0.4) {
        div.classList.add("warm");
      } else {
        div.classList.add("cool");
      }
    } else {
      div.classList.add("cool");
    }

    let digitText = document.createElement("div");
    digitText.style.fontSize = "1.2em";
    digitText.style.fontWeight = "bold";
    digitText.textContent = i;

    let countText = document.createElement("div");
    countText.style.fontSize = "0.8em";
    countText.style.opacity = "0.8";
    countText.textContent = "×" + heat[i];

    div.appendChild(digitText);
    div.appendChild(countText);

    box.appendChild(div);
  }
}

// ===============================
// ANALYSIS FUNCTIONS
// ===============================
function analyzeSignalQuality() {
  if (signalHistory.length === 0) {
    console.log("❌ No signal history yet. Start the engine first.");
    return;
  }

  let strongCount = signalHistory.filter(s => s.signal !== "wait" && s.signal !== "block").length;
  let avgScore = Math.round(signalHistory.reduce((sum, s) => sum + s.score, 0) / signalHistory.length);

  console.log("=== 📊 SIGNAL QUALITY ANALYSIS ===");
  console.log("Total Signals: " + signalHistory.length);
  console.log("Strong Signals (Over/Under): " + strongCount + " (" + Math.round((strongCount/signalHistory.length)*100) + "%)");
  console.log("Block Signals: " + stats.blockSignals);
  console.log("Wait Signals: " + stats.waitSignals);
  console.log("Average Score: " + avgScore + "/100");
  console.log("Win Rate Estimate: " + Math.round((strongCount/signalHistory.length)*100) + "%");
  console.log("Full History:", signalHistory);
}

function testScoringWithSimulation(rounds) {
  if (!rounds) rounds = 100;

  console.log("=== 🧪 SCORING SIMULATION ===");
  let testSignals = [];

  for (let i = 0; i < rounds; i++) {
    let testDigits = [];
    for (let j = 0; j < 30; j++) {
      testDigits.push(Math.floor(Math.random() * 10));
    }

    let over = testDigits.filter(d => [1,2,3].includes(d)).length;
    let under = testDigits.filter(d => [6,7,8,9].includes(d)).length;
    let even = testDigits.filter(d => d % 2 === 0).length;
    let odd = testDigits.filter(d => d % 2 !== 0).length;

    let overPct = (over / 30) * 100;
    let underPct = (under / 30) * 100;
    let evenPct = (even / 30) * 100;
    let oddPct = (odd / 30) * 100;

    let ouStrength = Math.abs(overPct - underPct);
    let eoStrength = Math.abs(evenPct - oddPct);

    let momentum = 0;
    for (let k = 1; k < testDigits.length; k++) {
      momentum += (testDigits[k] > testDigits[k - 1]) ? 1 : -1;
    }
    momentum = (momentum / 30) * 100;

    let score = Math.round((ouStrength * 0.4) + (eoStrength * 0.3) + (Math.abs(momentum) * 0.3));

    testSignals.push(score);
  }

  let avgScore = Math.round(testSignals.reduce((a, b) => a + b) / testSignals.length);
  let minScore = Math.min.apply(null, testSignals);
  let maxScore = Math.max.apply(null, testSignals);
  let blockCount = testSignals.filter(s => s < 45).length;
  let waitCount = testSignals.filter(s => s >= 45 && s < 70).length;
  let strongCount = testSignals.filter(s => s >= 70).length;

  console.log("Rounds: " + rounds);
  console.log("Average Score: " + avgScore + "/100");
  console.log("Min: " + minScore + ", Max: " + maxScore);
  console.log("Score Distribution: BLOCK=" + blockCount + ", WAIT=" + waitCount + ", STRONG=" + strongCount);
  console.log("Strong Signal Rate (70+): " + Math.round((strongCount / rounds) * 100) + "%");
  console.log("Full Scores:", testSignals);
}
