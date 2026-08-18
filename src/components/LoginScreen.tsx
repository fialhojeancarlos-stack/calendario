import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  LogIn, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { getSupabase } from '../services/supabaseClient';

interface LoginScreenProps {
  onLoginSuccess: (user: User | null) => void;
  onBypass?: () => void;
  onSelectTestUser?: (email: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onBypass, onSelectTestUser }) => {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const testUsers = [
    { name: 'Jean Silva', email: 'jean.silva@azi.com.br', role: 'ADMINISTRADOR', color: 'bg-purple-950 text-purple-300 border-purple-800' },
    { name: 'Mariana Costa', email: 'mariana.costa@azi.com.br', role: 'GESTOR', color: 'bg-blue-950 text-blue-300 border-blue-800' },
    { name: 'André Colombo', email: 'andre.colombo@azi.com.br', role: 'VISUALIZADOR', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  ];

  const appVersion = import.meta.env.VITE_APP_VERSION || import.meta.env.VITE_SYSTEM_VERSION || '1.0.0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const client = getSupabase();

    if (!client) {
      setError('O Supabase não está configurado.');
      return;
    }

    if (!email || (mode !== 'forgot' && !password)) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error: authError } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          if (authError.message.includes('Invalid login credentials')) {
            throw new Error('E-mail ou senha incorretos. Por favor, verifique suas credenciais no Supabase.');
          } else if (authError.message.includes('Email not confirmed')) {
            throw new Error('E-mail ainda não confirmado no Supabase. Verifique sua caixa de entrada.');
          } else {
            throw authError;
          }
        }

        if (data.user) {
          onLoginSuccess(data.user);
        }
      } else if (mode === 'forgot') {
        const { error: resetError } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });

        if (resetError) throw resetError;

        setSuccess('Instruções para redefinição de senha foram enviadas para o seu e-mail.');
        setMode('login');
      }
    } catch (err: any) {
      console.error('[Supabase Auth Error]:', err);
      setError(err.message || 'Ocorreu um erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-800/95 border border-slate-700 backdrop-blur-xl rounded-2xl shadow-2xl p-8 relative z-10 text-slate-100">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 mb-4 ring-4 ring-slate-800">
            <ShieldCheck className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Jira Delivery <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">Auth</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Acesse com seu e-mail e senha do Supabase
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-start space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-start space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{success}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Endereço de E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com.br"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm transition-all outline-none"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Senha
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-slate-100 placeholder-slate-500 text-sm transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="text-xs text-slate-400 leading-relaxed mb-2">
              Digite seu e-mail cadastrado e enviaremos um link de redefinição através do Supabase.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Entrar na Plataforma'}
                  {mode === 'forgot' && 'Enviar E-mail de Recuperação'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className="w-full py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors text-center block"
            >
              Voltar ao login
            </button>
          )}
        </form>

        {/* Footer Version */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-center text-xs text-slate-400 font-medium">
          <span>Versão: {appVersion}</span>
        </div>
      </div>
    </div>
  );
};
