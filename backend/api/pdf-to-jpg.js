const pdfImgConvert = require('pdf-img-convert');

const convertPdfToJpg = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No PDF file uploaded.');
        }

        // Convert PDF buffer to an array of images (base64 or Uint8Array)
        const outputImages = await pdfImgConvert.convert(req.file.buffer, {
            width: 1000 // High quality width
        });

        // For simplicity in this tool, we will return the first page as an image
        // In a full version, you might want to zip all pages
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(Buffer.from(outputImages[0])); 

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).send('Error converting PDF to JPG.');
    }
};

module.exports = { convertPdfToJpg };