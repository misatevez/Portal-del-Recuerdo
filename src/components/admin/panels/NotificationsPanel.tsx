import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader, Search, Filter, ChevronLeft, ChevronRight, Bell, Mail, Send } from 'lucide-react';

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showSendModal, setShowSendModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'sistema',
    recipients: 'all',
  });

  useEffect(() => {
    loadNotifications();
  }, [page, search, filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('notifications')
        .select(`
          *,
          profile:profiles(nombre)
        `, { count: 'exact' });

      if (search) {
        query = query.or(`
          mensaje.ilike.%${search}%,
          profiles.nombre.ilike.%${search}%
        `);
      }

      if (filter !== 'all') {
        query = query.eq('tipo', filter);
      }

      const { data, error, count } = await query
        .range(page * 10, (page + 1) * 10 - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.message) return;

      let userIds = [];
      if (newNotification.recipients === 'all') {
        const { data } = await supabase
          .from('profiles')
          .select('id');
        userIds = data?.map(u => u.id) || [];
      } else if (newNotification.recipients === 'premium') {
        const { data } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('estado', 'active');
        userIds = data?.map(s => s.user_id) || [];
      }

      const notifications = userIds.map(userId => ({
        user_id: userId,
        tipo: newNotification.type,
        mensaje: `${newNotification.title}\n\n${newNotification.message}`,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      setShowSendModal(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'sistema',
        recipients: 'all',
      });
      loadNotifications();
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif text-primary">Notificaciones</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />
            <input
              type="text"
              placeholder="Buscar notificaciones..."
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
            <option value="sistema">Sistema</option>
            <option value="vela">Velas</option>
            <option value="comentario">Comentarios</option>
          </select>
          <button
            onClick={() => setShowSendModal(true)}
            className="elegant-button px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar Notificación
          </button>
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
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text/60 uppercase tracking-wider">
                    Mensaje
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
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-primary/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">
                        {notification.profile?.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        notification.tipo === 'sistema'
                          ? 'bg-blue-100 text-blue-800'
                          : notification.tipo === 'vela'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {notification.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-text line-clamp-2">
                        {notification.mensaje}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        notification.leida
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notification.leida ? 'Leída' : 'No leída'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text/60">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-text/60">
              Mostrando {notifications.length} de {totalPages * 10} notificaciones
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

      {/* Modal de Enviar Notificación */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">Enviar Notificación</h2>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-text/60 hover:text-text"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Destinatarios
                </label>
                <select
                  value={newNotification.recipients}
                  onChange={(e) => setNewNotification({
                    ...newNotification,
                    recipients: e.target.value
                  })}
                  className="elegant-input w-full px-3 py-2 rounded-md"
                >
                  <option value="all">Todos los usuarios</option>
                  <option value="premium">Usuarios Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({
                    ...newNotification,
                    title: e.target.value
                  })}
                  className="elegant-input w-full px-3 py-2 rounded-md"
                  placeholder="Título de la notificación"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Mensaje
                </label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({
                    ...newNotification,
                    message: e.target.value
                  })}
                  className="elegant-input w-full px-3 py-2 rounded-md"
                  rows={4}
                  placeholder="Escribe el mensaje..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowSendModal(false)}
                  className="px-4 py-2 border border-primary/30 rounded-md text-text hover:bg-primary/10"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={!newNotification.title || !newNotification.message}
                  className="elegant-button px-4 py-2 rounded-md disabled:opacity-50"
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
