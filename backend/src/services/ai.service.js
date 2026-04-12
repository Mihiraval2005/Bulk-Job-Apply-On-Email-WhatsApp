import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

export const parseResume = async (filePath) => {
  const base64 = fs.readFileSync(filePath).toString('base64');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
        { type: 'text', text: `Extract resume info and return ONLY JSON, no extra text:
{
  "fullName": "", "email": "", "phone": "", "summary": "",
  "skills": [],
  "experience": [{ "company": "", "role": "", "duration": "", "highlights": [] }],
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "totalYearsExp": 0
}` },
      ],
    }],
  });

  const raw = response.content[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(raw);
};

export const generateBulkContent = async (jobs, resumeProfile, tone = 'formal') => {
  const toneGuide = {
    formal:     'Professional and formal. Use "Dear Hiring Manager".',
    semiformal: 'Friendly but professional.',
    casual:     'Conversational and warm. Keep concise.',
  };

  const results = await Promise.all(
    jobs.map(async (job) => {
      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Generate job application content. Return ONLY JSON, no extra text.

CANDIDATE: ${JSON.stringify(resumeProfile)}
COMPANY: ${job.companyName}
ROLE: ${job.jobTitle}
JD: ${job.jobDescription || 'Not provided'}
TONE: ${toneGuide[tone] || toneGuide.formal}

{
  "emailSubject": "Application for [Role] - [Name]",
  "emailBody": "HTML email body, max 300 words, highlight matching skills",
  "whatsappMessage": "Concise WA message max 100 words, include {{resumeLink}} placeholder"
}`,
          }],
        });

        const raw = response.content[0].text.replace(/```json|```/g, '').trim();
        return { jobId: job.jobId, success: true, ...JSON.parse(raw) };
      } catch (err) {
        logger.error(`AI gen failed for job ${job.jobId}`, { error: err.message });
        return { jobId: job.jobId, success: false, error: err.message };
      }
    })
  );

  return results;
};
