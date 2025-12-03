
import { createClient } from '@supabase/supabase-js';
import { HistoryItem, UserProfile } from '../types';

// ==============================================================================
// CONFIGURAÇÃO DO SUPABASE
// ==============================================================================
const PLACEHOLDER_URL = "COLE_SUA_URL_AQUI";
const PLACEHOLDER_KEY = "COLE_SUA_KEY_AQUI";

let supabase: any = null;

const initClient = () => {
  let url = PLACEHOLDER_URL;
  let key = PLACEHOLDER_KEY;

  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env.VITE_SUPABASE_URL) url = import.meta.env.VITE_SUPABASE_URL;
      // @ts-ignore
      if (import.meta.env.VITE_SUPABASE_ANON_KEY) key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    }
  } catch (e) {}

  // Fallback
  if (url === PLACEHOLDER_URL || key === PLACEHOLDER_KEY) {
    try {
      // @ts-ignore
      if (typeof process !== 'undefined' && process.env) {
        // @ts-ignore
        if (process.env.VITE_SUPABASE_URL) url = process.env.VITE_SUPABASE_URL;
        // @ts-ignore
        if (process.env.VITE_SUPABASE_ANON_KEY) key = process.env.VITE_SUPABASE_ANON_KEY;
      }
    } catch (e) {}
  }

  const isValidUrl = url && url !== "COLE_SUA_URL_AQUI";
  const isValidKey = key && key !== "COLE_SUA_KEY_AQUI";

  if (isValidUrl && isValidKey) {
    try {
      supabase = createClient(url, key);
    } catch (e) {
      console.error("Erro ao iniciar cliente Supabase:", e);
    }
  }
};

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

// LISTA DE EMAILS ADMINISTRATIVOS
// Adicione aqui os emails que devem ter acesso PRO automático ao logar no Supabase
const ADMIN_EMAILS = ['admin@fincalc.com']; 

// --- AUTH FUNCTIONS ---

export const signUp = async (email: string, pass: string) => {
  if (!supabase) throw new Error("Banco de dados não conectado.");
  const { data, error } = await supabase.auth.signUp({ email, password: pass });
  if (error) throw error;
  
  if (data.user) {
    await createProfile(data.user.id, email);
  }
  return data;
};

export const signIn = async (email: string, pass: string) => {
  if (!supabase) throw new Error("Banco de dados não conectado.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if (error) throw error;

  // Se o login for bem sucedido, buscamos o perfil imediatamente
  if (data.user) {
    const profile = await getUserProfile(data.user.id);
    
    // Verifica se é admin por email (bypass de PRO status via código)
    const isAdmin = ADMIN_EMAILS.includes(email);
    
    return { 
      ...data, 
      user: { 
        ...data.user, 
        ...profile, 
        is_pro: isAdmin ? true : profile?.is_pro 
      } 
    };
  }

  return data;
};

export const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

// --- PROFILE FUNCTIONS ---

// Lembre-se de rodar o SQL no painel do Supabase para criar a tabela 'profiles'
// com a coluna 'is_pro' boolean default false.

const createProfile = async (userId: string, email: string) => {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .insert([{ id: userId, email, is_pro: false }]);
  if (error) console.warn("Nota: Perfil pode já existir ou erro na criação", error);
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { id: userId, email: '', is_pro: false }; 
  }
  return data;
};

export const upgradeUserToPro = async (userId: string) => {
  if (!supabase) return;
  // Simulação de upgrade.
  const { error } = await supabase
    .from('profiles')
    .update({ is_pro: true })
    .eq('id', userId);

  if (error) throw error;
};

export const getUser = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    const profile = await getUserProfile(data.user.id);
    
    // Verifica se é admin por email (bypass de PRO status via código)
    const isAdmin = data.user.email && ADMIN_EMAILS.includes(data.user.email);

    return { 
      ...data.user, 
      ...profile, 
      is_pro: isAdmin ? true : profile?.is_pro
    };
  }
  return null;
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
