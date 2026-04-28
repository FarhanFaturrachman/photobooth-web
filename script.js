let photosTaken = [null, null, null, null]; // Array 4 slot
let currentSlot = 0;

function triggerManualCapture() {
    if (currentSlot < 4) {
        runCountdown(3); // Timer singkat sebelum jepret
    } else {
        alert("Semua slot sudah terisi. Silakan lanjut atau retake salah satu.");
    }
}

async function runCountdown(sec) {
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
                currentSlot = photosTaken.indexOf(null); // Cari slot kosong berikutnya
                if (currentSlot === -1) document.getElementById('btn-go-to-frame').style.display = 'block';
            }, 500);
        }
    }, 1000);
}

function captureToSlot(slotIndex) {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, 640, 480);
    
    const dataUri = canvas.toDataURL('image/png');
    photosTaken[slotIndex] = dataUri;

    // Tampilkan di UI
    const container = document.getElementById(`slot-${slotIndex}`);
    container.innerHTML = `
        <img src="${dataUri}">
        <div class="btn-retake-small" onclick="retakePhoto(${slotIndex})">Ulang</div>
    `;
}

function retakePhoto(index) {
    photosTaken[index] = null;
    currentSlot = index;
    document.getElementById(`slot-${index}`).innerHTML = `<span>${index + 1}</span>`;
    document.getElementById('btn-go-to-frame').style.display = 'none';
}

// LOGIKA CANVAS UNTUK FRAME STRIP (Sesuai gambar yang kamu kirim)
function generateCollage(frameSrc) {
    const ctx = canvasResult.getContext('2d');
    const frameImg = new Image();
    frameImg.src = frameSrc;

    frameImg.onload = () => {
        canvasResult.width = frameImg.width;
        canvasResult.height = frameImg.height;
        ctx.clearRect(0, 0, canvasResult.width, canvasResult.height);

        // Kuncinya di sini: Sesuaikan koordinat dengan kotak hitam di frame1.jpg kamu
        const imgW = canvasResult.width * 0.82; // Lebar foto 82% dari frame
        const imgH = imgW * 0.70; // Tinggi foto proporsional
        const xPos = (canvasResult.width - imgW) / 2;
        
        const startY = canvasResult.height * 0.045; // Jarak dari atas
        const verticalGap = canvasResult.height * 0.198; // Jarak antar kotak

        photosTaken.forEach((data, i) => {
            if (data) {
                const pImg = new Image();
                pImg.src = data;
                pImg.onload = () => {
                    const yPos = startY + (i * verticalGap);
                    ctx.drawImage(pImg, xPos, yPos, imgW, imgH);
                    
                    // Tempel frame di akhir
                    if (i === 3) ctx.drawImage(frameImg, 0, 0, canvasResult.width, canvasResult.height);
                };
            }
        });
        
        // Munculkan preview
        setTimeout(() => {
            const finalImg = document.getElementById('final-image-preview');
            finalImg.src = canvasResult.toDataURL('image/png');
            finalImg.style.display = 'block';
            document.getElementById('btn-download').style.display = 'block';
        }, 500);
    };
}
