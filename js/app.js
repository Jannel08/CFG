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
const MAX_LIVES = 3;

// Web Audio API Synthesizer for Sound Effects
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;

    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start();
      osc.stop(now + 0.2);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.3);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'gameover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(320, now + 0.12);
      osc.frequency.setValueAtTime(250, now + 0.24);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (e) {
    console.warn("Audio playback not supported or blocked by browser.", e);
  }
}

// Web Audio API Synthesizer for Among Us Start Sound
function playAmongUsStartSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(200, now + 0.4);

    osc2.frequency.setValueAtTime(155, now);
    osc2.frequency.exponentialRampToValueAtTime(605, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(205, now + 0.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  } catch (e) {
    console.warn("Start sound blocked or unsupported.", e);
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

  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  if (clickedElement) {
    clickedElement.classList.add('active');
  } else {
    const defaultBtn = document.querySelector(`.tab-btn[onclick*="${targetTabId}"]`);
    if (defaultBtn) defaultBtn.classList.add('active');
  }

  const targetTab = document.getElementById(`tab-${targetTabId}`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
}

function startGame() {
  playAmongUsStartSound();

  const startScreen = document.getElementById('start-screen');
  if (startScreen) {
    startScreen.style.opacity = '0';
    setTimeout(() => {
      startScreen.style.display = 'none';
    }, 300);
  }
  
  if (typeof LEVELS === 'undefined') {
    console.error("LEVELS array is not defined. Ensure js/levels.js is correctly loaded.");
    return;
  }
  
  shuffledLevels = shuffleArray(LEVELS);
  currentLevelIndex = 0;
  loadLevel(currentLevelIndex);
}

function updateLivesDisplay() {
  const livesContainer = document.getElementById('lives-display');
  if (!livesContainer) return;

  let heartsHtml = '';
  for (let i = 0; i < MAX_LIVES; i++) {
    if (i < lives) {
      heartsHtml += `<span class="heart active">❤️</span>`;
    } else {
      heartsHtml += `<span class="heart broken">💔</span>`;
    }
  }

  livesContainer.innerHTML = `Attempts Remaining: ${heartsHtml}`;
}

function loadLevel(index) {
  clearTimeout(autoAdvanceTimeout);
  const level = shuffledLevels[index]; 
  
  lives = 3;
  timeLeft = 30;
  levelAttempts = 0;
  levelStartTime = Date.now();

  updateLivesDisplay();
  
  const cleanTitle = (level.title || '').replace(/^Level\s*\d+:\s*/i, '');
  document.getElementById('level-title').textContent = `[${index + 1}/${shuffledLevels.length}] ${cleanTitle}`;
  document.getElementById('timer').textContent = timeLeft;
  document.getElementById('status').textContent = "";
  
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
      branchContainer.appendChild(renderParseTreeBranch(child));
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

  document.body.classList.remove('shake');
  void document.body.offsetWidth;
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 400);

  if (lives <= 0 || isTimeExpired) {
    playSound('gameover');
    clearInterval(timerInterval);
    document.getElementById('submit-btn').disabled = true;

    performanceStats.levelDetails.push({
      attempts: levelAttempts,
      timeTaken: isTimeExpired ? "Time Expired" : `${Math.round((Date.now() - levelStartTime) / 1000)}s`,
      passed: false,
      submittedGrammar: readConstructedGrammar(),
      derivation: "",
      levelData: currentLevel
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
    playSound('error');
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

  // Hide HUD elements
  const mainHeader = document.querySelector('.main-header-title');
  if (mainHeader) mainHeader.style.display = 'none';

  const hudHeader = document.querySelector('.hud');
  if (hudHeader) hudHeader.style.display = 'none';

  const container = document.querySelector('.game-container');

  // --- 1. Calculate Performance Metrics & Score ---
  const totalLevels = performanceStats.levelDetails.length;
  const passedLevels = performanceStats.levelsCompleted;
  const passRate = totalLevels > 0 ? (passedLevels / totalLevels) * 100 : 0;

  let totalScore = 0;
  performanceStats.levelDetails.forEach(lvl => {
    if (lvl.passed) {
      const timeSec = parseInt(lvl.timeTaken) || 30;
      const timeRemaining = Math.max(0, 30 - timeSec);
      const attemptPenalty = (lvl.attempts - 1) * 15;
      totalScore += Math.max(10, 100 + timeRemaining - attemptPenalty);
    }
  });

  // Grade Ranking
  let rankGrade = 'F';
  let rankTitle = 'System Corrupted';
  if (passRate === 100 && totalScore >= 1600) { rankGrade = 'S'; rankTitle = 'Master Syntactician'; }
  else if (passRate >= 80) { rankGrade = 'A'; rankTitle = 'Senior Grammar Architect'; }
  else if (passRate >= 60) { rankGrade = 'B'; rankTitle = 'Compiler Engineer'; }
  else if (passRate >= 40) { rankGrade = 'C'; rankTitle = 'Syntax Technician'; }

  // Dynamic Mission State
  const isSuccess = passRate >= 60;
  const headerText = isSuccess ? "MISSION COMPLETE" : "MISSION FAILED";
  const statusSubtitle = isSuccess 
    ? "Grammar Matrix Override Successful!" 
    : "System Compromised — Insufficient Valid Grammars";
  const stateClass = isSuccess ? "perf-success" : "perf-failed";

  // --- 2. Build Level Rows ---
  let rowsHtml = performanceStats.levelDetails.map((lvl, i) => {
    const levelData = lvl.levelData || {};
    const validList = (levelData.valid || []).map(s => `"${s}"`).join(', ');
    const invalidList = (levelData.invalid || []).map(s => `"${s}"`).join(', ');
    const grammarRules = lvl.submittedGrammar || "None submitted";
    const expectedGrammar = (levelData.expectedPatterns || []).join(' | ');

    const rawTitle = levelData.title || lvl.levelTitle || 'Unknown Level';
    const cleanTitle = rawTitle.replace(/^Level\s*\d+:\s*/i, '');

    let derivationFormatted = "N/A";
    if (lvl.derivation) {
      derivationFormatted = lvl.derivation.replace(/<br\s*\/?>/gi, '\n');
    }

    return `
      <tr class="perf-row">
        <td style="padding: 12px; vertical-align: top;">
          <div class="perf-level-title" onclick="toggleDetails(${i})">
            <span id="arrow-${i}" class="perf-arrow">▶</span>
            <span style="color: var(--cyan, #00ffff); font-weight: bold; margin-right: 6px;">Level ${i + 1}:</span>
            <span style="color: #fff;">${cleanTitle}</span>
          </div>
          
          <div id="details-${i}" class="perf-details-panel">
            <div class="perf-detail-group">
              <span class="perf-label">Active Production Rule:</span>
              <pre class="perf-code-block">${grammarRules}</pre>
            </div>

            <div class="perf-detail-group">
              <span class="perf-label">Derivation Steps:</span>
              <pre class="perf-code-block perf-derivation">${derivationFormatted}</pre>
            </div>
            
            <div class="perf-detail-group">
              <span class="perf-label">Expected Grammar:</span> 
              <span style="color: var(--cyan, #00ffff); font-weight: bold;">${expectedGrammar}</span>
            </div>

            <div class="perf-detail-group">
              <span class="perf-label">Valid Strings:</span> 
              <span style="color: #00ff88;">[ ${validList} ]</span>
            </div>

            <div class="perf-detail-group">
              <span class="perf-label">Invalid Strings:</span> 
              <span style="color: #ff0055;">[ ${invalidList} ]</span>
            </div>
          </div>
        </td>
        <td style="padding: 12px; vertical-align: top; text-align: center;">${lvl.attempts}</td>
        <td style="padding: 12px; vertical-align: top; text-align: center;">${lvl.timeTaken}</td>
        <td style="padding: 12px; vertical-align: top; text-align: center; color: ${lvl.passed ? '#00ff88' : '#ff0055'}; font-weight: bold;">
          ${lvl.passed ? 'PASSED' : 'FAILED'}
        </td>
      </tr>
    `;
  }).join('');

  // --- 3. Render Output HTML ---
  container.innerHTML = `
    <div class="panel perf-container ${stateClass}">
      <div class="perf-header-box">
        <h2 class="perf-main-heading">${headerText}</h2>
        <p class="perf-sub-heading">${statusSubtitle}</p>
      </div>

      <div class="perf-rank-card">
        <div class="perf-rank-badge">${rankGrade}</div>
        <div class="perf-rank-info">
          <div class="perf-rank-title">${rankTitle}</div>
          <div class="perf-rank-score">Final Score: <span>${totalScore}</span> pts</div>
        </div>
      </div>
      
      <div class="perf-table-wrapper">
        <table class="perf-table">
          <thead>
            <tr>
              <th>Level Details (Click ▶ to expand)</th>
              <th style="text-align: center;">Attempts</th>
              <th style="text-align: center;">Time</th>
              <th style="text-align: center;">Result</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div class="perf-summary-bar">
        <span><strong>Cleared:</strong> ${passedLevels} / ${totalLevels}</span>
        <span class="perf-separator">|</span>
        <span><strong>Total Time:</strong> ${performanceStats.timeSpentSeconds}s</span>
        <span class="perf-separator">|</span>
        <span><strong>Total Attempts:</strong> ${performanceStats.totalAttempts}</span>
      </div>

      <button class="perf-restart-btn" onclick="location.reload()">REBOOT SYSTEM</button>
    </div>
  `;
}

// Event Listeners initialization
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
      const currentLevel = shuffledLevels[currentLevelIndex];
      const constructedGrammar = readConstructedGrammar();
      const status = document.getElementById('status');

      if (typeof GrammarValidator === 'undefined') {
        console.error("GrammarValidator is missing.");
        return;
      }

      const result = GrammarValidator.validate(constructedGrammar, currentLevel);
      const treeContainer = document.getElementById('tree-display');

      if (result.tree) {
        if (typeof TreeRenderer !== 'undefined') {
          TreeRenderer.render(result.tree, treeContainer);
        } else if (typeof renderParseTree === 'function') {
          renderParseTree(result.tree);
        }
      }

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
          derivation: result.derivation || "",
          levelData: currentLevel
        });

        if (status) {
          status.style.color = "var(--green, #00ff88)";
          status.innerHTML = `
            <div class="success-message">
              <strong>${result.message}</strong>
            </div>
            <div class="production-rules-box" style="margin-top: 10px; padding: 10px; background: rgba(0, 255, 136, 0.08); border: 1px solid var(--green, #00ff88); border-radius: 4px; text-align: left;">
              <div style="font-size: 0.85rem; color: #aaa; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">Constructed Production Rule:</div>
              <code style="font-size: 1.1rem; color: var(--green, #00ff88); font-weight: bold;">${constructedGrammar}</code>
              
              <div style="font-size: 0.85rem; color: #aaa; margin-top: 8px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px;">Derivation Steps:</div>
              <code style="font-size: 1rem; color: var(--cyan, #00ffff); font-weight: bold;">${result.derivation || ''}</code>
            </div>
          `;
        }

        if (currentLevelIndex < shuffledLevels.length - 1) {
          document.getElementById('next-btn').style.display = "inline-block";
          document.getElementById('submit-btn').style.display = "none";
        } else {
          setTimeout(() => {
            if (status) {
              status.innerHTML += `<div style="margin-top: 8px; color: var(--cyan, #00ffff);">All levels completed! Generating performance report...</div>`;
            }
          }, 500);
          setTimeout(showPerformanceBreakdown, 2000);
        }
      } else {
        levelAttempts++;
        performanceStats.totalAttempts++;
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
