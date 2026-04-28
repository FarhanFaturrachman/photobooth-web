let photosTaken = [null, null, null, null]; 
let stream = null;
let targetRetakeIndex = null;
let currentSelectedFrameSrc = null; // Menyimpan frame yang sedang dipilih

const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const canvasResult = document.getElementById('canvas-result');
const finalPreview = document.getElementById('final-image-preview');

async function startCapture() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        video.srcObject = stream;
        switchPage('page-camera');
    } catch (err) { alert("Kamera error!"); }
}

function switchPage(pageId) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function triggerManualCapture() {
    let emptySlot = photosTaken.indexOf(null);
    if (emptySlot !== -1) runCountdown(3, emptySlot);
    else alert("Tidak dapat memotret lagi karena foto sudah full 4 foto!");
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
    tempCanvas.width = 1280; 
    tempCanvas.height = 720;
    const ctx = tempCanvas.getContext('2d');
    ctx.translate(tempCanvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 1280, 720);
    
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;
    document.getElementById(`slot-${slotIndex}`).innerHTML = `<img src="${dataUri}" style="width:100%; height:100%; object-fit:contain; background:#333;">`;
}

// MODAL DETAIL (GALLERY PREVIEW)
function openDetail(index) {
    if (!photosTaken[index]) return;
    targetRetakeIndex = index;
    const modal = document.getElementById('photo-detail-modal');
    document.getElementById('detail-img-view').src = photosTaken[index];
    document.getElementById('confirm-box').style.display = 'none';
    modal.style.display = 'flex';
}

function closeDetail() { document.getElementById('photo-detail-modal').style.display = 'none'; }

document.getElementById('btn-confirm-retake').onclick = () => { document.getElementById('confirm-box').style.display = 'block'; };

document.getElementById('btn-yes-retake').onclick = () => {
    photosTaken[targetRetakeIndex] = null;
    document.getElementById(`slot-${targetRetakeIndex}`).innerHTML = `<span>${targetRetakeIndex + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
    closeDetail();
};

// NAVIGASI & LOADING FRAMES
function loadFramesToContainer(containerId, className, isSidebar = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    for(let i=1; i<=10; i++) {
        const img = document.createElement('img');
        img.src = `frame/frame${i}.png`; 
        img.className = className;
        img.onclick = () => {
            if (isSidebar) {
                // Jika di sidebar preview, langsung generate ulang collage
                generateCollage(img.src);
            } else {
                // Jika di seleksi awal, simpan pilihan dan lanjut ke preview
                currentSelectedFrameSrc = img.src;
                generateCollage(img.src); // Generate dulu baru pindah
            }
        };
        container.appendChild(img);
    }
}

function showFrameSelection() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    switchPage('page-frame-selection');
    // Muat frames untuk seleksi horizontal
    loadFramesToContainer('frame-options-scroll', 'frame-thumb-scroll', false);
}

function backToCamera() { switchPage('page-camera'); startCapture(); } // Start capture lagi
function backToFrameSelection() { showFrameSelection(); }

// COLLAGE GENERATOR
function generateCollage(frameSrc) {
    // Tampilkan loading jika perlu, karena proses ini mungkin butuh waktu
    
    const ctx = canvasResult.getContext('2d');
    const frameImg = new Image();
    frameImg.src = frameSrc;
    
    frameImg.onload = () => {
        canvasResult.width = frameImg.width;
        canvasResult.height = frameImg.height;
        
        const w = canvasResult.width;
        const h = canvasResult.height;
        // Setting presisi (sesuaikan jika frame Anda berbeda rasio)
        const imgW = w * 0.85; 
        const imgH = imgW * 0.70; 
        const xPos = (w - imgW) / 2;
        const startY = h * 0.040; 
        const gap = h * 0.206;

        let processed = 0;
        photosTaken.forEach((data, i) => {
            const pImg = new Image();
            pImg.src = data;
            pImg.onload = () => {
                ctx.drawImage(pImg, xPos, startY + (i * gap), imgW, imgH);
                processed++;
                if (processed === 4) {
                    ctx.drawImage(frameImg, 0, 0, w, h);
                    finalPreview.src = canvasResult.toDataURL('image/png');
                    
                    // Jika belum di halaman preview, pindah ke sana
                    if (document.getElementById('page-final-preview').style.display !== 'flex') {
                        switchPage('page-final-preview');
                        // Muat frames untuk sidebar vertikal di halaman preview
                        loadFramesToContainer('frame-options-sidebar', 'frame-thumb-sidebar', true);
                    }
                }
            };
        });
    };
}

document.getElementById('btn-download').onclick = () => {
    const link = document.createElement('a');
    link.download = `Photobooth_Dina.png`;
    link.href = finalPreview.src;
    link.click();
};
