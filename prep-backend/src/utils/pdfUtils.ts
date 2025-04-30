import pdf from 'pdf-parse';

/**
 * Extract text content from a PDF buffer
 * 
 * @param buffer PDF file as buffer
 * @returns Extracted text content
 */
export const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};