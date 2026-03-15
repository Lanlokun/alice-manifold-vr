// Alice Manifold VR Research Suite - Main Application
// ================================================

// DOM Elements
const elements = {
    audio: null,
    timeline: null,
    volume: null,
    driftDisplay: null,
    peakDisplay: null,
    velocityDisplay: null,
    milestoneLabel: null,
    brainShell: null,
    brainSystem: null,
    traceContainer: null,
    cursorsContainer: null,
    vizContainer: null,
    playBtn: null
};

// Application State
let subjectData = [];
let stimulusMeta = {
    name: null,
    duration: 0
};
let driftHistory = [];
const maxHistory = 40; // Number of TRs to display on the graph

// Multi-Subject Registry
let subjects = {};          // { filename: subjectArray }
let activeSubjectId = 'subject18'; // Matches your config ID

// Constants
const trDuration = 1.5;
const barCount = 32;

// State Management
let state = { 
    seeking: false, 
    lastPos: {}, // Store last positions for all visible subjects
    lastTR: -1, 
    peakDrift: 0, 
    shellVisible: true 
};

// Web Audio Variables
let audioCtx, analyser, dataArray, source;
const bars = [];

// Initialize DOM Elements
function initializeElements() {
    elements.audio = document.getElementById('aliceAudio');
    elements.timeline = document.getElementById('timeline');
    elements.volume = document.getElementById('volumeControl');
    elements.driftDisplay = document.getElementById('drift-val');
    elements.peakDisplay = document.getElementById('drift-peak');
    elements.velocityDisplay = document.getElementById('velocity-val');
    elements.milestoneLabel = document.getElementById('milestone-text');
    elements.brainShell = document.getElementById('brain-shell');
    elements.brainSystem = document.getElementById('brain-system');
    elements.traceContainer = document.getElementById('trace-container');
    elements.cursorsContainer = document.getElementById('cursors-container');
    elements.vizContainer = document.getElementById('audio-viz');
    elements.playBtn = document.getElementById('playBtn');
}
// Add to app.js
function renderGhostPath(subjectData, currentTR) {
    const LOOK_AHEAD = 10; // Predict the next 10 TRs (15 seconds)
    const ghostContainer = document.getElementById('trace-container');
    
    // Clear only previous ghost markers to prevent cluttering
    const oldGhosts = document.querySelectorAll('.ghost-marker');
    oldGhosts.forEach(g => g.remove());

    for (let i = 1; i <= LOOK_AHEAD; i++) {
        let futureTR = currentTR + i;
        if (futureTR < subjectData.length) {
            const data = subjectData[futureTR];
            const ghostVoxel = document.createElement('a-octahedron'); // Different shape for AI
            
            ghostVoxel.setAttribute('class', 'ghost-marker');
            ghostVoxel.setAttribute('position', `${data.xllm_vr} ${data.yllm_vr} ${data.zllm_vr}`);
            ghostVoxel.setAttribute('radius', '0.02');
            ghostVoxel.setAttribute('material', {
                color: '#FFD700',
                opacity: 0.4 - (i * 0.03), // Fades out as it goes further into the future
                transparent: true,
                emissive: '#FFD700',
                emissiveIntensity: 2
            });
            
            ghostContainer.appendChild(ghostVoxel);
        }
    }
}
// Subject Management
let visibleSubjects = new Set(); // Track which subjects are visible

function initializeSubjects() {
    const subjects = SUBJECTS_CONFIG.getAllSubjects();
    
    // Clear existing cursors and subject list
    elements.cursorsContainer.innerHTML = '';
    const subjectList = document.getElementById('subject-list');
    subjectList.innerHTML = '';
    
    // Create cursor entities and UI for each subject
    subjects.forEach(subject => {
        // Create 3D cursor
        const cursor = document.createElement('a-sphere');
        cursor.setAttribute('id', subject.id);
        cursor.setAttribute('radius', subject.radius);
        cursor.setAttribute('material', {
            color: subject.color,
            emissive: subject.emissive,
            emissiveIntensity: 20
        });
        cursor.setAttribute('visible', 'true');
        elements.cursorsContainer.appendChild(cursor);
        
        // Add to visible subjects
        visibleSubjects.add(subject.id);
        
        // Create UI item
        const subjectItem = createSubjectUIItem(subject);
        subjectList.appendChild(subjectItem);
    });
}

function createSubjectUIItem(subject) {
    const item = document.createElement('div');
    item.className = 'subject-item';
    item.id = `subject-ui-${subject.id}`;
    item.style.borderLeftColor = subject.color;
    
    item.innerHTML = `
        <div class="subject-info">
            <div class="subject-color-indicator" style="background: ${subject.color}"></div>
            <div class="subject-name">${subject.name}</div>
        </div>
        <div class="subject-controls">
            <button class="subject-btn" onclick="toggleSubject('${subject.id}')">Hide</button>
            <button class="subject-btn remove" onclick="removeSubject('${subject.id}')">Remove</button>
        </div>
    `;
    
    return item;
}

function toggleSubject(subjectId) {
    const subject = SUBJECTS_CONFIG.getSubject(subjectId);
    const cursor = document.getElementById(subjectId);
    const uiItem = document.getElementById(`subject-ui-${subjectId}`);
    const toggleBtn = uiItem.querySelector('.subject-btn');
    
    if (visibleSubjects.has(subjectId)) {
        // Hide subject
        visibleSubjects.delete(subjectId);
        cursor.setAttribute('visible', 'false');
        uiItem.classList.add('hidden');
        toggleBtn.textContent = 'Show';
    } else {
        // Show subject
        visibleSubjects.add(subjectId);
        cursor.setAttribute('visible', 'true');
        uiItem.classList.remove('hidden');
        toggleBtn.textContent = 'Hide';
    }
}

function removeSubject(subjectId) {
    if (confirm(`Remove ${subjectId.replace('subject', 'Subject ')} from the visualization?`)) {
        // Remove from configuration
        SUBJECTS_CONFIG.removeSubject(subjectId);
        
        // Remove cursor
        const cursor = document.getElementById(subjectId);
        if (cursor) cursor.remove();
        
        // Remove UI item
        const uiItem = document.getElementById(`subject-ui-${subjectId}`);
        if (uiItem) uiItem.remove();
        
        // Remove from visible subjects
        visibleSubjects.delete(subjectId);
        
        elements.milestoneLabel.innerText = `REMOVED: ${subjectId}`;
    }
}

function toggleAllSubjects() {
    const subjects = SUBJECTS_CONFIG.getAllSubjects();
    const allVisible = visibleSubjects.size === subjects.length;
    
    subjects.forEach(subject => {
        if (allVisible) {
            // Hide all
            if (visibleSubjects.has(subject.id)) {
                toggleSubject(subject.id);
            }
        } else {
            // Show all
            if (!visibleSubjects.has(subject.id)) {
                toggleSubject(subject.id);
            }
        }
    });
}

function showAddSubjectDialog() {
    document.getElementById('add-subject-dialog').style.display = 'flex';
    
    // Set default values
    const newSubjectId = SUBJECTS_CONFIG.getAllSubjects().length + 1;
    document.getElementById('new-subject-id').value = newSubjectId;
    document.getElementById('new-subject-name').value = `Subject ${newSubjectId}`;
    document.getElementById('new-subject-prefix').value = `${newSubjectId}_vr`;
    
    // Generate a random color
    const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff8800', '#8800ff', '#00ff88'];
    const randomColor = colors[newSubjectId % colors.length];
    document.getElementById('new-subject-color').value = randomColor;
}

function hideAddSubjectDialog() {
    document.getElementById('add-subject-dialog').style.display = 'none';
}

function addNewSubject() {
    const subjectId = document.getElementById('new-subject-id').value.trim();
    const subjectName = document.getElementById('new-subject-name').value.trim();
    const subjectColor = document.getElementById('new-subject-color').value;
    const subjectPrefix = document.getElementById('new-subject-prefix').value.trim();
    
    if (!subjectId || !subjectName || !subjectPrefix) {
        alert('Please fill in all fields');
        return;
    }
    
    // Create new subject configuration
    const newSubject = {
        id: `subject${subjectId}`,
        name: subjectName,
        color: subjectColor,
        emissive: subjectColor,
        radius: 0.045,
        dataPrefix: subjectPrefix
    };
    
    // Add to configuration
    SUBJECTS_CONFIG.addSubject(newSubject);
    
    // Create cursor
    const cursor = document.createElement('a-sphere');
    cursor.setAttribute('id', newSubject.id);
    cursor.setAttribute('radius', newSubject.radius);
    cursor.setAttribute('material', {
        color: newSubject.color,
        emissive: newSubject.emissive,
        emissiveIntensity: 20
    });
    cursor.setAttribute('visible', 'true');
    elements.cursorsContainer.appendChild(cursor);
    
    // Add to visible subjects
    visibleSubjects.add(newSubject.id);
    
    // Create UI item
    const subjectItem = createSubjectUIItem(newSubject);
    document.getElementById('subject-list').appendChild(subjectItem);
    
    // Close dialog
    hideAddSubjectDialog();
    
    elements.milestoneLabel.innerText = `ADDED: ${newSubject.name}`;
}

// Upload Triggers
function triggerAudioUpload() {
    document.getElementById("audioInput").click();
}

function triggerDataUpload() {
    document.getElementById("dataInput").click();
}

// Stimulus Loader
function loadStimulus(file) {
    const url = URL.createObjectURL(file);
    elements.audio.src = url;
    elements.audio.load();

    stimulusMeta.name = file.name;

    elements.audio.onloadedmetadata = () => {
        stimulusMeta.duration = elements.audio.duration;
        elements.timeline.max = Math.floor(elements.audio.duration / trDuration);
        elements.milestoneLabel.innerText = `STIMULUS LOADED: ${file.name}`;
    };
}

// Subject Loader
function loadSubject(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);
            const data = Array.isArray(parsed) ? parsed : parsed.data;

            subjects[file.name] = data; 
            activeSubject = file.name;
            subjectData = data;

            resetVisualization();
            
            elements.timeline.max = subjectData.length - 1;
            elements.milestoneLabel.innerText = `SUBJECT LOADED: ${file.name}`;
        } catch (err) {
            alert("Invalid subject JSON format");
        }
    };
    reader.readAsText(file);
}

function resetVisualization() {
    elements.traceContainer.innerHTML = "";
    state.lastTR = -1;
    state.lastPos = {}; // Reset all last positions
    state.peakDrift = 0;
}

// Audio Engine
function initAudioEngine() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        
        // This connects the HTML5 audio element to the Web Audio graph
        source = audioCtx.createMediaElementSource(elements.audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        analyser.fftSize = 64;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
    }

    // Force wake up
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Initialize Visualization Bars
function initializeVisualizationBars() {
    for(let i = 0; i < barCount; i++) {
        let bar = document.createElement('div');
        bar.className = 'viz-bar';
        elements.vizContainer.appendChild(bar);
        bars.push(bar);
    }
}

// Main Simulation Loop
let isLoopRunning = false; // Add to top of app.js

function simulationLoop() {
    if (!subjectData || !subjectData.length) return;
    
    isLoopRunning = true; // Mark as running

    try {
        updateAudioVisualization();
        updateDataVisualization();
    } catch (err) {
        console.warn("Loop error caught:", err);
    }
    
    // The browser handles the timing here
    requestAnimationFrame(simulationLoop);
}

function updateAudioVisualization() {
    if(analyser && !elements.audio.paused) {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        
        for(let i = 0; i < barCount; i++) {
            let val = dataArray[i] / 2.5;
            bars[i].style.height = `${val}px`;
            bars[i].style.backgroundColor = (elements.driftDisplay.innerText > 0.05) ? '#ff0055' : '#00f2ff';
            sum += dataArray[i];
        }
        
        updateBrainShellPulse(sum);
    }
}

function updateBrainShellPulse(sum) {
    if (state.shellVisible) {
        let avg = sum / barCount;
        let pulse = avg / 255;
        elements.brainShell.setAttribute('material', 'opacity', 0.08 + (pulse * 0.15));
        elements.brainShell.setAttribute('material', 'emissiveIntensity', 0.5 + (pulse * 3));
    }
}

function updateDataVisualization() {
    // 1. Calculate TR based on audio time
    let tr = Math.floor(elements.audio.currentTime / trDuration);

    if(subjectData && subjectData[tr]) {
        const d = subjectData[tr];
        
        updateTimelineDisplay(tr);

        // 2. MOVE LLM MASTER (The Silicon Mirror)
        const llmMaster = document.getElementById('llm-master');
        if (llmMaster && d.xllm_vr !== undefined) {
            // Using your specific merged keys: xllm_vr, yllm_vr, zllm_vr
            llmMaster.setAttribute('position', {
                x: d.xllm_vr,
                y: d.yllm_vr,
                z: d.zllm_vr
            });
        }

        // 3. MOVE HUMAN SUBJECTS (The Carbon Path)
        updateCursorPositions(d);
        
        // 4. ALIGNMENT ANALYSIS
        updateDriftAnalysis(d, tr);
        
        if (!elements.audio.paused && !state.seeking) {
            dropVoxels(d);
            // Predictions based on the next TRs in this merged file
            renderGhostPath(subjectData, tr);
        }
    }
}
function updateTimelineDisplay(tr) {
    if (!elements.audio.paused && !state.seeking) {
        elements.timeline.value = tr;
        document.getElementById('current-tr').innerText = `TR ${tr}`;
        document.getElementById('current-time').innerText = new Date(elements.audio.currentTime * 1000).toISOString().substr(14, 5);
    }
}

function updateCursorPositions(dataPoint) {
    const subjectsList = SUBJECTS_CONFIG.getAllSubjects();
    
    subjectsList.forEach(subject => {
        if (!visibleSubjects.has(subject.id)) return;
        
        const fields = SUBJECTS_CONFIG.getDataFields(subject);
        const cursor = document.getElementById(subject.id);
        
        // DEBUG: Log one time to see if keys match
        if (state.lastTR === -1) {
             console.log(`Checking ${subject.id}: looking for key ${fields.x}. Found value:`, dataPoint[fields.x]);
        }

        if (cursor && dataPoint[fields.x] !== undefined) {
            cursor.setAttribute('position', {
                x: parseFloat(dataPoint[fields.x]),
                y: parseFloat(dataPoint[fields.y]),
                z: parseFloat(dataPoint[fields.z])
            });
        } else {
            // If the data is missing, move it far away so it doesn't clutter the center
            if (cursor) cursor.setAttribute('position', '0 -10 0');
        }
    });
}

function updateDriftAnalysis(d, tr) {
    if (!d) return;

    let maxDrift = 0;
    let furthestSubjectId = 'subject18';
    
    // 1. Find Max Drift (Existing logic is fine)
    visibleSubjects.forEach(id => {
        if (id === 'subject0_llm') return;
        const s = SUBJECTS_CONFIG.getSubject(id);
        const f = SUBJECTS_CONFIG.getDataFields(s);
        if (d[f.x] !== undefined) {
            const dist = Math.sqrt(
                Math.pow(d.xllm_vr - d[f.x], 2) +
                Math.pow(d.yllm_vr - d[f.y], 2) +
                Math.pow(d.zllm_vr - d[f.z], 2)
            );
            if (dist > maxDrift) {
                maxDrift = dist;
                furthestSubjectId = id;
            }
        }
    });

    // 2. ONLY CALCULATE VELOCITY WHEN THE DATA STEPS (TR change)
    if (tr !== state.lastTR) {
        const s = SUBJECTS_CONFIG.getSubject(furthestSubjectId);
        const f = SUBJECTS_CONFIG.getDataFields(s);
        const currentPos = { x: d[f.x], y: d[f.y], z: d[f.z] };

        // Ensure state.lastPos exists
        if (!state.lastPos) state.lastPos = {};

        if (state.lastPos[furthestSubjectId]) {
            const last = state.lastPos[furthestSubjectId];
            const vel = Math.sqrt(
                Math.pow(currentPos.x - last.x, 2) +
                Math.pow(currentPos.y - last.y, 2) +
                Math.pow(currentPos.z - last.z, 2)
            );
            
            // Update the display only on the step
            elements.velocityDisplay.innerText = vel.toFixed(5);
        }
        
        // UPDATE CACHE FOR NEXT STEP
        state.lastPos[furthestSubjectId] = currentPos;
        
        // --- History Logic ---
        driftHistory.push(maxDrift);
        if (driftHistory.length > maxHistory) driftHistory.shift();
        renderDriftGraph();
        
        state.lastTR = tr; // Move this to the end of the block
    }

    // 3. UI Updates (Every Frame)
    activeSubjectId = furthestSubjectId;
    elements.driftDisplay.innerText = maxDrift.toFixed(5);
    
    if (maxDrift > state.peakDrift) {
        state.peakDrift = maxDrift;
        elements.peakDisplay.innerText = state.peakDrift.toFixed(5);
    }

    if (maxDrift > 1.5) {
        elements.milestoneLabel.innerHTML = `<span style="color: #ff4d00;">HIGH DIVERGENCE</span>`;
        renderTether(d);
    } else {
        elements.milestoneLabel.innerText = "ALIGNED";
    }
}


function renderDriftGraph() {
    const canvas = document.getElementById('driftCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = '#00f2ff';
    ctx.lineWidth = 2;

    const step = canvas.width / (maxHistory - 1);
    driftHistory.forEach((val, i) => {
        // Map drift value to canvas height (assuming max drift of 3.0)
        const y = canvas.height - (val / 3.0) * canvas.height;
        const x = i * step;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
}



// VR Rendering Functions
function dropVoxels(d) {
    // Only drop if the High Divergence alert is currently active
    const userThreshold = parseFloat(elements.thresholdSlider.value);
    const currentDrift = parseFloat(elements.driftDisplay.innerText);
    
    if (currentDrift < userThreshold) return; 

    const subject = SUBJECTS_CONFIG.getSubject(activeSubjectId);
    const f = SUBJECTS_CONFIG.getDataFields(subject);

    // Create the Voxel entity
    const voxel = document.createElement('a-box');
    voxel.setAttribute('width', '0.02');
    voxel.setAttribute('height', '0.02');
    voxel.setAttribute('depth', '0.02');
    
    // Position it at the outlier's current coordinates (with your offsets)
    voxel.setAttribute('position', {
        x: d[f.x] - (MANIFOLD_OFFSETS.x || 0),
        y: d[f.y] - (MANIFOLD_OFFSETS.y || 0),
        z: d[f.z] - (MANIFOLD_OFFSETS.z || 0)
    });

    // Material: Glowing Red for errors
    voxel.setAttribute('material', {
        color: '#ff4d00',
        emissive: '#ff4d00',
        emissiveIntensity: 2,
        opacity: 0.7,
        transparent: true
    });

    // Add to your 3D container
    elements.traceContainer.appendChild(voxel);

    // PERSISTENCE: They stay for 30 seconds so you can see the "cloud"
    setTimeout(() => {
        if (voxel.parentNode) voxel.parentNode.removeChild(voxel);
    }, 30000);
}

function dropVoxel(x, y, z, color) {
    let p = document.createElement('a-box');
    p.setAttribute('position', `${x} ${y} ${z}`);
    p.setAttribute('scale', '0.006 0.006 0.006');
    p.setAttribute('material', {
        color: color, 
        emissive: color, 
        emissiveIntensity: 3, 
        opacity: 0.5, 
        transparent: true
    });
    p.setAttribute('animation', 'property: scale; to: 0 0 0; dur: 8000; easing: linear');
    elements.traceContainer.appendChild(p);
    setTimeout(() => { if(p.parentNode) p.parentNode.removeChild(p); }, 8000); 
}

function renderTether(d) {
    const subject = SUBJECTS_CONFIG.getSubject(activeSubjectId);
    const fields = SUBJECTS_CONFIG.getDataFields(subject);

    let line = document.createElement('a-entity');
    line.setAttribute('line', {
        start: `${d.xllm_vr} ${d.yllm_vr} ${d.zllm_vr}`, 
        end: `${d[fields.x]} ${d[fields.y]} ${d[fields.z]}`, 
        color: '#FFD700', // Silicon Gold
        opacity: 0.6 
    });
    elements.traceContainer.appendChild(line);
    setTimeout(() => { if(line.parentNode) line.parentNode.removeChild(line); }, 50);
}

// Control Functions
function setSpeed(multiplier) {
    elements.audio.playbackRate = multiplier;
}

function toggleShell() {
    state.shellVisible = !state.shellVisible; 
    elements.brainShell.setAttribute('visible', state.shellVisible); 
    document.getElementById('brain-core').setAttribute('visible', state.shellVisible);
}

function takeScreenshot() {
    document.querySelector('a-scene').components.screenshot.capture('perspective');
    elements.milestoneLabel.innerText = "CAPTION SAVED";
}

function exportSession() {
    const data = { 
        tr: Math.floor(elements.audio.currentTime / trDuration), 
        peak: state.peakDrift, 
        vel: elements.velocityDisplay.innerText 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Alice_Research_TR${data.tr}.json`;
    a.click();
}

function importSession(e) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const data = JSON.parse(ev.target.result);
        if (data.tr !== undefined) jumpTo(data.tr);
        if (data.peak !== undefined) { 
            state.peakDrift = data.peak; 
            elements.peakDisplay.innerText = state.peakDrift.toFixed(5); 
        }
    };
    reader.readAsText(e.target.files[0]);
}

function jumpTo(tr) {
    elements.audio.currentTime = tr * trDuration; 
    elements.traceContainer.innerHTML = ''; 
    elements.audio.play(); 
}

function resetSim() {
    elements.audio.pause(); 
    elements.audio.currentTime = 0; 
    state.peakDrift = 0; 
    state.lastPos = {}; // Reset all last positions
    state.lastTR = -1;
    elements.peakDisplay.innerText = "0.0000"; 
    elements.velocityDisplay.innerText = "0.0000"; 
    elements.traceContainer.innerHTML = ''; 
}

// Event Listeners Setup
function setupEventListeners() {
    // Audio input
    document.getElementById("audioInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) loadStimulus(file);
    });

    // Data input
    document.getElementById("dataInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) loadSubject(file);
    });

    // Play button
elements.playBtn.addEventListener('click', function() {
    // 1. Initialize and/or Resume the Audio Context
    initAudioEngine();
    
    // 2. Wrap the play call in the resume promise
    audioCtx.resume().then(() => {
        if (elements.audio.paused) {
            elements.audio.play().then(() => {
                this.innerText = "PAUSE SYNC";
                // Start the loop if it's not running
                requestAnimationFrame(simulationLoop);
            }).catch(err => {
                console.error("Playback failed:", err);
                elements.milestoneLabel.innerText = "ERROR: CLICK AGAIN TO UNMUTE";
            });
        } else {
            elements.audio.pause();
            this.innerText = "RESUME SYNC";
        }
    });
});

    // Volume control
    elements.volume.addEventListener('input', (e) => elements.audio.volume = e.target.value);

    // Timeline controls
    elements.timeline.addEventListener('input', () => state.seeking = true);
    elements.timeline.addEventListener('change', (e) => {
        elements.audio.currentTime = e.target.value * trDuration;
        elements.traceContainer.innerHTML = '';
        state.seeking = false;
    });
}


function setupGraphInteraction() {
    const canvas = document.getElementById('driftCanvas');
    if (!canvas) return;

    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        
        // Calculate which index in the history we clicked
        const step = canvas.width / (maxHistory - 1);
        const clickedIndex = Math.round(x / step);
        
        // Find the actual TR from our history buffer
        // Since driftHistory only holds the last 40 values:
        const currentTR = Math.floor(elements.audio.currentTime / trDuration);
        const historyStartTR = Math.max(0, currentTR - driftHistory.length + 1);
        const targetTR = historyStartTR + clickedIndex;

        if (targetTR >= 0 && targetTR < subjectData.length) {
            console.log(`Manifold Navigation: Jumping to TR ${targetTR}`);
            jumpTo(targetTR);
        }
    });
}

window.addEventListener('componentsReady', () => {
    console.log("Modules Injected. Initializing Alice Engine...");
    
    // Refresh element references since they now exist in the DOM
    initializeElements();
    
    // Setup UI components
    initializeVisualizationBars();
    initializeSubjects(); 
    
    // Attach event listeners to the buttons that were just loaded
    setupEventListeners();
    
    // Load default data and start the loop
    fetch('../data/alice_4subjects_vr.json')
        .then(r => r.json())
        .then(data => { 
            subjectData = Array.isArray(data) ? data : data.data; 
            if (elements.milestoneLabel) elements.milestoneLabel.innerText = "SYSTEM ONLINE: READY";
            // Inside your fetch(...).then(...)
            if (!isLoopRunning) {
                simulationLoop();
            }        })
        .catch(err => {
            console.error("Data load failed:", err);
            if (elements.milestoneLabel) elements.milestoneLabel.innerText = "SYSTEM READY: UPLOAD DATA";
        });
});

// --- Updated Core Visualization Logic ---

function updateDataVisualization() {
    let tr = Math.floor(elements.audio.currentTime / trDuration);

    if (subjectData && subjectData[tr]) {
        const d = subjectData[tr];
        
        updateTimelineDisplay(tr);
        
        // A. LLM MASTER UPDATE
        const llmMaster = document.getElementById('llm-master');
        if (llmMaster && d.xllm_vr !== undefined) {
            // Passing as an object is much more stable in A-Frame
            llmMaster.setAttribute('position', {
                x: d.xllm_vr, 
                y: d.yllm_vr, 
                z: d.zllm_vr
            });
        }

        // B. DYNAMIC HUMAN UPDATE
        try {
            updateCursorPositions(d);
            updateDriftAnalysis(d, tr);
        } catch (e) {
            console.warn("Soft error in analysis:", e);
        }
        
        if (!elements.audio.paused && !state.seeking) {
            dropVoxels(d);
            // Only ghost if data is valid
            if (d.xllm_vr !== undefined) renderGhostPath(subjectData, tr);
        }
    }
}

// Global exports for HTML onclick handlers
window.triggerAudioUpload = triggerAudioUpload;
window.triggerDataUpload = triggerDataUpload;
window.setSpeed = setSpeed;
window.toggleShell = toggleShell;
window.takeScreenshot = takeScreenshot;
window.exportSession = exportSession;
window.importSession = importSession;
window.jumpTo = jumpTo;
window.resetSim = resetSim;
window.toggleSubject = toggleSubject;
window.removeSubject = removeSubject;
window.toggleAllSubjects = toggleAllSubjects;
window.showAddSubjectDialog = showAddSubjectDialog;
window.hideAddSubjectDialog = hideAddSubjectDialog;
window.addNewSubject = addNewSubject;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
