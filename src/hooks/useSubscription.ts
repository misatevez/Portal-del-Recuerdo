import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/auth/AuthProvider';

interface Subscription {
  id: string;
  plan_id: string;
  estado: 'active' | 'cancelled' | 'expired';
  fecha_inicio: string;
  fecha_fin: string;
  plan: {
    nombre: string;
    caracteristicas: string[];
  };
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    async function loadSubscription() {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            plan:subscription_plans(
              nombre,
              caracteristicas
            )
          `)
          .eq('user_id', user.id)
          .eq('estado', 'active')
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setSubscription(data);
      } catch (err) {
        console.error('Error al cargar suscripción:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [user]);

  const hasFeature = (feature: string): boolean => {
    if (!subscription) return false;
    return subscription.plan.caracteristicas.includes(feature);
  };

  const isPremium = (): boolean => {
    return !!subscription && subscription.estado === 'active';
  };

  return {
    subscription,
    loading,
    hasFeature,
    isPremium,
  };
}
