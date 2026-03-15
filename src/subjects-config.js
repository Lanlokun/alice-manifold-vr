// Subject Configuration System
// ============================
// Easily add/remove subjects by modifying this configuration

const SUBJECTS_CONFIG = {
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

    // Get subject by ID
    getSubject: function(id) {
        return this.subjects.find(subject => subject.id === id);
    },

    // Get all subjects
    getAllSubjects: function() {
        return this.subjects;
    },

    // Add a new subject dynamically
    addSubject: function(subjectConfig) {
        this.subjects.push(subjectConfig);
        return this.subjects.length - 1; // Return index
    },

    // Remove a subject by ID
    removeSubject: function(id) {
        const index = this.subjects.findIndex(subject => subject.id === id);
        if (index !== -1) {
            this.subjects.splice(index, 1);
            return true;
        }
        return false;
    },

    // Generate data field names for a subject
    getDataFields: function(subject) {
        const prefix = subject.dataPrefix;
        return {
            x: `x${prefix}`,
            y: `y${prefix}`, 
            z: `z${prefix}`
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SUBJECTS_CONFIG;
}
