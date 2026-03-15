// subjects.js
import { SUBJECTS_CONFIG, visibleSubjects } from './config.js';
import { elements } from './state.js';

export function initializeSubjects() {
    const subjects = SUBJECTS_CONFIG.getAllSubjects();
    elements.cursorsContainer.innerHTML = '';
    const subjectList = document.getElementById('subject-list');
    if (subjectList) subjectList.innerHTML = '';

    subjects.forEach(subject => {
        const cursor = document.createElement('a-sphere');
        cursor.setAttribute('id', subject.id);
        cursor.setAttribute('radius', subject.radius);
        cursor.setAttribute('material', {
            color: subject.color,
            emissive: subject.emissive,
            emissiveIntensity: 20
        });
        cursor.setAttribute('visible', 'true');
        elements.cursorsContainer.appendChild(cursor);

        visibleSubjects.add(subject.id);

        const item = createSubjectUIItem(subject);
        if (subjectList) subjectList.appendChild(item);
    });
}

function createSubjectUIItem(subject) {
    const item = document.createElement('div');
    item.className = 'subject-item';
    item.id = `subject-ui-${subject.id}`;
    item.style.borderLeftColor = subject.color;

    item.innerHTML = `
        <div class="subject-info">
            <div class="subject-color-indicator" style="background: ${subject.color}"></div>
            <div class="subject-name">${subject.name}</div>
        </div>
        <div class="subject-controls">
            <button class="subject-btn" onclick="toggleSubject('${subject.id}')">Hide</button>
            <button class="subject-btn remove" onclick="removeSubject('${subject.id}')">Remove</button>
        </div>
    `;
    return item;
}

// The following functions are called from HTML → keep attached to window
window.toggleSubject = function(subjectId) {
    const subject = SUBJECTS_CONFIG.getSubject(subjectId);
    if (!subject) return;

    const cursor = document.getElementById(subjectId);
    const uiItem = document.getElementById(`subject-ui-${subjectId}`);
    if (!uiItem) return;
    const toggleBtn = uiItem.querySelector('.subject-btn');

    if (visibleSubjects.has(subjectId)) {
        visibleSubjects.delete(subjectId);
        cursor?.setAttribute('visible', 'false');
        uiItem.classList.add('hidden');
        toggleBtn.textContent = 'Show';
    } else {
        visibleSubjects.add(subjectId);
        cursor?.setAttribute('visible', 'true');
        uiItem.classList.remove('hidden');
        toggleBtn.textContent = 'Hide';
    }
};

window.removeSubject = function(subjectId) {
    if (!confirm(`Remove ${subjectId.replace('subject', 'Subject ')}?`)) return;

    SUBJECTS_CONFIG.removeSubject(subjectId);
    document.getElementById(subjectId)?.remove();
    document.getElementById(`subject-ui-${subjectId}`)?.remove();
    visibleSubjects.delete(subjectId);

    elements.milestoneLabel.innerText = `REMOVED: ${subjectId}`;
};

window.toggleAllSubjects = function() {
    const subjects = SUBJECTS_CONFIG.getAllSubjects();
    const allVisible = visibleSubjects.size === subjects.length;

    subjects.forEach(s => {
        if (allVisible && visibleSubjects.has(s.id)) {
            window.toggleSubject(s.id);
        } else if (!allVisible && !visibleSubjects.has(s.id)) {
            window.toggleSubject(s.id);
        }
    });
};

window.showAddSubjectDialog = function() {
    const dialog = document.getElementById('add-subject-dialog');
    if (!dialog) return;
    dialog.style.display = 'flex';

    const count = SUBJECTS_CONFIG.getAllSubjects().length + 1;
    document.getElementById('new-subject-id').value = count;
    document.getElementById('new-subject-name').value = `Subject ${count}`;
    document.getElementById('new-subject-prefix').value = `${count}_vr`;

    const colors = ['#ff00ff','#00ffff','#ffff00','#ff8800','#8800ff','#00ff88'];
    document.getElementById('new-subject-color').value = colors[count % colors.length];
};

window.hideAddSubjectDialog = function() {
    document.getElementById('add-subject-dialog')?.style.display = 'none';
};

window.addNewSubject = function() {
    const id    = document.getElementById('new-subject-id')?.value.trim();
    const name  = document.getElementById('new-subject-name')?.value.trim();
    const color = document.getElementById('new-subject-color')?.value;
    const prefix = document.getElementById('new-subject-prefix')?.value.trim();

    if (!id || !name || !prefix) {
        alert('Please fill in all fields');
        return;
    }

    const newSubject = {
        id: `subject${id}`,
        name,
        color,
        emissive: color,
        radius: 0.045,
        dataPrefix: prefix
    };

    SUBJECTS_CONFIG.addSubject(newSubject);

    const cursor = document.createElement('a-sphere');
    cursor.setAttribute('id', newSubject.id);
    cursor.setAttribute('radius', newSubject.radius);
    cursor.setAttribute('material', { color, emissive: color, emissiveIntensity: 20 });
    cursor.setAttribute('visible', 'true');
    elements.cursorsContainer.appendChild(cursor);

    visibleSubjects.add(newSubject.id);

    const item = createSubjectUIItem(newSubject);
    document.getElementById('subject-list')?.appendChild(item);

    window.hideAddSubjectDialog();
    elements.milestoneLabel.innerText = `ADDED: ${name}`;
};