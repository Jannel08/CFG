let shuffledLevels = [];
let currentLevelIndex = 0;
let lives = 3;
let timeLeft = 30;
let timerInterval = null;
let autoAdvanceTimeout = null;
let draggedElement = null;

// Performance Tracking Metrics
const performanceStats = {
  levelsCompleted: 0,
  totalAttempts: 0,
  timeSpentSeconds: 0,
  levelDetails: []
};

let levelStartTime = 0;
let levelAttempts = 0;

// Simple audio effect generator
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn("Audio playback not supported or blocked by browser.", e);
  }
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// FIXED: Handles single-argument tab switching from HTML onclick="switchStartTab('tabId')"
function switchStartTab(evtOrTabId, tabId) {
  let targetTabId = tabId;
  let clickedElement = null;

  if (typeof evtOrTabId === 'string') {
    targetTabId = evtOrTabId;
    if (window.event && window.event.currentTarget) {
      clickedElement = window.event.currentTarget;
    }
  } else {
    clickedElement = evtOrTabId ? (evtOrTabId.currentTarget || evtOrTabId.target) : null;
  }

  // Remove active state from all buttons & contents
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  // Highlight active tab button
  if (clickedElement) {
    clickedElement.classList.add('active');
  } else {
    const defaultBtn = document.querySelector(`.tab-btn[onclick*="${targetTabId}"]`);
    if (defaultBtn) defaultBtn.classList.add('active');
  }

  // Show selected content tab
  const targetTab = document.getElementById(`tab-${targetTabId}`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
}

// Triggered by "START MATRIX OVERRIDE" button
function startGame() {
  const startScreen = document.getElementById('start-screen');
  if (startScreen) {
    startScreen.style.display = 'none';
  }
  
  if (typeof LEVELS === 'undefined') {
    console.error("LEVELS array is not defined. Ensure js/levels.js is correctly loaded.");
    return;
  }
  
  shuffledLevels = shuffleArray(LEVELS);
  currentLevelIndex = 0;
  loadLevel(currentLevelIndex);
}

function loadLevel(index) {
  clearTimeout(autoAdvanceTimeout);
  const level = shuffledLevels[index]; 
  
  lives = 3;
  timeLeft = 30;
  levelAttempts = 0;
  levelStartTime = Date.now();

  updateLivesDisplay();
  document.getElementById('level-title').textContent = `[${index + 1}/${shuffledLevels.length}] ${level.title}`;
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('status').textContent = "";
  
  // CLEAR THE PARSE TREE ON LEVEL LOAD
  document.getElementById('tree-display').innerHTML = "";

  document.getElementById('submit-btn').style.display = "inline-block";
  document.getElementById('submit-btn').disabled = false;
  document.getElementById('next-btn').style.display = "none";

  const validList = document.getElementById('valid-list');
  const invalidList = document.getElementById('invalid-list');
  validList.innerHTML = level.valid.map(s => `<li>"${s}"</li>`).join('');
  invalidList.innerHTML = level.invalid.map(s => `<li>"${s}"</li>`).join('');

  setupPaletteAndSlots(level);
  startTimer();
}

// Balanced Parse Tree Visualizer
function renderParseTree(nodeData) {
  const container = document.getElementById('tree-display');
  if (!container) return;
  container.innerHTML = "";

  if (!nodeData) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'tree-wrapper';
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.margin = '20px 0';

  const nodeElem = document.createElement('div');
  nodeElem.className = 'tree-node';
  nodeElem.textContent = nodeData.name;
  nodeElem.style.border = '1px solid var(--cyan, #00ffff)';
  nodeElem.style.color = 'var(--cyan, #00ffff)';
  nodeElem.style.padding = '4px 12px';
  nodeElem.style.borderRadius = '3px';
  nodeElem.style.background = '#0d1117';
  nodeElem.style.fontWeight = 'bold';

  wrapper.appendChild(nodeElem);

  if (nodeData.children && nodeData.children.length > 0) {
    const branchContainer = document.createElement('div');
    branchContainer.className = 'tree-branches';
    branchContainer.style.display = 'flex';
    branchContainer.style.justifyContent = 'center';
    branchContainer.style.gap = '20px';
    branchContainer.style.marginTop = '15px';
    branchContainer.style.position = 'relative';

    nodeData.children.forEach(child => {
      const childBranch = renderParseTreeBranch(child);
      branchContainer.appendChild(childBranch);
    });

    wrapper.appendChild(branchContainer);
  }

  container.appendChild(wrapper);
}

function renderParseTreeBranch(nodeData) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.position = 'relative';

  // Connecting Line
  const line = document.createElement('div');
  line.style.width = '1px';
  line.style.height = '15px';
  line.style.backgroundColor = 'var(--cyan, #00ffff)';
  line.style.marginBottom = '2px';
  wrapper.appendChild(line);

  const nodeElem = document.createElement('div');
  nodeElem.className = 'tree-node';
  nodeElem.textContent = nodeData.name;
  nodeElem.style.border = '1px solid var(--cyan, #00ffff)';
  nodeElem.style.color = 'var(--cyan, #00ffff)';
  nodeElem.style.padding = '4px 12px';
  nodeElem.style.borderRadius = '3px';
  nodeElem.style.background = '#0d1117';
  nodeElem.style.fontWeight = 'bold';

  wrapper.appendChild(nodeElem);

  if (nodeData.children && nodeData.children.length > 0) {
    const branchContainer = document.createElement('div');
    branchContainer.style.display = 'flex';
    branchContainer.style.justifyContent = 'center';
    branchContainer.style.gap = '15px';
    branchContainer.style.marginTop = '10px';

    nodeData.children.forEach(child => {
      branchContainer.appendChild(renderParseTreeBranch(child));
    });

    wrapper.appendChild(branchContainer);
  }

  return wrapper;
}

function setupPaletteAndSlots(level) {
  const palette = document.getElementById('palette');
  const slotsContainer = document.getElementById('rule-slots-container');
  palette.innerHTML = "";
  slotsContainer.innerHTML = "";

  if (level.blockCategories) {
    level.blockCategories.forEach(category => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'palette-group';
      
      const title = document.createElement('div');
      title.className = 'palette-subtitle';
      title.textContent = category.subtitle;
      groupDiv.appendChild(title);

      const blocksContainer = document.createElement('div');
      blocksContainer.className = 'palette-blocks';

      category.items.forEach(blockVal => {
        const block = document.createElement('div');
        block.className = 'drag-block';
        block.textContent = blockVal;
        block.draggable = true;
        block.addEventListener('dragstart', handleDragStart);
        blocksContainer.appendChild(block);
      });

      groupDiv.appendChild(blocksContainer);
      palette.appendChild(groupDiv);
    });
  }

  for (let r = 0; r < level.rows; r++) {
    const row = document.createElement('div');
    row.className = 'rule-row';

    for (let s = 0; s < level.maxSlotsPerRow; s++) {
      const slot = document.createElement('div');
      slot.className = 'drop-slot';
      slot.addEventListener('dragover', handleDragOver);
      slot.addEventListener('dragleave', handleDragLeave);
      slot.addEventListener('drop', handleDrop);
      slot.addEventListener('click', () => { slot.innerHTML = ""; });

      row.appendChild(slot);
    }
    slotsContainer.appendChild(row);
  }
}

// Drag & Drop Handlers
function handleDragStart(e) {
  draggedElement = e.target;
  e.dataTransfer.setData('text/plain', e.target.textContent);
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  const slot = e.currentTarget;
  slot.classList.remove('drag-over');
  const val = e.dataTransfer.getData('text/plain');
  slot.innerHTML = `<div class="drag-block">${val}</div>`;
}

function readConstructedGrammar() {
  const rows = document.querySelectorAll('.rule-row');
  let rules = [];

  rows.forEach(row => {
    let rowString = "";
    const slots = row.querySelectorAll('.drop-slot');
    slots.forEach(slot => {
      if (slot.firstElementChild) {
        rowString += slot.firstElementChild.textContent.trim();
      }
    });

    if (rowString.trim().length > 0) {
      rules.push(rowString.trim());
    }
  });

  return rules.join('\n');
}

function startTimer() {
  clearInterval(timerInterval);
  const timerElem = document.getElementById('timer');
  const timerDisplay = document.getElementById('timer-display');

  timerInterval = setInterval(() => {
    timeLeft--;
    timerElem.textContent = Math.max(0, timeLeft);

    if (timeLeft <= 5) {
      timerDisplay.classList.add('timer-warning');
    } else {
      timerDisplay.classList.remove('timer-warning');
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleFailure("Time has expired!", true);
    }
  }, 1000);
}

function handleFailure(reason, isTimeExpired = false) {
  playSound('error');
  
  if (!isTimeExpired) {
    lives--;
    timeLeft = Math.max(0, timeLeft - 5);
    document.getElementById('timer').textContent = timeLeft;

    if (timeLeft <= 0) {
      isTimeExpired = true;
    }
  }
  
  levelAttempts++;
  performanceStats.totalAttempts++;
  updateLivesDisplay();

  const status = document.getElementById('status');
  const currentLevel = shuffledLevels[currentLevelIndex];
  const solutionText = currentLevel.expectedPatterns ? currentLevel.expectedPatterns.join(" | ") : "";

  status.style.color = "var(--magenta, #ff0055)";
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 400);

  if (lives <= 0 || isTimeExpired) {
    clearInterval(timerInterval);
    document.getElementById('submit-btn').disabled = true;

    performanceStats.levelDetails.push({
      attempts: levelAttempts,
      timeTaken: isTimeExpired ? "Time Expired" : `${Math.round((Date.now() - levelStartTime) / 1000)}s`,
      passed: false,
      submittedGrammar: readConstructedGrammar(),
      levelTitle: currentLevel.title
    });

    if (typeof TreeRenderer !== 'undefined') {
      TreeRenderer.render(currentLevel.demoTree, document.getElementById('tree-display'), readConstructedGrammar());
    } else {
      renderParseTree(currentLevel.demoTree);
    }

    if (isTimeExpired) {
      status.innerHTML = `
        <strong>Time has expired!</strong><br>
        <span style="color: var(--cyan, #00ffff);">[ Correct Reference: ${solutionText} ]</span><br>
        <span style="color: #fff; font-size: 0.85rem;">Auto-advancing to next level in 5 seconds...</span>
      `;
    } else {
      status.innerHTML = `
        <strong>Out of attempts!</strong><br>
        ${reason}<br>
        <span style="color: var(--cyan, #00ffff);">[ Standard Reference: ${solutionText} ]</span>
      `;
    }

    if (currentLevelIndex < shuffledLevels.length - 1) {
      document.getElementById('next-btn').style.display = "inline-block";
    }

    autoAdvanceTimeout = setTimeout(() => {
      proceedToNextLevel();
    }, 5000);
  } else {
    status.innerHTML = `
      ${reason} <strong style="color: #ff0055;">(-5s Penalty)</strong><br>
      <span style="color: var(--cyan, #00ffff); font-size: 0.85rem;">[ Hint Pattern: ${solutionText} ]</span>
    `;
  }
}

function proceedToNextLevel() {
  clearTimeout(autoAdvanceTimeout);
  currentLevelIndex++;
  if (currentLevelIndex < shuffledLevels.length) {
    loadLevel(currentLevelIndex);
  } else {
    showPerformanceBreakdown();
  }
}

function updateLivesDisplay() {
  document.getElementById('lives-display').innerHTML = `Attempts Remaining: ${'❤️'.repeat(Math.max(0, lives))}`;
}

function toggleDetails(index) {
  const content = document.getElementById(`details-${index}`);
  const icon = document.getElementById(`arrow-${index}`);
  
  if (content.style.display === "none" || !content.style.display) {
    content.style.display = "block";
    icon.textContent = "▼";
  } else {
    content.style.display = "none";
    icon.textContent = "▶";
  }
}

function showPerformanceBreakdown() {
  clearInterval(timerInterval);
  clearTimeout(autoAdvanceTimeout);
  const container = document.querySelector('.game-container');
  
  let rowsHtml = performanceStats.levelDetails.map((lvl, i) => {
    const levelData = shuffledLevels[i] || {};
    const validList = (levelData.valid || []).map(s => `"${s}"`).join(', ');
    const invalidList = (levelData.invalid || []).map(s => `"${s}"`).join(', ');
    const grammarRules = lvl.submittedGrammar || "None submitted";
    const expectedGrammar = (levelData.expectedPatterns || []).join(' | ');

    return `
      <tr style="border-bottom: 1px solid #333;">
        <td style="padding: 10px; vertical-align: top;">
          <div style="font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 8px;" onclick="toggleDetails(${i})">
            <span id="arrow-${i}" style="font-size: 0.8rem; color: var(--cyan, #00ffff);">▶</span>
            <span>Node ${i + 1}: ${levelData.title || ''}</span>
          </div>
          
          <div id="details-${i}" style="display: none; margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px; font-size: 0.85rem; text-align: left;">
            <p style="margin: 3px 0;"><strong>Submitted Grammar:</strong></p>
            <pre style="background: #111; padding: 5px; border-radius: 3px; color: #00ff88; margin: 3px 0 8px 0;">${grammarRules}</pre>
            
            <p style="margin: 3px 0;"><strong>Expected Grammar:</strong> <span style="color: var(--cyan, #00ffff);">${expectedGrammar}</span></p>
            <p style="margin: 3px 0;"><strong>Valid Strings:</strong> <span style="color: #00ff88;">[ ${validList} ]</span></p>
            <p style="margin: 3px 0;"><strong>Invalid Strings:</strong> <span style="color: #ff0055;">[ ${invalidList} ]</span></p>
          </div>
        </td>
        <td style="padding: 10px; vertical-align: top;">${lvl.attempts}</td>
        <td style="padding: 10px; vertical-align: top;">${lvl.timeTaken}</td>
        <td style="padding: 10px; vertical-align: top; color: ${lvl.passed ? '#00ff88' : '#ff0055'}; font-weight: bold;">
          ${lvl.passed ? 'PASSED' : 'FAILED'}
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="panel" style="grid-column: span 3; text-align: center; padding: 30px;">
      <h2 style="color: var(--cyan, #00ffff); margin-bottom: 10px;">MISSION COMPLETE</h2>
      <p style="font-size: 1.2rem; margin-bottom: 20px;">Grammar Matrix Override Finished!</p>
      
      <table style="width: 100%; max-width: 700px; margin: 0 auto 20px auto; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 2px solid var(--cyan, #00ffff);">
            <th style="padding: 10px;">Node Details (Click ▶ to expand)</th>
            <th style="padding: 10px;">Attempts</th>
            <th style="padding: 10px;">Time</th>
            <th style="padding: 10px;">Result</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="font-size: 1.1rem; margin-bottom: 20px;">
        <strong>Total Time:</strong> ${performanceStats.timeSpentSeconds}s | 
        <strong>Total Attempts:</strong> ${performanceStats.totalAttempts}
      </div>

      <button onclick="location.reload()" style="padding: 10px 25px; font-size: 1rem; cursor: pointer;">Restart System</button>
    </div>
  `;
}

// Controls Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.getElementById('clear-btn');
  const submitBtn = document.getElementById('submit-btn');
  const nextBtn = document.getElementById('next-btn');

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.querySelectorAll('.drop-slot').forEach(slot => slot.innerHTML = "");
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (lives <= 0) return;

      const constructedGrammar = readConstructedGrammar();
      const currentLevel = shuffledLevels[currentLevelIndex];
      
      if (typeof GrammarValidator === 'undefined') {
        console.error("GrammarValidator is not loaded. Check js/parser.js.");
        return;
      }

      const result = GrammarValidator.validateUserGrammar(constructedGrammar, currentLevel);
      const status = document.getElementById('status');

      if (result.success) {
        levelAttempts++;
        performanceStats.totalAttempts++;
        clearInterval(timerInterval);
        playSound('success');
        
        const timeTakenSec = Math.round((Date.now() - levelStartTime) / 1000);
        performanceStats.timeSpentSeconds += timeTakenSec;
        performanceStats.levelsCompleted++;
        performanceStats.levelDetails.push({
          attempts: levelAttempts,
          timeTaken: `${timeTakenSec}s`,
          passed: true,
          submittedGrammar: constructedGrammar,
          levelTitle: currentLevel.title
        });

        status.style.color = "var(--green, #00ff88)";
        status.textContent = result.message;

        if (typeof TreeRenderer !== 'undefined') {
          TreeRenderer.render(result.tree || currentLevel.demoTree, document.getElementById('tree-display'), constructedGrammar);
        } else {
          renderParseTree(result.tree || currentLevel.demoTree);
        }

        if (currentLevelIndex < shuffledLevels.length - 1) {
          document.getElementById('next-btn').style.display = "inline-block";
          document.getElementById('submit-btn').style.display = "none";
        } else {
          status.textContent = "All nodes overridden! Generating performance report...";
          setTimeout(showPerformanceBreakdown, 1500);
        }
      } else {
        handleFailure(result.message);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      proceedToNextLevel();
    });
  }
});