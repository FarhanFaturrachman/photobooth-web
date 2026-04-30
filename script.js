/* ========================================================
   DINA PHOTOBOOTH - FULL LOGIC (FINAL STABLE)
   ======================================================== */

let photosTaken = [null, null, null, null]; 
let stream = null;
let targetRetakeIndex = null;
let currentSelectedFrameSrc = null;

const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const canvasResult = document.getElementById('canvas-result');
const finalPreview = document.getElementById('final-image-preview');

function switchPage(pageId) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

async function startCapture() {
    if (stream) { stream.getTracks().forEach(track => track.stop()); }
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: { ideal: 1280 }, height: { ideal: 960 }, aspectRatio: 1.3333, facingMode: "user" } 
        });
        video.srcObject = stream;
        switchPage('page-camera');
    } catch (err) { alert("Kamera error!"); }
}

function triggerManualCapture() {
    let emptySlot = photosTaken.indexOf(null);
    if (emptySlot !== -1) runCountdown(3, emptySlot);
    else alert("Foto sudah penuh!");
}

function runCountdown(sec, slot) {
    let count = sec;
    timerDisplay.innerText = count;
    let inv = setInterval(() => {
        count--;
        if (count > 0) timerDisplay.innerText = count;
        else {
            clearInterval(inv);
            timerDisplay.innerText = "📸";
            captureToSlot(slot);
            setTimeout(() => { 
                timerDisplay.innerText = "";
                if (photosTaken.indexOf(null) === -1) document.getElementById('btn-go-to-frame').style.display = 'inline-block';
            }, 600);
        }
    }, 1000);
}

function captureToSlot(slotIndex) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1280; tempCanvas.height = 960;
    const ctx = tempCanvas.getContext('2d');
    ctx.translate(tempCanvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 1280, 960);
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;
    document.getElementById(`slot-${slotIndex}`).innerHTML = `<img src="${dataUri}" style="width:100%; height:100%; object-fit:cover;">`;
}

function openDetail(index) {
    if (!photosTaken[index]) return;
    targetRetakeIndex = index;
    document.getElementById('detail-img-view').src = photosTaken[index];
    document.getElementById('confirm-box').style.display = 'none';
    document.getElementById('photo-detail-modal').style.display = 'flex';
}

function closeDetail() { document.getElementById('photo-detail-modal').style.display = 'none'; }

document.getElementById('btn-confirm-retake').onclick = () => { document.getElementById('confirm-box').style.display = 'block'; };

document.getElementById('btn-yes-retake').onclick = () => {
    photosTaken[targetRetakeIndex] = null;
    document.getElementById(`slot-${targetRetakeIndex}`).innerHTML = `<span>${targetRetakeIndex + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
    closeDetail();
};

function loadFramesToContainer(containerId, className, isSidebar = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for(let i=1; i<=10; i++) {
        const img = document.createElement('img');
        img.src = `frame/frame${i}.png`; 
        img.className = className;
        img.onclick = () => { currentSelectedFrameSrc = img.src; generateCollage(img.src); };
        container.appendChild(img);
    }
}

function showFrameSelection() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    switchPage('page-frame-selection');
    loadFramesToContainer('frame-options-scroll', 'frame-thumb-scroll', false);
}

function generateCollage(frameSrc) {
    const ctx = canvasResult.getContext('2d');
    const frameImg = new Image();
    frameImg.src = frameSrc;
    frameImg.onload = () => {
        canvasResult.width = frameImg.width;
        canvasResult.height = frameImg.height;
        const w = canvasResult.width;
        const h = canvasResult.height;
        const imgW = w * 0.85; const imgH = imgW * 0.70;
        const xPos = (w - imgW) / 2;
        const startY = h * 0.033; const gap = h * 0.208;
        let processed = 0;
        photosTaken.forEach((data, i) => {
            const pImg = new Image();
            pImg.src = data;
            pImg.onload = () => {
                const imgRatio = pImg.width / pImg.height;
                const targetRatio = imgW / imgH;
                let sx, sy, sw, sh;
                if (imgRatio > targetRatio) { sw = pImg.height * targetRatio; sh = pImg.height; sx = (pImg.width - sw) / 2; sy = 0; }
                else { sw = pImg.width; sh = pImg.width / targetRatio; sx = 0; sy = (pImg.height - sh) / 2; }
                ctx.drawImage(pImg, sx, sy, sw, sh, xPos, startY + (i * gap), imgW, imgH);
                processed++;
                if (processed === 4) {
                    ctx.drawImage(frameImg, 0, 0, w, h);
                    finalPreview.src = canvasResult.toDataURL('image/png');
                    if (!document.getElementById('page-final-preview').classList.contains('active')) {
                        switchPage('page-final-preview');
                        loadFramesToContainer('frame-options-sidebar', 'frame-thumb-sidebar', true);
                    }
                }
            };
        });
    };
}

document.getElementById('btn-download').onclick = () => {
    const link = document.createElement('a');
    link.download = `Photobooth_Dina_${Date.now()}.png`;
    link.href = finalPreview.src;
    link.click();
};

document.getElementById('btn-share').onclick = async () => {
    try {
        const blob = await new Promise(resolve => canvasResult.toBlob(resolve, 'image/png'));
        const file = new File([blob], `Photo.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: 'DINA Photobooth' });
        } else { alert("Gunakan HP/HTTPS untuk share."); }
    } catch (err) { console.error(err); }
};

window.addEventListener("orientationchange", () => { setTimeout(() => { if (stream) startCapture(); }, 500); });
function backToCamera() { switchPage('page-camera'); startCapture(); }
function backToFrameSelection() { showFrameSelection(); }
