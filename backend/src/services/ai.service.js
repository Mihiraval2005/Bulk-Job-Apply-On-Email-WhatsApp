import Groq from 'groq-sdk';
import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import env from '../config/env.js';
import logger from '../utils/logger.js';

const client = new Groq({ apiKey: env.GROQ_API_KEY });

const extractPdfText = async (filePath) => {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  let text = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }
  return text.trim().substring(0, 3000);
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
        const response = await client.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1000,
          messages: [
            {
              role: 'system',
              content: 'You are a job application writer. Always respond with valid JSON only. No explanation, no markdown.',
            },
            {
              role: 'user',
              content: `Generate job application content. Return ONLY this JSON:
{
  "emailSubject": "Application for [Role] - [Name]",
  "emailBody": "HTML email body, max 300 words, highlight matching skills",
  "whatsappMessage": "Concise WA message max 100 words, include {{resumeLink}} placeholder"
}

CANDIDATE: ${JSON.stringify(resumeProfile)}
COMPANY: ${job.companyName}
ROLE: ${job.jobTitle}
JD: ${job.jobDescription || 'Not provided'}
TONE: ${toneGuide[tone] || toneGuide.formal}`,
            },
          ],
        });

        const raw = response.choices[0].message.content.replace(/```json|```/g, '').trim();
        return { jobId: job.jobId, success: true, ...JSON.parse(raw) };
      } catch (err) {
        logger.error(`AI gen failed for job ${job.jobId}`, { error: err.message });
        return { jobId: job.jobId, success: false, error: err.message };
      }
    })
  );

  return results;
};
export const parseResume = async (filePath) => {
  const resumeText = await extractPdfText(filePath);
  console.log('=== PDF TEXT ===', resumeText.substring(0, 200));

  if (!resumeText) throw new Error('Could not extract text from PDF');

  const response = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    max_tokens: 1500,
    messages: [
      {
        role: 'system',
        content: 'You are a resume parser. Always respond with valid JSON only. No explanation, no markdown.',
      },
      {
        role: 'user',
        content: `Parse this resume and return ONLY this JSON:
{
  "fullName": "",
  "email": "",
  "phone": "",
  "summary": "",
  "skills": [],
  "experience": [{ "company": "", "role": "", "duration": "", "highlights": [] }],
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "totalYearsExp": 0
}

RESUME:
${resumeText}`,
      },
    ],
  });

  const raw = response.choices[0].message.content.replace(/```json|```/g, '').trim();
  console.log('=== GROQ RESPONSE ===', raw.substring(0, 300));
  return JSON.parse(raw);
};