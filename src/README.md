# Alice Manifold VR Research Suite

A WebVR application for visualizing neural data and brain activity in an immersive 3D environment.

## Project Structure

```
src/
├── index.html          # Main HTML entry point
├── styles.css          # CSS styles and animations
├── app.js              # Main application logic
└── README.md           # This documentation

../data/
├── alice_audio.wav     # Audio stimulus file
├── alice_vr_data.json  # Neural data for visualization
└── ...                 # Other data files
```

## Features

- **Real-time VR visualization** of neural data points
- **Audio-reactive brain shell** that pulses with stimulus
- **Multi-subject support** with easy switching
- **Timeline navigation** with TR-based positioning
- **Data import/export** functionality
- **Live statistics** including drift, velocity, and peak values
- **Screenshot capture** for documentation

## Key Components

### HTML Structure (`index.html`)
- A-Frame VR scene setup
- Dashboard UI controls
- Audio element for stimulus playback
- File input elements for data upload

### CSS Styles (`styles.css`)
- Modern glassmorphism dashboard design
- Responsive grid layouts
- Smooth animations and transitions
- Custom color scheme with CSS variables

### JavaScript Application (`app.js`)
- **DOM Management**: Centralized element references
- **State Management**: Application state and data handling
- **Audio Engine**: Web Audio API integration
- **VR Rendering**: A-Frame entity manipulation
- **Data Processing**: Neural data visualization
- **Event Handling**: User interactions and controls

## Usage

1. Open `index.html` in a WebVR-compatible browser
2. Use the dashboard controls to:
   - Load audio stimulus files
   - Upload subject data (JSON format)
   - Navigate through the timeline
   - Adjust playback speed and volume
   - Toggle brain shell visibility
   - Export session data

## Data Format

Subject data should be in JSON format with the following structure:
```json
[
  {
    "x18_vr": 0.123,
    "y18_vr": 0.456,
    "z18_vr": 0.789,
    "x23_vr": 0.234,
    "y23_vr": 0.567,
    "z23_vr": 0.890,
    "drift": 0.0123
  }
  // ... more TR data points
]
```

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Requires WebVR/WebXR support
- Web Audio API support required
