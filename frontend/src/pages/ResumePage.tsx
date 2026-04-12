import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadResume, useParseResume } from '../hooks/index.ts';
import { useAuthStore } from '../store/auth.store.ts';
import Layout from '../components/layout/Layout.tsx';
import { Button, Card } from '../components/ui/index.tsx';
import type { ResumeProfile } from '../types';

export default function ResumePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<ResumeProfile | null>(null);

  const { mutate: upload, isPending: uploading } = useUploadResume();
  const { mutate: parse, isPending: parsing } = useParseResume();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    // Upload file first, then parse with AI
    upload(selectedFile, {
      onSuccess: () => {
        parse(selectedFile, {
          onSuccess: (data) => setProfile(data),
        });
      },
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Resume</h1>
          <p className="text-gray-500 mt-1">
            Upload once — AI will use this to personalise every application
          </p>
        </div>

        {/* Upload Card */}
        <Card className="mb-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFile}
            />
            <div className="text-4xl mb-3">📄</div>
            {selectedFile ? (
              <p className="text-blue-600 font-medium">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-gray-700 font-medium">Click to upload resume</p>
                <p className="text-gray-400 text-sm mt-1">PDF, DOC, DOCX — max 5MB</p>
              </>
            )}
          </div>

          {user?.resumeUrl && (
            <p className="text-sm text-green-600 mt-3 text-center">
              Current resume: {user.resumeUrl.split('/').pop()}
            </p>
          )}

          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleUpload}
              loading={uploading || parsing}
              disabled={!selectedFile}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : parsing ? 'AI Parsing...' : 'Upload & Parse'}
            </Button>
            {user?.resumeUrl && (
              <Button
                variant="secondary"
                onClick={() => navigate('/jobs')}
              >
                Skip → Jobs
              </Button>
            )}
          </div>
        </Card>

        {/* Parsed Profile Preview */}
        {profile && (
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">AI Parsed Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{profile.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Experience</span>
                <span className="font-medium">{profile.totalYearsExp} years</span>
              </div>
              <div>
                <span className="text-gray-500">Skills</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {profile.summary && (
                <div>
                  <span className="text-gray-500">Summary</span>
                  <p className="text-gray-700 mt-1">{profile.summary}</p>
                </div>
              )}
            </div>

            <Button onClick={() => navigate('/jobs')} className="w-full mt-6">
              Continue to Jobs →
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
}
