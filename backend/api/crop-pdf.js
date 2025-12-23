const { PDFDocument } = require('pdf-lib');

const cropPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No PDF file uploaded.');
        }

        // Parse coordinates and the specific page index from the frontend
        const { x, y, width, height, pageIndex } = JSON.parse(req.body.coordinates);

        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const pages = pdfDoc.getPages();

        if (pageIndex > 0 && pageIndex <= pages.length) {
            const page = pages[pageIndex - 1]; // Convert 1-based index to 0-based
            
            // PDF-lib uses points (72 DPI). Ensure your frontend handles this scale.
            // setCropBox(x, y, width, height)
            page.setCropBox(x, y, width, height);
        }

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cori-cropped.pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Crop PDF Error:', error);
        res.status(500).send('Error cropping PDF: ' + error.message);
    }
};

module.exports = { cropPdf };