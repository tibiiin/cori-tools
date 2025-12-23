const { PDFDocument } = require('pdf-lib');

const cropPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No PDF file uploaded.');
        }

        // Get crop coordinates from the request body
        // Coordinates should be in points (1/72 inch)
        const { x, y, width, height } = JSON.parse(req.body.coordinates);

        const pdfDoc = await PDFDocument.load(req.file.buffer);
        const pages = pdfDoc.getPages();

        pages.forEach((page) => {
            // In PDF coordinate systems, (0,0) is bottom-left
            // We need to convert from top-left (UI standard) if necessary
            const { width: pageWidth, height: pageHeight } = page.getSize();
            
            // Set the new crop box
            // x, y, width, height
            page.setCropBox(x, y, width, height);
        });

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