import React, { useState } from 'react';
import { 
  Users, Settings, BarChart2, Package, Shield, 
  CreditCard, Bell, Image, Music, Heart, Loader,
  AlertTriangle, CheckCircle, Calendar, Search,
  Star
} from 'lucide-react';
import { UsersPanel } from './panels/UsersPanel';
import { TributesPanel } from './panels/TributesPanel';
import { SubscriptionsPanel } from './panels/SubscriptionsPanel';
import { PaymentsPanel } from './panels/PaymentsPanel';
import { ModerationPanel } from './panels/ModerationPanel';
import { NotificationsPanel } from './panels/NotificationsPanel';
import { MediaPanel } from './panels/MediaPanel';
import { MusicPanel } from './panels/MusicPanel';
import { SettingsPanel } from './panels/SettingsPanel';

type PanelType = 'overview' | 'users' | 'tributes' | 'subscriptions' | 'payments' | 'moderation' | 'notifications' | 'media' | 'music' | 'settings';

export function AdminDashboard() {
  const [activePanel, setActivePanel] = useState<PanelType>('overview');

  const getIcon = (type: string) => {
    switch (type) {
      case 'overview': return <BarChart2 className="w-5 h-5" />;
      case 'users': return <Users className="w-5 h-5" />;
      case 'tributes': return <Heart className="w-5 h-5" />;
      case 'subscriptions': return <Package className="w-5 h-5" />;
      case 'payments': return <CreditCard className="w-5 h-5" />;
      case 'moderation': return <Shield className="w-5 h-5" />;
      case 'notifications': return <Bell className="w-5 h-5" />;
      case 'media': return <Image className="w-5 h-5" />;
      case 'music': return <Music className="w-5 h-5" />;
      case 'settings': return <Settings className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'users': return <UsersPanel />;
      case 'tributes': return <TributesPanel />;
      case 'subscriptions': return <SubscriptionsPanel />;
      case 'payments': return <PaymentsPanel />;
      case 'moderation': return <ModerationPanel />;
      case 'notifications': return <NotificationsPanel />;
      case 'media': return <MediaPanel />;
      case 'music': return <MusicPanel />;
      case 'settings': return <SettingsPanel />;
      default: return <OverviewPanel getIcon={getIcon} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="elegant-card rounded-lg p-4 sticky top-24">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Vista General' },
                  { id: 'users', label: 'Usuarios' },
                  { id: 'tributes', label: 'Homenajes' },
                  { id: 'subscriptions', label: 'Suscripciones' },
                  { id: 'payments', label: 'Pagos' },
                  { id: 'moderation', label: 'Moderación' },
                  { id: 'notifications', label: 'Notificaciones' },
                  { id: 'media', label: 'Multimedia' },
                  { id: 'music', label: 'Música' },
                  { id: 'settings', label: 'Configuración' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActivePanel(item.id as PanelType)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm
                      ${activePanel === item.id
                        ? 'bg-primary text-surface'
                        : 'text-text hover:bg-primary/10'
                      }
                    `}
                  >
                    {getIcon(item.id)}
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 py-8">
            {renderPanel()}
          </div>
        </div>
      </div>
    </div>
  );
}

interface OverviewPanelProps {
  getIcon: (type: string) => React.ReactNode;
}

function OverviewPanel({ getIcon }: OverviewPanelProps) {
  const stats = [
    { label: 'Usuarios Totales', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { label: 'Homenajes', value: '567', icon: Heart, color: 'bg-red-500' },
    { label: 'Suscripciones Activas', value: '89', icon: Package, color: 'bg-green-500' },
    { label: 'Reportes Pendientes', value: '12', icon: AlertTriangle, color: 'bg-yellow-500' },
  ];

  const recentEvents = [
    { type: 'user', text: 'Nuevo usuario registrado', time: '5 minutos' },
    { type: 'tribute', text: 'Nuevo homenaje creado', time: '15 minutos' },
    { type: 'subscription', text: 'Nueva suscripción premium', time: '1 hora' },
    { type: 'report', text: 'Nuevo reporte de contenido', time: '2 horas' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="elegant-card p-6 rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color} text-opacity-80`} />
              </div>
              <div>
                <p className="text-sm text-text/60">{stat.label}</p>
                <p className="text-2xl font-semibold text-text">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="elegant-card rounded-lg p-6">
        <h3 className="text-lg font-medium text-primary mb-6">Actividad Reciente</h3>
        <div className="space-y-4">
          {recentEvents.map((event, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                {getIcon(event.type)}
              </div>
              <div className="flex-1">
                <p className="text-text">{event.text}</p>
                <p className="text-sm text-text/60">Hace {event.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
