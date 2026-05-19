# 🌿 Psoriasis Companion

![Vercel Deploy](https://img.shields.io/badge/Vercel-Deployed-success?style=for-the-badge&logo=vercel)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A privacy-first, offline-capable **Progressive Web App (PWA)** designed to help individuals track psoriasis flare-ups, manage medications, and correlate lifestyle factors with their skin health.

🌐 **[Live Demo](https://psoriasis-companion.vercel.app)**

---

## ✨ Features

- **📱 Mobile-First PWA:** Installable on iOS and Android directly from the browser. Works completely offline.
- **🔒 Local-First Privacy:** All health data (including photos) is stored securely on your device using IndexedDB (via Dexie.js). No data leaves your phone.
- **💊 Medication Management:** Track daily routines (Morning/Evening/Custom) and check them off your list.
- **🗺️ Interactive Body Map:** Tap on a visual human silhouette to log exactly where flare-ups are occurring.
- **📸 Visual Logging:** Capture photos directly from your device camera, rate severity and itchiness (1-10), and add lifestyle notes (diet, stress, sleep).
- **📊 The "Data Scientist" Engine:** Automatically correlates your sleep and stress levels with your flare-up severity to generate actionable insights.
- **🌙 Deep Dark Mode:** A sleek, accessible, high-contrast UI designed to be easy on the eyes.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Vanilla CSS (Custom Properties for Theming)
- **Icons:** Lucide React
- **Storage:** Dexie.js (IndexedDB wrapper)
- **PWA:** `vite-plugin-pwa` for Service Workers and Web Manifest
- **Hosting:** Vercel

---

## 🚀 Running Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repo
   ```bash
   git clone https://github.com/Stormynubee/psoriasis-companion.git
   ```
2. Navigate to the project directory
   ```bash
   cd psoriasis-companion
   ```
3. Install NPM packages
   ```bash
   npm install
   ```
4. Start the development server
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173`

---

## 🏗️ Project Structure

```text
src/
├── components/
│   ├── dashboard/   # Home screen components (MedChecklist, BodyMap)
│   ├── history/     # Calendar/History view of past logs
│   ├── layout/      # Navigation and app shell
│   ├── log/         # Detailed photo and symptom logging
│   ├── settings/    # App preferences and medication management
│   └── trends/      # Analytics and Data Scientist insights
├── db/              # Dexie.js database schema and setup
├── hooks/           # Custom React hooks (e.g., useInsights)
├── App.tsx          # Main routing and application state
└── index.css        # Global styles and Dark Mode variables
```

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Designed and built with care for the chronic illness community.*
