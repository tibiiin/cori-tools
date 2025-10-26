const { PDFDocument } = require('pdf-lib');

/**
 * Merges multiple PDF buffers into a single PDF buffer.
 * This is a backend (Node.js) function.
 * @param {Array<Buffer>} pdfBuffers - An array of Buffers, one for each PDF file.
 * @returns {Promise<Uint8Array>} A promise that resolves with the merged PDF as a Uint8Array.
 */
async function mergePdfBuffers(pdfBuffers) {
    const mergedPdf = await PDFDocument.create();

    for (const pdfBytes of pdfBuffers) {
        // Load the PDF from its buffer
        const pdf = await PDFDocument.load(pdfBytes);
        
        // Get all page indices
        const pageIndices = pdf.getPageIndices();
        
        // Copy the pages into the merged document
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
        
        // Add the copied pages to the end
        copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
        });
    }

    // Save the merged PDF into a Uint8Array
    const mergedPdfBytes = await mergedPdf.save();
    return mergedPdfBytes;
}

/**
 * The Express route handler for merging PDFs.
 * It expects files to be in `req.files`.
 */
const mergePdfs = async (req, res) => {
    console.log('Merge request received. Processing files...');
    try {
        if (!req.files || req.files.length === 0) {
            console.log('No files uploaded.');
            return res.status(400).send('No files uploaded.');
        }

        // Get the file buffers from multer
        const pdfBuffers = req.files.map(file => file.buffer);

        // Run the merge function
        const mergedPdfBytes = await mergePdfBuffers(pdfBuffers);

        // Set headers and send the merged PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cori-merged.pdf');
        console.log('Successfully merged PDFs. Sending file.');
        res.send(Buffer.from(mergedPdfBytes)); // Send as a buffer

    } catch (error) {
        console.error('Error merging PDFs:', error.message);
        console.error(error.stack);
        res.status(500).send('An error occurred while merging the PDFs.');
    }
};

// This is the correct way to export for your server.js
module.exports = {
    mergePdfs
};

