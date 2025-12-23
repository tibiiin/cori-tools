const mammoth = require('mammoth');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const wordToPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No Word file uploaded.');
        }

        // 1. Extract raw text from the DOCX buffer
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        const text = result.value; // The raw text
        
        // 2. Create a new PDF
        const pdfDoc = await PDFDocument.create();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;
        const margin = 50;
        
        // 3. Add a page
        let page = pdfDoc.addPage();
        let { width, height } = page.getSize();
        let y = height - margin;

        // 4. Helper function to wrap text
        const textWidth = width - (margin * 2);
        const lines = text.split('\n');

        for (const line of lines) {
            // Basic text wrapping logic
            let currentLine = '';
            const words = line.split(' ');

            for (const word of words) {
                const testLine = currentLine + word + ' ';
                const textWidthCurrent = font.widthOfTextAtSize(testLine, fontSize);

                if (textWidthCurrent > textWidth) {
                    // Draw the current line and move down
                    page.drawText(currentLine, { x: margin, y: y, size: fontSize, font: font, color: rgb(0, 0, 0) });
                    y -= (fontSize + 4); // Line height
                    currentLine = word + ' ';
                    
                    // Add new page if we run out of space
                    if (y < margin) {
                        page = pdfDoc.addPage();
                        y = height - margin;
                    }
                } else {
                    currentLine = testLine;
                }
            }
            // Draw the last part of the line
            page.drawText(currentLine, { x: margin, y: y, size: fontSize, font: font, color: rgb(0, 0, 0) });
            y -= (fontSize + 8); // Extra space for new paragraph
            
            if (y < margin) {
                page = pdfDoc.addPage();
                y = height - margin;
            }
        }

        // 5. Save and send
        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cori-converted.pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Word to PDF Error:', error);
        res.status(500).send('Error converting Word to PDF: ' + error.message);
    }
};

module.exports = { wordToPdf };