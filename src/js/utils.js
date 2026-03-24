// utils.js
import { elements } from './state.js';
import { SUBJECTS_CONFIG, visibleSubjects } from './config.js';

export function dropVoxels(dataPoint) {
    SUBJECTS_CONFIG.getAllSubjects().forEach(subject => {
        if (!visibleSubjects.has(subject.id)) return;
        const fields = SUBJECTS_CONFIG.getDataFields(subject);
        if (dataPoint[fields.x] === undefined) return;

        dropVoxel(
            dataPoint[fields.x],
            dataPoint[fields.y],
            dataPoint[fields.z],
            subject.color
        );
    });
}

export function dropVoxel(x, y, z, color) {
    const p = document.createElement('a-box');
    p.setAttribute('position', `${x} ${y} ${z}`);
    p.setAttribute('scale', '0.006 0.006 0.006');
    p.setAttribute('material', {
        color,
        emissive: color,
        emissiveIntensity: 3,
        opacity: 0.5,
        transparent: true
    });
    p.setAttribute('animation', 'property: scale; to: 0 0 0; dur: 8000; easing: linear');

    elements.traceContainer.appendChild(p);
    setTimeout(() => p.remove(), 8000);
}