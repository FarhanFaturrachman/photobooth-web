/* ========================================================
   DINA PHOTOBOOTH - FULL LOGIC (FINAL STABLE)
   Developer: Farhan Faturrachman
   ======================================================== */

let photosTaken = [null, null, null, null]; 
let stream = null;
let targetRetakeIndex = null;
let currentSelectedFrameSrc = null;

const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const canvasResult = document.getElementById('canvas-result');
const finalPreview = document.getElementById('final-image-preview');

/**
 * 1. FUNGSI NAVIGASI HALAMAN
 */
function switchPage(pageId) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

/**
 * 2. LOGIKA KAMERA & PENGAMBILAN FOTO
 */
async function startCapture() {
    if (stream) { stream.getTracks().forEach(track => track.stop()); }
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 }, 
                height: { ideal: 960 }, 
                aspectRatio: 1.3333, 
                facingMode: "user" 
            } 
        });
        video.srcObject = stream;
        switchPage('page-camera');
    } catch (err) { 
        alert("Kamera error! Pastikan izin kamera sudah diberikan."); 
    }
}

function triggerManualCapture() {
    let emptySlot = photosTaken.indexOf(null);
    if (emptySlot !== -1) runCountdown(3, emptySlot);
    else alert("Foto sudah penuh! Silakan lanjut ke pilih frame atau ulangi foto.");
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
                if (photosTaken.indexOf(null) === -1) {
                    document.getElementById('btn-go-to-frame').style.display = 'inline-block';
                }
            }, 600);
        }
    }, 1000);
}

function captureToSlot(slotIndex) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1280; tempCanvas.height = 960;
    const ctx = tempCanvas.getContext('2d');
    
    // Mirroring kamera agar hasil sesuai tampilan layar
    ctx.translate(tempCanvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 1280, 960);
    
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;
    
    const slotElement = document.getElementById(`slot-${slotIndex}`);
    slotElement.innerHTML = `<img src="${dataUri}" style="width:100%; height:100%; object-fit:cover;">`;
}

/**
 * 3. LOGIKA MODAL DETAIL (RETAKE)
 */
function openDetail(index) {
    if (!photosTaken[index]) return;
    targetRetakeIndex = index;
    document.getElementById('detail-img-view').src = photosTaken[index];
    document.getElementById('confirm-box').style.display = 'none';
    document.getElementById('photo-detail-modal').style.display = 'flex';
}

function closeDetail() { 
    document.getElementById('photo-detail-modal').style.display = 'none'; 
}

document.getElementById('btn-confirm-retake').onclick = () => { 
    document.getElementById('confirm-box').style.display = 'block'; 
};

document.getElementById('btn-yes-retake').onclick = () => {
    photosTaken[targetRetakeIndex] = null;
    document.getElementById(`slot-${targetRetakeIndex}`).innerHTML = `<span>${targetRetakeIndex + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
    closeDetail();
};

/**
 * 4. LOGIKA LOAD FRAME
 */
function loadFramesToContainer(containerId, className, isSidebar = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    // Sesuaikan angka 10 dengan jumlah total file frame yang kamu punya
    for(let i=1; i<=7; i++) {
        const img = document.createElement('img');
        img.src = `frame/frame${i}.PNG`; 
        img.className = className;
        img.onclick = () => { 
            currentSelectedFrameSrc = img.src; 
            generateCollage(img.src); 
        };
        container.appendChild(img);
    }
}

function showFrameSelection() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    switchPage('page-frame-selection');
    loadFramesToContainer('frame-options-scroll', 'frame-thumb-scroll', false);
}

/**
 * 5. COLLAGE GENERATOR (ANTI-GEPENG)
 */
function generateCollage(frameSrc) {
    const ctx = canvasResult.getContext('2d');
    const frameImg = new Image();
    frameImg.src = frameSrc;
    
    frameImg.onload = () => {
        canvasResult.width = frameImg.width;
        canvasResult.height = frameImg.height;
        const w = canvasResult.width;
        const h = canvasResult.height;
        
        // Pengaturan koordinat foto di dalam frame
        const imgW = w * 0.85; 
        const imgH = imgW * 0.70;
        const xPos = (w - imgW) / 2;
        const startY = h * 0.033; 
        const gap = h * 0.208;
        
        let processed = 0;
        photosTaken.forEach((data, i) => {
            const pImg = new Image();
            pImg.src = data;
            pImg.onload = () => {
                const imgRatio = pImg.width / pImg.height;
                const targetRatio = imgW / imgH;
                let sx, sy, sw, sh;
                
                // Logika Center Crop agar foto tidak lonjong/gepeng
                if (imgRatio > targetRatio) { 
                    sw = pImg.height * targetRatio; sh = pImg.height; 
                    sx = (pImg.width - sw) / 2; sy = 0; 
                } else { 
                    sw = pImg.width; sh = pImg.width / targetRatio; 
                    sx = 0; sy = (pImg.height - sh) / 2; 
                }
                
                ctx.drawImage(pImg, sx, sy, sw, sh, xPos, startY + (i * gap), imgW, imgH);
                
                processed++;
                if (processed === 4) {
                    ctx.drawImage(frameImg, 0, 0, w, h);
                    finalPreview.src = canvasResult.toDataURL('image/png');
                    
                    if (!document.getElementById('page-final-preview').classList.contains('active')) {
                        switchPage('page-final-preview');
                        // Load sidebar dengan class frame-thumb-sidebar (untuk Grid 4 Kolom)
                        loadFramesToContainer('frame-options-sidebar', 'frame-thumb-sidebar', true);
                    }
                }
            };
        });
    };
}

/**
 * 6. DOWNLOAD & SHARE
 */
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
        } else { 
            alert("Fitur bagi hanya berfungsi di HP dan koneksi HTTPS."); 
        }
    } catch (err) { 
        console.error("Gagal share:", err); 
    }
};

/**
 * 7. UTILITY & ROTATION
 */
window.addEventListener("orientationchange", () => { 
    setTimeout(() => { if (stream) startCapture(); }, 500); 
});

function backToCamera() { 
    switchPage('page-camera'); 
    startCapture(); 
}

function backToFrameSelection() { 
    showFrameSelection(); 
}
