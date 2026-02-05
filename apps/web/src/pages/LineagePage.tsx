import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import cytoscape from 'cytoscape'
import { api } from '../api/client'
import { Card, PageHeader } from '../components/ui'

export function LineagePage() {
  const ref = useRef<HTMLDivElement>(null)
  const [node, setNode] = useState<any>(null)
  const [search, setSearch] = useState('')
  const q = useQuery({ queryKey: ['lineage'], queryFn: async () => (await api.get('/lineage')).data })
  useEffect(() => {
    if (!q.data || !ref.current) return
    const cy = cytoscape({ container: ref.current, elements: [...q.data.nodes, ...q.data.edges], style: [{ selector: 'node', style: { label: 'data(label)', color: '#fff', 'background-color': '#0ea5e9' } }, { selector: 'edge', style: { width: 2, label: 'data(label)' } }, { selector: '.highlight', style: { 'background-color': '#f97316', 'line-color': '#f97316' } }], layout: { name: 'breadthfirst' } })
    cy.on('tap', 'node', (evt) => {
      const n = evt.target
      setNode(n.data())
      cy.elements().removeClass('highlight')
      n.addClass('highlight'); n.incomers().addClass('highlight'); n.outgoers().addClass('highlight')
    })
    if (search) {
      const n = cy.nodes().filter((x) => x.id().includes(search))[0]
      if (n) cy.fit(n, 120)
    }
    return () => cy.destroy()
  }, [q.data, search])
  return <div>
    <PageHeader title='Lineage' subtitle='Interactive dependency graph with upstream/downstream highlights' actions={<input placeholder='Search node' value={search} onChange={(e) => setSearch(e.target.value)} />} />
    <div className='grid' style={{ gridTemplateColumns: '3fr 1fr' }}>
      <Card><div ref={ref} style={{ width: '100%', height: 480 }} /></Card>
      <Card><h4>Legend</h4><div>🔵 dataset/model node</div><div>🟧 highlighted path</div><h4>Node detail</h4><pre>{JSON.stringify(node ?? { select: 'click a node' }, null, 2)}</pre></Card>
    </div>
  </div>
}
