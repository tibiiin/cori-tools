const { PDFDocument } = require('pdf-lib');

const jpgToPdf = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No images uploaded.');
        }

        const pdfDoc = await PDFDocument.create();

        // Process each image in the order they were received
        for (const file of req.files) {
            const image = await pdfDoc.embedJpg(file.buffer);
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, {
                x: 0,
                y: 0,
                width: image.width,
                height: image.height,
            });
        }

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cori-images-to-pdf.pdf');
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('JPG to PDF Error:', error);
        res.status(500).send('Error converting images to PDF.');
    }
};

module.exports = { jpgToPdf };