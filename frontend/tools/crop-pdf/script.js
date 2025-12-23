let pdfDoc = null;
let currentPage = 1;

// Function to render a specific page for the cropper
async function loadPage(pageNum) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport: viewport }).promise;
    
    // Update the image source for Cropper.js
    if (cropper) cropper.destroy();
    previewImg.src = canvas.toDataURL();
    
    // Initialize Cropper again on the new page image
    cropper = new Cropper(previewImg, { viewMode: 1, autoCropArea: 0.8 });
    document.getElementById('current-page-num').textContent = pageNum;
}

// When the file is uploaded:
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const arrayBuffer = await file.arrayBuffer();
    pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
    document.getElementById('total-pages').textContent = pdfDoc.numPages;
    loadPage(currentPage);
});

// Crop button logic
cropButton.addEventListener('click', async () => {
    const data = cropper.getData();
    const formData = new FormData();
    formData.append('file', originalPdfFile);
    formData.append('coordinates', JSON.stringify({
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        pageIndex: currentPage // Pass the current page number
    }));
    // ... fetch and download logic
});