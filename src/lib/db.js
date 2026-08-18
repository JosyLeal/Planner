/**
 * Camada de dados do Planner.
 * Hoje: localStorage.
 * Depois: trocar as funções deste arquivo pelas queries do Supabase,
 * sem mudar as telas.
 *
 * Quando for conectar:
 * 1. Crie o projeto no Supabase
 * 2. Rode o SQL em supabase/schema.sql
 * 3. Preencha .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 * 4. Peça para ligar este arquivo ao cliente em src/lib/supabase.js
 */

const ACTIVITIES_KEY = "planner:activities";

export function loadActivities(seed) {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore broken cache
  }
  return seed;
}

export function saveActivities(list) {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(list));
}

export function newActivityId() {
  return crypto.randomUUID();
}
