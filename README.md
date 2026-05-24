# Erase — AI Background Remover

A browser-based tool that uses AI to instantly remove the background from any image, running entirely on your device with no uploads or server required. Upload a photo, let the model process it, and download the result as a transparent PNG in seconds.

---

## Features

- **100% client-side** — no images are ever sent to a server
- **Drag & drop or click to upload** — supports PNG, JPG, and WEBP
- **Live progress bar** — shows model loading and processing status
- **Side-by-side preview** — compare original and result before downloading
- **One-click PNG download** — transparent background, ready to use

## Project Structure

```
├── index.html   # Markup and layout
├── style.css    # All styles, variables, and responsive rules
├── app.js       # AI processing logic, drag & drop, and download
└── README.md
```

## Usage

Because `app.js` uses ES module imports, the files must be served over HTTP — opening `index.html` directly as a `file://` URL will not work. Start a local server in the project folder using one of these methods:

**Python**
```bash
python -m http.server 8080
```

**Node.js**
```bash
npx serve .
```

**VS Code** — install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension, then right-click `index.html` and choose "Open with Live Server".

Then open `http://localhost:8080` in your browser.

## How It Works

The app uses [`@imgly/background-removal`](https://github.com/imgly/background-removal-js), an open-source library that runs an ONNX segmentation model directly in the browser via WebAssembly. On first use, the model weights (~40MB) are downloaded from the IMG.LY CDN and cached by the browser — subsequent uses are significantly faster.

No `publicPath` configuration is needed; the library resolves its own model assets automatically.

## Dependencies

All dependencies are loaded from CDN — no `npm install` required.

| Dependency | Purpose |
|---|---|
| `@imgly/background-removal` | AI background removal (ONNX + WASM) |
| Google Fonts (Fraunces, DM Sans, DM Mono) | Typography |

## Browser Support

Any modern browser with WebAssembly and ES module support — Chrome, Firefox, Edge, and Safari all work.