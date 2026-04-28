let photosTaken = [null, null, null, null]; 
let currentSlot = 0;
let stream = null;
let targetRetakeIndex = null;

const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const canvasResult = document.getElementById('canvas-result');
const finalPreview = document.getElementById('final-image-preview');

// START CAPTURE
async function startCapture() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        video.srcObject = stream;
        document.getElementById('page-home').classList.remove('active');
        document.getElementById('page-camera').classList.add('active');
    } catch (err) { alert("Kamera error! Cek izin kamera."); }
}

// COUNTDOWN & CAPTURE
function triggerManualCapture() {
    currentSlot = photosTaken.indexOf(null);
    if (currentSlot !== -1) runCountdown(3);
    else alert("Slot penuh! Klik foto untuk ulangi.");
}

function runCountdown(sec) {
    let count = sec;
    timerDisplay.innerText = count;
    document.getElementById('btn-capture-manual').disabled = true;
    let inv = setInterval(() => {
        count--;
        if (count > 0) timerDisplay.innerText = count;
        else {
            clearInterval(inv);
            timerDisplay.innerText = "📸";
            captureToSlot(currentSlot);
            setTimeout(() => { 
                timerDisplay.innerText = "";
                document.getElementById('btn-capture-manual').disabled = false;
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
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;
    document.getElementById(`slot-${slotIndex}`).innerHTML = `<img src="${dataUri}">`;
}

// MODAL GALLERY
function openDetail(index) {
    if (!photosTaken[index]) return;
    targetRetakeIndex = index;
    document.getElementById('detail-img-view').src = photosTaken[index];
    document.getElementById('btn-confirm-retake').style.display = 'inline-block';
    document.getElementById('confirm-box').style.display = 'none';
    document.getElementById('photo-detail-modal').style.display = 'flex';
}

function closeDetail() { document.getElementById('photo-detail-modal').style.display = 'none'; }

document.getElementById('btn-confirm-retake').onclick = () => {
    document.getElementById('btn-confirm-retake').style.display = 'none';
    document.getElementById('confirm-box').style.display = 'block';
};

document.getElementById('btn-yes-retake').onclick = () => {
    photosTaken[targetRetakeIndex] = null;
    document.getElementById(`slot-${targetRetakeIndex}`).innerHTML = `<span>${targetRetakeIndex + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
    closeDetail();
};

// FRAME SELECTION
function showFrameSelection() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    document.getElementById('page-camera').classList.remove('active');
    document.getElementById('page-frame').classList.add('active');
    const frameContainer = document.getElementById('frame-options');
    frameContainer.innerHTML = '';
    for(let i=1; i<=10; i++) {
        const frameBtn = document.createElement('img');
        frameBtn.src = `frame/frame${i}.png`; 
        frameBtn.className = 'frame-thumb';
        frameBtn.onclick = () => generateCollage(frameBtn.src);
        frameContainer.appendChild(frameBtn);
    }
}

// COLLAGE GENERATOR
function generateCollage(frameSrc) {
    const ctx = canvasResult.getContext('2d');
    const frameImg = new Image();
    frameImg.src = frameSrc;
    frameImg.onload = () => {
        canvasResult.width = frameImg.width;
        canvasResult.height = frameImg.height;
        const w = canvasResult.width;
        const h = canvasResult.height;
        const imgW = w * 0.82; const imgH = imgW * 0.72;
        const xPos = (w - imgW) / 2;
        const startY = h * 0.035; const gap = h * 0.208;

        let processed = 0;
        photosTaken.forEach((data, i) => {
            const pImg = new Image();
            pImg.src = data;
            pImg.onload = () => {
                const imgRatio = pImg.width / pImg.height;
                const slotRatio = imgW / imgH;
                let sx, sy, sw, sh;
                if (imgRatio > slotRatio) {
                    sw = pImg.height * slotRatio; sh = pImg.height;
                    sx = (pImg.width - sw) / 2; sy = 0;
                } else {
                    sw = pImg.width; sh = pImg.width / slotRatio;
                    sx = 0; sy = (pImg.height - sh) / 2;
                }
                ctx.drawImage(pImg, sx, sy, sw, sh, xPos, startY + (i * gap), imgW, imgH);
                processed++;
                if (processed === 4) {
                    ctx.drawImage(frameImg, 0, 0, w, h);
                    finalPreview.src = canvasResult.toDataURL('image/png');
                    finalPreview.style.display = 'block';
                    document.getElementById('btn-download').style.display = 'inline-block';
                    document.getElementById('frame-main-title').innerText = "Hasil Photobooth";
                }
            };
        });
    };
}

document.getElementById('btn-download').onclick = () => {
    const link = document.createElement('a');
    link.download = `Photobooth_Dina.png`;
    link.href = canvasResult.toDataURL('image/png');
    link.click();
};
