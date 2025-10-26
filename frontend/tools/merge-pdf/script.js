document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // == CRITICAL: SET YOUR BACKEND API URL HERE ==
    // =========================================================================
    // This is the URL you get after deploying your backend to Render.
    // Example: "https://cori-api.onrender.com/api/merge"
    //
    // For local testing (if you run 'node server.js' locally):
    // const API_URL = 'http://localhost:3001/api/merge';
    //
    // For production (after deploying backend to Render):
    const API_URL = 'https://cori-tools.onrender.com/api/merge';
    // =========================================================================


    // --- Get DOM Elements ---
    const form = document.getElementById('merge-form');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.querySelector('.drop-zone');
    const fileListDiv = document.getElementById('file-list');
    const mergeButton = document.getElementById('merge-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessageDiv = document.getElementById('error-message');

    let uploadedFiles = []; // To store the File objects

    // --- Helper Functions ---

    /**
     * Updates the file list UI based on the 'uploadedFiles' array
     */
    function updateFileList() {
        fileListDiv.innerHTML = ''; // Clear current list

        if (uploadedFiles.length === 0) {
            fileListDiv.innerHTML = '<p class="text-slate-500 text-center">No files selected.</p>';
        } else {
            uploadedFiles.forEach((file, index) => {
                const fileElement = document.createElement('div');
                fileElement.className = 'p-3 bg-slate-100 rounded-lg flex items-center justify-between';
                
                // File name and size
                fileElement.innerHTML = `
                    <div class="flex items-center">
                        <i data-lucide="file-text" class="w-5 h-5 text-blue-500 mr-3"></i>
                        <span class="font-medium text-slate-700">${file.name}</span>
                        <span class="text-slate-500 ml-2">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                `;
                
                // Remove button
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '<i data-lucide="x" class="w-5 h-5 text-red-500 hover:text-red-700"></i>';
                removeBtn.onclick = () => {
                    removeFile(index);
                };
                fileElement.appendChild(removeBtn);

                fileListDiv.appendChild(fileElement);
            });
        }
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Enable/disable merge button
        mergeButton.disabled = uploadedFiles.length < 2;
    }

    /**
     * Removes a file from the 'uploadedFiles' array and updates the UI
     * @param {number} index - The index of the file to remove
     */
    function removeFile(index) {
        uploadedFiles.splice(index, 1);
        updateFileList();
        // Update the file input's files property (this is a bit of a hack)
        const dataTransfer = new DataTransfer();
        uploadedFiles.forEach(file => dataTransfer.items.add(file));
        fileInput.files = dataTransfer.files;
    }

    /**
     * Shows/hides the loading spinner
     * @param {boolean} isLoading 
     */
    function setLoading(isLoading) {
        if (isLoading) {
            loadingSpinner.classList.remove('hidden');
            mergeButton.classList.add('hidden');
            errorMessageDiv.classList.add('hidden');
        } else {
            loadingSpinner.classList.add('hidden');
            mergeButton.classList.remove('hidden');
        }
    }

    /**
     * Shows an error message
     * @param {string} message 
     */
    function showError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove('hidden');
    }

    // --- Event Listeners ---

    // 1. Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop default form submission
        
        if (uploadedFiles.length < 2) {
            showError('You must upload at least two PDF files to merge.');
            return;
        }
        
        if (API_URL.includes('your-render-backend-url.onrender.com')) {
            showError('Developer Error: Please update the API_URL in script.js before deploying.');
            return;
        }

        setLoading(true);

        // Create FormData to send files
        const formData = new FormData();
        uploadedFiles.forEach(file => {
            formData.append('files', file); // 'files' must match the backend 'upload.array('files')'
        });

        try {
            // Send files to the backend
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                // If response is not 2xx, get error text
                const errorText = await response.text();
                throw new Error(errorText || 'Server error occurred.');
            }

            // Get the merged PDF as a blob
            const blob = await response.blob();

            // Create a temporary URL and trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Get filename from response header, or use a default
            const disposition = response.headers.get('content-disposition');
            let filename = 'merged_by_CORi.pdf';
            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            a.download = filename;
            
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            // Reset form
            uploadedFiles = [];
            fileInput.value = '';
            updateFileList();

        } catch (err) {
            console.error('Fetch error:', err);
            showError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    });

    // 2. File Input Change (handles 'Choose Files' button)
    fileInput.addEventListener('change', () => {
        uploadedFiles = Array.from(fileInput.files);
        updateFileList();
    });

    // 3. Drag and Drop Listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        const dataTransfer = new DataTransfer();
        // Add existing files
        uploadedFiles.forEach(file => dataTransfer.items.add(file));
        
        // Add new (dropped) files, filtering for PDFs
        if (e.dataTransfer.files) {
            Array.from(e.dataTransfer.files).forEach(file => {
                if (file.type === 'application/pdf') {
                    dataTransfer.items.add(file);
                }
            });
        }
        
        // Update both the input and our internal array
        fileInput.files = dataTransfer.files;
        uploadedFiles = Array.from(fileInput.files);
        updateFileList();
    });

    // --- Initial Call ---
    updateFileList(); // Show "No files selected" on page load
});
