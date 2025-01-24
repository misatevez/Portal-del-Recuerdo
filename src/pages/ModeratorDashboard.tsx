import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Loader,
} from 'lucide-react';

interface Report {
  id: string;
  content_type: 'tribute' | 'comment' | 'user';
  content_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reporter: {
    nombre: string;
  };
  notes?: string;
}

export function ModeratorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [notes, setNotes] = useState('');
  const [filter, setFilter] = useState<Report['status']>('pending');

  useEffect(() => {
    async function checkModeratorStatus() {
      if (!user) {
        navigate('/login');
        return;
      }

      const { data } = await supabase
        .from('moderators')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!data) {
        navigate('/');
        return;
      }

      setIsModerator(true);
      loadReports();
    }

    checkModeratorStatus();
  }, [user, navigate]);

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reporter_id(nombre)
        `)
        .eq('status', filter)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error('Error al cargar reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: Report['status']) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          status: newStatus,
          notes: notes.trim() || null,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', reportId);

      if (error) throw error;
      
      setReports(prev =>
        prev.map(report =>
          report.id === reportId
            ? { ...report, status: newStatus, notes: notes.trim() || null }
            : report
        )
      );
      
      setSelectedReport(null);
      setNotes('');
    } catch (err) {
      console.error('Error al actualizar reporte:', err);
    }
  };

  if (!isModerator) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold flex items-center text-gray-900">
            <Shield className="w-6 h-6 mr-2" />
            Panel de Moderación
          </h1>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex gap-2">
            {(['pending', 'reviewed', 'resolved', 'dismissed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-md ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">No hay reportes {filter !== 'pending' && `${filter}s`}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reportado por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Razón
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="capitalize">{report.content_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.reporter.nombre}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate">{report.reason}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {report.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {report.status === 'reviewed' && <Eye className="w-3 h-3 mr-1" />}
                        {report.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {report.status === 'dismissed' && <XCircle className="w-3 h-3 mr-1" />}
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de Detalles */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Detalles del Reporte</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Tipo de Contenido</h3>
                  <p className="mt-1 text-gray-900 capitalize">{selectedReport.content_type}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Razón del Reporte</h3>
                  <p className="mt-1 text-gray-900">{selectedReport.reason}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">Notas de Moderación</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                    placeholder="Añade notas sobre la decisión tomada..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Descartar
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Marcar como Revisado
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Resolver
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
