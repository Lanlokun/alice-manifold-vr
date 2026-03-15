// main.js
import { initializeElements } from './dom.js';
import { initializeVisualizationBars } from './audio.js';
import { initializeSubjects } from './subjects.js';
import { setupEventListeners } from './events.js';
import { simulationLoop } from './visualization.js';
import { elements } from './state.js';

function initApp() {
    console.log("Alice Manifold VR Research Suite initializing...");

    initializeElements();
    initializeVisualizationBars();
    initializeSubjects();
    setupEventListeners();

    fetch('../data/alice_4subjects_vr.json')
        .then(r => r.json())
        .then(data => {
            subjectData.length = 0;
            const arr = Array.isArray(data) ? data : data.data || [];
            subjectData.push(...arr);
            elements.milestoneLabel.innerText = "SYSTEM ONLINE: READY";
            simulationLoop();
        })
        .catch(err => {
            console.error("Default data load failed:", err);
            elements.milestoneLabel.innerText = "SYSTEM READY: UPLOAD DATA";
        });
}

document.addEventListener('DOMContentLoaded', initApp);

// For HTML onclick=""
window.triggerAudioUpload = triggerAudioUpload;
window.triggerDataUpload  = triggerDataUpload;
window.setSpeed           = setSpeed;
window.toggleShell        = toggleShell;
window.takeScreenshot     = takeScreenshot;
window.exportSession      = exportSession;
window.importSession      = importSession;
window.jumpTo             = jumpTo;
window.resetSim           = resetSim;