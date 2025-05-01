import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

interface AuthRequest extends Request {
  user?: { id: string };
}

interface Profile {
  resume_text: string | null;
  resume_is_public: boolean;
  full_name: string | null;
}

interface Question {
  type: 'Behavioral' | 'Leadership' | 'Technical';
  question: string;
}

/**
 * Generates mock interview questions for a resume (to be replaced with AI in Task 5.3).
 * @param req - Request with resumeId param
 * @param res - Response with questions array
 */
export const generateInterviewQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { resumeId } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('resume_text, resume_is_public, full_name')
      .eq('id', resumeId)
      .single();

    if (profileError || !profileData) {
      res.status(404).json({ error: 'Resume not found' });
      return;
    }

    const isOwnResume = resumeId === userId;
    if (!isOwnResume && !profileData.resume_is_public) {
      res.status(403).json({ error: 'This resume is private' });
      return;
    }

    // Mock questions (to be replaced with AI in Task 5.3)
    const categories = [
      {
        type: 'Behavioral' as const,
        questions: [
          'Tell me about a time when you faced a challenging situation at work and how you handled it.',
          'Describe a project where you had to work with a difficult team member.',
          'Give an example of when you had to meet a tight deadline.',
          'Tell me about a time when you had to learn a new skill quickly.',
          'Describe a situation where you had to make a decision without all the information you needed.',
        ],
      },
      {
        type: 'Leadership' as const,
        questions: [
          'Tell me about a time when you led a team through a difficult situation.',
          'Describe your leadership style with examples.',
          'How do you motivate team members who are struggling?',
          'Tell me about a time when you had to delegate important tasks.',
          'Describe a situation where you had to provide constructive feedback to a team member.',
        ],
      },
      {
        type: 'Technical' as const,
        questions: [
          'How do you approach learning new technologies?',
          'Describe a complex technical problem you solved recently.',
          'How do you ensure your code is maintainable and scalable?',
          'Tell me about a time when you had to optimize performance in a project.',
          'How do you stay updated with the latest developments in your field?',
        ],
      },
    ];

    const selectedQuestions: Question[] = categories.map((category) => {
      const randomIndex = Math.floor(Math.random() * category.questions.length);
      return {
        type: category.type,
        question: category.questions[randomIndex],
      };
    });

    res.status(200).json({
      questions: selectedQuestions,
      resumeId,
      userName: profileData.full_name,
    });
  } catch (error: any) {
    console.error('Generate interview questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};