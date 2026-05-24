const LIB_CDN = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm';

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const canvasArea = document.getElementById('canvasArea');
const originalImg = document.getElementById('originalImg');
const resultCanvas = document.getElementById('resultCanvas');
const overlay = document.getElementById('overlay');
const processLabel = document.getElementById('processLabel');
const progressBar = document.getElementById('progressBar');
const downloadBtn = document.getElementById('downloadBtn');
const newImageBtn = document.getElementById('newImageBtn');
const statusBadge = document.getElementById('statusBadge');

let resultBlob = null;
let removeBackgroundFn = null;

async function loadLibrary() {
  const module = await import(LIB_CDN);
  removeBackgroundFn = module.removeBackground;
}

// Pre-load library on page load
loadLibrary().catch(err => console.error('Library load failed:', err));

dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

newImageBtn.addEventListener('click', () => {
  canvasArea.classList.remove('visible');
  dropZone.style.display = '';
  fileInput.value = '';
  downloadBtn.disabled = true;
  statusBadge.classList.remove('success');
  resultBlob = null;
});

downloadBtn.addEventListener('click', () => {
  if (!resultBlob) return;
  const url = URL.createObjectURL(resultBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'erased.png';
  a.click();
  URL.revokeObjectURL(url);
});

async function handleFile(file) {
  dropZone.style.display = 'none';
  canvasArea.classList.add('visible');

  originalImg.src = URL.createObjectURL(file);

  overlay.classList.remove('hidden');
  resultCanvas.style.display = 'none';
  downloadBtn.disabled = true;
  statusBadge.classList.remove('success');
  progressBar.style.width = '0%';
  processLabel.textContent = 'Loading AI model…';

  try {
    if (!removeBackgroundFn) {
      await loadLibrary();
    }

    // No publicPath — library fetches models from its own CDN automatically
    const config = {
      output: { format: 'image/png' },
      progress: (key, current, total) => {
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        progressBar.style.width = pct + '%';
        if (key.includes('fetch') || key.includes('load')) {
          processLabel.textContent = `Loading model… ${pct}%`;
        } else {
          processLabel.textContent = `Removing background… ${pct}%`;
        }
      }
    };

    const blob = await removeBackgroundFn(file, config);
    resultBlob = blob;

    const blobUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      resultCanvas.width = img.naturalWidth;
      resultCanvas.height = img.naturalHeight;
      const ctx = resultCanvas.getContext('2d');
      ctx.clearRect(0, 0, img.naturalWidth, img.naturalHeight);
      ctx.drawImage(img, 0, 0);
      overlay.classList.add('hidden');
      resultCanvas.style.display = 'block';
      downloadBtn.disabled = false;
      statusBadge.classList.add('success');
      URL.revokeObjectURL(blobUrl);
    };
    img.src = blobUrl;

  } catch (err) {
    console.error('Background removal error:', err);
    processLabel.textContent = 'Error — please try another image.';
    progressBar.style.width = '0%';
  }
}