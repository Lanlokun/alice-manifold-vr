# 🧠 Alice Manifold | VR Neuro-Alignment Suite

An immersive, real-time 3D research interface built with **A-Frame** and **Web Audio API**. This suite serves as a simulator for visualizing high-dimensional fMRI manifold data, specifically tracking how different subjects (Subject 18 and Subject 23) synchronize their neural states while processing the *Alice in Wonderland* narrative stimulus.



## 🔬 Scientific Context
This project utilizes **Manifold Alignment** to project complex brain activity into a shared 3D Euclidean space. By visualizing these trajectories in a VR environment, researchers can identify **"Neural Tears"**—specific temporal moments where subjects' internal representations of the story diverge due to differing cognitive interpretations, lapses in attention, or unique emotional responses to the stimulus.

## 🛠 Features
* **Velocity of Thought Metric:** Real-time calculation of Euclidean displacement per TR (1.5s), highlighting rapid shifts or "jumps" in the brain's neural state space.
* **Stimulus-Response Pulse:** A reactive VR Shell that pulses in sync with the audio frequency of the narrative, allowing for the observation of the **Hemodynamic Response Function (HRF)** lag between sound and neural movement.
* **Divergence Telemetry:** Live monitoring of **Manifold Drift** with a Peak-Drift memory log to track the maximum point of subject decoherence.
* **Research Persistence:** Integrated **JSON Export/Import** for saving session metadata and a **VR Screenshot** utility for immediate visual documentation of findings.
* **Audio Analytics:** 32-bar frequency visualizer (RTA) to monitor the auditory stimulus intensity in real-time.



## 🎮 Interface & Controls
| Control | Description |
| :--- | :--- |
| **Initialize Sync** | Authenticates the Web Audio context and starts the data/audio engine. |
| **Playback Speed** | Toggles between **0.5x**, **1.0x**, and **2.0x** for variable temporal analysis. |
| **Capture VR** | Triggers the A-Frame screenshot component to save the current manifold orientation. |
| **Export JSON** | Downloads a research snippet containing the current TR, Peak Drift, and Velocity. |
| **Toggle Shell** | Enables/disables the reactive boundary to eliminate perceptual bias during coordinate checks. |

## 📂 Project Structure
```text
/alice-vr-manifold
│
├── index.html          # Core VR Engine, Analytics Logic & UI
├── README.md           # Research Documentation
└── /data
    ├── alice_vr_data.json  # Pre-processed manifold coordinates (X,Y,Z)
    └── alice_audio.wav     # The "Alice in Wonderland" narrative stimulus audio

```


## 🚀 Deployment & Installation

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/alice-vr-manifold.git](https://github.com/lanlokun/alice-vr-manifold.git)

    ```

## 📊 Data Interpretation

The visual environment is mapped to reflect the real-time mathematical state of the **Alice fMRI manifold alignment**:

* **Proximity**: When the **Cyan (S18)** and **Magenta (S23)** spheres are in close spatial proximity, the subjects are in a state of **high neural alignment**, suggesting a shared cognitive understanding of the narrative stimulus.
* **Velocity Spikes**: Sudden jumps in the velocity metric often correlate with "climax" points in the story or rapid shifts in the brain's **Default Mode Network (DMN)** as subjects transition between narrative scenes.

* **Visual Tethers**: White lines appear automatically when **Drift exceeds 0.05**, signaling a significant **"Manifold Tear"** where subjects' internal representations have diverged.