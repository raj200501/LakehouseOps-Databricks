import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { api } from '../api/client'
import { Badge, Button, Modal, PageHeader, Table } from '../components/ui'

function toneForStatus(status: string): 'success' | 'failed' | 'running' {
  if (status === 'succeeded') return 'success'
  if (status === 'failed') return 'failed'
  return 'running'
}

export function RunsPage() {
  const { runId } = useParams()
  const qc = useQueryClient()
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [logSearch, setLogSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [pipeline, setPipeline] = useState('all')
  const [timeRange, setTimeRange] = useState('14d')
  const runs = useQuery({
    queryKey: ['runs'],
    queryFn: async () => (await api.get('/runs')).data,
    refetchInterval: (query) => {
      const rows = (query.state.data ?? []) as any[]
      return rows.some((r) => r.status === 'running') ? 2000 : false
    },
  })
  const gen = useMutation({ mutationFn: async () => (await api.post('/admin/demo/history')).data, onSuccess: () => qc.invalidateQueries() })

  useEffect(() => {
    if (!runId || !(runs.data ?? []).length) return
    const matched = (runs.data as any[]).find((r) => String(r.id) === String(runId))
    if (matched) {
      setSelected(matched)
    }
  }, [runId, runs.data])

  const pipelines = useMemo(() => {
    const names = ((runs.data ?? []) as any[]).map((r) => String(r.pipeline_name))
    return ['all', ...Array.from(new Set<string>(names))]
  }, [runs.data])
  const cutoffMs = timeRange === '24h' ? 86400000 : timeRange === '7d' ? 7 * 86400000 : 14 * 86400000

  const filtered = (runs.data ?? []).filter((r: any) => {
    const started = new Date(r.started_at).getTime()
    const inRange = (Date.now() - started) <= cutoffMs
    const statusOk = status === 'all' || r.status === status
    const pipelineOk = pipeline === 'all' || r.pipeline_name === pipeline
    const queryOk = `${r.pipeline_name} ${r.status} ${r.id}`.toLowerCase().includes(search.toLowerCase())
    return inRange && statusOk && pipelineOk && queryOk
  })

  const steps = selected ? JSON.parse(selected.steps_json ?? '[]') : []
  const artifacts = selected ? JSON.parse(selected.artifacts_json ?? '[]') : []
  const logs = String(selected?.logs ?? '')
  const visibleLogs = logSearch ? logs.split('\n').filter((line) => line.toLowerCase().includes(logSearch.toLowerCase())).join('\n') : logs

  return <div>
    <PageHeader title='Pipeline Runs' subtitle='Filterable run history with timeline, searchable logs, and artifacts' actions={<>
      <input placeholder='Search runs...' value={search} onChange={(e) => setSearch(e.target.value)} />
      <Button onClick={() => gen.mutate()}>{gen.isPending ? 'Generating...' : 'Generate history (30 runs)'}</Button>
    </>} />
    <div className='grid' style={{ gridTemplateColumns: 'repeat(3, minmax(180px, 1fr))', marginBottom: 12 }}>
      <select value={status} onChange={(e) => setStatus(e.target.value)}><option value='all'>All statuses</option><option value='succeeded'>Succeeded</option><option value='failed'>Failed</option><option value='running'>Running</option></select>
      <select value={pipeline} onChange={(e) => setPipeline(e.target.value)}>{pipelines.map((name) => <option key={name} value={name}>{name === 'all' ? 'All pipelines' : name}</option>)}</select>
      <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}><option value='24h'>Last 24h</option><option value='7d'>Last 7d</option><option value='14d'>Last 14d</option></select>
    </div>
    <Table><thead><tr><th>ID</th><th>Pipeline</th><th>Status</th><th>Duration</th><th>Started</th><th>Ended</th></tr></thead><tbody>
      {filtered.map((r: any) => <tr key={r.id} onClick={() => setSelected(r)}><td>#{r.id}</td><td>{r.pipeline_name}</td><td><Badge text={r.status} tone={toneForStatus(r.status)} /></td><td>{Math.round((r.duration_ms ?? 0) / 1000)}s</td><td>{new Date(r.started_at).toLocaleString()}</td><td>{r.ended_at ? new Date(r.ended_at).toLocaleString() : '-'}</td></tr>)}
    </tbody></Table>
    <Modal open={!!selected} onClose={() => setSelected(null)}>
      <h3>Run detail #{selected?.id}</h3><p className='small'>{selected?.pipeline_name}</p>
      <h4>Step timeline</h4>
      <div className='grid'>
        {steps.map((step: any) => <div key={step.name} className='card' style={{ padding: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>{step.name}</strong><Badge text={step.status} tone={toneForStatus(step.status === 'pending' ? 'running' : step.status)} /></div>
        </div>)}
      </div>
      <h4>Logs viewer</h4>
      <input placeholder='Search logs...' value={logSearch} onChange={(e) => setLogSearch(e.target.value)} style={{ width: '100%', marginBottom: 6 }} />
      <pre style={{ background: '#020617', color: '#e2e8f0', padding: 8, minHeight: 120 }}>{visibleLogs || 'No matching logs'}</pre>
      <h4>Artifacts</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{artifacts.map((a: string) => <Badge key={a} text={a} tone='running' />)}</div>
    </Modal>
  </div>
}
