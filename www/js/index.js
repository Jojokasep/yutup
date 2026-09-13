document.addEventListener('deviceready', onDeviceReady, false);

const video = document.getElementById('webcam');
const canvas = document.getElementById('photo-canvas');
const photoResult = document.getElementById('photo-result');
const btnStart = document.getElementById('btn-start');
const btnCapture = document.getElementById('btn-capture');
const btnSave = document.getElementById('btn-save');

let capturedDataURL = null;

function onDeviceReady() {
    console.log("Cordova siap dijalankan!");
}

// 1. Minta Izin Kamera dan Jalankan Video Stream
btnStart.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" },
            audio: false
        });
        video.srcObject = stream;
        btnCapture.disabled = false;
        btnStart.disabled = true;
    } catch (err) {
        alert("Gagal mengakses kamera. Pastikan izin kamera sudah diberikan: " + err.message);
    }
});

// 2. Ambil Foto dari Video ke Canvas
btnCapture.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    capturedDataURL = canvas.toDataURL('image/png');
    photoResult.src = capturedDataURL;
    btnSave.disabled = false;
});

// 3. Simpan Foto ke Galeri / Unduh
btnSave.addEventListener('click', () => {
    if (!capturedDataURL) return;

    // Jika berjalan di Cordova Mobile App
    if (window.cordova && cordova.plugins) {
        saveImageCordova(capturedDataURL);
    } else {
        // Jika berjalan di Web Browser Biasa
        const a = document.createElement('a');
        a.href = capturedDataURL;
        a.download = `photobooth_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        alert("Foto berhasil diunduh ke folder Downloads!");
    }
});

function saveImageCordova(base64Data) {
    // Fungsi bantuan simpan file untuk lingkungan Cordova Mobile
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
        const fileName = `photobooth_${Date.now()}.png`;
        fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
            fetch(base64Data)
                .then(res => res.blob())
                .then(blob => {
                    fileEntry.createWriter(function (fileWriter) {
                        fileWriter.write(blob);
                        alert("Foto berhasil disimpan ke penyimpanan HP!");
                    }, function (e) {
                        alert("Gagal menulis file: " + e.toString());
                    });
                });
        }, function (e) {
            alert("Gagal membuat file: " + e.toString());
        });
    }, function (e) {
        alert("Gagal mengakses filesystem: " + e.toString());
    });
}
