// visualization.js
import { elements, subjectData, state } from './state.js';
import { TR_DURATION } from './config.js';
import { updateCursorPositions } from './subjects.js';
import { updateDriftAnalysis, renderGhostPath } from './drift.js';
import { dropVoxels } from './utils.js';
import { updateAudioVisualization } from './audio.js';

export function resetVisualization() {
    elements.traceContainer.innerHTML = "";
    state.lastTR = -1;
    state.lastPos = {};
    state.peakDrift = 0;
}

export function simulationLoop() {
    if (!subjectData.length) return;

    updateAudioVisualization();
    updateDataVisualization();

    requestAnimationFrame(simulationLoop);
}

export function updateDataVisualization() {
    const tr = Math.floor(elements.audio.currentTime / TR_DURATION);
    if (tr >= subjectData.length) return;

    const d = subjectData[tr];

    updateTimelineDisplay(tr);
    updateCursorPositions(d);

    // LLM master (fixed baseline)
    const llmMaster = document.getElementById('llm-master');
    if (llmMaster && d.xllm_vr !== undefined) {
        llmMaster.setAttribute('position', `${d.xllm_vr} ${d.yllm_vr} ${d.zllm_vr}`);
    }

    updateDriftAnalysis(d, tr);

    if (!elements.audio.paused && !state.seeking) {
        dropVoxels(d);
        renderGhostPath(subjectData, tr);
    }
}

function updateTimelineDisplay(tr) {
    if (elements.audio.paused || state.seeking) return;

    elements.timeline.value = tr;
    document.getElementById('current-tr').innerText = `TR ${tr}`;
    document.getElementById('current-time').innerText =
        new Date(elements.audio.currentTime * 1000).toISOString().substr(14, 5);
}