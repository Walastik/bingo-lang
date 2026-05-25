# 🚀 Expo App

A [Expo](https://expo.dev) project built with React Native.

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) or use `npx expo`

### Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the app:
   ```bash
   npx expo start
   ```

4. Press `i` to open in iOS Simulator, `a` for Android Emulator, or scan the QR code with the **Expo Go** app on your physical device.

---

## 📁 Project Structure

- `app/` — Main React Native screens (Expo Router)
- `assets/` — Images, fonts, icons
- `components/` — Reusable UI components
- `constants/`, `utils/`, etc. — Supporting code

---

## 🧪 Testing & Debugging

- `npx expo start --dev-client` — for custom development builds (Expo Dev Client)
- `npx expo install react-native-web` — to enable web support

---

## 📦 Deployment

- **Prebuild**: `npx expo prebuild` (if using native modules)
- **EAS Build**: `eas build -p ios --profile preview`
- **EAS Submit**: `eas submit -p ios --profile preview`

> See [Expo Documentation](https://docs.expo.dev/) for full guides.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR.

---

## 📜 License

MIT — see `LICENSE` for details.
```

> Replace `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME` with your actual GitHub info.

---

### ✅ `.gitignore` (Expo/React Native)

```gitignore packages/expo-app/.gitignore
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build
/.expo

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# debugging
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db# bingo-lang
A fun little bingo app para sa aking pamilya!
