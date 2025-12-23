document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://cori-tools.onrender.com/api/organize-pdf';
    
    const uploadArea = document.getElementById('upload-area');
    const mainFileInput = document.getElementById('main-file-input');
    const editorArea = document.getElementById('editor-area');
    const pagesGrid = document.getElementById('pages-grid');
    const actionButtons = document.getElementById('action-buttons');
    const saveButton = document.getElementById('save-button');
    const insertInput = document.getElementById('insert-input');
    const loadingSpinner = document.getElementById('loading-spinner');

    let mainPdfFile = null;
    let insertFiles = []; // Array to store inserted files
    let pageCount = 0;

    // Initialize Sortable
    new Sortable(pagesGrid, {
        animation: 150,
        ghostClass: 'ghost'
    });

    // Handle Main PDF Upload
    mainFileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            mainPdfFile = e.target.files[0];
            await loadPdfToGrid(mainPdfFile);
            uploadArea.classList.add('hidden');
            editorArea.classList.remove('hidden');
            actionButtons.classList.remove('hidden');
        }
    });

    // Function to render PDF pages as thumbnails
    async function loadPdfToGrid(file, isInsert = false) {
        loadingSpinner.classList.remove('hidden');
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 0.5 });
            
            // Create canvas for thumbnail
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.className = 'rounded shadow-sm mb-2 w-full object-contain bg-white border border-slate-200';

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            // Create Page Card DOM
            const card = document.createElement('div');
            card.className = 'page-card relative bg-slate-100 p-2 rounded-lg group cursor-move';
            
            // Store metadata for the backend
            // If it's the main file, type is 'original'
            // If it's an insert, type is 'insert' and we track which file it came from
            const type = isInsert ? 'insert' : 'original';
            const fileId = isInsert ? `insert_${insertFiles.length - 1}` : 'main';
            
            card.dataset.type = type;
            card.dataset.pageIndex = i - 1; // 0-based index
            card.dataset.rotation = 0;
            if (isInsert) card.dataset.fileId = fileId;

            // Toolbar overlay
            const toolbar = document.createElement('div');
            toolbar.className = 'absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded p-1';
            
            // Rotate Button
            const rotateBtn = document.createElement('button');
            rotateBtn.innerHTML = '<i data-lucide="rotate-cw" class="w-4 h-4 text-white"></i>';
            rotateBtn.onclick = (e) => {
                e.stopPropagation(); // Prevent drag start
                let currentRot = parseInt(card.dataset.rotation);
                currentRot = (currentRot + 90) % 360;
                card.dataset.rotation = currentRot;
                canvas.style.transform = `rotate(${currentRot}deg)`;
            };

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i>';
            deleteBtn.onclick = (e) => {
                card.remove();
            };

            toolbar.appendChild(rotateBtn);
            toolbar.appendChild(deleteBtn);
            
            card.appendChild(toolbar);
            card.appendChild(canvas);
            
            // Page Number Label
            const label = document.createElement('div');
            label.className = 'text-xs text-center text-slate-500 mt-1';
            label.innerText = `Page ${i}`;
            card.appendChild(label);

            pagesGrid.appendChild(card);
            lucide.createIcons();
        }
        loadingSpinner.classList.add('hidden');
    }

    // Handle "Add Page" (Insert new PDF)
    insertInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            insertFiles.push(file); // Store file to send later
            await loadPdfToGrid(file, true);
        }
    });

    // Save & Download
    saveButton.addEventListener('click', async () => {
        loadingSpinner.classList.remove('hidden');
        
        const cards = Array.from(pagesGrid.children);
        const instructions = cards.map(card => ({
            type: card.dataset.type,
            pageIndex: parseInt(card.dataset.pageIndex),
            rotation: parseInt(card.dataset.rotation),
            fileId: card.dataset.fileId || null
        }));

        const formData = new FormData();
        formData.append('mainPdf', mainPdfFile);
        formData.append('instructions', JSON.stringify(instructions));
        
        // Append all insert files
        insertFiles.forEach((file, index) => {
            formData.append(`insert_${index}`, file);
        });

        try {
            const response = await fetch(API_URL, { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Failed to organize PDF');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cori-organized.pdf';
            a.click();
        } catch (error) {
            alert(error.message);
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    });
});