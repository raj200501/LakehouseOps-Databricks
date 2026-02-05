import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Badge, Button, Modal, PageHeader, Table } from '../components/ui'

export function RunsPage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')
  const runs = useQuery({ queryKey: ['runs'], queryFn: async () => (await api.get('/runs')).data })
  const gen = useMutation({ mutationFn: async () => (await api.post('/admin/demo/seed')).data, onSuccess: () => qc.invalidateQueries() })
  const filtered = (runs.data ?? []).filter((r: any) => `${r.pipeline_name} ${r.status}`.toLowerCase().includes(search.toLowerCase()))
  return <div>
    <PageHeader title='Pipeline Runs' subtitle='Searchable run history with timeline and logs' actions={<><input placeholder='Search runs...' value={search} onChange={(e) => setSearch(e.target.value)} /><Button onClick={() => gen.mutate()}>Generate Demo History</Button></>} />
    <Table><thead><tr><th>ID</th><th>Pipeline</th><th>Status</th><th>Duration</th><th>Started</th><th>Ended</th></tr></thead><tbody>
      {filtered.map((r: any) => <tr key={r.id} onClick={() => setSelected(r)}><td>#{r.id}</td><td>{r.pipeline_name}</td><td><Badge text={r.status} tone={r.status === 'succeeded' ? 'success' : r.status === 'failed' ? 'failed' : 'running'} /></td><td>{Math.round((r.duration_ms ?? 0) / 1000)}s</td><td>{new Date(r.started_at).toLocaleString()}</td><td>{r.ended_at ? new Date(r.ended_at).toLocaleString() : '-'}</td></tr>)}
    </tbody></Table>
    <Modal open={!!selected} onClose={() => setSelected(null)}>
      <h3>Run detail #{selected?.id}</h3><p className='small'>{selected?.pipeline_name}</p>
      <h4>Timeline</h4><pre>{selected?.steps_json}</pre>
      <h4>Logs</h4><pre style={{ background: '#020617', color: '#e2e8f0', padding: 8 }}>{selected?.logs}</pre>
      <h4>Artifacts</h4><pre>{selected?.artifacts_json}</pre>
    </Modal>
  </div>
}
