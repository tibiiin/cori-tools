const pdfParse = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun } = require('docx');

const convertPdfToWord = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No PDF file uploaded.');
        }

        // 1. Extract text from the PDF buffer
        const data = await pdfParse(req.file.buffer);
        const text = data.text;

        // 2. Split text by newlines to create paragraphs (basic formatting)
        // This prevents the whole document from being one giant block of text
        const lines = text.split(/\n/);
        const docChildren = lines.map(line => {
            return new Paragraph({
                children: [new TextRun(line)],
                spacing: { after: 200 } // Add a little space between lines
            });
        });

        // 3. Create the Word Document structure
        const doc = new Document({
            sections: [{
                properties: {},
                children: docChildren,
            }],
        });

        // 4. Generate the DOCX file buffer
        const buffer = await Packer.toBuffer(doc);

        // 5. Send the file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename=cori-converted.docx');
        res.send(buffer);

    } catch (error) {
        console.error('PDF to Word Error:', error);
        res.status(500).send('Error converting PDF to Word: ' + error.message);
    }
};

module.exports = { convertPdfToWord };