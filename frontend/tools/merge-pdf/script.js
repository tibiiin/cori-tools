/**
 * This is the frontend (browser) JavaScript for the Merge PDF tool.
 * This version is corrected to match the element IDs in `index.html`.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // --- IMPORTANT ---
    // Make sure this URL is correct for your deployed Render backend.
    const API_URL = 'https://cori-tools.onrender.com/api/merge';

    // Get correct elements from index.html
    const mergeForm = document.getElementById('merge-form');
    const fileInput = document.getElementById('file-input');
    const fileListDisplay = document.getElementById('file-list');
    const mergeButton = document.getElementById('merge-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const dropZone = document.querySelector('.drop-zone'); // For drag/drop styling

    let uploadedFiles = []; // To store the valid File objects

    // --- 1. Handle File Input (from 'change' and 'drop') ---
    function handleFiles(files) {
        // Clear previous files and errors
        uploadedFiles = [];
        fileListDisplay.innerHTML = '';
        hideError();

        if (files.length > 0) {
            for (const file of files) {
                if (file.type === 'application/pdf') {
                    uploadedFiles.push(file);
                    const listItem = document.createElement('div');
                    listItem.className = 'p-3 bg-slate-100 rounded-md text-sm font-medium text-slate-700 flex items-center justify-between';
                    
                    // Truncate long file names
                    const fileName = file.name.length > 40 ? file.name.substring(0, 37) + '...' : file.name;
                    
                    listItem.innerHTML = `
                        <span>${fileName}</span>
                        <span class="text-xs text-slate-500">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    `;
                    fileListDisplay.appendChild(listItem);
                } else {
                    // Show a warning for non-PDF files
                    const errorItem = document.createElement('div');
                    errorItem.className = 'p-3 bg-red-100 rounded-md text-sm font-medium text-red-700';
                    errorItem.textContent = `${file.name} (Not a PDF, will be skipped)`;
                    fileListDisplay.appendChild(errorItem);
                }
            }
        }

        // Enable/disable the merge button
        if (uploadedFiles.length < 2) {
            mergeButton.disabled = true;
            if (uploadedFiles.length > 0) {
                showError('You must select at least two PDF files to merge.');
            }
        } else {
            mergeButton.disabled = false;
        }
    }

    // --- 2. Event Listeners for File Input ---
    
    // Listen for file selection via the "Choose Files" button
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    // --- 3. Drag and Drop Listeners ---
    
    // Add visual feedback for dragging over
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow a drop
        dropZone.classList.add('drag-over');
    });

    // Remove visual feedback
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    // Handle the actual file drop
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        // Use dropped files
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files; // Assign dropped files to the input
            handleFiles(fileInput.files); // Process them
        }
    });

    // --- 4. Handle Form Submission ---
    mergeForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop the form from submitting normally

        if (uploadedFiles.length < 2) {
            showError('You need at least two PDF files to merge.');
            return;
        }

        // Show loading state
        showLoading(true);

        // Create FormData to send files
        const formData = new FormData();
        uploadedFiles.forEach(file => {
            // 'files' must match the backend 'upload.array('files')'
            formData.append('files', file); 
        });

        try {
            // Make the API call
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData, // 'fetch' sets the 'Content-Type' for FormData automatically
            });

            if (!response.ok) {
                // Handle server errors
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status}. ${errorText || 'Failed to merge.'}`);
            }

            // Get the merged file as a 'blob'
            const mergedPdfBlob = await response.blob();

            // --- 5. Handle Successful Download ---
            // Create a temporary link to trigger the download
            const downloadUrl = URL.createObjectURL(mergedPdfBlob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'cori-merged.pdf'; // The default filename
            document.body.appendChild(a); // Add link to body
            a.click(); // Simulate a click
            a.remove(); // Remove the link
            URL.revokeObjectURL(downloadUrl); // Clean up the object URL

            // Reset the form
            fileListDisplay.innerHTML = '';
            uploadedFiles = [];
            mergeButton.disabled = true;

        } catch (error) {
            console.error('Merge error:', error);
            showError(`An error occurred: ${error.message}`);
        } finally {
            // Stop loading state
            showLoading(false);
        }
    });

    // --- Helper Functions ---

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.classList.add('hidden');
    }

    function showLoading(isLoading) {
        if (isLoading) {
            hideError();
            mergeButton.classList.add('hidden'); // Hide the button
            loadingSpinner.classList.remove('hidden'); // Show the spinner
        } else {
            mergeButton.classList.remove('hidden'); // Show the button
            loadingSpinner.classList.add('hidden'); // Hide the spinner
        }
    }

    // Lucide icons replacement
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});