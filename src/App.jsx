import { useEffect, useState } from "react"
import { loadTrainData } from "./utils/loadData"
import FaultDashboard from "./components/FaultDashboard"

export default function App() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    loadTrainData()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", gap:"1rem" }}>
      <div style={{ fontFamily:"var(--font-mono)", fontSize:"0.85rem", color:"var(--accent)", letterSpacing:"0.1em" }}>
        LOADING DATASET...
      </div>
      <div style={{ width:200, height:2, background:"var(--border)", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", background:"var(--accent)", animation:"load 1.5s ease-in-out infinite", width:"40%", borderRadius:2 }} />
      </div>
      <style>{`@keyframes load { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", flexDirection:"column", gap:"0.5rem" }}>
      <div style={{ color:"var(--critical)", fontFamily:"var(--font-mono)", fontSize:"0.85rem" }}>ERROR</div>
      <div style={{ color:"var(--muted)", fontSize:"0.9rem", maxWidth:500, textAlign:"center" }}>{error}</div>
    </div>
  )

  return <FaultDashboard data={data} />
}
