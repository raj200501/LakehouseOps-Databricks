import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import cytoscape from 'cytoscape'
import { api } from '../api/client'

export function LineagePage(){
  const ref = useRef<HTMLDivElement>(null)
  const q = useQuery({queryKey:['lineage'], queryFn: async()=> (await api.get('/lineage')).data})
  useEffect(()=>{
    if (!q.data || !ref.current) return
    const cy = cytoscape({container: ref.current, elements:[...q.data.nodes, ...q.data.edges], style:[{selector:'node', style:{label:'data(label)', 'background-color':'#2563eb', color:'#fff'}}, {selector:'edge', style:{label:'data(label)', width:2}}], layout:{name:'breadthfirst'}})
    return ()=>cy.destroy()
  },[q.data])
  return <div><h2>Lineage</h2><div ref={ref} style={{width:'100%', height:400, border:'1px solid #ddd'}}/></div>
}
