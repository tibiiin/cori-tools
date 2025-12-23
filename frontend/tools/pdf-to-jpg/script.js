document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://cori-tools.onrender.com/api/pdf-to-jpg';
    const form = document.getElementById('convert-form');
    const fileInput = document.getElementById('file-input');
    const convertButton = document.getElementById('convert-button');

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            convertButton.disabled = false;
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Conversion failed');

            const blob = await response.blob();
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'cori-converted.jpg';
            a.click();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
});