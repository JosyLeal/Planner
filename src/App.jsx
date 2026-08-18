import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  ROUTINE,
  DAYS,
  DAY_LABELS,
  toMins,
  toHHMM,
  routineWithTotals,
  dayTotals,
  totalGeral,
  chartData,
  catColors,
} from "./data/routine";
import { SEED_ACTIVITIES } from "./data/seed";
import { loadActivities, saveActivities, newActivityId } from "./lib/db";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background:"#1e1b4b", border:"1px solid #4338ca", borderRadius:8, padding:"6px 10px", fontSize:12 }}>
        <div style={{ fontWeight:700, color:"#fff" }}>{payload[0].payload.icon} {payload[0].payload.name}</div>
        <div style={{ color:"#a5b4fc" }}>{toHHMM(payload[0].value)}</div>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [tab, setTab] = useState("resumo");
  const [activities, setActivities] = useState(() => loadActivities(SEED_ACTIVITIES));
  const [selectedDate, setSelectedDate] = useState("01/mar");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ data:"", dia:"", inicio:"", fim:"", atividade:"", detalhes:"" });
  const [filterDay, setFilterDay] = useState(null);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  const uniqueDates = [...new Set(activities.map(a => a.data))].sort((a,b) => parseInt(a)-parseInt(b));
  const dayActivities = activities.filter(a => a.data === selectedDate).sort((a,b) => a.inicio.localeCompare(b.inicio));
  const selectedDayName = dayActivities[0]?.dia || "";
  const completedCount = dayActivities.filter(a => a.concluido).length;
  const progress = dayActivities.length > 0 ? (completedCount / dayActivities.length) * 100 : 0;

  const toggle = id => setActivities(p => p.map(a => a.id===id ? {...a, concluido:!a.concluido} : a));
  const deleteAct = id => setActivities(p => p.filter(a => a.id!==id));

  function calcDuracao(inicio, fim) {
    if (!inicio||!fim) return "00:00";
    const [h1,m1]=inicio.split(":").map(Number);
    const [h2,m2]=fim.split(":").map(Number);
    const d=(h2*60+m2)-(h1*60+m1);
    return d<=0?"00:00":`${String(Math.floor(d/60)).padStart(2,"0")}:${String(d%60).padStart(2,"0")}`;
  }

  const saveActivity = () => {
    if (!form.atividade||!form.inicio||!form.fim||!form.data) return;
    const duracao = calcDuracao(form.inicio, form.fim);
    if (editItem) {
      setActivities(p => p.map(a => a.id===editItem.id ? {...a,...form,duracao} : a));
    } else {
      setActivities((p) => [...p, { id: newActivityId(), mes: "mar", ...form, duracao, concluido: false }]);
    }
    setShowModal(false);
  };

  const getCat = a => catColors[a] || catColors["default"];

  const filteredRoutine = filterDay !== null
    ? routineWithTotals.filter(r => toMins(r[DAYS[filterDay]]) > 0)
    : routineWithTotals.filter(r => r.total > 0);

  return (
    <div style={{
      fontFamily:"'Nunito','Segoe UI',sans-serif",
      background:"linear-gradient(160deg,#0f0c29,#302b63,#24243e)",
      minHeight:"100vh", maxWidth:430, margin:"0 auto", color:"#fff", paddingBottom:80,
    }}>
      {/* HEADER */}
      <div style={{padding:"28px 20px 0", background:"rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
          <div>
            <div style={{fontSize:11, opacity:.5, letterSpacing:2, textTransform:"uppercase"}}>Agenda</div>
            <div style={{fontSize:22, fontWeight:800}}>Rotina Planejada</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11, opacity:.5}}>Total Semanal</div>
            <div style={{fontSize:20, fontWeight:900, color:"#a78bfa"}}>{toHHMM(totalGeral)}</div>
          </div>
        </div>
        <div style={{display:"flex", gap:4}}>
          {[["resumo","📊 Resumo"],["dia","📅 Dia"],["semana","🗓️ Semana"]].map(([v,label])=>(
            <button key={v} onClick={()=>setTab(v)} style={{
              flex:1, padding:"8px 4px", border:"none", borderRadius:"10px 10px 0 0",
              fontWeight:700, fontSize:11, cursor:"pointer",
              background: tab===v ? "rgba(167,139,250,0.2)" : "transparent",
              color: tab===v ? "#a78bfa" : "rgba(255,255,255,0.4)",
              borderBottom: tab===v ? "2px solid #a78bfa" : "2px solid transparent",
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ─── RESUMO ─── */}
      {tab==="resumo" && (
        <div style={{padding:"16px 12px"}}>
          {/* Day filter */}
          <div style={{display:"flex", gap:6, overflowX:"auto", paddingBottom:8, marginBottom:12}}>
            <button onClick={()=>setFilterDay(null)} style={{
              padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer",
              fontSize:11, fontWeight:700, whiteSpace:"nowrap",
              background: filterDay===null ? "#a78bfa" : "rgba(255,255,255,0.08)", color:"#fff",
            }}>Todos</button>
            {DAY_LABELS.map((d,i)=>(
              <button key={i} onClick={()=>setFilterDay(filterDay===i?null:i)} style={{
                padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer",
                fontSize:11, fontWeight:700, whiteSpace:"nowrap",
                background: filterDay===i ? "#7c6af7" : "rgba(255,255,255,0.08)", color:"#fff",
              }}>{d}</button>
            ))}
          </div>

          {/* Stats cards */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16}}>
            {[
              {label:"Atividades",     value:ROUTINE.length,              icon:"📋", color:"#7c6af7"},
              {label:"Horas/semana",   value:toHHMM(totalGeral),          icon:"⏱️", color:"#06b6d4"},
              {label:"Horas/dia",      value:toHHMM(Math.round(totalGeral/7)), icon:"📆", color:"#22c55e"},
              {label:"Dias planejados",value:"7",                         icon:"✅", color:"#f59e0b"},
            ].map((s,i)=>(
              <div key={i} style={{
                background:"rgba(255,255,255,0.06)", borderRadius:14, padding:"12px 14px",
                border:`1px solid ${s.color}33`,
              }}>
                <div style={{fontSize:18, marginBottom:4}}>{s.icon}</div>
                <div style={{fontSize:20, fontWeight:900, color:s.color}}>{s.value}</div>
                <div style={{fontSize:11, opacity:.6, marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div style={{background:"rgba(255,255,255,0.05)", borderRadius:16, padding:"14px 8px 8px", marginBottom:16, border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{fontSize:12, fontWeight:700, opacity:.7, paddingLeft:8, marginBottom:10}}>⏱ Tempo por Atividade (semana)</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{top:0, right:4, left:-20, bottom:0}}>
                <XAxis dataKey="icon" tick={{fill:"#fff", fontSize:14}} axisLine={false} tickLine={false}/>
                <YAxis tickFormatter={v=>toHHMM(v)} tick={{fill:"rgba(255,255,255,0.4)", fontSize:9}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {chartData.map((e,i)=><Cell key={i} fill={e.cor}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity table */}
          <div style={{background:"rgba(255,255,255,0.05)", borderRadius:16, overflow:"hidden", border:"1px solid rgba(255,255,255,0.08)", marginBottom:16}}>
            <div style={{display:"grid", gridTemplateColumns:"28px 1fr 52px 60px", gap:4, padding:"9px 12px", background:"rgba(167,139,250,0.15)", borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              {["","Atividade", filterDay===null?"Total":DAY_LABELS[filterDay], ""].map((h,i)=>(
                <div key={i} style={{fontSize:10, fontWeight:800, opacity:.7, textTransform:"uppercase", letterSpacing:1}}>{h}</div>
              ))}
            </div>
            {filteredRoutine.map((r,i)=>{
              const val = filterDay!==null ? toMins(r[DAYS[filterDay]]) : r.total;
              if (!val) return null;
              const maxVal = filterDay!==null ? Math.max(...ROUTINE.map(x=>toMins(x[DAYS[filterDay]]))) : Math.max(...routineWithTotals.map(x=>x.total));
              return (
                <div key={i} style={{
                  display:"grid", gridTemplateColumns:"28px 1fr 52px 60px", gap:4,
                  padding:"8px 12px", borderBottom:"1px solid rgba(255,255,255,0.05)",
                  background: i%2===0 ? "transparent" : "rgba(255,255,255,0.02)", alignItems:"center",
                }}>
                  <div style={{fontSize:15}}>{r.icon}</div>
                  <div style={{fontSize:12, fontWeight:600, lineHeight:1.3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{r.atividade}</div>
                  <div style={{fontSize:12, fontWeight:700, color:r.cor}}>{toHHMM(val)}</div>
                  <div style={{width:"100%", height:5, background:"rgba(255,255,255,0.08)", borderRadius:4}}>
                    <div style={{width:`${(val/maxVal)*100}%`, height:"100%", background:r.cor, borderRadius:4}}/>
                  </div>
                </div>
              );
            })}
            <div style={{display:"grid", gridTemplateColumns:"28px 1fr 52px 60px", gap:4, padding:"9px 12px", background:"rgba(167,139,250,0.2)", borderTop:"1px solid rgba(167,139,250,0.3)"}}>
              <div/>
              <div style={{fontSize:12, fontWeight:900}}>Total Geral</div>
              <div style={{fontSize:13, fontWeight:900, color:"#a78bfa"}}>
                {filterDay!==null ? toHHMM(ROUTINE.reduce((s,r)=>s+toMins(r[DAYS[filterDay]]),0)) : toHHMM(totalGeral)}
              </div>
              <div/>
            </div>
          </div>

          {/* Day breakdown bars */}
          <div style={{background:"rgba(255,255,255,0.05)", borderRadius:16, padding:14, border:"1px solid rgba(255,255,255,0.08)"}}>
            <div style={{fontSize:12, fontWeight:700, opacity:.7, marginBottom:12}}>📅 Total por Dia</div>
            {DAYS.map((d,i)=>(
              <div key={d} style={{display:"flex", alignItems:"center", gap:10, marginBottom:8}}>
                <div style={{width:32, fontSize:11, fontWeight:700, opacity:.7}}>{DAY_LABELS[i]}</div>
                <div style={{flex:1, height:8, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden"}}>
                  <div style={{width:`${(dayTotals[i]/1440)*100}%`, height:"100%", background:`hsl(${i*50},70%,60%)`, borderRadius:4}}/>
                </div>
                <div style={{width:36, fontSize:12, fontWeight:700, color:`hsl(${i*50},70%,70%)`}}>{toHHMM(dayTotals[i])}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── DIA ─── */}
      {tab==="dia" && (
        <>
          <div style={{overflowX:"auto", padding:"14px 16px 8px", display:"flex", gap:8}}>
            {uniqueDates.map(date=>{
              const num=date.split("/")[0];
              const d=activities.find(a=>a.data===date)?.dia||"";
              const isSel=date===selectedDate;
              return (
                <button key={date} onClick={()=>setSelectedDate(date)} style={{
                  minWidth:50, padding:"9px 6px", borderRadius:12,
                  border:isSel?"2px solid #a78bfa":"2px solid rgba(255,255,255,0.1)",
                  background:isSel?"rgba(167,139,250,0.25)":"rgba(255,255,255,0.06)",
                  color:"#fff", cursor:"pointer",
                }}>
                  <div style={{fontSize:9, opacity:.6, marginBottom:2}}>{d.slice(0,3)}</div>
                  <div style={{fontSize:17, fontWeight:800}}>{num}</div>
                </button>
              );
            })}
          </div>

          <div style={{padding:"4px 20px 4px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span style={{fontSize:16, fontWeight:800, textTransform:"capitalize"}}>
              {selectedDayName} <span style={{fontSize:12, opacity:.5, fontWeight:400}}>{selectedDate}</span>
            </span>
          </div>

          {dayActivities.length > 0 && (
            <div style={{padding:"2px 20px 10px"}}>
              <div style={{height:4, background:"rgba(255,255,255,0.08)", borderRadius:4}}>
                <div style={{height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#a78bfa,#f472b6)", borderRadius:4, transition:"width 0.4s"}}/>
              </div>
              <div style={{fontSize:11, opacity:.5, marginTop:4}}>{completedCount}/{dayActivities.length} concluídas</div>
            </div>
          )}

          <div style={{padding:"0 14px"}}>
            {dayActivities.length===0 ? (
              <div style={{textAlign:"center", padding:"48px 20px", opacity:.4}}>
                <div style={{fontSize:32, marginBottom:8}}>📋</div>
                Nenhuma atividade neste dia
              </div>
            ) : dayActivities.map(act=>{
              const cat=getCat(act.atividade);
              return (
                <div key={act.id} style={{
                  background:act.concluido?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.07)",
                  borderRadius:14, marginBottom:9, padding:"12px 14px",
                  display:"flex", gap:10, alignItems:"center",
                  borderLeft:`4px solid ${cat.accent}`,
                  opacity:act.concluido?.6:1,
                }}>
                  <button onClick={()=>toggle(act.id)} style={{
                    width:24, height:24, minWidth:24, borderRadius:7,
                    border:`2px solid ${cat.accent}`,
                    background:act.concluido?cat.accent:"transparent",
                    cursor:"pointer", color:"#fff", fontSize:12,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>{act.concluido?"✓":""}</button>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700, fontSize:13, textDecoration:act.concluido?"line-through":"none"}}>
                      {cat.icon} {act.atividade}
                    </div>
                    <div style={{fontSize:11, opacity:.55, marginTop:1}}>{act.inicio} – {act.fim} · {act.duracao}</div>
                    {act.detalhes && <div style={{fontSize:11, opacity:.45, marginTop:1}}>{act.detalhes}</div>}
                  </div>
                  <div style={{display:"flex", gap:3}}>
                    <button onClick={()=>{setForm({data:act.data,dia:act.dia,inicio:act.inicio,fim:act.fim,atividade:act.atividade,detalhes:act.detalhes});setEditItem(act);setShowModal(true);}} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:7,width:28,height:28,cursor:"pointer",fontSize:12,color:"#fff"}}>✏️</button>
                    <button onClick={()=>deleteAct(act.id)} style={{background:"rgba(239,68,68,0.15)",border:"none",borderRadius:7,width:28,height:28,cursor:"pointer",color:"#ef4444",fontWeight:700}}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={()=>{setForm({data:selectedDate,dia:selectedDayName,inicio:"",fim:"",atividade:"",detalhes:""});setEditItem(null);setShowModal(true);}} style={{
            position:"fixed", bottom:24, right:"calc(50% - 215px + 16px)",
            width:54, height:54, borderRadius:"50%",
            background:"linear-gradient(135deg,#a78bfa,#f472b6)",
            border:"none", color:"#fff", fontSize:26, cursor:"pointer",
            boxShadow:"0 4px 20px rgba(167,139,250,0.5)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>+</button>
        </>
      )}

      {/* ─── SEMANA ─── */}
      {tab==="semana" && (
        <div style={{padding:"16px 14px"}}>
          {uniqueDates.map(date=>{
            const list=activities.filter(a=>a.data===date);
            const done=list.filter(a=>a.concluido).length;
            const pct=list.length>0?(done/list.length)*100:0;
            return (
              <div key={date} onClick={()=>{setSelectedDate(date);setTab("dia");}} style={{
                background:"rgba(255,255,255,0.06)", borderRadius:14, marginBottom:10, padding:"13px 14px",
                cursor:"pointer", border:"1px solid rgba(255,255,255,0.08)",
              }}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                  <div>
                    <span style={{fontWeight:800, fontSize:14, textTransform:"capitalize"}}>{list[0]?.dia}</span>
                    <span style={{fontSize:11, opacity:.5, marginLeft:8}}>{date}</span>
                  </div>
                  <span style={{fontSize:11, fontWeight:700, color:pct===100?"#22c55e":"#a78bfa", background:pct===100?"rgba(34,197,94,.15)":"rgba(167,139,250,.15)", padding:"2px 10px", borderRadius:20}}>
                    {done}/{list.length}
                  </span>
                </div>
                <div style={{height:3, background:"rgba(255,255,255,0.08)", borderRadius:3, marginBottom:8}}>
                  <div style={{height:"100%", width:`${pct}%`, background:pct===100?"#22c55e":"linear-gradient(90deg,#a78bfa,#f472b6)", borderRadius:3}}/>
                </div>
                <div style={{display:"flex", gap:5, flexWrap:"wrap"}}>
                  {list.map(a=>{
                    const cat=getCat(a.atividade);
                    return (
                      <span key={a.id} style={{fontSize:10, padding:"2px 7px", borderRadius:20, background:a.concluido?"rgba(34,197,94,.15)":`${cat.accent}18`, border:`1px solid ${a.concluido?"#22c55e":cat.accent}44`, color:a.concluido?"#22c55e":cat.accent}}>
                        {cat.icon} {a.inicio}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={()=>setShowModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#1a1640",borderRadius:"22px 22px 0 0",padding:22,width:"100%",maxWidth:430,border:"1px solid rgba(255,255,255,0.1)"}}>
            <div style={{fontWeight:800,fontSize:17,marginBottom:18}}>{editItem?"Editar":"Nova"} Atividade</div>
            {[
              {label:"Atividade",key:"atividade",type:"text",placeholder:"Ex: Reunião, Leitura..."},
              {label:"Data",key:"data",type:"text",placeholder:"Ex: 01/mar"},
              {label:"Início",key:"inicio",type:"time"},
              {label:"Fim",key:"fim",type:"time"},
              {label:"Detalhes",key:"detalhes",type:"text",placeholder:"Opcional"},
            ].map(({label,key,type,placeholder})=>(
              <div key={key} style={{marginBottom:12}}>
                <div style={{fontSize:10,opacity:.5,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>{label}</div>
                <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={placeholder}
                  style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:9,padding:"9px 11px",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:6}}>
              <button onClick={()=>setShowModal(false)} style={{flex:1,padding:13,borderRadius:11,border:"1px solid rgba(255,255,255,0.12)",background:"transparent",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>Cancelar</button>
              <button onClick={saveActivity} style={{flex:2,padding:13,borderRadius:11,border:"none",background:"linear-gradient(135deg,#a78bfa,#f472b6)",color:"#fff",fontWeight:800,cursor:"pointer",fontSize:13}}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
