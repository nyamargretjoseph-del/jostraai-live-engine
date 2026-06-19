let digits = [];
let interval;

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

  let score = (over * 3) + (even * 2) + Math.abs(match * 5);

  let signal = "WAIT ⏳";

  if (score >= 85 && over > under && even > odd) {
    signal = "OVER 🟢 STRONG";
  } else if (score >= 85 && under > over && odd > even) {
    signal = "UNDER 🔴 STRONG";
  } else if (score < 70) {
    signal = "BLOCK ❌";
  }

  document.getElementById("signal").innerText = signal;
  document.getElementById("score").innerText = "Score: " + score;

  document.getElementById("ou").innerText = `Over: ${over} | Under: ${under}`;
  document.getElementById("eo").innerText = `Even: ${even} | Odd: ${odd}`;
  document.getElementById("match").innerText = `MatchDiffer: ${match}`;
}
