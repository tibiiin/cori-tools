document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://cori-tools.onrender.com/api/crop-pdf';
    const fileInput = document.getElementById('file-input');
    const previewImg = document.getElementById('pdf-preview');
    const cropButton = document.getElementById('crop-button');
    let cropper = null;
    let originalPdfFile = null;

    fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            originalPdfFile = e.target.files[0];
            const arrayBuffer = await originalPdfFile.arrayBuffer();
            
            // Render first page as image for Cropper.js
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

            previewImg.src = canvas.toDataURL();
            document.getElementById('upload-container').classList.add('hidden');
            document.getElementById('editor-container').classList.remove('hidden');

            if (cropper) cropper.destroy();
            cropper = new Cropper(previewImg, { viewMode: 1, dragMode: 'crop', autoCropArea: 0.8 });
        }
    });

    cropButton.addEventListener('click', async () => {
        const data = cropper.getData();
        const formData = new FormData();
        formData.append('file', originalPdfFile);
        formData.append('coordinates', JSON.stringify({
            x: data.x,
            y: data.y, // You may need to flip Y coordinate for PDF-lib
            width: data.width,
            height: data.height
        }));

        const response = await fetch(API_URL, { method: 'POST', body: formData });
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cori-cropped.pdf';
        a.click();
    });
});