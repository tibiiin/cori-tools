document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://cori-tools.onrender.com/api/compress-image';
    
    const form = document.getElementById('compress-form');
    const fileInput = document.getElementById('file-input');
    const controlsArea = document.getElementById('controls-area');
    const resultArea = document.getElementById('result-area');
    const compressButton = document.getElementById('compress-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    
    // Elements for updating values
    const fileNameDisplay = document.getElementById('file-name');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const originalSizeDisplay = document.getElementById('original-size');
    const newSizeDisplay = document.getElementById('new-size');
    const savingsText = document.getElementById('savings-text');
    const downloadLink = document.getElementById('download-link');
    const resetButton = document.getElementById('reset-button');

    let originalFile = null;

    // Helper to format bytes
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Update slider percentage display
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value + '%';
    });

    // Handle File Selection
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            originalFile = fileInput.files[0];
            
            // Show UI
            fileNameDisplay.textContent = originalFile.name;
            controlsArea.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            resultArea.classList.add('hidden');
            
            // Auto-hide the big drop zone instructions if needed (optional)
        }
    });

    // Handle Compress Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        controlsArea.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        const formData = new FormData();
        formData.append('file', originalFile);
        formData.append('quality', qualitySlider.value); // Send the slider value

        try {
            const response = await fetch(API_URL, { method: 'POST', body: formData });
            
            if (!response.ok) throw new Error('Compression failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Calculate savings
            const originalSize = originalFile.size;
            const newSize = blob.size;
            const savedBytes = originalSize - newSize;
            const savedPercent = Math.round((savedBytes / originalSize) * 100);

            // Update Result UI
            originalSizeDisplay.textContent = formatBytes(originalSize);
            newSizeDisplay.textContent = formatBytes(newSize);
            
            if (savedBytes > 0) {
                savingsText.textContent = `You saved ${savedPercent}% (${formatBytes(savedBytes)})`;
                savingsText.className = 'text-green-600 font-medium mb-6';
            } else {
                savingsText.textContent = `File size increased (Quality setting too high)`;
                savingsText.className = 'text-orange-500 font-medium mb-6';
            }

            // Setup Download
            downloadLink.href = url;
            downloadLink.download = `cori-compressed-${originalFile.name}`;
            
            // Show results
            loadingSpinner.classList.add('hidden');
            resultArea.classList.remove('hidden');

        } catch (error) {
            loadingSpinner.classList.add('hidden');
            controlsArea.classList.remove('hidden'); // Show controls again so they can retry
            errorMessage.textContent = 'Error: ' + error.message;
            errorMessage.classList.remove('hidden');
        }
    });

    // Handle Reset
    resetButton.addEventListener('click', () => {
        resultArea.classList.add('hidden');
        controlsArea.classList.add('hidden');
        fileInput.value = '';
        originalFile = null;
    });
});