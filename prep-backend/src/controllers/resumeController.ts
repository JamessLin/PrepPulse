import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs'
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
    }catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}