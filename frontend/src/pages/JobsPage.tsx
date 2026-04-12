import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBulkInsertJobs, useGenerateContent, useBulkApply } from '../hooks/index.ts';
import { useAuthStore } from '../store/auth.store.ts';
import Layout from '../components/layout/Layout.tsx';
import { Button, Select, Card } from '../components/ui/index.tsx';
import type { JobFormRow, ResumeProfile, GeneratedContent } from '../types';

const CHANNEL_OPTIONS = [
  { value: 1, label: 'Email' },
  { value: 2, label: 'WhatsApp' },
  { value: 3, label: 'Both' },
];

const TONE_OPTIONS = [
  { value: 'formal',     label: 'Formal' },
  { value: 'semiformal', label: 'Semi-formal' },
  { value: 'casual',     label: 'Casual' },
];

const emptyRow = (): JobFormRow => ({
  companyName: '', jobTitle: '', jobDescription: '',
  contactEmail: '', contactPhone: '', channel: 1,
});

export default function JobsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState<JobFormRow[]>([emptyRow()]);
  const [tone, setTone] = useState('formal');
  const [generated, setGenerated] = useState<GeneratedContent[]>([]);
  const [step, setStep] = useState<'input' | 'review'>('input');

  const { mutate: insertJobs, isPending: inserting } = useBulkInsertJobs();
  const { mutate: generateContent, isPending: generating } = useGenerateContent();
  const { mutate: bulkApply, isPending: sending } = useBulkApply();

  const updateRow = (i: number, field: keyof JobFormRow, value: string | number) => {
    setRows((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleGenerate = () => {
    const validRows = rows.filter((r) => r.companyName && r.jobTitle);
    if (!validRows.length) return alert('Fill at least one company and job title');

    // First save jobs to DB
    insertJobs(validRows, {
      onSuccess: (savedJobs) => {
        // Get profile from localStorage (saved after resume parse)
        const profileRaw = localStorage.getItem('resumeProfile');
        const resumeProfile: ResumeProfile = profileRaw
          ? JSON.parse(profileRaw)
          : { fullName: user?.fullName || '', skills: [], experience: [], education: [], totalYearsExp: 0, email: '', phone: '', summary: '' };

        // Generate AI content
        generateContent(
          { jobs: savedJobs, resumeProfile, tone },
          {
            onSuccess: (results) => {
              setGenerated(results);
              setStep('review');
            },
          }
        );
      },
    });
  };

  const handleSendAll = () => {
    const validRows = rows.filter((r) => r.companyName);
    const applications = generated
      .filter((g) => g.success)
      .map((g, i) => ({
        jobId: g.jobId,
        channel: validRows[i]?.channel || 1,
        contactEmail: validRows[i]?.contactEmail,
        contactPhone: validRows[i]?.contactPhone,
        emailSubject: g.emailSubject,
        emailBody: g.emailBody,
        whatsAppMsg: g.whatsappMessage,
        resumePath: user?.resumeUrl,
      }));

    bulkApply(applications, {
      onSuccess: () => navigate('/dashboard'),
    });
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-500 mt-1">Add companies and generate applications in one click</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            options={TONE_OPTIONS}
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          />
          {step === 'input' ? (
            <Button onClick={handleGenerate} loading={inserting || generating}>
              {generating ? 'AI Generating...' : 'Generate Applications'}
            </Button>
          ) : (
            <Button onClick={handleSendAll} loading={sending}>
              {sending ? 'Sending...' : `Send All (${generated.filter(g => g.success).length})`}
            </Button>
          )}
        </div>
      </div>

      {/* Job Input Table */}
      {step === 'input' && (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Company', 'Role', 'Job Description', 'Email', 'Phone', 'Channel', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-2 py-2">
                    <input
                      className="w-36 border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="Google"
                      value={row.companyName}
                      onChange={(e) => updateRow(i, 'companyName', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className="w-36 border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="Frontend Dev"
                      value={row.jobTitle}
                      onChange={(e) => updateRow(i, 'jobTitle', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <textarea
                      className="w-48 border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Paste JD here..."
                      rows={2}
                      value={row.jobDescription}
                      onChange={(e) => updateRow(i, 'jobDescription', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className="w-40 border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="hr@company.com"
                      value={row.contactEmail}
                      onChange={(e) => updateRow(i, 'contactEmail', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      className="w-32 border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="+91 9999999999"
                      value={row.contactPhone}
                      onChange={(e) => updateRow(i, 'contactPhone', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      className="border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      value={row.channel}
                      onChange={(e) => updateRow(i, 'channel', Number(e.target.value))}
                    >
                      {CHANNEL_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => removeRow(i)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-100">
            <Button variant="ghost" size="sm" onClick={addRow}>
              + Add Row
            </Button>
          </div>
        </Card>
      )}

      {/* Generated Content Review */}
      {step === 'review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">
              Review AI-generated content before sending
            </p>
            <Button variant="ghost" size="sm" onClick={() => setStep('input')}>
              ← Back to Edit
            </Button>
          </div>
          {generated.map((g, i) => (
            <Card key={g.jobId}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{rows[i]?.companyName}</h3>
                  <p className="text-sm text-gray-500">{rows[i]?.jobTitle}</p>
                </div>
                {g.success ? (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Ready</span>
                ) : (
                  <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">Failed</span>
                )}
              </div>
              {g.success ? (
                <div className="space-y-3 text-sm">
                  {g.emailSubject && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Email Subject</p>
                      <p className="text-gray-800 font-medium">{g.emailSubject}</p>
                    </div>
                  )}
                  {g.whatsappMessage && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">WhatsApp Message</p>
                      <p className="text-gray-700 bg-gray-50 rounded p-2">{g.whatsappMessage}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-red-500">{g.error}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
