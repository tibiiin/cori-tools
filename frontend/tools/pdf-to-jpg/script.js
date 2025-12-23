document.addEventListener('DOMContentLoaded', () => {
    // Ensure the API URL matches your backend route
    const API_URL = 'https://cori-tools.onrender.com/api/pdf-to-jpg'; 

    const form = document.getElementById('convert-form');
    const fileInput = document.getElementById('file-input');
    const fileListDisplay = document.getElementById('file-list');
    const convertButton = document.getElementById('convert-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');

    // Handle file selection display (similar to Merge tool logic)
    fileInput.addEventListener('change', () => {
        fileListDisplay.innerHTML = '';
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const listItem = document.createElement('div');
            listItem.className = 'p-3 bg-slate-100 rounded-md text-sm font-medium text-slate-700 flex justify-between';
            
            const fileName = file.name.length > 40 ? file.name.substring(0, 37) + '...' : file.name;
            listItem.innerHTML = `
                <span>${fileName}</span>
                <span class="text-xs text-slate-500">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            `;
            fileListDisplay.appendChild(listItem);
            convertButton.disabled = false;
        }
    });

    // Handle Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Show loading state and hide button
        convertButton.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        errorMessage.classList.add('hidden');

        const formData = new FormData();
        // Key 'file' must match your backend upload.single('file')
        formData.append('file', fileInput.files[0]); 

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to convert PDF.');
            }

            // Get the ZIP file as a blob
            const zipBlob = await response.blob();

            // Create a download link for the ZIP file
            const downloadUrl = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            // Update filename to indicate it is a ZIP containing all pages
            a.download = 'cori-converted-images.zip'; 
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(downloadUrl);

            // Reset form after success
            fileListDisplay.innerHTML = '';
            fileInput.value = '';
            convertButton.disabled = true;

        } catch (error) {
            console.error('Conversion error:', error);
            errorMessage.textContent = `An error occurred: ${error.message}`;
            errorMessage.classList.remove('hidden');
        } finally {
            // Restore UI state
            loadingSpinner.classList.add('hidden');
            convertButton.classList.remove('hidden');
        }
    });
});