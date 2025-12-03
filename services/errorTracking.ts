
import { logSystemError } from './supabase';

interface ErrorDetails {
  message: string;
  stack?: string;
  source?: string;
}

class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  public init() {
    if (this.isInitialized) return;
    
    // Captura erros globais (sintaxe, runtime síncrono)
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureException(error || new Error(String(message)), {
        source: 'window.onerror',
        metadata: { source, lineno, colno }
      });
      return false; // Deixa o erro propagar para o console
    };

    // Captura promessas rejeitadas não tratadas
    window.onunhandledrejection = (event) => {
      this.captureException(event.reason instanceof Error ? event.reason : new Error(String(event.reason)), {
        source: 'unhandledrejection'
      });
    };

    this.isInitialized = true;
    console.log('[ErrorTracking] Service Initialized');
  }

  public captureException(error: Error | string, context: { source?: string, metadata?: any } = {}) {
    const err = error instanceof Error ? error : new Error(error);
    const source = context.source || 'manual';
    const metadata = context.metadata || {};

    // 1. Log no Console (Ambiente de Dev / Backup)
    console.error(`[Captured Error] [${source}]:`, err);

    // 2. Enviar para Supabase (Persistência)
    logSystemError(
      err.message,
      err.stack || 'No stack trace',
      source,
      {
        ...metadata,
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    );
  }
}

export const errorTracker = ErrorTrackingService.getInstance();
