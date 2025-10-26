/**
 * This is the frontend (browser) JavaScript for the Merge PDF tool.
 * It handles form submission, file validation, and API communication.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- IMPORTANT ---
    // Change this URL to your live Render backend URL
    // You get this *after* your backend is successfully deployed.
    const API_URL = 'https://cori-api.onrender.com/api/merge'; // <-- *** EDIT THIS ***

    const toolForm = document.getElementById('tool-form');
    const fileInput = document.getElementById('file-input');
    const fileListDisplay = document.getElementById('file-list-display');
    const submitButton = document.getElementById('submit-button');
    const statusMessage = document.getElementById('status-message');
    const downloadButton = document.getElementById('download-button');

    let uploadedFiles = []; // To store the File objects

    // --- 1. Handle File Input ---
    fileInput.addEventListener('change', () => {
        // Clear previous files and list
        uploadedFiles = [];
        fileListDisplay.innerHTML = '';
        statusMessage.textContent = '';
        downloadButton.classList.add('hidden');

        if (fileInput.files.length > 0) {
            for (const file of fileInput.files) {
                // We only accept PDFs
                if (file.type === 'application/pdf') {
                    uploadedFiles.push(file);
                    const listItem = document.createElement('div');
                    listItem.className = 'file-item';
                    listItem.textContent = file.name;
                    fileListDisplay.appendChild(listItem);
                } else {
                    // Show a warning for non-PDF files
                    const errorItem = document.createElement('div');
                    errorItem.className = 'file-item-error';
                    errorItem.textContent = `${file.name} (Not a PDF, will be skipped)`;
                    fileListDisplay.appendChild(errorItem);
                }
            }
        }

        // Show/hide submit button
        if (uploadedFiles.length < 2) {
            submitButton.classList.add('opacity-50', 'cursor-not-allowed');
            submitButton.disabled = true;
            if (uploadedFiles.length > 0) {
                showStatus('You must select at least two PDF files to merge.', 'error');
            }
        } else {
            submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
            submitButton.disabled = false;
        }
    });

    // --- 2. Handle Form Submission ---
    toolForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the form from submitting normally

        if (uploadedFiles.length < 2) {
            showStatus('You need at least two PDF files to merge.', 'error');
            return;
        }

        // Show loading state
        showLoading(true);

        // Create FormData to send files
        const formData = new FormData();
        uploadedFiles.forEach(file => {
            formData.append('files', file); // 'files' must match the backend 'upload.array('files')'
        });

        try {
            // Make the API call
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData, // No 'Content-Type' header needed; 'fetch' sets it for FormData
            });

            if (!response.ok) {
                // Handle server errors
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} ${response.statusText}. ${errorText}`);
            }

            // Get the merged file as a 'blob'
            const mergedPdfBlob = await response.blob();

            // --- 3. Handle Successful Download ---
            showStatus('Files merged successfully! Your download is ready.', 'success');
            
            // Create a temporary URL for the blob
            const downloadUrl = URL.createObjectURL(mergedPdfBlob);
            
            // Show the download button
            downloadButton.href = downloadUrl;
            downloadButton.download = 'cori-merged.pdf'; // The default filename
            downloadButton.classList.remove('hidden');

        } catch (error) {
            console.error('Fetch error:', error);
            showStatus(`An error occurred: ${error.message}`, 'error');
        } finally {
            // Stop loading state
            showLoading(false);
        }
    });

    // --- Helper Functions ---

    function showStatus(message, type = 'info') {
        statusMessage.textContent = message;
        statusMessage.className = 'text-sm mt-4'; // Reset classes
        if (type === 'error') {
            statusMessage.classList.add('text-red-500');
        } else if (type === 'success') {
            statusMessage.classList.add('text-green-500');
        } else {
            statusMessage.classList.add('text-gray-500');
        }
    }

    function showLoading(isLoading) {
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.classList.add('opacity-50', 'cursor-not-allowed');
            submitButton.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Merging...
            `;
            statusMessage.textContent = 'Uploading and processing your files...';
            statusMessage.className = 'text-sm mt-4 text-blue-500';
            downloadButton.classList.add('hidden');
        } else {
            submitButton.disabled = false;
            submitButton.classList.remove('opacity-50', 'cursor-not-allowed');
            submitButton.innerHTML = 'Merge PDFs';
        }
    }

});

