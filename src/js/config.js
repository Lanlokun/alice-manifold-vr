// config.js
export const TR_DURATION = 1.5;
export const BAR_COUNT = 32;
export const MAX_HISTORY = 40;
export const GHOST_LOOKAHEAD = 10;



export const SUBJECTS_CONFIG = {
    // Define subjects with their properties
    subjects: [

        // Add this to the 'subjects' array in SUBJECTS_CONFIG
        {
            id: 'subject0_llm',
            name: 'LLM Master Path',
            color: '#ff4d00ff', // Gold for the "Universal Skeleton"
            emissive: '#ff4d00ff',
            radius: 0.06, // Slightly larger to act as an anchor
            dataPrefix: 'llm_vr' // Matches your SBERT latent coordinates
        },
        {
            id: 'subject18',
            name: 'Subject 18',
            color: '#00f2ff',
            emissive: '#00f2ff',
            radius: 0.045,
            dataPrefix: '18_vr' // Used to match data fields like x18_vr, y18_vr, z18_vr
        },
        {
            id: 'subject22',
            name: 'Subject 22',
            color: '#00ff00',
            emissive: '#00ff00',
            radius: 0.045,
            dataPrefix: '22_vr' // Used to match data fields like x22_vr, y22_vr, z22_vr
        },
        {
            id: 'subject23', 
            name: 'Subject 23',
            color: '#ff0055',
            emissive: '#ff0055',
            radius: 0.045,
            dataPrefix: '23_vr' // Used to match data fields like x23_vr, y23_vr, z23_vr
        },
        {
            id: 'subject24',
            name: 'Subject 24',
            color: '#ffaa00',
            emissive: '#ffaa00',
            radius: 0.045,
            dataPrefix: '24_vr' // Used to match data fields like x24_vr, y24_vr, z24_vr
        }
    ],
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