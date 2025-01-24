import { supabase } from '../lib/supabase';

interface CreatePreferenceResponse {
  id: string;
  init_point: string;
}

export async function createPaymentPreference(planId: string): Promise<CreatePreferenceResponse> {
  try {
    // Check if it's the static plan
    if (planId === 'static-plan') {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: 'static-plan',
          title: 'Test Plan',
          price: 5,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear preferencia de pago');
      }

      return await response.json();
    } else {
      const { data: plan, error: planError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          title: `Plan ${plan.nombre}`,
          price: plan.precio,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear preferencia de pago');
      }

      return await response.json();
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
