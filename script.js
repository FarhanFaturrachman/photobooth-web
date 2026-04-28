/**
 * WEB PHOTOBOOTH - FULL SCRIPT
 * Developer: Farhan Faturrachman (Adaptive AI Optimized)
 */

// --- 1. Inisialisasi Variabel Global ---
let selectedPhotoCount = 0;
let photosTaken = [];
let stream = null;
const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const previewStrip = document.getElementById('preview-strip');
const canvasResult = document.getElementById('canvas-result');

// Konfigurasi Background Halaman Utama
const backgrounds = ['#f0f0f0', '#ffdde1', '#ee9ca7', '#a8c0ff']; // Bisa diganti URL gambar
let currentBgIndex = 0;

// --- 2. Fungsi Navigasi & UI ---

function goToCameraSelection() {
    document.getElementById('page-home').classList.remove('active');
    document.getElementById('page-camera').classList.add('active');
}

function changeBackground() {
    currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
    document.body.style.background = backgrounds[currentBgIndex];
}

// --- 3. Logika Kamera & Capture ---

async function startCapture(count) {
    selectedPhotoCount = count;
    photosTaken = []; 
    previewStrip.innerHTML = ''; 
    
    // Tampilan UI
    document.getElementById('selection-overlay').style.display = 'none';
    document.getElementById('camera-container').style.display = 'flex';

    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 }, 
            audio: false 
        });
        video.srcObject = stream;
        
        takePhotosSequentially();
    } catch (err) {
        alert("Akses kamera ditolak atau tidak ditemukan.");
        location.reload();
    }
}

async function takePhotosSequentially() {
    for (let i = 0; i < selectedPhotoCount; i++) {
        await runTimer(5); // Timer 5 detik per foto
        captureImage(i);
    }
    
    // Selesai foto, matikan kamera dan lanjut ke Frame
    stopCamera();
    setTimeout(() => {
        showFrameSelection();
    }, 1000);
}

function runTimer(seconds) {
    return new Promise((resolve) => {
        let counter = seconds;
        timerDisplay.innerText = counter;
        
        let interval = setInterval(() => {
            counter--;
            if (counter > 0) {
                timerDisplay.innerText = counter;
            } else {
                clearInterval(interval);
                timerDisplay.innerText = "📸";
                // Efek Flash
                document.body.style.backgroundColor = "white";
                setTimeout(() => {
                    document.body.style.backgroundColor = backgrounds[currentBgIndex];
                    timerDisplay.innerText = "";
                    resolve();
                }, 150);
            }
        }, 1000);
    });
}

function captureImage(index) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    
    // Mirroring fix jika video di-mirror di CSS
    ctx.translate(tempCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken.push(dataUri);

    // Tambah ke Preview Strip
    const img = document.createElement('img');
    img.src = dataUri;
    img.className = 'preview-img';
    previewStrip.appendChild(img);
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}

// --- 4. Logika Frame & Kolase (Canvas) ---

function showFrameSelection() {
    document.getElementById('page-camera').classList.remove('active');
    document.getElementById('page-frame').classList.add('active');
    
    const frameContainer = document.getElementById('frame-options');
    frameContainer.innerHTML = '';

    // Logika agar tidak error 404: 
    // Kita hanya memunculkan tombol jika file frame-nya memang ada
    // Untuk sekarang, kita buat manual dulu agar kamu bisa ngetes frame6_1.png
    
    const frameBtn = document.createElement('img');
    
    // Cek: Jika user pilih 6 foto, arahkan ke frame6_1.png
    if (selectedPhotoCount === 6) {
        frameBtn.src = `frames/frame6_1.png`;
    } else {
        // Jika pilih 3 atau 4 foto tapi belum ada frame-nya, 
        // kita pakai frame6_1 sebagai dummy agar tidak error saat tes
        frameBtn.src = `frames/frame6_1.png`; 
        console.warn("Frame untuk jumlah foto ini belum ada, menggunakan frame6_1.png sebagai pengganti.");
    }

    frameBtn.className = 'frame-thumb';
    frameBtn.onclick = () => generateCollage(frameBtn.src);
    frameContainer.appendChild(frameBtn);
}

function generateCollage(frameSrc) {
    const ctx = canvasResult.getContext('2d');
    const frameImg = new Image();
    frameImg.src = frameSrc;

    frameImg.onload = () => {
        // Set ukuran canvas sesuai ukuran frame (misal ukuran cetak 4R)
        canvasResult.width = frameImg.width;
        canvasResult.height = frameImg.height;
        canvasResult.style.display = 'block';

        // 1. Gambar Foto-foto terlebih dahulu (di bawah frame)
        // Logika koordinat X,Y tergantung desain frame kamu
        photosTaken.forEach((photoData, index) => {
            const pImg = new Image();
            pImg.src = photoData;
            pImg.onload = () => {
                // Contoh kalkulasi posisi vertikal sederhana:
                let posX = 50; 
                let posY = 50 + (index * (canvasResult.height / selectedPhotoCount));
                ctx.drawImage(pImg, posX, posY, 400, 300); // Sesuaikan ukuran slot

                // 2. Gambar Frame di atas foto (Layer Atas)
                if (index === photosTaken.length - 1) {
                    ctx.drawImage(frameImg, 0, 0);
                }
            };
        });
    };
}

// --- 5. Download ---

document.getElementById('btn-download').onclick = () => {
    const link = document.createElement('a');
    link.download = 'photobooth-result.png';
    link.href = canvasResult.toDataURL();
    link.click();
};
