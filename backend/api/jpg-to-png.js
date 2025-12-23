const sharp = require('sharp');

const jpgToPng = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No image file uploaded.');
        }

        // Convert the buffer to PNG
        const outputBuffer = await sharp(req.file.buffer)
            .png()
            .toBuffer();

        // Send the converted file
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename=cori-converted.png');
        res.send(outputBuffer);

    } catch (error) {
        console.error('JPG to PNG Error:', error);
        res.status(500).send('Error converting image: ' + error.message);
    }
};

module.exports = { jpgToPng };