import React, { useState } from 'react';

interface AuditLogEntry {
  id: string;
  adminName: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  timestamp: string;
  ipAddress: string;
}

export const AdminAuditLogs: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>([
    {
      id: 'LOG-1001',
      adminName: 'Super Admin (JMZ)',
      action: 'UPDATE_INVENTORY',
      entity: 'Product',
      entityId: 'Samsung-S26U',
      description: 'Stock updated from 8 to 12 units after shipment inspection',
      timestamp: '2026-10-03 11:20:15',
      ipAddress: '192.168.1.104',
    },
    {
      id: 'LOG-1000',
      adminName: 'Super Admin (JMZ)',
      action: 'CONFIRM_BOOKING',
      entity: 'Booking',
      entityId: 'JMZ-BK-918234',
      description: 'Customer reservation confirmed for Hospital Road pickup',
      timestamp: '2026-10-03 10:45:00',
      ipAddress: '192.168.1.104',
    },
    {
      id: 'LOG-999',
      adminName: 'Showroom Manager',
      action: 'CREATE_OFFER',
      entity: 'Offer',
      entityId: 'FLASH-WEEKEND',
      description: 'Flash sale campaign created with 10% discount on sealed stock',
      timestamp: '2026-10-02 18:30:22',
      ipAddress: '192.168.1.112',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-primary uppercase tracking-widest">
            Security &amp; Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mt-1">
            System Audit &amp; Security Logs
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            Immutable tracking of administrative actions, stock revisions, price updates, and booking confirmations
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 shrink-0">
          Write-protected
        </span>
      </div>

      <div className="rounded-card border border-line bg-card shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface border-b border-line text-ink-3 uppercase text-[11px] tracking-wide font-semibold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-elevated transition-colors">
                  <td className="px-4 py-3 font-mono text-ink-3 text-xs">{log.timestamp}</td>
                  <td className="px-4 py-3 font-bold text-ink">{log.adminName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wide">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink-2 text-xs">
                    {log.entity} ({log.entityId})
                  </td>
                  <td className="px-4 py-3 text-ink-3 max-w-sm">{log.description}</td>
                  <td className="px-4 py-3 font-mono text-ink-3 text-xs text-right">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;