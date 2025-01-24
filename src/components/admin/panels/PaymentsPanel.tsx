import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader, Search, Filter, ChevronLeft, ChevronRight, CreditCard, Calendar, CheckCircle, XCircle } from 'lucide-react';

export function PaymentsPanel() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPayments();
  }, [page, search, filter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payments')
        .select(`
          *,
          profile:profiles(nombre),
          subscription:subscriptions(
            plan:subscription_plans(nombre)
          )
        `, { count: 'exact' });

      if (search) {
        query = query.ilike('profiles.nombre', `%${search}%`);
      }

      if (filter !== 'all') {
        query = query.eq('estado', filter);
      }

      const { data, error, count } = await query
        .range(page * 10, (page + 1) * 10 - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (err) {
      console.error('Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-primary">Pagos</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
            <input
              type="text"
              placeholder="Buscar pagos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="elegant-input pl-10 pr-4 py-2 rounded-lg"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="elegant-input px-4 py-2 rounded-lg"
          >
            <option value="all">Todos</option>
            <option value="completed">Completados</option>
            <option value="pending">Pendientes</option>
            <option value="failed">Fallidos</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
          <div className="elegant-card rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    ID Transacción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-primary/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-text">
                        {payment.transaction_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">
                        {payment.profile?.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">
                        {payment.subscription?.plan?.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">
                        ${payment.monto.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.estado === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : payment.estado === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.estado === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
                        {payment.estado === 'failed' && <XCircle className="w-4 h-4 mr-1" />}
                        {payment.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-text/60">
              Mostrando {payments.length} de {totalPages * 10} pagos
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 elegant-button rounded-lg disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="p-2 elegant-button rounded-lg disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
