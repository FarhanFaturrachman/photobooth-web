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
    try {
        // Setting resolusi ke rasio 4:3 (1280 / 960 = 1.33)
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 960 },
                aspectRatio: 1.3333333333 
            } 
        });
        video.srcObject = stream;
        switchPage('page-camera');
    } catch (err) { 
        alert("Kamera error! Pastikan izin kamera sudah diizinkan."); 
    }
}

function triggerManualCapture() {
    let emptySlot = photosTaken.indexOf(null);
    if (emptySlot !== -1) {
        runCountdown(3, emptySlot);
    } else {
        alert("Tidak dapat memotret lagi karena foto sudah full 4 foto!");
    }
}

function runCountdown(sec, slot) {
    let count = sec;
    timerDisplay.innerText = count;
    
    let inv = setInterval(() => {
        count--;
        if (count > 0) {
            timerDisplay.innerText = count;
        } else {
            clearInterval(inv);
            timerDisplay.innerText = "📸";
            captureToSlot(slot);
            setTimeout(() => { 
                timerDisplay.innerText = "";
                // Tampilkan tombol lanjut jika 4 foto sudah penuh
                if (photosTaken.indexOf(null) === -1) {
                    document.getElementById('btn-go-to-frame').style.display = 'inline-block';
                }
            }, 600);
        }
    }, 1000);
}

function captureToSlot(slotIndex) {
    const tempCanvas = document.createElement('canvas');
    // Set resolusi canvas ke 4:3
    tempCanvas.width = 1280; 
    tempCanvas.height = 960; 
    const ctx = tempCanvas.getContext('2d');
    
    // Mirroring kamera
    ctx.translate(tempCanvas.width, 0); 
    ctx.scale(-1, 1);
    
    // Gambar video secara penuh ke canvas 4:3
    ctx.drawImage(video, 0, 0, 1280, 960);
    
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;
    
    const slotElement = document.getElementById(`slot-${slotIndex}`);
    slotElement.innerHTML = `<img src="${dataUri}" style="width:100%; height:100%; object-fit:contain; background:#333;">`;
}
/**
 * 3. LOGIKA MODAL DETAIL (GALLERY PREVIEW)
 */
function openDetail(index) {
    if (!photosTaken[index]) return;
    targetRetakeIndex = index;
    const modal = document.getElementById('photo-detail-modal');
    
    document.getElementById('detail-img-view').src = photosTaken[index];
    document.getElementById('confirm-box').style.display = 'none';
    modal.style.display = 'flex';
}

function closeDetail() { 
    document.getElementById('photo-detail-modal').style.display = 'none'; 
}

// Tombol ulangi di dalam modal
document.getElementById('btn-confirm-retake').onclick = () => { 
    document.getElementById('confirm-box').style.display = 'block'; 
};

// Konfirmasi ulangi foto
document.getElementById('btn-yes-retake').onclick = () => {
    photosTaken[targetRetakeIndex] = null;
    document.getElementById(`slot-${targetRetakeIndex}`).innerHTML = `<span>${targetRetakeIndex + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
    closeDetail();
};

/**
 * 4. LOGIKA PEMILIHAN FRAME
 */
function loadFramesToContainer(containerId, className, isSidebar = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    for(let i=1; i<=10; i++) {
        const img = document.createElement('img');
        img.src = `frame/frame${i}.png`; 
        img.className = className;
        img.onclick = () => {
            if (isSidebar) {
                // Langsung update preview jika ganti frame di sidebar
                generateCollage(img.src);
            } else {
                // Simpan pilihan dan proses ke halaman preview
                currentSelectedFrameSrc = img.src;
                generateCollage(img.src); 
            }
        };
        container.appendChild(img);
    }
}

function showFrameSelection() {
    // Stop kamera untuk hemat resource
    if (stream) stream.getTracks().forEach(t => t.stop());
    
    switchPage('page-frame-selection');
    // Muat frames untuk seleksi horizontal (Scroll Samping)
    loadFramesToContainer('frame-options-scroll', 'frame-thumb-scroll', false);
}

// Fungsi tombol kembali
function backToCamera() { 
    switchPage('page-camera'); 
    startCapture(); 
}

function backToFrameSelection() { 
    showFrameSelection(); 
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
        
        // Ukuran kotak di frame (Target)
        const imgW = w * 0.85;  
        const imgH = imgW * 0.70; 
        const xPos = (w - imgW) / 2;
        const startY = h * 0.034; 
        const gap = h * 0.208;

        let processed = 0;
        photosTaken.forEach((data, i) => {
            const pImg = new Image();
            pImg.src = data;
            pImg.onload = () => {
                // --- LOGIKA ANTI GAP (CENTER CROP) ---
                const imgRatio = pImg.width / pImg.height;
                const targetRatio = imgW / imgH;
                let sx, sy, sw, sh;

                if (imgRatio > targetRatio) {
                    // Foto lebih lebar dari kotak, potong samping
                    sw = pImg.height * targetRatio;
                    sh = pImg.height;
                    sx = (pImg.width - sw) / 2;
                    sy = 0;
                } else {
                    // Foto lebih tinggi dari kotak, potong atas bawah
                    sw = pImg.width;
                    sh = pImg.width / targetRatio;
                    sx = 0;
                    sy = (pImg.height - sh) / 2;
                }

                // Gambar dengan koordinat potong (Source) ke koordinat frame (Destination)
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
/**
 * 6. DOWNLOAD HASIL
 */
document.getElementById('btn-download').onclick = () => {
    const link = document.createElement('a');
    link.download = `Photobooth_Adina_${Date.now()}.png`;
    link.href = finalPreview.src;
    link.click();
};
