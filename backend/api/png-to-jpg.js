const sharp = require('sharp');

const pngToJpg = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No image file uploaded.');
        }

        // Convert the buffer to JPEG
        const outputBuffer = await sharp(req.file.buffer)
            .jpeg({ quality: 90 }) // High quality JPG
            .toBuffer();

        // Send the converted file
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Disposition', 'attachment; filename=cori-converted.jpg');
        res.send(outputBuffer);

    } catch (error) {
        console.error('PNG to JPG Error:', error);
        res.status(500).send('Error converting image: ' + error.message);
    }
};

module.exports = { pngToJpg };