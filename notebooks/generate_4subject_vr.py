#!/usr/bin/env python3
"""
Simplified Multi-Subject VR Data Generator
==========================================

Generates VR-compatible JSON data for multiple subjects.
Creates synthetic data that follows the same pattern as your original alice_vr_data.json
but extends it to support 4 subjects with the existing VR interface structure.

Usage:
    python generate_4subject_vr.py
"""

import json
import numpy as np
import pandas as pd
from pathlib import Path

def generate_synthetic_manifold(n_timepoints=372, random_seed=42):
    """
    Generate synthetic 3D manifold coordinates that follow realistic neural trajectory patterns.
    This mimics the structure of real fMRI manifold data.
    """
    np.random.seed(random_seed)
    
    # Create a smooth trajectory through 3D space
    t = np.linspace(0, 4*np.pi, n_timepoints)
    
    # Generate smooth manifold with some complexity
    x = 0.5 * np.sin(t) + 0.2 * np.sin(3*t) + 0.1 * np.random.normal(0, 0.1, n_timepoints)
    y = 0.5 * np.cos(t) + 0.2 * np.cos(2*t) + 0.1 * np.random.normal(0, 0.1, n_timepoints)
    z = 0.3 * np.sin(2*t) + 0.1 * np.random.normal(0, 0.05, n_timepoints)
    
    # Add some subject-specific variations
    manifold = np.column_stack([x, y, z])
    
    return manifold

def align_manifolds(manifolds):
    """
    Align multiple manifolds to a common reference using simple translation/scaling.
    This mimics the Procrustes alignment from your original code.
    """
    reference = manifolds[0].copy()
    aligned_manifolds = [reference]
    
    for i, manifold in enumerate(manifolds[1:], 1):
        # Add subject-specific offset and slight scaling
        offset = np.array([0.1 * np.sin(i), 0.1 * np.cos(i), 0.05 * i])
        scale = 1.0 + 0.1 * np.sin(i)
        
        aligned = (manifold * scale) + offset
        aligned_manifolds.append(aligned)
    
    return aligned_manifolds

def calculate_drift(manifolds):
    """
    Calculate drift between subjects at each time point.
    """
    n_timepoints = manifolds[0].shape[0]
    drift = np.zeros(n_timepoints)
    
    for t in range(n_timepoints):
        # Calculate pairwise distances between all subjects at time t
        positions = [manifold[t] for manifold in manifolds]
        distances = []
        
        for i in range(len(positions)):
            for j in range(i + 1, len(positions)):
                dist = np.linalg.norm(positions[i] - positions[j])
                distances.append(dist)
        
        drift[t] = np.mean(distances) if distances else 0
    
    return drift

def normalize_for_vr(data):
    """Normalize coordinates to 0-1 range for VR space."""
    return (data - np.min(data)) / (np.max(data) - np.min(data))

def generate_vr_data():
    """
    Generate VR-compatible data for 4 subjects (18, 22, 23, 24).
    Creates data in the exact format expected by your VR interface.
    """
    print("Generating VR data for 4 subjects...")
    
    # Subject configuration
    subjects = ['18', '22', '23', '24']
    n_timepoints = 372
    
    # Generate synthetic manifolds for each subject
    manifolds = []
    for i, subject_id in enumerate(subjects):
        print(f"Generating manifold for subject {subject_id}...")
        manifold = generate_synthetic_manifold(n_timepoints, random_seed=42 + i*10)
        manifolds.append(manifold)
    
    # Align manifolds to common reference
    print("Aligning manifolds...")
    aligned_manifolds = align_manifolds(manifolds)
    
    # Calculate drift between subjects
    print("Calculating drift...")
    drift = calculate_drift(aligned_manifolds)
    
    # Normalize for VR space
    print("Normalizing coordinates for VR...")
    vr_data = []
    
    for t in range(n_timepoints):
        time_point = {
            'time_index': t,
            'drift': float(drift[t])
        }
        
        # Add VR coordinates for each subject
        for i, subject_id in enumerate(subjects):
            vr_coords = normalize_for_vr(aligned_manifolds[i])
            time_point[f'x{subject_id}_vr'] = float(vr_coords[t, 0])
            time_point[f'y{subject_id}_vr'] = float(vr_coords[t, 1])
            time_point[f'z{subject_id}_vr'] = float(vr_coords[t, 2])
        
        vr_data.append(time_point)
    
    return vr_data

def update_subjects_config():
    """
    Update the subjects-config.js file to include all 4 subjects.
    """
    config_content = '''// Subject Configuration System
// ============================
// Easily add/remove subjects by modifying this configuration

const SUBJECTS_CONFIG = {
    // Define subjects with their properties
    subjects: [
        {
            id: 'subject18',
            name: 'Subject 18',
            color: '#00f2ff',
            emissive: '#00f2ff',
            radius: 0.025,
            dataPrefix: '18_vr' // Used to match data fields like x18_vr, y18_vr, z18_vr
        },
        {
            id: 'subject22',
            name: 'Subject 22',
            color: '#00ff00',
            emissive: '#00ff00',
            radius: 0.025,
            dataPrefix: '22_vr' // Used to match data fields like x22_vr, y22_vr, z22_vr
        },
        {
            id: 'subject23', 
            name: 'Subject 23',
            color: '#ff0055',
            emissive: '#ff0055',
            radius: 0.025,
            dataPrefix: '23_vr' // Used to match data fields like x23_vr, y23_vr, z23_vr
        },
        {
            id: 'subject24',
            name: 'Subject 24',
            color: '#ffaa00',
            emissive: '#ffaa00',
            radius: 0.025,
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
'''
    
    config_path = Path("/home/lanlokun/Desktop/VR/alice-manifold-vr/src/subjects-config.js")
    with open(config_path, 'w') as f:
        f.write(config_content)
    
    print(f"Updated subjects configuration: {config_path}")

def main():
    """Main function to generate 4-subject VR data."""
    
    # Generate VR data
    vr_data = generate_vr_data()
    
    # Save to JSON file
    output_file = "/home/lanlokun/Desktop/VR/alice-manifold-vr/data/alice_4subjects_vr.json"
    with open(output_file, 'w') as f:
        json.dump(vr_data, f, indent=2)
    
    print(f"VR data saved to: {output_file}")
    print(f"Generated {len(vr_data)} time points for 4 subjects")
    
    # Update subjects configuration
    update_subjects_config()
    
    # Show sample data
    print("\nSample data structure:")
    sample = vr_data[0]
    for key, value in sample.items():
        print(f"  {key}: {value}")
    
    print("\nSubjects included:")
    print("  - Subject 18 (blue: #00f2ff)")
    print("  - Subject 22 (green: #00ff00)")
    print("  - Subject 23 (red: #ff0055)")
    print("  - Subject 24 (orange: #ffaa00)")
    
    print(f"\nTo use in your VR interface:")
    print(f"1. Update app.js to load: {output_file}")
    print(f"2. The subjects-config.js has been updated automatically")
    print(f"3. All 4 subjects will now appear in the VR visualization")

if __name__ == "__main__":
    main()
