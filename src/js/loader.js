// loader.js
import { elements, stimulusMeta, subjectData } from './state.js';
import { TR_DURATION } from './config.js';
import { resetVisualization } from './visualization.js';

export function triggerAudioUpload() {
    document.getElementById("audioInput")?.click();
}

export function triggerDataUpload() {
    document.getElementById("dataInput")?.click();
}

export function loadStimulus(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    elements.audio.src = url;
    elements.audio.load();

    stimulusMeta.name = file.name;

    elements.audio.onloadedmetadata = () => {
        stimulusMeta.duration = elements.audio.duration;
        elements.timeline.max = Math.floor(elements.audio.duration / TR_DURATION);
        elements.milestoneLabel.innerText = `STIMULUS LOADED: ${file.name}`;
    };
}

export function loadSubject(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const parsed = JSON.parse(ev.target.result);
            const data = Array.isArray(parsed) ? parsed : parsed.data || [];

            subjectData.length = 0;
            subjectData.push(...data);

            resetVisualization();

            elements.timeline.max = subjectData.length - 1;
            elements.milestoneLabel.innerText = `SUBJECT LOADED: ${file.name}`;
        } catch (err) {
            alert("Invalid subject JSON format");
        }
    };
    reader.readAsText(file);
}