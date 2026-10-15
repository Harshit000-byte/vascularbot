# 🫀 VascularBot — Interactive Hemodynamic Dijkstra Algorithm Visualization

**VascularBot** is an interactive biomedical algorithm simulation and visualization application. It models a medical nanobot navigating through human vasculature (arteries, veins, and capillaries) to locate and target a neoplasm (tumor) with minimal energy expenditure.

Unlike standard shortest-path algorithms that consider only Euclidean distance, VascularBot implements a custom **Hemodynamic Dijkstra's Algorithm** where edge traversal weights reflect the actual biophysical energy cost of fluid dynamic resistance and counter-current hemodynamics.

---

## ⚡ Mathematical & Biophysical Model

The traversal cost for an edge $e = (u, v)$ is calculated as:

$$\text{Cost} = \left( \frac{\text{Length}}{\text{Radius}^2} \right) \times \text{Penalty}$$

Where the directional hemodynamic penalty is:
- **Moving WITH blood flow**: $\text{Penalty} = 1.0$
- **Moving AGAINST blood flow**: $\text{Penalty} = \exp(k \times v)$
  - $v$: Local blood velocity $(\text{cm/s})$
  - $k$: Biophysical drag constant (customizable, default $k = 0.5$)

### Systolic Heartbeat Pulse Dynamics
When the cardiac cycle enters **systole** (or when the user engages the **Heartbeat Pulse** toggle):
1. Blood velocity spikes by a multiplier factor (e.g., $2.5\times$).
2. Traversal penalty for moving against high-pressure arterial flow surges exponentially ($\exp(k \cdot v)$).
3. The Dijkstra engine recalculates in real-time, dynamically rerouting the nanobot through lower-velocity bypass veins, sinusoids, or collateral pathways to preserve energy.

---

## 🩺 Anatomical Models & Features

### 1. Real Heart Anatomical Model (Coronary Circulation)
- **Cardiac Anatomy**: High-precision vector illustration of the human heart featuring the **Left Ventricle**, **Right Ventricle**, **Left & Right Atria**, **Ascending Aorta & Aortic Arch**, **Pulmonary Trunk**, **Superior/Inferior Vena Cava**, cardiac valves (**AV, PV, MV, TV**), and apex.
- **Embedded Arterial Bed**:
  - **Catheter Port**: Aortic Root / Ostium injection site
  - **Left Main Coronary Artery (LMCA)**
  - **Left Anterior Descending (LAD)**: Courses along the anterior interventricular sulcus with **Diagonal Branches (D1, D2)** and **Septal Perforators**
  - **Left Circumflex Artery (LCx)**: Traverses the left AV groove with **Obtuse Marginal Branches (OM1, OM2)**
  - **Right Coronary Artery (RCA)**: Loops along the right AV groove with **Acute Marginal** and **Posterior Descending (PDA)** branches
  - **Coronary Venous Return**: Great Cardiac Vein, Middle Cardiac Vein, Coronary Sinus
  - **Target**: Cardiac Myxoma on the posterior ventricular wall
- **Systolic Expansion**: The myocardium physically contracts and dilates with animated systolic shockwaves during pulse cycles.

### 2. Additional Microcirculation Presets
- **Cerebral Microcirculation (Circle of Willis)**: High-speed carotid feed vs. cortical venous shunts targeting glioblastoma multiforme.
- **Hepatic Dual-Inflow System**: Hepatic Artery + Portal Vein dual-circulation targeting hepatocellular carcinoma.
- **Procedural Network Generator**: Infinite procedural vascular bed generation for stress-testing.

### 3. Real-Time Telemetry & Simulation Controls
- **Interactive Canvas (70%)**: 60fps HTML5 Canvas with Pan & Zoom, animated nanobot with thrust plume & directional radar, blood flow particles, and vessel metric tooltips.
- **Biophysics Control Sidebar (30%)**:
  - Start, Pause, Resume, and Reset simulation
  - Heartbeat Pulse manual toggle and Auto-Pulse cycle
  - Live **Energy Depleted** metric with progression gauge
  - Real-time ECG Oscilloscope synced with pulse states
  - Fluid dynamics parameters ($k$-constant, pulse multiplier, simulation speed)
  - Real-time algorithm comparison modal (Hemodynamic Dijkstra vs. Euclidean Shortest Path)
  - Web Audio API synthesizer for cardiac heartbeat, telemetry pings, and arrival fanfares

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Graphics**: HTML5 Canvas (60fps animation loop) + Anatomical SVG
- **Audio**: Web Audio API (real-time procedural telemetry audio synthesis)
- **Icons**: Lucide React
- **Celebration FX**: Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd vascular-bot

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building for Production

```bash
npm run build
npm start
```

---

## 📜 License

MIT License. Built for Design & Analysis of Algorithms (DAA).
