#!/usr/bin/env python3
"""
Multi-Subject VR Data Generator for Alice Manifold
==================================================

Generates VR-compatible JSON data for multiple subjects from fMRI data.
Compatible with the existing VR interface's SUBJECTS_CONFIG system.

Usage:
    python generate_multi_subject_vr.py --config subjects_config.yaml
    python generate_multi_subject_vr.py --subjects 18,22,23,24 --output alice_4subjects_vr.json
"""

import os
import json
import yaml
import argparse
import numpy as np
import pandas as pd
import nibabel as nib
from scipy.spatial import procrustes
from umap import UMAP
from nilearn import input_data
from pathlib import Path
from typing import List, Dict, Tuple, Optional

class MultiSubjectVRGenerator:
    def __init__(self, data_path: str):
        """
        Initialize the VR data generator.
        
        Args:
            data_path: Path to the ds002322 dataset
        """
        self.data_path = Path(data_path)
        self.derivatives_path = self.data_path / "derivatives"
        self.masker = None
        self.reference_manifold = None
        
    def setup_masker(self):
        """Setup the brain masker for consistent preprocessing."""
        if self.masker is None:
            self.masker = input_data.NiftiMasker(
                standardize=True, 
                detrend=True, 
                smoothing_fwhm=6
            )
        return self.masker
    
    def get_available_subjects(self) -> List[str]:
        """Get list of available subjects with preprocessed data."""
        subjects = []
        if self.derivatives_path.exists():
            for item in self.derivatives_path.iterdir():
                if item.is_dir() and item.name.startswith('sub-'):
                    # Check if preprocessed file exists
                    preproc_file = item / f"{item.name}_task-alice_bold_preprocessed.nii.gz"
                    if preproc_file.exists():
                        subjects.append(item.name.replace('sub-', ''))
        return sorted(subjects)
    
    def load_subject_data(self, subject_id: str) -> np.ndarray:
        """
        Load and preprocess fMRI data for a subject.
        
        Args:
            subject_id: Subject ID (e.g., '18', '23')
            
        Returns:
            Preprocessed time series data
        """
        subject_path = self.derivatives_path / f"sub-{subject_id}" / f"sub-{subject_id}_task-alice_bold_preprocessed.nii.gz"
        
        if not subject_path.exists():
            raise FileNotFoundError(f"Preprocessed data not found for subject {subject_id}")
        
        masker = self.setup_masker()
        time_series = masker.fit_transform(str(subject_path))
        
        return time_series
    
    def generate_manifold(self, time_series: np.ndarray, random_state: int = 42) -> np.ndarray:
        """
        Generate 3D manifold from fMRI time series using UMAP.
        
        Args:
            time_series: Preprocessed fMRI time series
            random_state: Random seed for reproducibility
            
        Returns:
            3D manifold coordinates
        """
        reducer = UMAP(
            n_components=3, 
            n_neighbors=30, 
            min_dist=0.1, 
            metric='cosine', 
            random_state=random_state
        )
        manifold = reducer.fit_transform(time_series)
        return manifold
    
    def align_to_reference(self, manifold: np.ndarray) -> Tuple[np.ndarray, float]:
        """
        Align manifold to reference using Procrustes analysis.
        
        Args:
            manifold: Manifold to align
            
        Returns:
            Tuple of (aligned_manifold, disparity)
        """
        if self.reference_manifold is None:
            # This is the first subject - set as reference
            self.reference_manifold = manifold
            return manifold, 0.0
        
        # Align to reference
        aligned, _, disparity = procrustes(self.reference_manifold, manifold)
        return aligned, disparity
    
    def normalize_for_vr(self, data: np.ndarray) -> np.ndarray:
        """
        Normalize coordinates to 0-1 range for VR space.
        
        Args:
            data: Coordinate data to normalize
            
        Returns:
            Normalized data
        """
        return (data - np.min(data)) / (np.max(data) - np.min(data))
    
    def generate_vr_data(self, subject_ids: List[str], output_file: str) -> Dict:
        """
        Generate VR-compatible data for multiple subjects.
        
        Args:
            subject_ids: List of subject IDs to process
            output_file: Output JSON file path
            
        Returns:
            Generated VR data dictionary
        """
        print(f"Generating VR data for subjects: {subject_ids}")
        
        # Storage for all subject manifolds
        subject_manifolds = {}
        subject_data = {}
        
        # Process each subject
        for i, subject_id in enumerate(subject_ids):
            print(f"Processing subject {subject_id}...")
            
            # Load and process data
            time_series = self.load_subject_data(subject_id)
            manifold = self.generate_manifold(time_series, random_state=42 + i)
            aligned_manifold, disparity = self.align_to_reference(manifold)
            
            # Store raw manifold for reference
            subject_manifolds[subject_id] = aligned_manifold
            
            # Normalize for VR
            vr_coords = self.normalize_for_vr(aligned_manifold)
            
            # Store subject data
            subject_data[subject_id] = {
                'manifold': aligned_manifold,
                'vr_coords': vr_coords,
                'disparity': disparity
            }
        
        # Calculate drift between subjects (using first two as reference)
        drift_data = self.calculate_drift(subject_manifolds)
        
        # Create VR-compatible JSON structure
        vr_data = self.create_vr_json_structure(subject_data, subject_ids, drift_data)
        
        # Save to file
        with open(output_file, 'w') as f:
            json.dump(vr_data, f, indent=2)
        
        print(f"VR data saved to: {output_file}")
        print(f"Generated {len(vr_data)} time points for {len(subject_ids)} subjects")
        
        return vr_data
    
    def calculate_drift(self, subject_manifolds: Dict[str, np.ndarray]) -> np.ndarray:
        """
        Calculate drift between subjects at each time point.
        
        Args:
            subject_manifolds: Dictionary of subject manifolds
            
        Returns:
            Drift values for each time point
        """
        subject_ids = list(subject_manifolds.keys())
        if len(subject_ids) < 2:
            return np.zeros(next(iter(subject_manifolds.values())).shape[0])
        
        # Calculate drift as average pairwise distance
        n_timepoints = next(iter(subject_manifolds.values())).shape[0]
        drift = np.zeros(n_timepoints)
        
        for t in range(n_timepoints):
            distances = []
            for i in range(len(subject_ids)):
                for j in range(i + 1, len(subject_ids)):
                    subj1 = subject_manifolds[subject_ids[i]][t]
                    subj2 = subject_manifolds[subject_ids[j]][t]
                    dist = np.linalg.norm(subj1 - subj2)
                    distances.append(dist)
            drift[t] = np.mean(distances) if distances else 0
        
        return drift
    
    def create_vr_json_structure(self, subject_data: Dict, subject_ids: List[str], drift: np.ndarray) -> List[Dict]:
        """
        Create VR-compatible JSON structure matching the existing format.
        
        Args:
            subject_data: Processed subject data
            subject_ids: List of subject IDs
            drift: Drift values for each time point
            
        Returns:
            VR-compatible JSON data
        """
        n_timepoints = len(drift)
        vr_data = []
        
        for t in range(n_timepoints):
            time_point = {'time_index': t, 'drift': float(drift[t])}
            
            # Add VR coordinates for each subject
            for subject_id in subject_ids:
                vr_coords = subject_data[subject_id]['vr_coords']
                time_point[f'x{subject_id}_vr'] = float(vr_coords[t, 0])
                time_point[f'y{subject_id}_vr'] = float(vr_coords[t, 1])
                time_point[f'z{subject_id}_vr'] = float(vr_coords[t, 2])
            
            vr_data.append(time_point)
        
        return vr_data

def load_config(config_file: str) -> Dict:
    """Load configuration from YAML file."""
    with open(config_file, 'r') as f:
        return yaml.safe_load(f)

def create_default_config() -> Dict:
    """Create default configuration."""
    return {
        'data_path': '/home/lanlokun/Documents/Nankai University/FinalYear/THESIS/The Universal Narrative Engine/Datasets/ds002322',
        'subjects': ['18', '22', '23', '24'],
        'output_file': 'alice_4subjects_vr.json',
        'umap_params': {
            'n_components': 3,
            'n_neighbors': 30,
            'min_dist': 0.1,
            'metric': 'cosine'
        }
    }

def main():
    parser = argparse.ArgumentParser(description='Generate multi-subject VR data')
    parser.add_argument('--config', type=str, help='Configuration file path')
    parser.add_argument('--subjects', type=str, help='Comma-separated subject IDs (e.g., 18,22,23,24)')
    parser.add_argument('--output', type=str, help='Output JSON file path')
    parser.add_argument('--data-path', type=str, help='Path to ds002322 dataset')
    parser.add_argument('--list-subjects', action='store_true', help='List available subjects')
    
    args = parser.parse_args()
    
    # Load configuration
    if args.config:
        config = load_config(args.config)
    else:
        config = create_default_config()
    
    # Override config with command line arguments
    if args.subjects:
        config['subjects'] = [s.strip() for s in args.subjects.split(',')]
    if args.output:
        config['output_file'] = args.output
    if args.data_path:
        config['data_path'] = args.data_path
    
    # Initialize generator
    generator = MultiSubjectVRGenerator(config['data_path'])
    
    # List available subjects if requested
    if args.list_subjects:
        available = generator.get_available_subjects()
        print(f"Available subjects: {available}")
        return
    
    # Generate VR data
    try:
        vr_data = generator.generate_vr_data(
            config['subjects'], 
            config['output_file']
        )
        
        print(f"\nSuccess! Generated VR data for {len(config['subjects'])} subjects:")
        for subject_id in config['subjects']:
            print(f"  - Subject {subject_id}")
        print(f"\nOutput file: {config['output_file']}")
        print(f"Time points: {len(vr_data)}")
        
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
