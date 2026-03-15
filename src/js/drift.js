// drift.js
import { elements, state, driftHistory } from './state.js';
import { MAX_HISTORY, GHOST_LOOKAHEAD } from './config.js';
import { SUBJECTS_CONFIG, visibleSubjects } from './config.js';

export function renderGhostPath(data, currentTR) {
    const container = document.getElementById('trace-container');
    document.querySelectorAll('.ghost-marker').forEach(el => el.remove());

    for (let i = 1; i <= GHOST_LOOKAHEAD; i++) {
        const tr = currentTR + i;
        if (tr >= data.length) break;

        const d = data[tr];
        const ghost = document.createElement('a-octahedron');
        ghost.className = 'ghost-marker';
        ghost.setAttribute('position', `${d.xllm_vr} ${d.yllm_vr} ${d.zllm_vr}`);
        ghost.setAttribute('radius', '0.02');
        ghost.setAttribute('material', {
            color: '#FFD700',
            opacity: 0.4 - (i * 0.03),
            transparent: true,
            emissive: '#FFD700',
            emissiveIntensity: 2
        });
        container.appendChild(ghost);
    }
}

export function updateDriftAnalysis(d, tr) {
    if (tr !== state.lastTR) {
        // velocity
        let totalVelocity = 0;
        let validCount = 0;

        SUBJECTS_CONFIG.getAllSubjects()
            .filter(s => visibleSubjects.has(s.id))
            .forEach(subject => {
                const fields = SUBJECTS_CONFIG.getDataFields(subject);
                if (d[fields.x] === undefined) return;

                const pos = { x: d[fields.x], y: d[fields.y], z: d[fields.z] };
                if (state.lastPos[subject.id]) {
                    const dist = Math.hypot(
                        pos.x - state.lastPos[subject.id].x,
                        pos.y - state.lastPos[subject.id].y,
                        pos.z - state.lastPos[subject.id].z
                    );
                    totalVelocity += dist;
                    validCount++;
                }
                state.lastPos[subject.id] = pos;
            });

        if (validCount > 0) {
            elements.velocityDisplay.innerText = (totalVelocity / validCount * 10).toFixed(5);
        }

        driftHistory.push(d.drift);
        if (driftHistory.length > MAX_HISTORY) driftHistory.shift();
        renderDriftGraph();

        state.lastTR = tr;
    }

    // UI
    elements.driftDisplay.innerText = d.drift.toFixed(5);

    if (d.drift > state.peakDrift) {
        state.peakDrift = d.drift;
        elements.peakDisplay.innerText = state.peakDrift.toFixed(5);
    }

    const diverged = d.drift > 0.05;
    elements.brainShell.setAttribute('material', 'color', diverged ? '#ff0055' : '#00f2ff');

    elements.milestoneLabel.innerHTML = diverged
        ? `<span class="divergence-alert">HIGH DRIFT DETECTED</span>`
        : "ALIGNED STATE";

    if (diverged) renderTether(d);
}

function renderDriftGraph() {
    const canvas = document.getElementById('driftCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let i = 0; i < h; i += 20) {
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
    }
    ctx.stroke();

    // line
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00f2ff';

    const step = w / (MAX_HISTORY - 1);
    driftHistory.forEach((val, i) => {
        const x = i * step;
        const y = h - (Math.min(val, 0.1) * 10 * h);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        if (val > 0.05) {
            ctx.fillStyle = '#ff0055';
            ctx.fillRect(x - 2, y - 2, 4, 4);
        }
    });
    ctx.stroke();
}

function renderTether(d) {
    const subs = SUBJECTS_CONFIG.getAllSubjects();
    if (subs.length < 2) return;

    const s1 = subs[0], s2 = subs[1];
    const f1 = SUBJECTS_CONFIG.getDataFields(s1);
    const f2 = SUBJECTS_CONFIG.getDataFields(s2);

    if (!d[f1.x] || !d[f2.x]) return;

    const line = document.createElement('a-entity');
    line.setAttribute('line', {
        start: `${d[f1.x]} ${d[f1.y]} ${d[f1.z]}`,
        end:   `${d[f2.x]} ${d[f2.y]} ${d[f2.z]}`,
        color: '#ffffff',
        opacity: 0.3
    });

    elements.traceContainer.appendChild(line);
    setTimeout(() => line.remove(), 100);
}