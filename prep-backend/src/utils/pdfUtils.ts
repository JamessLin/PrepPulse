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

export const extractTextFromPdf = async (buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', err => reject(err.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      const text = pdfData.Pages.map(page =>
        page.Texts.map(t => decodeURIComponent(t.R[0].T)).join(' ')
      ).join('\n');
      resolve(text);
    });

    pdfParser.parseBuffer(buffer);
  });
};

export const parseResumeFromPdf = async (buffer: Buffer): Promise<ResumeData> => {
  const rawText = await extractTextFromPdf(buffer);
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const resume: ResumeData = {
    name: null,
    email: null,
    phone: null,
    education: [],
    experience: [],
    skills: [],
    rawText
  };

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/;

  // === Extract email & phone ===
  for (const line of lines) {
    if (!resume.email && emailRegex.test(line)) resume.email = line.match(emailRegex)?.[0] || null;
    if (!resume.phone && phoneRegex.test(line)) resume.phone = line.match(phoneRegex)?.[0] || null;
  }

  // === Guess Name ===
  if (lines[0] && !emailRegex.test(lines[0])) {
    resume.name = lines[0];
  }

  // === Section Parsing ===
  const sectionMap: { [key: string]: string[] } = {
    education: [],
    experience: [],
    skills: []
  };

  let currentSection: keyof typeof sectionMap | null = null;
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('education')) {
      currentSection = 'education';
      continue;
    } else if (lower.includes('experience') || lower.includes('work history')) {
      currentSection = 'experience';
      continue;
    } else if (lower.includes('skills') || lower.includes('technologies')) {
      currentSection = 'skills';
      continue;
    } else if (/^[a-z]/i.test(line)) {
      if (currentSection) sectionMap[currentSection].push(line);
    }
  }

  // === Education Extraction ===
  for (let i = 0; i < sectionMap.education.length; i++) {
    const line = sectionMap.education[i];
    const yearsMatch = line.match(/\b\d{4}\b/g);
    const next = sectionMap.education[i + 1] || '';
    if (yearsMatch) {
      resume.education.push({
        institution: line,
        degree: next,
        years: yearsMatch.join(' - ')
      });
      i++; // skip next line
    }
  }

  // === Experience Extraction ===
  for (let i = 0; i < sectionMap.experience.length; i++) {
    const line = sectionMap.experience[i];
    const year = line.match(/\b\d{4}\b/g);
    const next = sectionMap.experience[i + 1] || '';
    const next2 = sectionMap.experience[i + 2] || '';
    if (year && next && next2) {
      resume.experience.push({
        company: line,
        role: next,
        years: year.join(' - '),
        description: next2
      });
      i += 2;
    }
  }

  // === Skills Extraction ===
  const skillsText = sectionMap.skills.join(', ');
  const skills = skillsText.split(/[,•\-–\n]/).map(s => s.trim()).filter(s => s.length > 1);
  resume.skills = [...new Set(skills)];

  return resume;
};
