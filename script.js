let selectedPhotoCount = 4;
let photosTaken = [];
let stream = null;

const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const previewStrip = document.getElementById('preview-strip');
const canvasResult = document.getElementById('canvas-result');
const finalPreview = document.getElementById('final-image-preview');

async function startCapture(count) {
    selectedPhotoCount = count;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        video.srcObject = stream;
        document.getElementById('page-home').classList.remove('active');
        document.getElementById('page-camera').classList.add('active');
        takePhotosSequentially();
    } catch (err) { alert("Izinkan akses kamera terlebih dahulu!"); }
}

async function takePhotosSequentially() {
    for (let i = 0; i < selectedPhotoCount; i++) {
        await runTimer(5);
        captureImage();
    }
    document.getElementById('btn-go-to-frame').style.display = 'inline-block';
    document.getElementById('btn-retake').style.display = 'inline-block';
}

function runTimer(seconds) {
    return new Promise((resolve) => {
        let counter = seconds;
        timerDisplay.innerText = counter;
        let interval = setInterval(() => {
            counter--;
            timerDisplay.innerText = counter > 0 ? counter : "📸";
            if (counter <= 0) {
                clearInterval(interval);
                setTimeout(() => { timerDisplay.innerText = ""; resolve(); }, 500);
            }
        }, 1000);
    });
}

function captureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 640, 480);
    const dataUri = canvas.toDataURL('image/png');
    photosTaken.push(dataUri);
    const img = document.createElement('img');
    img.src = dataUri; img.className = 'preview-img';
    previewStrip.appendChild(img);
}

function showFrameSelection() {
    document.getElementById('page-camera').classList.remove('active');
    document.getElementById('page-frame').classList.add('active');
    const frameContainer = document.getElementById('frame-options');
    frameContainer.innerHTML = '';

    // Loop untuk menampilkan semua 10 frame yang kamu upload
    for(let i=1; i<=10; i++) {
        const frameBtn = document.createElement('img');
        frameBtn.src = `frame/frame${i}.png`; // Sesuai folder 'frame' di screenshotmu
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
        // Berdasarkan desain strip vertikal (4 kotak)
        canvasResult.width = frameImg.width;
        canvasResult.height = frameImg.height;

        // Bersihkan canvas
        ctx.clearRect(0, 0, canvasResult.width, canvasResult.height);

        // Hitung posisi kotak (Settingan ini untuk frame vertikal panjang)
        const photoWidth = canvasResult.width * 0.85; // Foto menutupi 85% lebar frame
        const photoHeight = photoWidth * (3/4); // Rasio 4:3
        const startX = (canvasResult.width - photoWidth) / 2;
        
        // Jarak antar foto (padding)
        const gap = (canvasResult.height * 0.02); 
        const marginTop = canvasResult.height * 0.05;

        let loadedCount = 0;
        photosTaken.forEach((photoData, index) => {
            const pImg = new Image();
            pImg.src = photoData;
            pImg.onload = () => {
                const posY = marginTop + (index * (photoHeight + gap));
                ctx.drawImage(pImg, startX, posY, photoWidth, photoHeight);
                loadedCount++;

                // Jika semua foto sudah digambar, baru tempelkan frame di atasnya
                if (loadedCount === photosTaken.length) {
                    ctx.drawImage(frameImg, 0, 0, canvasResult.width, canvasResult.height);
                    finalPreview.src = canvasResult.toDataURL('image/png');
                    finalPreview.style.display = 'inline-block';
                    document.getElementById('btn-download').style.display = 'inline-block';
                }
            };
        });
    };
}

document.getElementById('btn-download').onclick = () => {
    const link = document.createElement('a');
    link.download = 'Photobooth_Farhan.png';
    link.href = canvasResult.toDataURL('image/png');
    link.click();
};
