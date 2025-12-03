import React, { Component, ErrorInfo, ReactNode } from 'react';
import { errorTracker } from '../services/errorTracking';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para que a próxima renderização mostre a UI alternativa.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Loga o erro no nosso serviço de rastreamento
    errorTracker.captureException(error, {
      source: 'ErrorBoundary',
      metadata: { componentStack: errorInfo.componentStack }
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
     // Tenta recuperar limpando o estado e redirecionando para home
     this.setState({ hasError: false, error: null });
     window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 dark:text-red-400">
              <AlertTriangle size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Ops! Algo deu errado.
            </h1>
            
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm leading-relaxed">
              Encontramos um erro inesperado. Nosso time já foi notificado automaticamente.
            </p>

            {this.state.error && (
               <div className="mb-6 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg text-left overflow-hidden">
                 <p className="text-[10px] font-mono text-red-600 dark:text-red-400 break-all">
                    {this.state.error.toString()}
                 </p>
               </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-2.5 bg-[#1C3A5B] hover:bg-blue-800 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCcw size={16} /> Recarregar Página
              </button>
              
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Home size={16} /> Ir para Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;