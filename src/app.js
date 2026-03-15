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
let activeSubject = null;   // key of currently selected subject

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
        source = audioCtx.createMediaElementSource(elements.audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.fftSize = 64;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
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
function simulationLoop() {
    if (!subjectData.length) return;
    
    updateAudioVisualization();
    updateDataVisualization();
    
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
    let tr = Math.floor(elements.audio.currentTime / trDuration);

    if(tr < subjectData.length) {
        const d = subjectData[tr];
        
        updateTimelineDisplay(tr);
        updateCursorPositions(d);
        
        // GEN 5 UPDATE: 
        // We now calculate drift specifically against the LLM baseline
        // rather than just a general inter-subject average.
        updateDriftAnalysis(d, tr);
        
        if (!elements.audio.paused && !state.seeking) {
            // 1. Drop existing temporary human voxels (Biological Path)
            dropVoxels(d);

            // 2. INTEGRATION: Render the "Ghost Path" (Silicon Mirror)
            // This projects the LLM's latent trajectory into the future
            // based on the upcoming narrative text.
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
    const subjects = SUBJECTS_CONFIG.getAllSubjects();
    
    subjects.forEach(subject => {
        // Only update if subject is visible
        if (!visibleSubjects.has(subject.id)) return;
        
        const fields = SUBJECTS_CONFIG.getDataFields(subject);
        const cursor = document.getElementById(subject.id);
        
        if (cursor && dataPoint[fields.x] !== undefined) {
            cursor.setAttribute('position', 
                `${dataPoint[fields.x]} ${dataPoint[fields.y]} ${dataPoint[fields.z]}`
            );
        }
    });
}

function updateDriftAnalysis(d, tr) {
    // 1. Per-TR Calculations (Velocity and History)
    if (tr !== state.lastTR) {
        const subjects = SUBJECTS_CONFIG.getAllSubjects();
        const visibleSubjectsList = subjects.filter(subject => visibleSubjects.has(subject.id));
        
        if (visibleSubjectsList.length > 0) {
            let totalVelocity = 0;
            let validVelocityCount = 0;
            
            visibleSubjectsList.forEach(subject => {
                const fields = SUBJECTS_CONFIG.getDataFields(subject);
                if (d[fields.x] === undefined) return;
                
                const currentPos = { x: d[fields.x], y: d[fields.y], z: d[fields.z] };
                
                if (state.lastPos[subject.id]) {
                    const dist = Math.sqrt(
                        Math.pow(currentPos.x - state.lastPos[subject.id].x, 2) + 
                        Math.pow(currentPos.y - state.lastPos[subject.id].y, 2) + 
                        Math.pow(currentPos.z - state.lastPos[subject.id].z, 2)
                    );
                    totalVelocity += dist;
                    validVelocityCount++;
                }
                state.lastPos[subject.id] = currentPos;
            });
            
            if (validVelocityCount > 0) {
                elements.velocityDisplay.innerText = ((totalVelocity / validVelocityCount) * 10).toFixed(5);
            }
        }

        // Update History Buffer
        driftHistory.push(d.drift);
        if (driftHistory.length > maxHistory) driftHistory.shift();
        renderDriftGraph();
        
        state.lastTR = tr;
    }

    // 2. Continuous UI Updates
    elements.driftDisplay.innerText = d.drift.toFixed(5);
    
    // Peak Tracking
    if(d.drift > state.peakDrift) {
        state.peakDrift = d.drift;
        elements.peakDisplay.innerText = state.peakDrift.toFixed(5);
    }

    // 3. Alignment Visual State
    const isDiverged = d.drift > 0.05;
    const themeColor = isDiverged ? '#ff0055' : '#00f2ff';
    
    elements.brainShell.setAttribute('material', 'color', themeColor);
    
    if (isDiverged) {
        elements.milestoneLabel.innerHTML = `<span class="divergence-alert">HIGH DRIFT DETECTED</span>`;
        renderTether(d);
    } else {
        elements.milestoneLabel.innerText = "ALIGNED STATE";
    }
}

function renderDriftGraph() {
    const canvas = document.getElementById('driftCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    
    // Draw Background Grid
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for(let i = 0; i < h; i += 20) { ctx.moveTo(0, i); ctx.lineTo(w, i); }
    ctx.stroke();

    // Draw Drift Line
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00f2ff';
    
    const step = w / (maxHistory - 1);
    driftHistory.forEach((val, i) => {
        // Map drift value (0.0 to 0.1) to canvas height (60 to 0)
        const x = i * step;
        const y = h - (Math.min(val, 0.1) * 10 * h);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        // Visual alert on graph if drift is high
        if (val > 0.05) {
            ctx.fillStyle = '#ff0055';
            ctx.fillRect(x - 2, y - 2, 4, 4);
        }
    });
    ctx.stroke();
}



// VR Rendering Functions
function dropVoxels(dataPoint) {
    const subjects = SUBJECTS_CONFIG.getAllSubjects();
    
    subjects.forEach(subject => {
        // Only drop voxels for visible subjects
        if (!visibleSubjects.has(subject.id)) return;
        
        const fields = SUBJECTS_CONFIG.getDataFields(subject);
        
        if (dataPoint[fields.x] !== undefined) {
            dropVoxel(
                dataPoint[fields.x], 
                dataPoint[fields.y], 
                dataPoint[fields.z], 
                subject.color
            );
        }
    });
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

function renderTether(dataPoint) {
    const subjects = SUBJECTS_CONFIG.getAllSubjects();
    
    if (subjects.length >= 2) {
        const subject1 = subjects[0];
        const subject2 = subjects[1];
        
        const fields1 = SUBJECTS_CONFIG.getDataFields(subject1);
        const fields2 = SUBJECTS_CONFIG.getDataFields(subject2);
        
        if (dataPoint[fields1.x] && dataPoint[fields2.x]) {
            let line = document.createElement('a-entity');
            line.setAttribute('line', {
                start: `${dataPoint[fields1.x]} ${dataPoint[fields1.y]} ${dataPoint[fields1.z]}`, 
                end: `${dataPoint[fields2.x]} ${dataPoint[fields2.y]} ${dataPoint[fields2.z]}`, 
                color: '#ffffff', 
                opacity: 0.3 
            });
            elements.traceContainer.appendChild(line);
            setTimeout(() => { if(line.parentNode) line.parentNode.removeChild(line); }, 100);
        }
    }
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
        initAudioEngine();
        if(audioCtx.state === 'suspended') audioCtx.resume();
        if(elements.audio.paused) { 
            elements.audio.play(); 
            this.innerText = "PAUSE SYNC"; 
        } else { 
            elements.audio.pause(); 
            this.innerText = "RESUME SYNC"; 
        }
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
            simulationLoop(); 
        })
        .catch(err => {
            console.error("Data load failed:", err);
            if (elements.milestoneLabel) elements.milestoneLabel.innerText = "SYSTEM READY: UPLOAD DATA";
        });
});

// --- Updated Core Visualization Logic ---

function updateDataVisualization() {
    let tr = Math.floor(elements.audio.currentTime / trDuration);

    if(tr < subjectData.length) {
        const d = subjectData[tr];
        
        updateTimelineDisplay(tr);
        
        // A. PERMANENT LLM UPDATE (The Silicon Mirror)
        // We look for 'llm-master' directly to ensure it's treated as a baseline
        const llmMaster = document.getElementById('llm-master');
        if (llmMaster) {
            llmMaster.setAttribute('position', `${d.xllm_vr} ${d.yllm_vr} ${d.zllm_vr}`);
        }

        // B. DYNAMIC HUMAN UPDATE (The Carbon Path)
        updateCursorPositions(d);
        
        // C. ALIGNMENT ANALYSIS
        updateDriftAnalysis(d, tr);
        
        if (!elements.audio.paused && !state.seeking) {
            dropVoxels(d);
            renderGhostPath(subjectData, tr);
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
