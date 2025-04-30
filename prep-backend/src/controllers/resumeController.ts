import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs'
import * as path from 'path';
import multer from 'multer';
import { fileTypeFromBuffer } from 'file-type';
import { extractTextFromPdf } from '../utils/pdfUtils';

const storage = multer.memoryStorage();
const upload = multer({
        storage: storage, 
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 MB limit
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['application/pdf']; //TODO: Maybe support more file types in the future
            // const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
            }
        }
    }
)


export const uploadResume = async (req: Request, res: Response): Promise<void> => {
    try{
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const user = req.user
        if (!user || !user.id) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const fileBuffer = req.file.buffer;
        const fileTypeResult = await fileTypeFromBuffer(fileBuffer);
        const fileExtension = fileTypeResult?.ext || 
          path.extname(req.file.originalname).substring(1);
    
        // Create a unique filename
        const fileName = `${user.id}_${uuidv4()}.${fileExtension}`;
    
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('resumes')
          .upload(fileName, fileBuffer, {
            contentType: req.file.mimetype,
            upsert: true
          });
    
        if (uploadError) {
          console.error('Resume upload error:', uploadError);
          res.status(500).json({ error: 'Failed to upload resume', details: uploadError });
          return;
        }


        const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(fileName);

        let resumeText = null;
        if (req.file.mimetype === 'application/pdf') {
            try {
                resumeText = await extractTextFromPdf(fileBuffer);
            } catch (extractError) {
                console.error('Error extracting text from PDF:', extractError);
                // Continue even if text extraction fails
            }
        }

        // Set sharing permissions flag (default: private)
        const isPublic = req.body.isPublic === 'true';

            // Update the user's profile with the resume URL and text content
        const { data: profileData, error: profileError } = await supabase.from('profiles').update({
            resume_url: publicUrl,
            resume_text: resumeText,
            resume_is_public: isPublic,
            updated_at: new Date()
        }).eq('id', user.id);

        if (profileError) {
            console.error('Profile update error:', profileError);
            res.status(500).json({ error: 'Failed to update profile with resume information', details: profileError });
            return;
        }

        res.status(200).json({ 
            message: 'Resume uploaded successfully', 
            url: publicUrl,
            isPublic
        });
    
    }catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}