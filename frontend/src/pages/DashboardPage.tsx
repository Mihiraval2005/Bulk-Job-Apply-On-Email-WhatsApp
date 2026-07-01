import { useState } from 'react';
import { useApplications, useAppStats, useRetryApplication } from '../hooks/index.ts';
import Layout from '../components/layout/Layout.tsx';
import { Badge, Spinner, StatTile, Button } from '../components/ui/index.tsx';

// Email preview modal
function EmailModal({ app, onClose }: { app: any; onClose: () => void }) {
  if (!app) return null;
  const body = app.emailBody || app.EmailBody || '';
  const subject = app.emailSubject || app.EmailSubject || '';
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h3 className="font-semibold text-gray-900">
              {app.companyName || app.CompanyName} — {app.jobTitle || app.JobTitle}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">Subject: {subject}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="px-6 py-4 text-sm text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body || '<p>No email content</p>' }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: apps, isLoading } = useApplications();
  const { data: stats } = useAppStats();
  const { mutate: retry, isPending: retrying } = useRetryApplication();
  const [previewApp, setPreviewApp] = useState<any>(null);

  return (
    <Layout>
      <EmailModal app={previewApp} onClose={() => setPreviewApp(null)} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Track all your sent applications</p>
      </div>

      {/* Stats Tiles */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatTile label="Total"   value={(stats as any).Total   ?? (stats as any).total   ?? 0} />
          <StatTile label="Sent"    value={(stats as any).Sent    ?? (stats as any).sent    ?? 0} color="text-green-600" />
          <StatTile label="Pending" value={(stats as any).Pending ?? (stats as any).pending ?? 0} color="text-yellow-600" />
          <StatTile label="Failed"  value={(stats as any).Failed  ?? (stats as any).failed  ?? 0} color="text-red-600" />
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <Spinner />
      ) : !apps?.length ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm mt-1">Go to Jobs page to send your first batch</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Company', 'Role', 'Channel', 'Status', 'Sent At', 'Retries', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(apps as any[]).map((app) => {
                const companyName  = app.companyName  || app.CompanyName  || '—';
                const jobTitle     = app.jobTitle     || app.JobTitle     || '—';
                const channelLabel = app.channelLabel || app.ChannelLabel || '—';
                const statusLabel  = app.statusLabel  || app.StatusLabel  || '—';
                const sentAt       = app.sentAt       || app.SentAt       || null;
                const retryCount   = app.retryCount   ?? app.RetryCount   ?? 0;
                const status       = app.status       ?? app.Status       ?? 0;
                const errorMsg     = app.errorMsg     || app.ErrorMsg     || null;
                const appId        = app.applicationId || app.ApplicationId || app.applicationid || app.ApplicationId || '';
                const rowKey       = appId || `${companyName}-${jobTitle}-${sentAt || 'no-date'}`;

                return (
                  <tr key={rowKey} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{companyName}</td>
                    <td className="px-4 py-3 text-gray-600">{jobTitle}</td>
                    <td className="px-4 py-3"><Badge label={channelLabel} /></td>
                    <td className="px-4 py-3"><Badge label={statusLabel} /></td>
                    <td className="px-4 py-3 text-gray-500">
                      {sentAt ? new Date(sentAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{retryCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* View Email */}
                        <button
                          onClick={() => setPreviewApp(app)}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View
                        </button>

                        {/* Retry — only for failed */}
                        {status === 2 && appId && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={retrying}
                            onClick={() => retry(appId)}
                          >
                            Retry
                          </Button>
                        )}
                        {status === 2 && !appId && (
                          <span className="text-xs text-red-500">Retry unavailable</span>
                        )}
                      </div>
                      {status === 2 && errorMsg && (
                        <p className="text-xs text-red-400 mt-1 max-w-xs truncate" title={errorMsg}>{errorMsg}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}