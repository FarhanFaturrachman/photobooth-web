/**
 * WEB PHOTOBOOTH - DINA EDITION (FINAL STABLE)
 * Fitur: Gallery Modal Preview & Konfirmasi Ulangi
 */

let photosTaken = [null, null, null, null]; 
let currentSlot = 0;
let stream = null;
let targetRetakeIndex = null; // Untuk melacak foto mana yang mau diulang

const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const canvasResult = document.getElementById('canvas-result');
const finalPreview = document.getElementById('final-image-preview');

// 1. FUNGSI MULAI
async function startCapture() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 } 
        });
        video.srcObject = stream;
        
        document.getElementById('page-home').classList.remove('active');
        document.getElementById('page-camera').classList.add('active');
    } catch (err) { 
        alert("Kamera error! Pastikan izin kamera diberikan."); 
    }
}

// 2. AMBIL FOTO
function triggerManualCapture() {
    currentSlot = photosTaken.indexOf(null);
    if (currentSlot !== -1) runCountdown(3);
    else alert("Slot penuh! Klik foto untuk melihat detail atau mengulang.");
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
                if (photosTaken.indexOf(null) === -1) {
                    document.getElementById('btn-go-to-frame').style.display = 'inline-block';
                }
            }, 600);
        }
    }, 1000);
}

function captureToSlot(slotIndex) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1280; 
    tempCanvas.height = 960;
    const ctx = tempCanvas.getContext('2d');
    
    ctx.translate(tempCanvas.width, 0); 
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;

    const container = document.getElementById(`slot-${slotIndex}`);
    // Slot sekarang bisa diklik untuk buka detail (Gallery Preview)
    container.innerHTML = `<img src="${dataUri}" onclick="openDetail(${slotIndex})" style="cursor:pointer;">`;
}

// --- FUNGSI MODAL DETAIL (GALLERY PREVIEW) ---
function openDetail(index) {
    if (!photosTaken[index]) return;
    targetRetakeIndex = index;
    
    const modal = document.getElementById('photo-detail-modal');
    document.getElementById('detail-img-view').src = photosTaken[index];
    
    // Reset tampilan tombol konfirmasi di dalam modal
    document.getElementById('btn-confirm-retake').style.display = 'inline-block';
    document.getElementById('confirm-box').style.display = 'none';
    
    modal.style.display = 'flex';
}

function closeDetail() {
    document.getElementById('photo-detail-modal').style.display = 'none';
}

// Logika saat tombol "ULANGI FOTO INI" diklik
document.getElementById('btn-confirm-retake').onclick = () => {
    document.getElementById('btn-confirm-retake').style.display = 'none';
    document.getElementById('confirm-box').style.display = 'block';
};

// Logika saat konfirmasi "YA, YAKIN" diklik
document.getElementById('btn-yes-retake').onclick = () => {
    photosTaken[targetRetakeIndex] = null;
    document.getElementById(`slot-${targetRetakeIndex}`).innerHTML = `<span>${targetRetakeIndex + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
    closeDetail();
};

// 3. SELEKSI FRAME
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

// 4. GENERATE HASIL (Anti-Kepotong)
function generateCollage(frameSrc) {
    const ctx = canvasResult.getContext('2d');
    const frameImg = new Image();
    frameImg.src = frameSrc;

    frameImg.onload = () => {
        canvasResult.width = frameImg.width;
        canvasResult.height = frameImg.height;
        ctx.clearRect(0, 0, canvasResult.width, canvasResult.height);

        const imgW = canvasResult.width * 0.82; 
        const imgH = imgW * 0.72; 
        const xPos = (canvasResult.width - imgW) / 2;
        const startY = canvasResult.height * 0.035; 
        const verticalGap = canvasResult.height * 0.208; 

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

                ctx.drawImage(pImg, sx, sy, sw, sh, xPos, startY + (i * verticalGap), imgW, imgH);
                processed++;

                if (processed === 4) {
                    ctx.drawImage(frameImg, 0, 0, canvasResult.width, canvasResult.height);
                    
                    // Aktifkan Split Layout
                    document.getElementById('page-frame').classList.add('split-layout');
                    
                    // Teks "Hasil Photobooth" dihapus agar lebih bersih
                    const titleElem = document.getElementById('frame-title');
                    if(titleElem) titleElem.style.display = 'none';
                    
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
    link.download = `Photobooth_Adina_${Date.now()}.png`;
    link.href = canvasResult.toDataURL('image/png');
    link.click();
};
