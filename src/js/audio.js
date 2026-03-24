// audio.js
import { elements, state, audioCtx, analyser, dataArray, source, bars } from './state.js';
import { TR_DURATION, BAR_COUNT } from './config.js';

export function initAudioEngine() {
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

export function initializeVisualizationBars() {
    for (let i = 0; i < BAR_COUNT; i++) {
        const bar = document.createElement('div');
        bar.className = 'viz-bar';
        elements.vizContainer.appendChild(bar);
        bars.push(bar);
    }
}

export function updateAudioVisualization() {
    if (!analyser || elements.audio.paused) return;

    analyser.getByteFrequencyData(dataArray);
    let sum = 0;

    for (let i = 0; i < BAR_COUNT; i++) {
        const val = dataArray[i] / 2.5;
        bars[i].style.height = `${val}px`;
        bars[i].style.backgroundColor = (parseFloat(elements.driftDisplay.innerText) > 0.05) ? '#ff0055' : '#00f2ff';
        sum += dataArray[i];
    }

    updateBrainShellPulse(sum);
}

function updateBrainShellPulse(sum) {
    if (!state.shellVisible) return;
    const avg = sum / BAR_COUNT;
    const pulse = avg / 255;
    elements.brainShell.setAttribute('material', 'opacity', 0.08 + (pulse * 0.15));
    elements.brainShell.setAttribute('material', 'emissiveIntensity', 0.5 + (pulse * 3));
}