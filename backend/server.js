const express = require('express');
const cors = require('cors');
const multer = require('multer');
// FIX IS HERE: Deconstruct the 'mergePdfs' function from the imported module
const { mergePdfs } = require('./api/merge'); 

const app = express();
const port = process.env.PORT || 3001; // Render will set the PORT env variable

// === Middleware ===
// 1. Enable CORS for all routes
// This is crucial to allow your Vercel frontend to call your Render backend
// --- 1. Enable CORS ---
// This is crucial to allow your Vercel frontend to call your Render backend
app.use(cors({
    origin: 'https://cori-tools.vercel.app' // This specifically allows your Vercel site
}));

// 2. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Configure Multer for file uploads
// We use 'memoryStorage' to hold the file in a buffer,
// which is perfect for processing with 'pdf-lib' without saving to disk.
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB file size limit
});

// === API Routes ===

// Root route for health check (good for Render)
app.get('/', (req, res) => {
    res.send('CORi Backend is running!');
});

// The 'merge' endpoint
// It expects files to be sent under the field name 'files'
// AND FIX IS HERE: We are now passing the 'mergePdfs' function, not the object
app.post('/api/merge', upload.array('files'), mergePdfs);

// === Start Server ===
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

