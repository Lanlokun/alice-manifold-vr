// config.js
export const TR_DURATION = 1.5;
export const BAR_COUNT = 32;
export const MAX_HISTORY = 40;
export const GHOST_LOOKAHEAD = 10;

export const SUBJECTS_CONFIG = {
    subjects: [],

    addSubject(subject) {
        this.subjects.push(subject);
    },

    removeSubject(id) {
        this.subjects = this.subjects.filter(s => s.id !== id);
    },

    getAllSubjects() {
        return [...this.subjects];
    },

    getSubject(id) {
        return this.subjects.find(s => s.id === id);
    },

    getDataFields(subject) {
        return {
            x: `${subject.dataPrefix}x`,
            y: `${subject.dataPrefix}y`,
            z: `${subject.dataPrefix}z`
        };
    }
};