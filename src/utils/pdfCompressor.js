import { PDFDocument } from 'pdf-lib';

/**
 * Compresses a PDF file by attempting to repack it.
 * This is a "safe" compression that just removes unused objects/metadata by copying pages to a new doc.
 * It's not as aggressive as ghostscript but runs fully in the browser.
 * 
 * @param {File} file - The original PDF File object
 * @returns {Promise<File>} - The compressed File object (or original if compression failed/increased size)
 */
export async function compressPDF(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        // Load as PDFDocument
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        // Create a new document to copy pages into
        const newPdfDoc = await PDFDocument.create();

        // Copy all pages
        const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => newPdfDoc.addPage(page));

        // Save with default settings (often removes junk)
        const compressedBytes = await newPdfDoc.save();

        // Convert back to File
        const originalSize = file.size;
        const newSize = compressedBytes.byteLength;

        if (newSize < originalSize) {
            console.log(`PDF Compressed: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024 / 1024).toFixed(2)}MB`);
            // Return new File with same name/type
            return new File([compressedBytes], file.name, { type: file.type, lastModified: Date.now() });
        } else {
            console.log("Compression did not reduce size significantly. Returning original.");
            return file;
        }
    } catch (error) {
        console.error("Error compressing PDF:", error);
        return file; // Fallback to original
    }
}
