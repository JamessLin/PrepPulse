import PDFParser from 'pdf2json';

interface ResumeData {
  name: string | null;
  email: string | null;
  phone: string | null;
  education: Array<{ institution: string; degree: string; years: string }>;
  experience: Array<{ company: string; role: string; years: string; description: string }>;
  skills: string[];
  rawText: string;
}

// Simple function to extract text from PDF
export const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(new Error(`Failed to parse PDF: ${errData.parserError}`));
    });

    pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
      try {
        let text = '';
        if (pdfData && pdfData.formImage && pdfData.formImage.Pages) {
          const pages = pdfData.formImage.Pages;
          for (const page of pages) {
            if (page.Texts) {
              for (const textObj of page.Texts) {
                if (textObj.R && textObj.R[0] && textObj.R[0].T) {
                  const decodedText = decodeURIComponent(textObj.R[0].T);
                  text += decodedText + ' ';
                }
              }
            }
            text += '\n';
          }
        }
        resolve(text.trim());
      } catch (error: any) {
        reject(new Error(`Failed to extract text from PDF: ${error.message}`));
      }
    });

    pdfParser.parseBuffer(buffer);
  });
};

// Advanced function to parse resume from PDF
export const parseResumeFromPdf = async (buffer: Buffer): Promise<ResumeData> => {
  try {
    // First, extract the text safely
    const rawText = await extractTextFromPdf(buffer);
    
    // Initialize resume data with default values
    const resumeData: ResumeData = {
      name: null,
      email: null,
      phone: null,
      education: [],
      experience: [],
      skills: [],
      rawText
    };

    // Parse the raw text to extract structured data
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length > 0) {
      resumeData.name = lines[0] || null;
    }

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/;
    
    for (const line of lines) {
      if (!resumeData.email && emailRegex.test(line)) {
        resumeData.email = line.match(emailRegex)![0];
      }
      if (!resumeData.phone && phoneRegex.test(line)) {
        resumeData.phone = line.match(phoneRegex)![0];
      }
    }

    // Parse sections (Education, Experience, Skills) using keywords and heuristics
    let currentSection: 'education' | 'experience' | 'skills' | null = null;
    let currentEntry: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();

      // Detect section headers
      if (line.includes('education')) {
        currentSection = 'education';
        continue;
      } else if (line.includes('experience') || line.includes('work history')) {
        currentSection = 'experience';
        currentEntry = null;
        continue;
      } else if (line.includes('skills') || line.includes('technologies')) {
        currentSection = 'skills';
        continue;
      }

      // Parse section content
      if (currentSection === 'education') {
        if (/^(january|february|march|april|may|june|july|august|september|october|november|december|\d{4})/i.test(line)) {
          if (currentEntry) {
            resumeData.education.push(currentEntry);
          }
          currentEntry = { institution: i > 0 ? lines[i - 1] || '' : '', degree: '', years: line };
        } else if (currentEntry) {
          currentEntry.degree = line;
        }
      } else if (currentSection === 'experience') {
        if (/^(january|february|march|april|may|june|july|august|september|october|november|december|\d{4})/i.test(line)) {
          if (currentEntry) {
            resumeData.experience.push(currentEntry);
          }
          currentEntry = { company: i > 0 ? lines[i - 1] || '' : '', role: '', years: line, description: '' };
        } else if (currentEntry && !currentEntry.role) {
          currentEntry.role = line;
        } else if (currentEntry) {
          currentEntry.description += line + ' ';
        }
      } else if (currentSection === 'skills') {
        // Try to handle both comma-separated and line-by-line skill lists
        if (line.includes(',')) {
          const skillList = line.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
          resumeData.skills.push(...skillList);
        } else {
          resumeData.skills.push(line);
        }
      }
    }

    // Push the last entry if it exists
    if (currentSection === 'education' && currentEntry) {
      resumeData.education.push(currentEntry);
    } else if (currentSection === 'experience' && currentEntry) {
      resumeData.experience.push(currentEntry);
    }

    return resumeData;
  } catch (error) {
    // If any error occurs during parsing, return a basic ResumeData with just the raw text
    console.error("Error in parseResumeFromPdf:", error);
    
    // Try to extract just the raw text as a fallback
    let rawText = "";
    try {
      rawText = await extractTextFromPdf(buffer);
    } catch (textError) {
      console.error("Failed even to extract raw text:", textError);
    }
    
    return {
      name: null,
      email: null,
      phone: null,
      education: [],
      experience: [],
      skills: [],
      rawText
    };
  }
};