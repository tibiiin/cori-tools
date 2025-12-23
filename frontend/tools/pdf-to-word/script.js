document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://cori-tools.onrender.com/api/pdf-to-word';
    const form = document.getElementById('convert-form');
    const fileInput = document.getElementById('file-input');
    const fileListDisplay = document.getElementById('file-list');
    const convertButton = document.getElementById('convert-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');

    fileInput.addEventListener('change', () => {
        fileListDisplay.innerHTML = '';
        errorMessage.classList.add('hidden');
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const listItem = document.createElement('div');
            listItem.className = 'p-3 bg-slate-100 rounded-md text-sm font-medium text-slate-700 flex justify-between';
            listItem.innerHTML = `<span>${file.name}</span><span>${(file.size / 1024 / 1024).toFixed(2)} MB</span>`;
            fileListDisplay.appendChild(listItem);
            convertButton.disabled = false;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        convertButton.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            const response = await fetch(API_URL, { method: 'POST', body: formData });
            
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Conversion failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cori-converted.docx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            // Reset UI
            fileListDisplay.innerHTML = '';
            fileInput.value = '';
            convertButton.disabled = true;

        } catch (error) {
            errorMessage.textContent = 'Error: ' + error.message;
            errorMessage.classList.remove('hidden');
        } finally {
            loadingSpinner.classList.add('hidden');
            convertButton.classList.remove('hidden');
        }
    });
});