# Multi-Subject VR Data Generator

This directory contains scripts to generate VR-compatible neural trajectory data for multiple subjects.

## Files

### `generate_4subject_vr.py`
**Quick Start Script** - Generates VR data for 4 subjects (18, 22, 23, 24) with synthetic neural trajectories that follow realistic patterns.

```bash
cd notebooks
source ../venv/bin/activate
python generate_4subject_vr.py
```

**What it does:**
- Generates synthetic 3D manifold coordinates for 4 subjects
- Aligns manifolds to common reference space
- Calculates drift between subjects at each time point
- Normalizes coordinates to 0-1 VR space
- Updates `subjects-config.js` automatically
- Saves data as `alice_4subjects_vr.json`

### `generate_multi_subject_vr.py`
**Advanced Configurable Script** - Full pipeline for processing real fMRI data with YAML configuration.

```bash
cd notebooks
source ../venv/bin/activate
python generate_multi_subject_vr.py --config subjects_config.yaml
```

**Features:**
- Processes real fMRI data from ds002322 dataset
- UMAP manifold learning
- Procrustes alignment
- YAML configuration support
- Custom subject selection

### `subjects_config.yaml`
Configuration file for the advanced script. Customize:
- Subject IDs to include
- UMAP parameters
- Output file paths
- Processing options

## Generated Data Structure

The JSON output follows this format for each time point:

```json
{
  "time_index": 0,
  "drift": 0.157,
  "x18_vr": 0.418,
  "y18_vr": 0.997,
  "z18_vr": 0.416,
  "x22_vr": 0.435,
  "y22_vr": 0.986,
  "z22_vr": 0.409,
  "x23_vr": 0.468,
  "y23_vr": 0.995,
  "z23_vr": 0.465,
  "x24_vr": 0.465,
  "y24_vr": 0.967,
  "z24_vr": 0.581
}
```

## VR Integration

### Subject Colors
- Subject 18: Blue (#00f2ff)
- Subject 22: Green (#00ff00)
- Subject 23: Red (#ff0055)
- Subject 24: Orange (#ffaa00)

### Automatic Updates
The generator automatically updates:
- `../data/alice_4subjects_vr.json` - VR data file
- `../src/subjects-config.js` - Subject configuration

### Manual Usage
To add more subjects manually:

1. **Update subjects-config.js:**
```javascript
{
    id: 'subject26',
    name: 'Subject 26',
    color: '#ff00ff',
    emissive: '#ff00ff',
    radius: 0.025,
    dataPrefix: '26_vr'
}
```

2. **Generate data with matching field names:**
```json
{
  "x26_vr": 0.123,
  "y26_vr": 0.456,
  "z26_vr": 0.789
}
```

## Quick Start

1. **Generate 4-subject data:**
```bash
cd notebooks
python generate_4subject_vr.py
```

2. **Start VR interface:**
```bash
cd ../src
# Open index.html in browser or serve with HTTP server
```

3. **All 4 subjects will appear:**
- Blue cursor: Subject 18
- Green cursor: Subject 22  
- Red cursor: Subject 23
- Orange cursor: Subject 24

## Adding More Subjects

### Method 1: Quick Script (Recommended)
Modify `generate_4subject_vr.py`:
```python
subjects = ['18', '22', '23', '24', '26', '28']  # Add more subjects
```

### Method 2: Configuration File
Edit `subjects_config.yaml`:
```yaml
subjects: 
  - "18"
  - "22" 
  - "23"
  - "24"
  - "26"  # Add new subjects
```

### Method 3: Manual
1. Generate data with field names: `x{id}_vr`, `y{id}_vr`, `z{id}_vr`
2. Update `subjects-config.js` with new subject configuration
3. Update `app.js` to load your JSON file

## Data Processing Pipeline

For real fMRI data processing:

1. **Install dependencies:**
```bash
pip install nibabel nilearn umap-learn pyyaml
```

2. **Run advanced script:**
```bash
python generate_multi_subject_vr.py --subjects 18,22,23,24,26 --output my_vr_data.json
```

3. **Features:**
- Real fMRI data loading
- UMAP dimensionality reduction
- Procrustes alignment
- Drift calculation
- VR normalization

## Troubleshooting

### Git-annex Issues
If you encounter git-annex symlink issues with real fMRI data:
```bash
cd "path/to/ds002322"
git annex get .  # Retrieve actual data files
```

### Missing Dependencies
```bash
pip install nibabel nilearn umap-learn pyyaml numpy pandas scipy
```

### VR Not Loading
1. Check JSON file exists in `../data/`
2. Verify `subjects-config.js` is updated
3. Ensure `app.js` loads correct JSON file
4. Check browser console for errors

## Next Steps

1. **Generate 4-subject data** using the quick script
2. **Test in VR interface** - all 4 subjects should be visible
3. **Add more subjects** by modifying the script
4. **Process real data** using the advanced pipeline
5. **Customize colors** and visualization parameters
