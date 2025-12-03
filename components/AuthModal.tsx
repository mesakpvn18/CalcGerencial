import React, { useState } from 'react';
import { X, LogIn, UserPlus, Database, AlertCircle, CheckCircle, Mail, ArrowRight } from 'lucide-react';
import { initSupabase, signIn, signUp, isSupabaseConfigured } from '../services/supabase';
import { Language } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  language: Language;
}

const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLoginSuccess, language }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para controlar as telas de sucesso
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  
  const [configMode, setConfigMode] = useState(!isSupabaseConfigured());
  const [sbUrl, setSbUrl] = useState('');
  const [sbKey, setSbKey] = useState('');

  if (!isOpen) return null;

  const t = {
    configTitle: language === 'pt' ? 'Configurar Banco de Dados' : 'Setup Database',
    welcome: language === 'pt' ? 'Para continuar, entre na sua conta' : 'Please log in to continue',
    create: language === 'pt' ? 'Criar Conta Grátis' : 'Create Free Account',
    configDesc: language === 'pt' ? 'Conecte o Supabase para salvar na nuvem.' : 'Connect Supabase to save to cloud.',
    loginDesc: language === 'pt' ? 'Necessário para salvar e exportar relatórios.' : 'Required to save and export reports.',
    emailPlaceholder: 'seu@email.com',
    passPlaceholder: '••••••••',
    btnConnect: language === 'pt' ? 'Conectar' : 'Connect',
    btnProcessing: language === 'pt' ? 'Processando...' : 'Processing...',
    btnLogin: language === 'pt' ? 'Entrar' : 'Sign In',
    btnSignUp: language === 'pt' ? 'Criar Conta' : 'Sign Up',
    toggleSignup: language === 'pt' ? 'Não tem conta? Cadastre-se' : "Don't have an account? Sign up",
    toggleLogin: language === 'pt' ? 'Já tem conta? Faça login' : "Already have an account? Sign in",
    pasteKeys: language === 'pt' ? 'Cole as chaves do seu projeto Supabase aqui.' : 'Paste your Supabase project keys here.',
    
    // Textos de Sucesso Cadastro
    successTitle: language === 'pt' ? 'Conta criada com sucesso!' : 'Account created successfully!',
    successDesc: language === 'pt' ? 'Enviamos um link de confirmação para o seu e-mail.' : 'We sent a confirmation link to your email.',
    checkSpam: language === 'pt' ? 'Verifique sua caixa de entrada e spam.' : 'Check your inbox and spam folder.',
    backToLogin: language === 'pt' ? 'Voltar para Login' : 'Back to Login',

    // Textos de Sucesso Login
    loginSuccessTitle: language === 'pt' ? 'Login realizado!' : 'Login successful!',
    loginWelcome: language === 'pt' ? 'Carregando seus dados...' : 'Loading your data...',
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { user } = await signIn(email, password);
        if (user) {
          // Exibe tela de sucesso
          setShowLoginSuccess(true);
          
          // Aguarda 2 segundos para o usuário ver a animação antes de fechar
          setTimeout(() => {
            onLoginSuccess(user);
            onClose();
            // Reseta estados após fechar para a próxima vez
            setTimeout(() => {
              setShowLoginSuccess(false);
              setLoading(false);
              setEmail('');
              setPassword('');
            }, 300);
          }, 2000);
        }
      } else {
        const { user } = await signUp(email, password);
        if (user) {
          if (!user.email_confirmed_at) {
             setShowSignupSuccess(true);
             setLoading(false);
          } else {
             // Caso o Supabase esteja configurado para não exigir confirmação de email
             onLoginSuccess(user);
             onClose();
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Erro na autenticação");
      setLoading(false);
    }
  };

  const handleConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const success = initSupabase(sbUrl, sbKey);
    if (success) {
      setConfigMode(false);
      setError('');
    } else {
      setError("URL ou Chave inválida");
    }
  };

  const handleCloseSignupSuccess = () => {
    setShowSignupSuccess(false);
    setIsLogin(true); // Volta para a tela de login
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transition-all duration-300 border border-slate-200 dark:border-slate-800 min-h-[420px] flex flex-col">
        
        {/* === TELA DE SUCESSO AO CRIAR CONTA === */}
        {showSignupSuccess ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 ring-8 ring-emerald-50 dark:ring-emerald-900/10 transition-transform transform scale-100">
              <Mail size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t.successTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
              {t.successDesc}
              <br/>
              <span className="font-semibold text-[#1C3A5B] dark:text-blue-400 text-xs mt-3 block bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                {t.checkSpam}
              </span>
            </p>
            <button 
              onClick={handleCloseSignupSuccess}
              className="w-full py-3 bg-[#1C3A5B] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
            >
              {t.backToLogin} <ArrowRight size={16} />
            </button>
          </div>
        ) : showLoginSuccess ? (
          /* === TELA DE SUCESSO LOGIN === */
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-xl shadow-emerald-900/10 ring-4 ring-white dark:ring-slate-800 animate-pulse">
               <CheckCircle size={48} strokeWidth={3} />
             </div>
             <h2 className="text-2xl font-bold text-[#1C3A5B] dark:text-white mb-3">
               {t.loginSuccessTitle}
             </h2>
             <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
               {t.loginWelcome}
             </p>
          </div>
        ) : (
          /* === TELA PADRÃO DE FORMULÁRIO === */
          <>
            <div className="p-6 text-center border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <div className="mx-auto w-12 h-12 bg-[#1C3A5B] rounded-xl flex items-center justify-center text-white mb-3 shadow-lg shadow-blue-900/20">
                <Database size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {configMode ? t.configTitle : (isLogin ? t.welcome : t.create)}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {configMode ? t.configDesc : t.loginDesc}
              </p>
              <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-center">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-900/30">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              {configMode ? (
                <form onSubmit={handleConfig} className="space-y-4">
                   <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Supabase URL</label>
                    <input 
                      type="text" 
                      value={sbUrl}
                      onChange={e => setSbUrl(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-[#1C3A5B] transition-all"
                      placeholder="https://xyz.supabase.co"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Supabase Anon Key</label>
                    <input 
                      type="password" 
                      value={sbKey}
                      onChange={e => setSbKey(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-[#1C3A5B] transition-all"
                      placeholder="eyJh..."
                      required
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 leading-relaxed">
                    {t.pasteKeys}
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#1C3A5B] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                    {t.btnConnect}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">E-mail</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-[#1C3A5B] dark:text-white transition-all focus:bg-white dark:focus:bg-slate-900"
                      placeholder={t.emailPlaceholder}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">{language === 'pt' ? 'Senha' : 'Password'}</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-[#1C3A5B] dark:text-white transition-all focus:bg-white dark:focus:bg-slate-900"
                      placeholder={t.passPlaceholder}
                      required
                      minLength={6}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-[#1C3A5B] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                  >
                    {loading ? t.btnProcessing : (isLogin ? t.btnLogin : t.btnSignUp)}
                    {!loading && (isLogin ? <LogIn size={16} /> : <UserPlus size={16} />)}
                  </button>
                </form>
              )}
            </div>

            {!configMode && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-xs font-bold text-[#1C3A5B] dark:text-blue-400 hover:underline"
                >
                  {isLogin ? t.toggleSignup : t.toggleLogin}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;