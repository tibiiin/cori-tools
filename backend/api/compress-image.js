const sharp = require('sharp');

const compressImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No image file uploaded.');
        }

        // Get quality from request body (default to 80 if not provided)
        // Convert string to integer
        const quality = parseInt(req.body.quality) || 80;

        let pipeline = sharp(req.file.buffer);
        const metadata = await pipeline.metadata();

        // Apply compression based on image format
        if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
            pipeline = pipeline.jpeg({ quality: quality });
        } else if (metadata.format === 'png') {
            // PNG compression (quality requires specific settings in sharp)
            pipeline = pipeline.png({ 
                quality: quality, 
                compressionLevel: 9, 
                palette: true 
            });
        } else if (metadata.format === 'webp') {
            pipeline = pipeline.webp({ quality: quality });
        }

        const outputBuffer = await pipeline.toBuffer();

        // Send the compressed image
        // We set a custom header so the frontend can read the new size easily if needed,
        // though standard Content-Length also works.
        res.setHeader('Content-Type', `image/${metadata.format}`);
        res.setHeader('Content-Disposition', `attachment; filename=cori-compressed.${metadata.format}`);
        res.send(outputBuffer);

    } catch (error) {
        console.error('Compression Error:', error);
        res.status(500).send('Error compressing image: ' + error.message);
    }
};

module.exports = { compressImage };