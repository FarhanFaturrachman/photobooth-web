/**
 * WEB PHOTOBOOTH - STABLE VERSION
 * Developer: Farhan Faturrachman
 */

let photosTaken = [null, null, null, null]; 
let currentSlot = 0;
let stream = null;

const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const canvasResult = document.getElementById('canvas-result');
const finalPreview = document.getElementById('final-image-preview');

// 1. FUNGSI MULAI (Kunci Utama Tombol Mulai)
async function startCapture() {
    console.log("Tombol Mulai Diklik"); // Cek di console (F12)
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 } 
        });
        video.srcObject = stream;
        
        // Pindah Halaman
        document.getElementById('page-home').classList.remove('active');
        document.getElementById('page-camera').classList.add('active');
        
    } catch (err) { 
        console.error(err);
        alert("Gagal akses kamera! Pastikan izin diberikan."); 
    }
}

// 2. Ambil Foto Manual
function triggerManualCapture() {
    currentSlot = photosTaken.indexOf(null);
    if (currentSlot !== -1) runCountdown(3);
    else alert("Slot penuh! Silakan pilih frame atau ulangi foto.");
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
    
    // Mirror fix
    ctx.translate(tempCanvas.width, 0); 
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;

    const container = document.getElementById(`slot-${slotIndex}`);
    // Tombol Ulangi dengan posisi melayang (absolute)
    container.innerHTML = `
        <img src="${dataUri}" style="width:100%;height:100%;object-fit:cover;border-radius:1vh;">
        <div class="btn-retake-small" onclick="retakePhoto(${slotIndex})">Ulangi</div>
    `;
}

function retakePhoto(index) {
    photosTaken[index] = null;
    document.getElementById(`slot-${index}`).innerHTML = `<span style="color:#555; font-size:3vh;">${index + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
}

// 3. Masuk ke Pemilihan Frame
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

// 4. Proses Kolase (Logika Anti-Kepotong)
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
                // Logika Center Crop agar tidak gepeng/kepotong
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
                    
                    // Aktifkan tampilan Kiri-Kanan agar rapi
                    document.getElementById('page-frame').classList.add('split-layout');
                    
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
    link.download = `Photobooth_Farhan.png`;
    link.href = canvasResult.toDataURL('image/png');
    link.click();
};
