import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader, Search, Filter, ChevronLeft, ChevronRight, Package, Calendar } from 'lucide-react';

export function SubscriptionsPanel() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadSubscriptions();
  }, [page, search, filter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('subscriptions')
        .select(`
          *,
          profile:profiles(nombre),
          plan:subscription_plans(nombre, precio)
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

      setSubscriptions(data || []);
      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (err) {
      console.error('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (subscriptionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ estado: newStatus })
        .eq('id', subscriptionId);

      if (error) throw error;
      loadSubscriptions();
    } catch (err) {
      console.error('Error updating subscription:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-primary">Suscripciones</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
            <input
              type="text"
              placeholder="Buscar suscriptor..."
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
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="cancelled">Canceladas</option>
            <option value="expired">Expiradas</option>
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
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Fecha Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Fecha Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-primary/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text">
                        {subscription.profile?.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">
                        {subscription.plan?.nombre}
                      </div>
                      <div className="text-xs text-text/60">
                        ${subscription.plan?.precio}/mes
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subscription.estado === 'active'
                          ? 'bg-green-100 text-green-800'
                          : subscription.estado === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subscription.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60">
                      {new Date(subscription.fecha_inicio).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60">
                      {new Date(subscription.fecha_fin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={subscription.estado}
                        onChange={(e) => handleStatusChange(subscription.id, e.target.value)}
                        className="elegant-input px-2 py-1 text-sm rounded"
                      >
                        <option value="active">Activa</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="expired">Expirada</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-text/60">
              Mostrando {subscriptions.length} de {totalPages * 10} suscripciones
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
