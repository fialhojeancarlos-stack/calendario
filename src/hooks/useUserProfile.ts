import { useState, useEffect } from 'react';
import { UserProfileRecord, SystemScopeCode } from '../types';
import { fetchUsersList } from '../services/apiService';

export function useUserProfile(userEmail: string | null) {
  const [userProfile, setUserProfile] = useState<UserProfileRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserProfile = async () => {
    if (!userEmail) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cleanEmail = userEmail.toLowerCase().trim();

      // Get stored user ID from localStorage if available
      const storedUserId = localStorage.getItem('supabase_user_id') || localStorage.getItem('user_id');

      // 1. Sync & fetch profile from backend
      try {
        const syncRes = await fetch('/api/users/sync-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: storedUserId || undefined,
            email: cleanEmail,
            nome: userEmail.split('@')[0].replace('.', ' '),
          }),
        });

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.user) {
            setUserProfile(syncData.user);
            return;
          }
        }
      } catch (e) {
        console.warn('Sync profile endpoint failed, falling back to fetchUsersList:', e);
      }

      // 2. Fallback: fetch users list
      const res = await fetchUsersList();
      let matched = res.users.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      // Rule: jean.silva@azi.com.br is always ADMINISTRADOR with full scopes
      if (cleanEmail.includes('jean.silva')) {
        if (matched) {
          matched = {
            ...matched,
            perfil: 'ADMINISTRADOR',
            escopos: ['menu_dashboard', 'menu_eventos', 'menu_relatorios', 'menu_configuracoes'],
          };
        } else {
          matched = {
            id: storedUserId || 'usr-admin-01',
            nome: 'Jean Silva (Administrador)',
            email: 'jean.silva@azi.com.br',
            perfil: 'ADMINISTRADOR',
            status: 'ATIVO',
            escopos: ['menu_dashboard', 'menu_eventos', 'menu_relatorios', 'menu_configuracoes'],
          };
        }
      }

      if (matched) {
        setUserProfile(matched);
      } else {
        // Default fallback for logged-in user
        setUserProfile({
          id: `usr-auto-${Date.now()}`,
          nome: userEmail.split('@')[0].replace('.', ' '),
          email: cleanEmail,
          perfil: 'VISUALIZADOR',
          status: 'ATIVO',
          escopos: ['menu_dashboard'],
        });
      }
    } catch (err) {
      console.warn('Erro ao carregar perfil de permissões do usuário:', err);
      setUserProfile({
        id: 'usr-fallback',
        nome: userEmail ? userEmail.split('@')[0] : 'Usuário',
        email: userEmail || '',
        perfil: 'VISUALIZADOR',
        status: 'ATIVO',
        escopos: ['menu_dashboard'],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [userEmail]);

  const hasScope = (scope: SystemScopeCode | string): boolean => {
    if (!userProfile) return false;
    if (userProfile.perfil === 'ADMINISTRADOR') return true;
    return Boolean(userProfile.escopos && userProfile.escopos.includes(scope));
  };

  const isReadOnly = userProfile ? userProfile.perfil === 'VISUALIZADOR' : true;
  const canSync = userProfile ? userProfile.perfil === 'ADMINISTRADOR' || userProfile.perfil === 'GESTOR' : false;
  const canAccessSettings = hasScope('menu_configuracoes');

  return {
    userProfile,
    loading,
    refetchProfile: loadUserProfile,
    hasScope,
    isReadOnly,
    canSync,
    canAccessSettings,
  };
}
