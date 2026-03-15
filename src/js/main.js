// main.js (fixed fetch handling)
import { initializeElements } from './dom.js';
import { initializeVisualizationBars } from './audio.js';
import { initializeSubjects } from './subjects.js';
import { setupEventListeners } from './events.js';
import { simulationLoop } from './visualization.js';
import { elements, subjectData } from './state.js';  // ← make sure subjectData is imported

function initApp() {
    console.log("Alice Manifold VR Research Suite initializing...");

    initializeElements();
    initializeVisualizationBars();
    initializeSubjects();
    setupEventListeners();

    fetch('../../data/alice_4subjects_vr.json')
        .then(r => {
            if (!r.ok) {
                throw new Error(`HTTP error! Status: ${r.status} ${r.statusText}`);
            }
            return r.json();
        })
        .then(data => {
            subjectData.length = 0;  // clear any old data
            const arr = Array.isArray(data) ? data : data?.data || [];
            subjectData.push(...arr);

            console.log("✅ Loaded", subjectData.length, "timepoints");
            if (subjectData.length > 0) {
                console.log("First point sample:", subjectData[0]);
            } else {
                console.warn("Data array is empty after processing");
            }

            elements.milestoneLabel.innerText = "SYSTEM ONLINE: READY";
            simulationLoop();  // start the loop once data is ready
        })
        .catch(err => {
            console.error("❌ Default data load failed:", err.message);
            elements.milestoneLabel.innerText = "SYSTEM READY: UPLOAD DATA – " + err.message;
        });
}

document.addEventListener('DOMContentLoaded', initApp);

// Global exports for onclick=""
window.triggerAudioUpload = triggerAudioUpload;
window.triggerDataUpload  = triggerDataUpload;
window.setSpeed           = setSpeed;
window.toggleShell        = toggleShell;
window.takeScreenshot     = takeScreenshot;
window.exportSession      = exportSession;
window.importSession      = importSession;
window.jumpTo             = jumpTo;
window.resetSim           = resetSim;