document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://cori-tools.onrender.com/api/jpg-to-pdf';
    const fileInput = document.getElementById('file-input');
    const fileListDisplay = document.getElementById('file-list');
    const convertButton = document.getElementById('convert-button');
    const form = document.getElementById('convert-form');

    let selectedFiles = [];

    // Initialize Sortable for reordering
    const sortable = new Sortable(fileListDisplay, {
        animation: 150,
        onEnd: () => {
            // Reorder the selectedFiles array based on the new UI order
            const newOrder = Array.from(fileListDisplay.children).map(el => el.dataset.id);
            selectedFiles = newOrder.map(id => selectedFiles.find(f => f.id === id));
        }
    });

    fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files);
        files.forEach(file => {
            const id = Math.random().toString(36).substr(2, 9);
            selectedFiles.push({ id, file });

            const listItem = document.createElement('div');
            listItem.dataset.id = id;
            listItem.className = 'p-3 bg-slate-100 rounded-md text-sm font-medium text-slate-700 flex items-center shadow-sm';
            listItem.innerHTML = `
                <i data-lucide="grip-vertical" class="w-4 h-4 mr-3 text-slate-400"></i>
                <span class="flex-grow">${file.name}</span>
                <span class="text-xs text-slate-500">${(file.size / 1024).toFixed(0)} KB</span>
            `;
            fileListDisplay.appendChild(listItem);
        });
        
        lucide.createIcons();
        convertButton.disabled = selectedFiles.length === 0;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        convertButton.disabled = true;
        document.getElementById('loading-spinner').classList.remove('hidden');

        const formData = new FormData();
        // Append files in the specific order determined by the user reordering
        selectedFiles.forEach(item => {
            formData.append('files', item.file);
        });

        try {
            const response = await fetch(API_URL, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Failed to create PDF');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cori-images.pdf';
            a.click();
        } catch (err) {
            alert(err.message);
        } finally {
            document.getElementById('loading-spinner').classList.add('hidden');
            convertButton.disabled = false;
        }
    });
});