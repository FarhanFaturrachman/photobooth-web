/**
 * WEB PHOTOBOOTH - FINAL OPTIMIZED
 * Developer: Farhan Faturrachman
 */

let photosTaken = [null, null, null, null]; 
let currentSlot = 0;
let stream = null;

const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const previewStrip = document.getElementById('preview-strip');
const canvasResult = document.getElementById('canvas-result');
const finalPreview = document.getElementById('final-image-preview');

// 1. Fungsi Mulai (Hanya buka kamera, TIDAK moto otomatis)
async function startCapture() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 },
            audio: false 
        });
        video.srcObject = stream;
        
        // Pindah Halaman
        document.getElementById('page-home').classList.remove('active');
        document.getElementById('page-camera').classList.add('active');
        
        console.log("Kamera Aktif. Menunggu input manual...");
    } catch (err) {
        alert("Gagal akses kamera. Pastikan izin diberikan.");
    }
}

// 2. Logika Ambil Foto Manual
function triggerManualCapture() {
    // Cari slot yang kosong (null)
    currentSlot = photosTaken.indexOf(null);

    if (currentSlot !== -1) {
        runCountdown(3); // Timer 3 detik agar pose siap
    } else {
        alert("Semua slot sudah terisi! Hapus salah satu atau lanjut ke frame.");
    }
}

function runCountdown(sec) {
    let count = sec;
    timerDisplay.innerText = count;
    
    // Nonaktifkan tombol sementara agar tidak double klik
    document.getElementById('btn-capture-manual').disabled = true;

    let inv = setInterval(() => {
        count--;
        if (count > 0) {
            timerDisplay.innerText = count;
        } else {
            clearInterval(inv);
            timerDisplay.innerText = "📸";
            
            captureToSlot(currentSlot);

            setTimeout(() => { 
                timerDisplay.innerText = "";
                document.getElementById('btn-capture-manual').disabled = false;
                
                // Cek apakah sudah penuh
                if (photosTaken.indexOf(null) === -1) {
                    document.getElementById('btn-go-to-frame').style.display = 'inline-block';
                }
            }, 600);
        }
    }, 1000);
}

function captureToSlot(slotIndex) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 640;
    tempCanvas.height = 480;
    const ctx = tempCanvas.getContext('2d');
    
    // Mirroring fix
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 640, 480);
    
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;

    // Update tampilan kotak (slot) di sebelah kanan
    const container = document.getElementById(`slot-${slotIndex}`);
    container.innerHTML = `
        <img src="${dataUri}" style="width:100%; height:100%; object-fit:cover;">
        <div class="btn-retake-small" onclick="retakePhoto(${slotIndex})">Ulang</div>
    `;
}

function retakePhoto(index) {
    photosTaken[index] = null;
    document.getElementById(`slot-${index}`).innerHTML = `<span>${index + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
}

// 3. Logika Frame & Canvas (Presisi Sesuai Gambar Strip Kamu)
function showFrameSelection() {
    // Matikan kamera untuk hemat baterai
    if (stream) stream.getTracks().forEach(track => track.stop());

    document.getElementById('page-camera').classList.remove('active');
    document.getElementById('page-frame').classList.add('active');
    
    const frameContainer = document.getElementById('frame-options');
    frameContainer.innerHTML = '';

    // Tampilkan 10 frame sebagai pilihan
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
    frameImg.crossOrigin = "anonymous";
    frameImg.src = frameSrc;

    frameImg.onload = () => {
        canvasResult.width = frameImg.width;
        canvasResult.height = frameImg.height;
        ctx.clearRect(0, 0, canvasResult.width, canvasResult.height);

        // KORDINAT PRESISI UNTUK FRAME 4 SLOT VERTIKAL
        const imgW = canvasResult.width * 0.82; 
        const imgH = imgW * 0.70; 
        const xPos = (canvasResult.width - imgW) / 2;
        
        const startY = canvasResult.height * 0.045; 
        const verticalGap = canvasResult.height * 0.198; 

        let processed = 0;
        photosTaken.forEach((data, i) => {
            const pImg = new Image();
            pImg.src = data;
            pImg.onload = () => {
                const yPos = startY + (i * verticalGap);
                ctx.drawImage(pImg, xPos, yPos, imgW, imgH);
                processed++;

                // Gambar frame di layer paling atas setelah semua foto masuk
                if (processed === 4) {
                    ctx.drawImage(frameImg, 0, 0, canvasResult.width, canvasResult.height);
                    
                    // Tampilkan preview hasil akhir
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
    link.download = `Photobooth_Farhan_${Date.now()}.png`;
    link.href = canvasResult.toDataURL('image/png');
    link.click();
};
