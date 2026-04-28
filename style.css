/* ========================================================
   DINA PHOTOBOOTH - FINAL STABLE UI
   ======================================================== */

body {
    background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('bg.jpg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    color: white;
    font-family: 'Arial Black', sans-serif;
    margin: 0;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}

section {
    display: none;
    height: 100vh;
    width: 100vw;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2vh;
}

section.active { display: flex !important; }

button {
    background: #ff4757;
    color: white;
    border: 0.5vh solid white;
    padding: 1.5vh 3vw;
    border-radius: 50px;
    font-size: 2.5vh;
    font-weight: 900;
    cursor: pointer;
    text-transform: uppercase;
    transition: 0.3s;
}

button:hover { transform: scale(1.05); background: #ff6b81; }

/* LAYOUT KAMERA */
#camera-container { display: flex; align-items: center; gap: 3vw; }
.video-wrapper {
    width: 55vw;
    border: 1vh solid white;
    border-radius: 3vh;
    position: relative;
    overflow: hidden;
    background: black;
}
#video { width: 100%; transform: scaleX(-1); }
#timer {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-size: 20vh;
    color: white;
    text-shadow: 0 0 3vh rgba(0,0,0,0.8);
    z-index: 10;
}

/* PREVIEW SLOTS & TOMBOL ULANGI */
.camera-right { width: 15vw; display: flex; flex-direction: column; gap: 2vh; }
.slot {
    width: 100%;
    height: 12vh;
    background: rgba(0,0,0,0.3);
    border: 2px solid white;
    position: relative; /* Kunci untuk tombol melayang */
    border-radius: 1vh;
}
.slot img { width: 100%; height: 100%; object-fit: cover; border-radius: 1vh; }

/* FIX: TOMBOL ULANGI AGAR TIDAK HILANG */
.btn-retake-small {
    position: absolute;
    top: -10px;
    right: -10px;
    background: #ff4757;
    color: white;
    padding: 5px 10px;
    font-size: 12px;
    border: 2px solid white;
    border-radius: 5px;
    cursor: pointer;
    z-index: 999; /* Pastikan di paling atas */
}

/* HALAMAN PILIH FRAME */
#page-frame {
    display: flex;
    flex-direction: column; /* Default atas-bawah */
    transition: all 0.5s ease;
}

/* TAMPILAN AWAL: SCROLL SAMPING FULL */
#frame-options {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    gap: 20px;
    width: 90vw;
    padding: 20px;
    scrollbar-width: thin;
}

/* Thumbnail Frame */
.frame-thumb {
    flex: 0 0 auto;
    height: 40vh;
    border: 3px solid white;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.3s;
}

/* TAMPILAN SETELAH PILIH (Diatur via JS) */
.split-layout {
    flex-direction: row !important;
    justify-content: space-around !important;
    padding: 5vh !important;
}

.split-layout #frame-options {
    flex-direction: column !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    width: 20vw !important;
    height: 70vh !important;
}

.split-layout .frame-thumb {
    height: auto !important;
    width: 100% !important;
}

.result-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

#final-image-preview {
    height: 75vh;
    border: 1vh solid white;
    border-radius: 2vh;
    box-shadow: 0 0 5vh black;
}

.action-buttons { margin-top: 2vh; display: flex; gap: 20px; }
