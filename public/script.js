const directions = ['N', 'S', 'E', 'W', 'NE', 'NW', 'SE', 'SW'];
const mapTypes = [
  'congruent', 'congruent', // 2 congruent
  'incongruent',            // 1 incongruent
  'homogenous'              // 1 homogenous
];
const randomizedConfigs = [];
const results = [];
let currentIndex = 0;

// Utility to shuffle array
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

if (window.location.pathname.endsWith('results.html')) {
  // Results page logic
  fetch('/results')
    .then(res => res.json())
    .then(data => {
      const directionTotals = {};
      const schellingTotals = {};
      const confidenceBuckets = [0, 0, 0, 0, 0];

      data.forEach(entry => {
        entry.responses.forEach(r => {
          directionTotals[r.direction] = (directionTotals[r.direction] || 0) + 1;
          if (r.isSchelling) schellingTotals[r.direction] = (schellingTotals[r.direction] || 0) + 1;
          if (r.confidence >= 1 && r.confidence <= 5) confidenceBuckets[r.confidence - 1]++;
        });
      });

      renderChart(directionTotals, schellingTotals, confidenceBuckets);
    });

  function renderChart(directionTotals, schellingTotals, confidenceBuckets) {
    const container = document.getElementById('resultsContainer') || document.body;
    container.innerHTML = `
      <h2>Results</h2>
      <canvas id="choicesChart" width="400" height="200"></canvas>
      <canvas id="schellingChart" width="400" height="200"></canvas>
      <canvas id="confidenceChart" width="400" height="200"></canvas>
    `;

    // Choices taken
    new Chart(document.getElementById('choicesChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(directionTotals),
        datasets: [{
          label: 'Choices Taken',
          data: Object.values(directionTotals),
          backgroundColor: '#4287f5'
        }]
      },
      options: { plugins: { legend: { display: false } } }
    });

    // Schelling point choices
    new Chart(document.getElementById('schellingChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: Object.keys(schellingTotals),
        datasets: [{
          label: 'Schelling Choices',
          data: Object.values(schellingTotals),
          backgroundColor: '#ffd700'
        }]
      },
      options: { plugins: { legend: { display: false } } }
    });

    // Confidence
    new Chart(document.getElementById('confidenceChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['1', '2', '3', '4', '5'],
        datasets: [{
          label: 'Confidence',
          data: confidenceBuckets,
          backgroundColor: '#888'
        }]
      },
      options: { plugins: { legend: { display: false } } }
    });
  }
} else {
  // Test logic
  // Shuffle map types for random order
  shuffle(mapTypes);
  for (let i = 0; i < mapTypes.length; i++) {
    randomizedConfigs.push({
      type: mapTypes[i],
      points: generateRandomPoints()
    });
  }

  // Generate 5 points with minimum distance between them
  function generateRandomPoints(minDist = 40) {
    const labels = ['x', 'y', 'z', 'a', 'b'];
    const points = {};
    let tries = 0;
    for (let i = 0; i < labels.length; i++) {
      let valid = false;
      let px, py;
      while (!valid && tries < 100) {
        px = 40 + Math.floor(Math.random() * 220);
        py = 40 + Math.floor(Math.random() * 220);
        valid = true;
        for (const [_, [ox, oy]] of Object.entries(points)) {
          const dist = Math.sqrt((px - ox) ** 2 + (py - oy) ** 2);
          if (dist < minDist) valid = false;
        }
        tries++;
      }
      points[labels[i]] = [px, py];
    }
    return points;
  }

  // Helper to get direction from pointA to pointB
  function getDirection(ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle >= -22.5 && angle < 22.5) return 'E';
    if (angle >= 22.5 && angle < 67.5) return 'NE';
    if (angle >= 67.5 && angle < 112.5) return 'N';
    if (angle >= 112.5 && angle < 157.5) return 'NW';
    if (angle >= 157.5 || angle < -157.5) return 'W';
    if (angle >= -157.5 && angle < -112.5) return 'SW';
    if (angle >= -112.5 && angle < -67.5) return 'S';
    if (angle >= -67.5 && angle < -22.5) return 'SE';
    return 'E';
  }

  function getBorderStyle(type) {
    if (type === 'congruent') return '4px solid green';
    if (type === 'incongruent') return '4px dashed red';
    if (type === 'homogenous') return '4px dotted blue';
    return '2px solid black';
  }

  function drawMap(config) {
    const svgNS = "http://www.w3.org/2000/svg";
    const size = 350; // Larger map
    const center = size / 2;
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.style.display = "block";
    svg.style.margin = "0 auto";
    svg.style.background = "#fafafa";
    svg.style.border = "2px solid #bbb";
    svg.style.boxSizing = "border-box";

    // Draw the "state border" as a line through the center, with edge-to-edge points
    if (config.type === "congruent" || config.type === "incongruent") {
      // Pick a random angle for the border
      const angle = Math.random() * 2 * Math.PI;

      // Calculate edge points (exactly at the SVG border)
      const r = center; // reach the edge
      const x1 = center + r * Math.cos(angle);
      const y1 = center + r * Math.sin(angle);
      const x2 = center + r * Math.cos(angle + Math.PI);
      const y2 = center + r * Math.sin(angle + Math.PI);

      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", config.type === "congruent" ? "green" : "red");
      line.setAttribute("stroke-width", 4);
      svg.appendChild(line);
    }
    // For homogenous, no line

    // Draw points (with more padding so they don't touch the edge)
    Object.entries(config.points).forEach(([label, [x, y]]) => {
      const pad = 35;
      const scaledX = Math.max(pad, Math.min(size - pad, x * (size - 2 * pad) / 350 + pad));
      const scaledY = Math.max(pad, Math.min(size - pad, y * (size - 2 * pad) / 350 + pad));

      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", scaledX);
      circle.setAttribute("cy", scaledY);
      circle.setAttribute("r", 12);
      circle.setAttribute("fill", "#333");
      svg.appendChild(circle);

      const text = document.createElementNS(svgNS, "text");
      text.setAttribute("x", scaledX);
      text.setAttribute("y", scaledY + 5);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "16");
      text.setAttribute("fill", "#fff");
      text.setAttribute("font-weight", "bold");
      text.textContent = label;
      svg.appendChild(text);
    });

    return svg;
  }

  async function saveResults() {
    await fetch('/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses: results })
    });
  }

  function nextStep() {
    const container = document.getElementById('mapContainer');
    container.innerHTML = '';
    document.getElementById('questionContainer').style.display = 'none';

    if (currentIndex < randomizedConfigs.length) {
      const config = randomizedConfigs[currentIndex];
      container.innerHTML = `<h2>Map Type: ${config.type}</h2>`;

      // Timer
      let timeLeft = 15;
      const timerDiv = document.createElement('div');
      timerDiv.style.fontSize = "1.5em";
      timerDiv.style.textAlign = "center";
      timerDiv.textContent = `Time left: ${timeLeft}`;
      container.appendChild(timerDiv);

      // Draw map
      container.appendChild(drawMap(config));

      // Countdown
      const interval = setInterval(() => {
        timeLeft--;
        timerDiv.textContent = `Time left: ${timeLeft}`;
        if (timeLeft <= 0) clearInterval(interval);
      }, 1000);

      // After 15 seconds, hide map and show question
      setTimeout(() => {
        clearInterval(interval);
        container.innerHTML = '';
        showQuestion(config);
      }, 15000);
    } else {
      saveResults().then(() => {
        window.location.href = "results.html";
      });
    }
  }

  function showQuestion(config) {
    const container = document.getElementById('mapContainer');
    container.innerHTML = `<h2>Map Type: ${config.type}</h2>`;

    // Randomize point pairs for the question
    const labels = Object.keys(config.points);
    let [from, to] = shuffle([...labels]).slice(0, 2);

    // Compute correct direction
    const [ax, ay] = config.points[from];
    const [bx, by] = config.points[to];
    const correctDir = getDirection(ax, ay, bx, by);

    // Ensure correctDir is in the choices
    let otherDirs = directions.filter(d => d !== correctDir);
    otherDirs = shuffle(otherDirs).slice(0, 3);
    let choices = [correctDir, ...otherDirs];
    choices = shuffle(choices);

    // For debugging: log the correct answer and choices
    console.log(`Q: ${from} vs ${to} | Correct: ${correctDir} | Choices: ${choices.join(', ')}`);

    const schelling = choices[Math.floor(Math.random() * choices.length)];

    // Show question
    const q = document.createElement('div');
    q.innerHTML = `<p><b>Which direction is point <span style="color:blue">${from}</span> in compared to point <span style="color:green">${to}</span>?</b></p>`;
    container.appendChild(q);

    choices.forEach(dir => {
      const btn = document.createElement('button');
      btn.textContent = dir;
      btn.className = 'choice';
      btn.style.margin = '10px';
      btn.style.fontSize = '1.2em';
      btn.style.padding = '10px 20px';
      if (dir === schelling) {
        btn.style.background = '#ffd700';
        btn.style.color = '#222';
        btn.style.border = '2px solid #222';
      }
      btn.onclick = () => {
        let confidence = prompt("Confidence (1-5)?");
        confidence = parseInt(confidence);
        if (isNaN(confidence) || confidence < 1 || confidence > 5) {
          alert("Please enter a number between 1 and 5.");
          return;
        }
        results.push({
          mapType: config.type,
          from, to,
          direction: dir,
          correct: dir === correctDir,
          isSchelling: dir === schelling,
          confidence
        });
        currentIndex++;
        nextStep();
      };
      container.appendChild(btn);
    });
  }

  window.onload = () => {
    const container = document.getElementById('mapContainer');
    if (container) {
      container.innerHTML = "<p>Test started</p>";
      setTimeout(nextStep, 1000);
    }
  };
}