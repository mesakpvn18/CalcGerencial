import { createClient } from '@supabase/supabase-js';
import { HistoryItem } from '../types';

// ==============================================================================
// CONFIGURAÇÃO DO SUPABASE
// ==============================================================================
// Mantenha esses placeholders para o GitHub (Segurança)
// Configure os valores reais no painel da Vercel (Environment Variables)
const PLACEHOLDER_URL = "COLE_SUA_URL_AQUI";
const PLACEHOLDER_KEY = "COLE_SUA_KEY_AQUI";
// ==============================================================================

let supabase: any = null;

const initClient = () => {
  let url = PLACEHOLDER_URL;
  let key = PLACEHOLDER_KEY;

  // 1. Tenta ler das variáveis de ambiente (Padrão Vite/Vercel)
  // Isso é o que vai funcionar quando estiver hospedado na Vercel
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_SUPABASE_URL) url = import.meta.env.VITE_SUPABASE_URL;
      // @ts-ignore
      if (import.meta.env.VITE_SUPABASE_ANON_KEY) key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }
  } catch (e) {}

  // 2. Fallback para process.env (caso use outro sistema de build)
  if (url === PLACEHOLDER_URL || key === PLACEHOLDER_KEY) {
    try {
      // @ts-ignore
      if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        if (process.env.VITE_SUPABASE_URL) url = process.env.VITE_SUPABASE_URL;
        // @ts-ignore
        if (process.env.VITE_SUPABASE_ANON_KEY) key = process.env.VITE_SUPABASE_ANON_KEY;
        // @ts-ignore
        if (process.env.REACT_APP_SUPABASE_URL) url = process.env.REACT_APP_SUPABASE_URL;
        // @ts-ignore
        if (process.env.REACT_APP_SUPABASE_ANON_KEY) key = process.env.REACT_APP_SUPABASE_ANON_KEY;
      }
    } catch (e) {}
  }

  // 3. Verifica se temos chaves válidas (que não sejam os placeholders)
  const isValidUrl = url && url !== "COLE_SUA_URL_AQUI";
  const isValidKey = key && key !== "COLE_SUA_KEY_AQUI";

  if (isValidUrl && isValidKey) {
    try {
      supabase = createClient(url, key);
    } catch (e) {
      console.error("Erro ao iniciar cliente Supabase:", e);
    }
  } else {
    console.warn("Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente da Vercel.");
  }
};

// Inicializa
initClient();

export const initSupabase = (url: string, key: string) => {
  if (!url || !key) return false;
  try {
    supabase = createClient(url, key);
    return true;
  } catch (e) {
    console.error("Erro ao iniciar Supabase manualmente:", e);
    return false;
  }
};

export const isSupabaseConfigured = () => !!supabase;

// --- AUTH FUNCTIONS ---

export const signUp = async (email: string, pass: string) => {
  if (!supabase) throw new Error("Banco de dados não conectado. Verifique as configurações na Vercel.");
  const { data, error } = await supabase.auth.signUp({ email, password: pass });
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, pass: string) => {
  if (!supabase) throw new Error("Banco de dados não conectado. Verifique as configurações na Vercel.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

export const getUser = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
};

// --- DATABASE FUNCTIONS ---

export const saveSimulation = async (item: HistoryItem, userId: string) => {
  if (!supabase) return null;
  
  const { id, ...payload } = item;
  
  const { data, error } = await supabase
    .from('simulations')
    .insert([{
      user_id: userId,
      mode: payload.mode,
      inputs: payload.inputs,
      result: payload.result,
      currency: payload.currency,
      language: payload.language,
      timestamp: new Date(payload.timestamp).toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getSimulations = async (userId: string) => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  
  return data.map((row: any) => ({
    id: row.id,
    timestamp: new Date(row.timestamp).getTime(),
    mode: row.mode,
    inputs: row.inputs,
    result: row.result,
    currency: row.currency,
    language: row.language,
    isCloud: true
  }));
};

export const deleteSimulation = async (id: string | number) => {
  if (!supabase) return;
  
  const { error } = await supabase
    .from('simulations')
    .delete()
    .eq('id', id);

  if (error) throw error;
};