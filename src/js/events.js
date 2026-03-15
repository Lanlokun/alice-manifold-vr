// events.js
import { initAudioEngine } from './audio.js';
import { loadStimulus, loadSubject } from './loader.js';
import { elements, state } from './state.js';

export function setupEventListeners() {
    document.getElementById("audioInput")?.addEventListener("change", e => {
        loadStimulus(e.target.files[0]);
    });

    document.getElementById("dataInput")?.addEventListener("change", e => {
        loadSubject(e.target.files[0]);
    });

    elements.playBtn?.addEventListener('click', function() {
        initAudioEngine();
        if (audioCtx?.state === 'suspended') audioCtx.resume();

        if (elements.audio.paused) {
            elements.audio.play();
            this.innerText = "PAUSE SYNC";
        } else {
            elements.audio.pause();
            this.innerText = "RESUME SYNC";
        }
    });

    elements.volume?.addEventListener('input', e => {
        elements.audio.volume = e.target.value;
    });

    elements.timeline?.addEventListener('input', () => {
        state.seeking = true;
    });

    elements.timeline?.addEventListener('change', e => {
        elements.audio.currentTime = e.target.value * TR_DURATION;
        elements.traceContainer.innerHTML = '';
        state.seeking = false;
    });

    const canvas = document.getElementById('driftCanvas');
    canvas?.addEventListener('click', e => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const step = canvas.width / (MAX_HISTORY - 1);
        const idx = Math.round(x / step);

        const currentTR = Math.floor(elements.audio.currentTime / TR_DURATION);
        const startTR = Math.max(0, currentTR - driftHistory.length + 1);
        const targetTR = startTR + idx;

        if (targetTR >= 0 && targetTR < subjectData.length) {
            jumpTo(targetTR);
        }
    });
}