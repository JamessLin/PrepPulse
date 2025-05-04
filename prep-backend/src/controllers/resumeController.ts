import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs'
import * as path from 'path';
import multer from 'multer';
import FileType from 'file-type';
import { parseResumeFromPdf } from '../utils/pdfUtils';
import { profile } from 'console';

const storage = multer.memoryStorage();

export const upload = multer({
        storage: storage, 
        limits: {
            fileSize: 5 * 1024 * 1024, // 5 MB limit
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['application/pdf']; //FIXME: Only PDF file types for now
            // const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only PDF files are allowed.'));
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
      const fileTypeResult = await FileType.fromBuffer(fileBuffer);
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
              // Try to parse with the new function but fall back gracefully
              const parsedResume = await parseResumeFromPdf(fileBuffer);
              resumeText = parsedResume.rawText;
              // Store structured data separately for future use when DB schema is updated
              console.log('Successfully parsed resume structure:', {
                name: parsedResume.name,
                email: parsedResume.email,
                education: parsedResume.education.length,
                experience: parsedResume.experience.length,
                skills: parsedResume.skills.length
              });
          } catch (parseError) {
              console.error('Error parsing PDF resume:', parseError);
              // Continue even if parsing fails
          }
      }

      // Set sharing permissions flag (default: private)
      const isPublic = req.body.isPublic === 'true' || false;

      // Update the user's profile with the resume URL and text content
      // Note: Not storing structured_data until DB schema is updated
      const { data: profileData, error: profileError } = await supabase.from('profiles').update({
          resume_url: publicUrl,
          resume_text: resumeText,
          resume_is_public: isPublic,
          resume_filename: req.file.originalname,
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

export const getResume = async (req: Request, res: Response): Promise<void> => {
  try {
      const user = req.user;
      if (!user || !user.id) {
          res.status(401).json({ error: 'User not authenticated' });
          return;
      }
      const targetUserId = req.params.userId || user.id;


      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('resume_url, resume_text, resume_is_public, resume_filename, id, full_name')
        .eq('id', targetUserId)
        .single();

      if (profileError || !profileData) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      if (!profileData.resume_url) {
        res.status(404).json({ error: 'No resume found' });
        return;
      }

      const isOwnResume = targetUserId === user.id;
      if (!isOwnResume && !profileData.resume_is_public) {
          res.status(403).json({ error: 'This resume is private' });
          return;
      }

      res.status(200).json({
        resume_url: profileData.resume_url,
        resume_text: profileData.resume_text || null,
        is_public: profileData.resume_is_public,
        filename: profileData.resume_filename,
        user_id: profileData.id,
        full_name: profileData.full_name
      });

  } catch (error) {
      console.error('Get resume error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
}

export const deleteResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const {data: profileData, error: profileError} = await supabase
      .from('profiles')
      .select('resume_url')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    if (!profileData.resume_url) {
      res.status(404).json({ error: 'No resume found' });
      return;
    }

    const urlParts = profileData.resume_url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const folderPath = profileData.resume_url.includes('/public/') ? 'public/' : 'private/';
    const fullPath = folderPath + fileName;

    const { error: deleteError } = await supabase
      .storage
      .from('resumes')
      .remove([fullPath]);

    if (deleteError) {
      console.error('Resume delete error:', deleteError);
      res.status(500).json({ error: 'Failed to delete resume', details: deleteError });
      return;
    }


    const { error:updateError } = await supabase.from('profiles').update({
      resume_url: null,
      resume_text: null,
      resume_is_public: false,
      resume_filename: null,
      updated_at: new Date()
    }).eq('id', user.id);


    if (updateError) {
      console.error('Profile update error:', updateError);
      res.status(500).json({ error: 'Failed to update profile', details: updateError });
      return;
    }

    res.status(200).json({ message: 'Resume deleted successfully' });
  }catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export const getPeerResumes = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get all public resumes
    const { data: resumes, error: resumesError } = await supabase
      .from('profiles')
      .select('id, resume_url, resume_filename, full_name, title')
      .eq('resume_is_public', true)
      .not('resume_url', 'is', null);

    if (resumesError) {
      console.error('Error fetching peer resumes:', resumesError);
      res.status(500).json({ error: 'Failed to fetch peer resumes' });
      return;
    }

    res.status(200).json({ 
      resumes: resumes || [] 
    });
  } catch (error) {
    console.error('Get peer resumes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const togglePublicStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Get the current resume status
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('resume_is_public, resume_url')
      .eq('id', user.id)
      .single();

    if (profileError || !profileData) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    if (!profileData.resume_url) {
      res.status(400).json({ error: 'No resume found to update' });
      return;
    }

    const newPublicStatus = !profileData.resume_is_public;

    // Update resume status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        resume_is_public: newPublicStatus,
        updated_at: new Date()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      res.status(500).json({ error: 'Failed to update resume visibility' });
      return;
    }

    res.status(200).json({ 
      message: `Resume is now ${newPublicStatus ? 'public' : 'private'}`,
      isPublic: newPublicStatus
    });
  } catch (error) {
    console.error('Toggle public status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};