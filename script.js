let selectedPhotoCount = 4; // Default langsung 4
let photosTaken = [];
let stream = null;
const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const previewStrip = document.getElementById('preview-strip');

async function startCapture(count) {
    selectedPhotoCount = count;
    photosTaken = [];
    previewStrip.innerHTML = '';
    
    document.getElementById('page-home').classList.remove('active');
    document.getElementById('page-camera').classList.add('active');
    document.getElementById('camera-container').style.display = 'flex';

    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 }, 
            audio: false 
        });
        video.srcObject = stream;
        takePhotosSequentially();
    } catch (err) {
        alert("Kamera tidak ditemukan");
    }
}

async function takePhotosSequentially() {
    for (let i = 0; i < selectedPhotoCount; i++) {
        await runTimer(5);
        captureImage(i);
    }
    // Tampilkan tombol lanjut setelah semua foto beres
    document.getElementById('btn-go-to-frame').style.display = 'inline-block';
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
                setTimeout(() => {
                    timerDisplay.innerText = "";
                    resolve();
                }, 500);
            }
        }, 1000);
    });
}

function captureImage(index) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    const dataUri = canvas.toDataURL('image/png');
    photosTaken.push(dataUri);

    const img = document.createElement('img');
    img.src = dataUri;
    img.className = 'preview-img';
    previewStrip.appendChild(img);
}

function showFrameSelection() {
    // Matikan kamera
    if (stream) stream.getTracks().forEach(t => t.stop());
    
    document.getElementById('page-camera').classList.remove('active');
    document.getElementById('page-frame').classList.add('active');
    
    const frameContainer = document.getElementById('frame-options');
    frameContainer.innerHTML = '';
    
    // Langsung tampilkan Frame6_1.png sebagai pilihan (atau ganti nama ke Frame4_1.png)
    const frameBtn = document.createElement('img');
    frameBtn.src = `frames/Frame6_1.png`; 
    frameBtn.className = 'frame-thumb';
    frameBtn.style.width = "200px";
    frameBtn.onclick = () => generateCollage(frameBtn.src);
    frameContainer.appendChild(frameBtn);
}

// ... Fungsi generateCollage dan download tetap sama seperti sebelumnya ...
