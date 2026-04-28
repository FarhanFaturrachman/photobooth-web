let photosTaken = [null, null, null, null]; 
let currentSlot = 0;
let stream = null;
let targetRetakeIndex = null;

const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const canvasResult = document.getElementById('canvas-result');
const finalPreview = document.getElementById('final-image-preview');

async function startCapture() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        video.srcObject = stream;
        document.getElementById('page-home').classList.remove('active');
        document.getElementById('page-camera').classList.add('active');
    } catch (err) { alert("Kamera error!"); }
}

function triggerManualCapture() {
    currentSlot = photosTaken.indexOf(null);
    if (currentSlot !== -1) runCountdown(3);
}

function runCountdown(sec) {
    let count = sec;
    timerDisplay.innerText = count;
    let inv = setInterval(() => {
        count--;
        if (count > 0) timerDisplay.innerText = count;
        else {
            clearInterval(inv);
            timerDisplay.innerText = "📸";
            captureToSlot(currentSlot);
            setTimeout(() => { 
                timerDisplay.innerText = "";
                if (photosTaken.indexOf(null) === -1) {
                    document.getElementById('btn-go-to-frame').style.display = 'inline-block';
                }
            }, 600);
        }
    }, 1000);
}

// FUNGSI CAPTURE DENGAN LOGIKA ANTI-GEPENG / ANTI-KEPOTONG
function captureToSlot(slotIndex) {
    const tempCanvas = document.createElement('canvas');
    // Set resolusi portrait agar tidak terpotong saat masuk frame
    tempCanvas.width = 800; 
    tempCanvas.height = 1000;
    const ctx = tempCanvas.getContext('2d');
    
    ctx.translate(tempCanvas.width, 0); ctx.scale(-1, 1);
    
    // Ambil bagian tengah video (Center Crop)
    const sourceWidth = 1280;
    const sourceHeight = 720;
    const targetAspect = tempCanvas.width / tempCanvas.height;
    const drawWidth = sourceHeight * targetAspect;
    const startX = (sourceWidth - drawWidth) / 2;

    ctx.drawImage(video, startX, 0, drawWidth, sourceHeight, 0, 0, tempCanvas.width, tempCanvas.height);
    
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;
    document.getElementById(`slot-${slotIndex}`).innerHTML = `<img src="${dataUri}">`;
}

// LOGIKA MODAL DETAIL (GALLERY PREVIEW)
function openDetail(index) {
    if (!photosTaken[index]) return;
    targetRetakeIndex = index;
    const modal = document.getElementById('photo-detail-modal');
    document.getElementById('detail-img-view').src = photosTaken[index];
    document.getElementById('confirm-box').style.display = 'none';
    modal.style.display = 'flex';
}

function closeDetail() { document.getElementById('photo-detail-modal').style.display = 'none'; }

document.getElementById('btn-confirm-retake').onclick = () => {
    document.getElementById('confirm-box').style.display = 'block';
};

document.getElementById('btn-yes-retake').onclick = () => {
    photosTaken[targetRetakeIndex] = null;
    document.getElementById(`slot-${targetRetakeIndex}`).innerHTML = `<span>${targetRetakeIndex + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
    closeDetail();
};

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

function generateCollage(frameSrc) {
    const ctx = canvasResult.getContext('2d');
    const frameImg = new Image();
    frameImg.src = frameSrc;
    frameImg.onload = () => {
        canvasResult.width = frameImg.width;
        canvasResult.height = frameImg.height;
        
        // --- SETING PRESISI HASIL KOLASE ---
        const imgW = canvasResult.width * 0.85; 
        const imgH = imgW * 0.70; 
        const xPos = (canvasResult.width - imgW) / 2;
        const startY = canvasResult.height * 0.040; 
        const gap = canvasResult.height * 0.206;

        let processed = 0;
        photosTaken.forEach((data, i) => {
            const pImg = new Image();
            pImg.src = data;
            pImg.onload = () => {
                ctx.drawImage(pImg, xPos, startY + (i * gap), imgW, imgH);
                processed++;
                if (processed === 4) {
                    ctx.drawImage(frameImg, 0, 0, canvasResult.width, canvasResult.height);
                    finalPreview.src = canvasResult.toDataURL('image/png');
                    finalPreview.style.display = 'block';
                    document.getElementById('btn-download').style.display = 'inline-block';
                }
            };
        });
    };
}

document.getElementById('btn-download').onclick = () => {
    const link = document.createElement('a');
    link.download = `Photobooth_Adina.png`;
    link.href = canvasResult.toDataURL('image/png');
    link.click();
};
