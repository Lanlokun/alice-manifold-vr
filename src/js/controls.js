// controls.js
import { elements, state } from './state.js';
import { TR_DURATION } from './config.js';

export function setSpeed(multiplier) {
    elements.audio.playbackRate = multiplier;
}

export function toggleShell() {
    state.shellVisible = !state.shellVisible;
    elements.brainShell?.setAttribute('visible', state.shellVisible);
    document.getElementById('brain-core')?.setAttribute('visible', state.shellVisible);
}

export function takeScreenshot() {
    document.querySelector('a-scene')?.components.screenshot?.capture('perspective');
    elements.milestoneLabel.innerText = "CAPTION SAVED";
}

export function exportSession() {
    const data = {
        tr: Math.floor(elements.audio.currentTime / TR_DURATION),
        peak: state.peakDrift,
        vel: elements.velocityDisplay.innerText
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Alice_Research_TR${data.tr}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function importSession(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            const data = JSON.parse(ev.target.result);
            if (data.tr !== undefined) jumpTo(data.tr);
            if (data.peak !== undefined) {
                state.peakDrift = data.peak;
                elements.peakDisplay.innerText = state.peakDrift.toFixed(5);
            }
        } catch {}
    };
    reader.readAsText(file);
}

export function jumpTo(tr) {
    elements.audio.currentTime = tr * TR_DURATION;
    elements.traceContainer.innerHTML = '';
    elements.audio.play();
}

export function resetSim() {
    elements.audio.pause();
    elements.audio.currentTime = 0;
    state.peakDrift = 0;
    state.lastPos = {};
    state.lastTR = -1;
    elements.peakDisplay.innerText = "0.0000";
    elements.velocityDisplay.innerText = "0.0000";
    elements.traceContainer.innerHTML = '';
}