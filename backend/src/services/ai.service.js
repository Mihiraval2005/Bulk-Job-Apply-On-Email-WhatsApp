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
    formal: 'Professional and formal, but still sounds like a real person typed it. Use "Dear Hiring Manager" or "Hi [Company] Team" if no name is known.',
    semiformal: 'Friendly but professional. Contractions are fine (I\'m, I\'ve, I\'d).',
    casual: 'Conversational and warm, like messaging a recruiter you already have some rapport with. Keep it concise.',
  };

  const results = await Promise.all(
    jobs.map(async (job) => {
      try {
        const response = await client.chat.completions.create({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1000,
          temperature: 1.0,
          top_p: 0.95,
          messages: [
            {
              role: 'system',
              content: 'You are a real candidate writing your own job application emails. You write the way an actual person writes when they care about a job but are not trying to sound impressive — clear, a little informal, specific. You always respond with valid JSON only. No explanation, no markdown, no code fences.',
            },
            {
              role: 'user',
              content: `Write a job application email and WhatsApp message AS THE CANDIDATE below. Return ONLY this JSON shape:
{
  "emailSubject": "Application for [Role] - [Name]",
  "emailBody": "HTML email body",
  "whatsappMessage": "Short WA message with {{resumeLink}} placeholder"
}

CANDIDATE PROFILE: ${JSON.stringify(resumeProfile)}
COMPANY: ${job.companyName}
ROLE: ${job.jobTitle}
JOB DESCRIPTION: ${job.jobDescription || 'Not provided'}
TONE: ${toneGuide[tone] || toneGuide.formal}

WRITE LIKE A HUMAN, NOT AN AI. Follow these rules strictly:

1. NEVER use these phrases or anything close to them (huge red flags for AI writing):
   - "I am writing to express my interest"
   - "I am excited to apply"
   - "I believe my skills align perfectly"
   - "I am confident that I would be a valuable asset"
   - "passionate about"
   - "leverage my experience/skills"
   - "blank slate" / "unexplored strengths" / "formal education has provided the foundation"
   - "I would welcome the opportunity"
   - "dynamic team" / "fast-paced environment" (unless the JD itself uses this language)

2. Open with something specific, not generic. E.g. reference one real detail from the job description or company instead of "I came across your job posting."

3. Sentence rhythm should be uneven, like real typing — mix short and medium sentences. Occasionally starting a sentence with "And" or "But" is fine. Avoid the classic AI 3-paragraph symmetric structure (intro / skills / closing) — let it flow more naturally.

4. Mention only ONE or TWO real things from the candidate's profile (a specific project, number, or skill) — don't list everything. Specificity beats completeness.

5. If the job description has any specific requirement, tool, or responsibility, mention it by name to show this isn't a copy-paste email.

6. End simply — no flowery closing. Something like "Happy to share more if useful" or "Let me know if you'd like to chat" works better than "I look forward to the opportunity to discuss further."

7. emailBody should be HTML but minimal — just <p> tags, no excessive formatting, max 220 words.

8. whatsappMessage: max 70 words, sounds like an actual WhatsApp text (no "Dear", no formal sign-off), includes {{resumeLink}}.

Return valid JSON only, nothing else.
`,
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
  logger.info('PDF text extracted', { preview: resumeText.substring(0, 200) });

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
        content: `Parse the following resume text and return valid JSON only.

Resume Text:
${resumeText}

Return JSON with these fields:
{
  "fullName": "",
  "email": "",
  "phone": "",
  "location": "",
  "summary": "",
  "skills": [""],
  "experience": [{ "role": "", "company": "", "duration": "", "description": "" }],
  "totalYearsExp": "",
  "education": "",
  "resumeUrl": ""
}

If any field is missing from the resume, return an empty string or empty array for that field.
`,
      },
    ],
  });

  const raw = response.choices[0].message.content.replace(/```json|```/g, '').trim();
  logger.info('Groq parse response', { preview: raw.substring(0, 300) });
  return JSON.parse(raw);
};