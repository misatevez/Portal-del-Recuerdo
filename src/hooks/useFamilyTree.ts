import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface FamilyMember {
  id: string;
  nombre: string;
  imagen_principal: string | null;
  fecha_nacimiento: string;
  fecha_fallecimiento: string;
  tipo_relacion: string;
}

export function useFamilyTree(tributeId: string) {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, [tributeId]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('family_relationships')
        .select(`
          id,
          tipo,
          tribute_to:tributes!tribute_id_to(
            id,
            nombre,
            imagen_principal,
            fecha_nacimiento,
            fecha_fallecimiento
          )
        `)
        .eq('tribute_id_from', tributeId);

      if (error) throw error;

      const formattedMembers = data.map(relation => ({
        id: relation.tribute_to.id,
        nombre: relation.tribute_to.nombre,
        imagen_principal: relation.tribute_to.imagen_principal,
        fecha_nacimiento: relation.tribute_to.fecha_nacimiento,
        fecha_fallecimiento: relation.tribute_to.fecha_fallecimiento,
        tipo_relacion: relation.tipo,
      }));

      setMembers(formattedMembers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (memberId: string, tipo: string) => {
    try {
      const { error } = await supabase
        .from('family_relationships')
        .insert({
          tribute_id_from: tributeId,
          tribute_id_to: memberId,
          tipo,
        });

      if (error) throw error;
      await loadMembers();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('family_relationships')
        .delete()
        .eq('tribute_id_from', tributeId)
        .eq('tribute_id_to', memberId);

      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    members,
    loading,
    error,
    addMember,
    removeMember,
  };
}
