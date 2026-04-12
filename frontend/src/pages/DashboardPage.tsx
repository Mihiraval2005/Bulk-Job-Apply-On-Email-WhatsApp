import { useApplications, useAppStats, useRetryApplication } from '../hooks/index.ts';
import Layout from '../components/layout/Layout.tsx';
import { Badge, Spinner, StatTile, Button } from '../components/ui/index.tsx';

export default function DashboardPage() {
  const { data: apps, isLoading } = useApplications();
  const { data: stats } = useAppStats();
  const { mutate: retry, isPending: retrying } = useRetryApplication();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Track all your sent applications</p>
      </div>

      {/* Stats Tiles */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatTile label="Total"   value={stats.Total}   />
          <StatTile label="Sent"    value={stats.Sent}    color="text-green-600" />
          <StatTile label="Pending" value={stats.Pending} color="text-yellow-600" />
          <StatTile label="Failed"  value={stats.Failed}  color="text-red-600" />
        </div>
      )}

      {/* Applications Table */}
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
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {apps.map((app) => (
                <tr key={app.applicationId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{app.companyName}</td>
                  <td className="px-4 py-3 text-gray-600">{app.jobTitle}</td>
                  <td className="px-4 py-3">
                    <Badge label={app.channelLabel} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={app.statusLabel} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {app.sentAt
                      ? new Date(app.sentAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{app.retryCount}</td>
                  <td className="px-4 py-3">
                    {app.status === 2 && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={retrying}
                        onClick={() => retry(app.applicationId)}
                      >
                        Retry
                      </Button>
                    )}
                    {app.status === 2 && app.errorMsg && (
                      <p className="text-xs text-red-400 mt-1">{app.errorMsg}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
