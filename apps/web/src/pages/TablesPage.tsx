import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Card, PageHeader, Table, Tabs } from '../components/ui'

export function TablesPage() {
  const [layer, setLayer] = useState('bronze')
  const [selected, setSelected] = useState<any>(null)
  const q = useQuery({ queryKey: ['datasets'], queryFn: async () => (await api.get('/datasets')).data })
  const rows = useMemo(() => (q.data ?? []).filter((d: any) => d.layer === layer), [q.data, layer])
  return <div>
    <PageHeader title='Tables' subtitle='Medallion tables with profile info and drift indicators' />
    <Tabs tabs={['bronze', 'silver', 'gold']} value={layer} onChange={setLayer} />
    <Table><thead><tr><th>Name</th><th>Owner</th><th>Updated</th><th>Rows</th><th>Drift</th></tr></thead><tbody>
      {rows.map((d: any) => <tr key={d.id} onClick={() => setSelected(d)}><td>{d.name}</td><td>{d.owner}</td><td>{new Date(d.updated_at).toLocaleString()}</td><td>{d.row_count.toLocaleString()}</td><td>{d.schema_drift ? '⚠️' : '✅'}</td></tr>)}
    </tbody></Table>
    {selected && <Card><h4>{selected.name} schema</h4><pre>{selected.schema_json}</pre><h4>Sample rows</h4><pre>{'[{"id":1,"amount":49.3},{"id":2,"amount":9.8}]'}</pre><h4>Profiling</h4><div className='small'>Null rate 0.2% • P95 amount 822 • cardinality 91k</div></Card>}
  </div>
}
