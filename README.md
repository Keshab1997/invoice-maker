# Invoice Maker - Daily Cash Report PWA

## Features
✅ Login system with local storage
✅ Dynamic cash report entries
✅ Double-click to edit any field
✅ Cash received (+) with green icon
✅ Cash handover (-) with red icon
✅ Auto calculation (Petty Cash & Total)
✅ Export report as image
✅ Premium modern UI
✅ PWA - Install as mobile app
✅ Offline support

## Installation

### Method 1: Direct Browser (Easiest)
1. Open `index.html` in Chrome/Edge browser
2. Click the install icon in address bar
3. App will be installed on your device

### Method 2: Local Server
```bash
cd /tmp/invoice-maker
python3 -m http.server 8000
```
Then open: http://localhost:8000

### Method 3: Convert to APK
1. Use **PWA Builder**: https://www.pwabuilder.com/
   - Enter your hosted URL
   - Click "Build My PWA"
   - Download Android APK

2. Or use **Bubblewrap**:
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://your-url/manifest.json
bubblewrap build
```

## Usage
1. **Login**: Enter any username/password (stored locally)
2. **Add Entry**: Click green (+) for received or red (-) for handover
3. **Edit**: Double-click any field to edit
4. **Export**: Click "Export as Image" to save report
5. **Clear**: Click "Clear All" to reset

## Files
- `index.html` - Main app structure
- `style.css` - Premium modern styling
- `app.js` - All functionality
- `manifest.json` - PWA configuration
- `sw.js` - Service worker for offline

## Tech Stack
- HTML5
- CSS3 (Gradient, Flexbox, Grid)
- Vanilla JavaScript
- LocalStorage API
- html2canvas (Image export)
- Service Worker (PWA)

---
Made with ❤️ for professional cash reporting
