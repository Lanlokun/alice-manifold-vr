// dom.js
import { elements } from './state.js';

export function initializeElements() {
    elements.audio           = document.getElementById('aliceAudio');
    elements.timeline        = document.getElementById('timeline');
    elements.volume          = document.getElementById('volumeControl');
    elements.driftDisplay    = document.getElementById('drift-val');
    elements.peakDisplay     = document.getElementById('drift-peak');
    elements.velocityDisplay = document.getElementById('velocity-val');
    elements.milestoneLabel  = document.getElementById('milestone-text');
    elements.brainShell      = document.getElementById('brain-shell');
    elements.brainSystem     = document.getElementById('brain-system');
    elements.traceContainer  = document.getElementById('trace-container');
    elements.cursorsContainer = document.getElementById('cursors-container');
    elements.vizContainer    = document.getElementById('audio-viz');
    elements.playBtn         = document.getElementById('playBtn');
}