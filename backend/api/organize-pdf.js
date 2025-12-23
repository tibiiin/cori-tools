const { PDFDocument, degrees } = require('pdf-lib');

const organizePdf = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No files uploaded.');
        }

        // 1. The main PDF is the first file
        const mainPdfBuffer = req.files.find(f => f.fieldname === 'mainPdf').buffer;
        
        // 2. "Insert" pages are any other files uploaded
        const insertFiles = req.files.filter(f => f.fieldname.startsWith('insert_'));

        // 3. Parse the organization instructions (sent as a JSON string)
        const instructions = JSON.parse(req.body.instructions); 
        // Example instruction structure:
        // [
        //   { type: 'original', pageIndex: 0, rotation: 90 },
        //   { type: 'original', pageIndex: 2, rotation: 0 },
        //   { type: 'insert', fileId: 'insert_0', pageIndex: 0, rotation: 0 }
        // ]

        // Load the main document
        const srcDoc = await PDFDocument.load(mainPdfBuffer);
        const newDoc = await PDFDocument.create();

        // Load all insert documents into a map for easy access
        const insertDocs = {};
        for (const file of insertFiles) {
            insertDocs[file.fieldname] = await PDFDocument.load(file.buffer);
        }

        // 4. Construct the new PDF based on instructions
        for (const step of instructions) {
            let sourcePage;
            
            if (step.type === 'original') {
                // Copy from original PDF
                const [copiedPage] = await newDoc.copyPages(srcDoc, [step.pageIndex]);
                sourcePage = copiedPage;
            } else if (step.type === 'insert') {
                // Copy from an uploaded insert file
                const sourceInsertDoc = insertDocs[step.fileId];
                if (sourceInsertDoc) {
                    const [copiedPage] = await newDoc.copyPages(sourceInsertDoc, [0]); // Assuming inserts are single pages for now
                    sourcePage = copiedPage;
                }
            }

            if (sourcePage) {
                // Apply rotation
                const currentRotation = sourcePage.getRotation().angle;
                sourcePage.setRotation(degrees(currentRotation + step.rotation));
                newDoc.addPage(sourcePage);
            }
        }

        const pdfBytes = await newDoc.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cori-organized.pdf');
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Organize PDF Error:', error);
        res.status(500).send('Error organizing PDF: ' + error.message);
    }
};

module.exports = { organizePdf };