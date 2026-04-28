let photosTaken = [null, null, null, null]; 
let currentSlot = 0;
let stream = null;

const video = document.getElementById('video');
const timerDisplay = document.getElementById('timer');
const previewStrip = document.getElementById('preview-strip');
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
    else alert("Slot penuh!");
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
                if (photosTaken.indexOf(null) === -1) document.getElementById('btn-go-to-frame').style.display = 'inline-block';
            }, 600);
        }
    }, 1000);
}

function captureToSlot(slotIndex) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 640; tempCanvas.height = 480;
    const ctx = tempCanvas.getContext('2d');
    ctx.translate(tempCanvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 640, 480);
    const dataUri = tempCanvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;

    const container = document.getElementById(`slot-${slotIndex}`);
    container.innerHTML = `<img src="${dataUri}" style="width:100%;height:100%;object-fit:cover;"><div class="btn-retake-small" onclick="retakePhoto(${slotIndex})">Ulangi</div>`;
}

function retakePhoto(index) {
    photosTaken[index] = null;
    document.getElementById(`slot-${index}`).innerHTML = `<span>${index + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
}

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
        ctx.clearRect(0, 0, canvasResult.width, canvasResult.height);

        // --- BAGIAN SETTING (EDIT DI SINI) ---
        //lebar tinggi foto
        const imgW = canvasResult.width * 0.82; 
        const imgH = imgW * 0.72; 
        //posisi tengah
        const xPos = (canvasResult.width - imgW) / 2;
        
        const startY = canvasResult.height * 0.030;   // jarak foto pertama ke frame atas
        const verticalGap = canvasResult.height * 0.210; // Jarak antar foto
        // -------------------------------------

        let processed = 0;
        photosTaken.forEach((data, i) => {
            const pImg = new Image();
            pImg.src = data;
            pImg.onload = () => {
                ctx.drawImage(pImg, xPos, startY + (i * verticalGap), imgW, imgH);
                processed++;
                if (processed === 4) {
                    ctx.drawImage(frameImg, 0, 0, canvasResult.width, canvasResult.height);
                    finalPreview.src = canvasResult.toDataURL('image/png');
                    finalPreview.style.display = 'block';
                    document.getElementById('btn-download').style.display = 'inline-block';
                    // Perkecil area pilih frame saat hasil muncul
                    document.getElementById('frame-options').style.height = "18vh";
                }
            };
        });
    };
}

document.getElementById('btn-download').onclick = () => {
    const link = document.createElement('a');
    link.download = `Photo_${Date.now()}.png`;
    link.href = canvasResult.toDataURL('image/png');
    link.click();
};
