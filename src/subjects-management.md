# Dynamic Subject Management System

## Overview
The VR research suite now supports dynamic addition and removal of subjects through a configuration-based system.

## Adding New Subjects

### 1. Update Configuration
Edit `subjects-config.js` and add new subject to the `subjects` array:

```javascript
{
    id: 'subject45',
    name: 'Subject 45', 
    color: '#00ff00',
    emissive: '#00ff00',
    radius: 0.025,
    dataPrefix: '45_vr'
}
```

### 2. Update Data Format
Your JSON data must include corresponding coordinate fields:
- `x45_vr`, `y45_vr`, `z45_vr` for the new subject

### 3. Automatic Integration
The system will automatically:
- Create cursor entity in VR scene
- Handle position updates
- Add voxel trails
- Include in tether visualization (if ≥2 subjects)

## Removing Subjects

### Method 1: Configuration Edit
Simply remove the subject entry from `subjects-config.js`

### Method 2: Runtime Removal
```javascript
SUBJECTS_CONFIG.removeSubject('subject45');
initializeSubjects(); // Rebuild cursors
```

## Subject Properties

- **id**: Unique identifier (used for DOM element ID)
- **name**: Display name for UI
- **color**: RGB color for cursor and voxels
- **emissive**: Glow color
- **radius**: Size of cursor sphere
- **dataPrefix**: Prefix matching data field names

## Data Field Mapping

The system automatically maps data fields:
- `x{dataPrefix}` → X coordinate
- `y{dataPrefix}` → Y coordinate  
- `z{dataPrefix}` → Z coordinate

Example: For `dataPrefix: '18_vr'`
- `x18_vr` → X position
- `y18_vr` → Y position
- `z18_vr` → Z position

## Visualization Features

### Cursors
- Each subject gets a colored sphere cursor
- Position updates in real-time with data

### Voxel Trails
- Each subject drops colored voxels during playback
- Color matches subject configuration

### Tethers
- Lines connect first two subjects when drift > 0.05
- Automatically adapts to subject count

### Velocity Calculation
- Uses first subject's movement for velocity display
- Automatically adapts if first subject changes

## Best Practices

1. **Consistent Data Format**: Ensure all subjects have complete coordinate data
2. **Color Selection**: Use distinct colors for easy differentiation
3. **Performance**: Limit to ~10 subjects for optimal performance
4. **Data Validation**: System gracefully handles missing data fields

## Example: Adding 3rd Subject

```javascript
// subjects-config.js
{
    id: 'subject42',
    name: 'Subject 42',
    color: '#ffff00',  // Yellow
    emissive: '#ffff00',
    radius: 0.025,
    dataPrefix: '42_vr'
}
```

```json
// Data file addition
{
    "x18_vr": 0.123, "y18_vr": 0.456, "z18_vr": 0.789,
    "x23_vr": 0.234, "y23_vr": 0.567, "z23_vr": 0.890,
    "x42_vr": 0.345, "y42_vr": 0.678, "z42_vr": 0.901,  // New
    "drift": 0.0123
}
```

The system will automatically handle the new subject without any code changes!
