const pdfImgConvert = require('pdf-img-convert');
const JSZip = require('jszip');

const convertPdfToJpg = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No PDF file uploaded.');
        }

        // 1. Convert ALL pages of the PDF to images
        const outputImages = await pdfImgConvert.convert(req.file.buffer, {
            width: 1200 // Higher width for better quality
        });

        // 2. Create a new ZIP file
        const zip = new JSZip();
        
        // 3. Loop through all converted pages and add them to the ZIP
        outputImages.forEach((image, index) => {
            // Filenames will be page-1.jpg, page-2.jpg, etc.
            zip.file(`page-${index + 1}.jpg`, image);
        });

        // 4. Generate the ZIP as a buffer
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        // 5. Send the ZIP file to the user
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=cori-images.zip');
        res.send(zipBuffer);

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).send('Error converting all PDF pages.');
    }
};

module.exports = { convertPdfToJpg };