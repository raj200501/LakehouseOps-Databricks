import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import cytoscape from 'cytoscape'
import { api } from '../api/client'
import { Badge, Button, Card, PageHeader } from '../components/ui'

const layerColors: Record<string, string> = {
  bronze: '#b45309',
  silver: '#64748b',
  gold: '#ca8a04',
  model: '#7c3aed',
}

export function LineagePage() {
  const ref = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)
  const [node, setNode] = useState<any>(null)
  const [search, setSearch] = useState('')
  const q = useQuery({ queryKey: ['lineage'], queryFn: async () => (await api.get('/lineage')).data })

  const edgeMap = useMemo(() => {
    const map = new Map<string, { upstream: string[]; downstream: string[] }>()
    for (const n of q.data?.nodes ?? []) map.set(n.data.id, { upstream: [], downstream: [] })
    for (const e of q.data?.edges ?? []) {
      map.get(e.data.source)?.downstream.push(e.data.target)
      map.get(e.data.target)?.upstream.push(e.data.source)
    }
    return map
  }, [q.data])

  useEffect(() => {
    if (!q.data || !ref.current) return
    const coloredNodes = q.data.nodes.map((node: any) => ({
      ...node,
      data: { ...node.data, color: layerColors[node.data.layer] ?? '#0ea5e9' },
    }))
    const cy = cytoscape({
      container: ref.current,
      elements: [...coloredNodes, ...q.data.edges],
      style: [
        { selector: 'node', style: { label: 'data(name)', color: '#fff', 'font-size': '10px', 'text-wrap': 'wrap', 'text-max-width': '90px', 'background-color': 'data(color)', width: '42px', height: '42px' } },
        { selector: 'edge', style: { width: 2, label: 'data(label)', 'curve-style': 'bezier', 'target-arrow-shape': 'triangle', 'line-color': '#64748b', 'target-arrow-color': '#64748b', 'font-size': '8px' } },
        { selector: '.highlight', style: { 'background-color': '#f97316', 'line-color': '#f97316', 'target-arrow-color': '#f97316' } },
      ],
      layout: { name: 'breadthfirst', directed: true, spacingFactor: 1.1 },
    })
    cyRef.current = cy


    cy.on('tap', 'node', (evt) => {
      const n = evt.target
      const details = n.data()
      const links = edgeMap.get(details.id) ?? { upstream: [], downstream: [] }
      setNode({ ...details, ...links })
      cy.elements().removeClass('highlight')
      n.addClass('highlight'); n.incomers().addClass('highlight'); n.outgoers().addClass('highlight')
    })

    return () => cy.destroy()
  }, [q.data, edgeMap])

  useEffect(() => {
    const cy = cyRef.current
    if (!cy || !search) return
    const n = cy.nodes().filter((x) => x.id().toLowerCase().includes(search.toLowerCase()))[0]
    if (n) {
      cy.fit(n, 120)
      n.emit('tap')
    }
  }, [search])

  const handleNodeJump = (nodeId: string) => {
    const cy = cyRef.current
    if (!cy) return
    const n = cy.getElementById(nodeId)
    if (n) {
      cy.fit(n, 120)
      n.emit('tap')
    }
  }

  return <div>
    <PageHeader title='Lineage' subtitle='Interactive dependency graph with rich node detail and quality context' actions={<div style={{ display: 'flex', gap: 8 }}><input placeholder='Search node' value={search} onChange={(e) => setSearch(e.target.value)} /><Button onClick={() => cyRef.current?.fit(undefined, 80)}>Fit view</Button></div>} />
    <div className='grid' style={{ gridTemplateColumns: '3fr 1fr' }}>
      <Card><div ref={ref} style={{ width: '100%', height: 520 }} /></Card>
      <Card>
        <h4>Legend</h4>
        <div className='small'>Node colors by layer</div>
        {Object.entries(layerColors).map(([layer, color]) => <div key={layer} style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 999, background: color, display: 'inline-block' }} /><span>{layer}</span></div>)}
        <h4>Node detail</h4>
        {!node ? <div className='small'>Select a node to inspect details.</div> : <>
          <div><strong>{node.name}</strong></div>
          <div style={{ marginTop: 4 }}><Badge text={node.type} tone='running' /> <Badge text={node.layer} tone='success' /></div>
          <div className='small' style={{ marginTop: 6 }}>Last updated: {new Date(node.last_updated).toLocaleString()}</div>
          <div className='small'>Last run status: {node.last_run_status}</div>
          <div className='small'>Quality pass rate: {node.quality_pass_rate}%</div>
          <h5>Upstream</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{node.upstream?.length ? node.upstream.map((u: string) => <Button key={u} onClick={() => handleNodeJump(u)}>{u}</Button>) : <span className='small'>None</span>}</div>
          <h5>Downstream</h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>{node.downstream?.length ? node.downstream.map((d: string) => <Button key={d} onClick={() => handleNodeJump(d)}>{d}</Button>) : <span className='small'>None</span>}</div>
        </>}
      </Card>
    </div>
  </div>
}
