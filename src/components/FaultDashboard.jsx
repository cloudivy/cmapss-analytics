import { useState, useMemo } from "react"
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts"

const FAULT_COLORS = {
  healthy:   "var(--healthy)",
  degrading: "var(--degrading)",
  critical:  "var(--critical)"
}

const SENSORS = ["s2","s3","s4","s7","s8","s11","s12","s13","s14","s15","s17","s20","s21"]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:6, padding:"0.6rem 0.9rem" }}>
      <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--muted)", marginBottom:4 }}>cycle {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ fontSize:"0.85rem", color: p.color }}>
          {p.dataKey}: {typeof p.value === "number" ? p.value.toFixed(3) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function FaultDashboard({ data }) {
  const [selectedUnit, setSelectedUnit]     = useState(1)
  const [selectedSensor, setSelectedSensor] = useState("s4")

  const units = useMemo(() =>
    [...new Set(data.map(d => d.unit))].sort((a,b) => a - b), [data])

  // Last cycle per unit → fault zone
  const unitFaultMap = useMemo(() => {
    const map = {}
    data.forEach(d => {
      if (!map[d.unit] || d.cycle > map[d.unit].cycle) map[d.unit] = d
    })
    return map
  }, [data])

  const summary = useMemo(() => {
    const c = { healthy: 0, degrading: 0, critical: 0 }
    Object.values(unitFaultMap).forEach(d => c[d.fault_zone]++)
    return c
  }, [unitFaultMap])

  const unitData = useMemo(() =>
    data.filter(d => d.unit === selectedUnit).sort((a,b) => a.cycle - b.cycle),
    [data, selectedUnit])

  const currentZone = unitFaultMap[selectedUnit]?.fault_zone ?? "healthy"
  const totalUnits  = units.length

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerTag}>NASA CMAPSS · FD001 · TRAIN SET</div>
          <h1 style={styles.headerTitle}>Fault Detection Dashboard</h1>
        </div>
        <div style={styles.headerMeta}>
          <span style={styles.metaItem}>{data.length.toLocaleString()} records</span>
          <span style={styles.metaItem}>{totalUnits} engines</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.cards}>
        {[["healthy","HEALTHY","Within safe operating range"],
          ["degrading","DEGRADING","Elevated wear detected"],
          ["critical","CRITICAL","Imminent failure risk"]
        ].map(([zone, label, sub]) => (
          <div key={zone} style={{ ...styles.card, borderColor: FAULT_COLORS[zone] }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ ...styles.cardCount, color: FAULT_COLORS[zone] }}>{summary[zone]}</div>
              <div style={{ ...styles.cardBadge, background: FAULT_COLORS[zone] + "22", color: FAULT_COLORS[zone] }}>
                {Math.round(summary[zone] / totalUnits * 100)}%
              </div>
            </div>
            <div style={styles.cardLabel}>{label}</div>
            <div style={styles.cardSub}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          <label style={styles.label}>ENGINE UNIT</label>
          <select value={selectedUnit} onChange={e => setSelectedUnit(Number(e.target.value))} style={styles.select}>
            {units.map(u => (
              <option key={u} value={u}>Unit {u} — {unitFaultMap[u]?.fault_zone}</option>
            ))}
          </select>
        </div>
        <div style={styles.controlGroup}>
          <label style={styles.label}>SENSOR</label>
          <select value={selectedSensor} onChange={e => setSelectedSensor(e.target.value)} style={styles.select}>
            {SENSORS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>
        <div style={{ ...styles.zonePill, background: FAULT_COLORS[currentZone] + "22", border:`1px solid ${FAULT_COLORS[currentZone]}`, color: FAULT_COLORS[currentZone] }}>
          ● {currentZone.toUpperCase()} · {unitData.length} cycles
        </div>
      </div>

      {/* Sensor Chart */}
      <div style={styles.chartBox}>
        <div style={styles.chartHeader}>
          <span style={styles.chartTitle}>Unit {selectedUnit} — {selectedSensor.toUpperCase()} Sensor Reading</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={unitData} margin={{ top:10, right:20, bottom:20, left:0 }}>
            <XAxis dataKey="cycle" tick={{ fill:"var(--muted)", fontSize:11, fontFamily:"var(--font-mono)" }}
              label={{ value:"CYCLE", position:"insideBottom", offset:-8, fill:"var(--muted)", fontSize:10, fontFamily:"var(--font-mono)" }} />
            <YAxis tick={{ fill:"var(--muted)", fontSize:11, fontFamily:"var(--font-mono)" }} width={55} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={selectedSensor} stroke="var(--accent)" dot={false} strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RUL Chart */}
      <div style={styles.chartBox}>
        <div style={styles.chartHeader}>
          <span style={styles.chartTitle}>Unit {selectedUnit} — Remaining Useful Life (RUL)</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={unitData} margin={{ top:10, right:20, bottom:20, left:0 }}>
            <XAxis dataKey="cycle" tick={{ fill:"var(--muted)", fontSize:11, fontFamily:"var(--font-mono)" }}
              label={{ value:"CYCLE", position:"insideBottom", offset:-8, fill:"var(--muted)", fontSize:10, fontFamily:"var(--font-mono)" }} />
            <YAxis tick={{ fill:"var(--muted)", fontSize:11, fontFamily:"var(--font-mono)" }} width={55} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={80} stroke="var(--degrading)" strokeDasharray="4 4" label={{ value:"DEGRADING", fill:"var(--degrading)", fontSize:9, fontFamily:"var(--font-mono)" }} />
            <ReferenceLine y={30} stroke="var(--critical)"  strokeDasharray="4 4" label={{ value:"CRITICAL",  fill:"var(--critical)",  fontSize:9, fontFamily:"var(--font-mono)" }} />
            <Line type="monotone" dataKey="RUL" stroke="var(--healthy)" dot={false} strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Fleet Grid */}
      <div style={styles.chartBox}>
        <div style={styles.chartHeader}>
          <span style={styles.chartTitle}>Fleet Overview — Final Fault Zone per Engine</span>
          <span style={styles.chartSub}>Click a unit to inspect</span>
        </div>
        <div style={styles.grid}>
          {units.map(u => {
            const zone = unitFaultMap[u]?.fault_zone ?? "healthy"
            const isSelected = u === selectedUnit
            return (
              <div key={u} onClick={() => setSelectedUnit(u)} style={{
                ...styles.unitCell,
                borderColor: FAULT_COLORS[zone],
                background:  isSelected ? FAULT_COLORS[zone] + "44" : FAULT_COLORS[zone] + "18",
                boxShadow:   isSelected ? `0 0 10px ${FAULT_COLORS[zone]}66` : "none",
                transform:   isSelected ? "scale(1.1)" : "scale(1)",
              }}>
                <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.7rem", fontWeight:"bold" }}>U{u}</div>
                <div style={{ fontSize:"0.6rem", color: FAULT_COLORS[zone], marginTop:2, textTransform:"uppercase" }}>
                  {zone.slice(0,3)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

const styles = {
  page:         { maxWidth:1100, margin:"0 auto", padding:"2rem 1.5rem", fontFamily:"var(--font-body)" },
  header:       { display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"2rem", borderBottom:"1px solid var(--border)", paddingBottom:"1rem" },
  headerTag:    { fontFamily:"var(--font-mono)", fontSize:"0.7rem", color:"var(--accent)", letterSpacing:"0.12em", marginBottom:"0.4rem" },
  headerTitle:  { fontSize:"1.6rem", fontWeight:600, color:"var(--text)", letterSpacing:"-0.02em" },
  headerMeta:   { display:"flex", gap:"1rem" },
  metaItem:     { fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--muted)", background:"var(--surface)", padding:"0.3rem 0.7rem", borderRadius:4, border:"1px solid var(--border)" },
  cards:        { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" },
  card:         { background:"var(--surface)", borderRadius:10, padding:"1.2rem", border:"1px solid", transition:"border-color 0.2s" },
  cardCount:    { fontSize:"2.8rem", fontWeight:700, fontFamily:"var(--font-mono)", lineHeight:1 },
  cardBadge:    { fontFamily:"var(--font-mono)", fontSize:"0.75rem", padding:"0.2rem 0.5rem", borderRadius:4 },
  cardLabel:    { fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.1em", marginTop:"0.5rem", color:"var(--text)" },
  cardSub:      { fontSize:"0.78rem", color:"var(--muted)", marginTop:"0.25rem" },
  controls:     { display:"flex", alignItems:"flex-end", gap:"1rem", marginBottom:"1.5rem", flexWrap:"wrap" },
  controlGroup: { display:"flex", flexDirection:"column", gap:"0.4rem" },
  label:        { fontFamily:"var(--font-mono)", fontSize:"0.65rem", color:"var(--muted)", letterSpacing:"0.1em" },
  select:       { padding:"0.45rem 0.8rem", borderRadius:6, background:"var(--surface)", color:"var(--text)", border:"1px solid var(--border)", fontFamily:"var(--font-body)", fontSize:"0.85rem", cursor:"pointer" },
  zonePill:     { padding:"0.45rem 1rem", borderRadius:20, fontFamily:"var(--font-mono)", fontSize:"0.75rem", alignSelf:"flex-end" },
  chartBox:     { background:"var(--surface)", borderRadius:10, padding:"1.5rem", marginBottom:"1.2rem", border:"1px solid var(--border)" },
  chartHeader:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" },
  chartTitle:   { fontFamily:"var(--font-mono)", fontSize:"0.75rem", color:"var(--text)", letterSpacing:"0.05em" },
  chartSub:     { fontSize:"0.75rem", color:"var(--muted)" },
  grid:         { display:"flex", flexWrap:"wrap", gap:"0.5rem", marginTop:"0.5rem" },
  unitCell:     { width:52, height:52, borderRadius:8, border:"1px solid", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s ease" },
}
