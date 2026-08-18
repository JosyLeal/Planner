export const DAYS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
export const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const ROUTINE = [
  { atividade: "Dormir",             domingo:"8:00", segunda:"8:00", terca:"8:00",  quarta:"8:00", quinta:"8:00", sexta:"9:30", sabado:"9:15", icon:"😴", cor:"#7c6af7" },
  { atividade: "Trabalho",           domingo:"7:45", segunda:"7:45", terca:"8:00",  quarta:"",     quinta:"7:45", sexta:"",    sabado:"",     icon:"💼", cor:"#4f9cf9" },
  { atividade: "Livre",              domingo:"1:00", segunda:"1:00", terca:"1:00",  quarta:"2:00", quinta:"1:00", sexta:"8:00",sabado:"5:00", icon:"🎉", cor:"#f97316" },
  { atividade: "Almoço",             domingo:"1:00", segunda:"1:00", terca:"1:00",  quarta:"1:00", quinta:"1:00", sexta:"1:00",sabado:"1:00", icon:"🍽️", cor:"#22c55e" },
  { atividade: "Música - Clarinete", domingo:"0:45", segunda:"",    terca:"",      quarta:"0:45", quinta:"0:45", sexta:"2:30",sabado:"",     icon:"🎵", cor:"#ec4899" },
  { atividade: "EBD",                domingo:"",     segunda:"",    terca:"",      quarta:"",     quinta:"",     sexta:"",    sabado:"3:30", icon:"📖", cor:"#a855f7" },
  { atividade: "Café da Manhã",      domingo:"0:30", segunda:"0:30",terca:"0:30",  quarta:"0:30", quinta:"0:30", sexta:"0:30",sabado:"0:30", icon:"☕", cor:"#f59e0b" },
  { atividade: "Start Day",          domingo:"0:30", segunda:"0:30",terca:"0:30",  quarta:"0:30", quinta:"0:30", sexta:"0:30",sabado:"0:15", icon:"⚡", cor:"#06b6d4" },
  { atividade: "Culto",              domingo:"",     segunda:"",    terca:"",      quarta:"",     quinta:"",     sexta:"",    sabado:"3:00", icon:"🙏", cor:"#8b5cf6" },
  { atividade: "Leitura",            domingo:"1:00", segunda:"",    terca:"1:00",  quarta:"",     quinta:"1:00", sexta:"",    sabado:"",     icon:"📚", cor:"#10b981" },
  { atividade: "Lanche",             domingo:"0:15", segunda:"0:15",terca:"0:30",  quarta:"",     quinta:"0:15", sexta:"1:00",sabado:"0:30", icon:"🥪", cor:"#84cc16" },
  { atividade: "Atividade Física",   domingo:"0:30", segunda:"0:30",terca:"0:30",  quarta:"0:30", quinta:"0:30", sexta:"0:30",sabado:"",     icon:"🏃", cor:"#ef4444" },
  { atividade: "Jantar",             domingo:"0:30", segunda:"0:30",terca:"",      quarta:"0:30", quinta:"0:30", sexta:"0:30",sabado:"",     icon:"🌙", cor:"#6366f1" },
  { atividade: "Cursos Livres",      domingo:"1:00", segunda:"",    terca:"",      quarta:"0:45", quinta:"",     sexta:"",    sabado:"0:45", icon:"🎓", cor:"#0ea5e9" },
  { atividade: "Estudo Bíblico",     domingo:"0:15", segunda:"0:15",terca:"0:15",  quarta:"0:15", quinta:"0:15", sexta:"0:15",sabado:"0:45", icon:"✝️", cor:"#d946ef" },
  { atividade: "Cuidar do Cabelo",   domingo:"0:45", segunda:"",    terca:"",      quarta:"0:45", quinta:"",     sexta:"0:45",sabado:"",     icon:"💇", cor:"#f43f5e" },
  { atividade: "Arrumar a casa",     domingo:"",     segunda:"1:00",terca:"",      quarta:"1:00", quinta:"",     sexta:"",    sabado:"",     icon:"🏠", cor:"#78716c" },
  { atividade: "DuoLínguo",         domingo:"0:15", segunda:"0:15",terca:"0:15",  quarta:"0:15", quinta:"0:15", sexta:"0:15",sabado:"",     icon:"🌐", cor:"#65a30d" },
  { atividade: "Arrumar o armário",  domingo:"",     segunda:"1:00",terca:"",      quarta:"",     quinta:"",     sexta:"",    sabado:"",     icon:"👗", cor:"#c084fc" },
  { atividade: "Pintar as unhas",    domingo:"",     segunda:"",    terca:"",      quarta:"",     quinta:"1:00", sexta:"",    sabado:"",     icon:"💅", cor:"#fb7185" },
  { atividade: "Organizar Finanças", domingo:"",     segunda:"",    terca:"1:00",  quarta:"",     quinta:"",     sexta:"",    sabado:"",     icon:"💰", cor:"#fbbf24" },
  { atividade: "Música - Teclado",   domingo:"",     segunda:"",    terca:"0:45",  quarta:"",     quinta:"",     sexta:"",    sabado:"",     icon:"🎹", cor:"#38bdf8" },
];

export function toMins(str) {
  if (!str) return 0;
  const [h, m] = str.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function toHHMM(mins) {
  if (!mins) return "";
  return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")}`;
}

export const routineWithTotals = ROUTINE.map((r) => ({
  ...r,
  total: DAYS.reduce((s, d) => s + toMins(r[d]), 0),
}));

export const dayTotals = DAYS.map((d) => ROUTINE.reduce((s, r) => s + toMins(r[d]), 0));

export const totalGeral = ROUTINE.reduce(
  (s, r) => s + DAYS.reduce((ss, d) => ss + toMins(r[d]), 0),
  0
);

export const chartData = [...routineWithTotals]
  .filter((r) => r.total > 0)
  .sort((a, b) => b.total - a.total)
  .map((r) => ({ name: r.atividade, value: r.total, cor: r.cor, icon: r.icon }));

export const catColors = {
  ...Object.fromEntries(ROUTINE.map((r) => [r.atividade, { accent: r.cor, icon: r.icon }])),
  default: { accent: "#7c6af7", icon: "📌" },
};
