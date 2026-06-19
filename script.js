let digits = [];
let interval;
let signalHistory = [];
let stats = {
  totalSignals: 0,
  strongSignals: 0,
  blockSignals: 0,
  waitSignals: 0
};

function rand() {
  return Math.floor(Math.random() * 10);
}

function start() {
  interval = setInterval(() => {

    digits.push(rand());
    if (digits.length > 30) digits.shift();

    runEngine();

  }, 1000);
}

function stop() {
  clearInterval(interval);
}

function runEngine() {

  let over = digits.filter(d => [1,2,3].includes(d)).length;
  let under = digits.filter(d => [6,7,8,9].includes(d)).length;

  let even = digits.filter(d => d % 2 === 0).length;
  let odd = digits.filter(d => d % 2 !== 0).length;

  let match = over - under;

  // ===== IMPROVED SCORING =====
  // Normalized percentages (0-100 scale)
  let overPct = (over / digits.length) * 100;
  let underPct = (under / digits.length) * 100;
  let evenPct = (even / digits.length) * 100;
  let oddPct = (odd / digits.length) * 100;
  
  // Calculate directional strength (how strong the bias is)
  let ouStrength = Math.abs(overPct - underPct); // 0-100 (higher = stronger OU bias)
  let eoStrength = Math.abs(evenPct - oddPct);   // 0-100 (higher = stronger EO bias)
  
  // Calculate momentum (change from previous tick)
  let momentum = Math.abs(match) / digits.length * 100; // 0-100
  
  // Composite score: balance of all factors
  let score = Math.round((ouStrength * 0.4) + (eoStrength * 0.3) + (momentum * 0.3));
  
  // ===== SIGNAL LOGIC =====
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
  if (signalHistory.length > 100) signalHistory.shift(); // Keep last 100

  // Update stats
  stats.totalSignals++;
  if (signalType === "over" || signalType === "under") stats.strongSignals++;
  if (signalType === "block") stats.blockSignals++;
  if (signalType === "wait") stats.waitSignals++;

  // Update UI
  document.getElementById("signal").innerText = signal;
  document.getElementById("score").innerText = `Score: ${score} | Strength: OU ${Math.round(ouStrength)}% | EO ${Math.round(eoStrength)}%`;

  document.getElementById("ou").innerText = `Over: ${over} (${Math.round(overPct)}%) | Under: ${under} (${Math.round(underPct)}%)`;
  document.getElementById("eo").innerText = `Even: ${even} (${Math.round(evenPct)}%) | Odd: ${odd} (${Math.round(oddPct)}%)`;
  document.getElementById("match").innerText = `MatchDiffer: ${match} | Momentum: ${Math.round(momentum)}%`;
}

// ===== ANALYSIS FUNCTIONS =====
function analyzeSignalQuality() {
  if (signalHistory.length === 0) {
    console.log("No signal history yet");
    return;
  }

  let strongCount = signalHistory.filter(s => s.signal !== "wait" && s.signal !== "block").length;
  let avgScore = Math.round(signalHistory.reduce((sum, s) => sum + s.score, 0) / signalHistory.length);
  
  console.log("=== SIGNAL QUALITY ANALYSIS ===");
  console.log(`Total Signals: ${signalHistory.length}`);
  console.log(`Strong Signals: ${strongCount} (${Math.round((strongCount/signalHistory.length)*100)}%)`);
  console.log(`Average Score: ${avgScore}`);
  console.log(`Stats: ${JSON.stringify(stats)}`);
  console.log(signalHistory);
}

function testScoringWithSimulation(rounds = 100) {
  console.log("=== SCORING SIMULATION ===");
  let testSignals = [];
  
  for (let i = 0; i < rounds; i++) {
    let testDigits = [];
    for (let j = 0; j < 30; j++) {
      testDigits.push(rand());
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
    let momentum = Math.abs(over - under) / 30 * 100;
    
    let score = Math.round((ouStrength * 0.4) + (eoStrength * 0.3) + (momentum * 0.3));
    
    testSignals.push(score);
  }
  
  let avgScore = Math.round(testSignals.reduce((a, b) => a + b) / testSignals.length);
  let minScore = Math.min(...testSignals);
  let maxScore = Math.max(...testSignals);
  let scoreDistribution = {
    "0-30": testSignals.filter(s => s < 30).length,
    "30-50": testSignals.filter(s => s >= 30 && s < 50).length,
    "50-70": testSignals.filter(s => s >= 50 && s < 70).length,
    "70+": testSignals.filter(s => s >= 70).length
  };
  
  console.log(`Average Score: ${avgScore}`);
  console.log(`Min: ${minScore}, Max: ${maxScore}`);
  console.log(`Distribution:`, scoreDistribution);
  console.log(`% Strong Signals (70+): ${Math.round((scoreDistribution["70+"] / rounds) * 100)}%`);
}
