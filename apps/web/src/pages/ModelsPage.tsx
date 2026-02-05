import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Badge, Button, Card, PageHeader } from '../components/ui'
import { MiniLineChart } from '../components/charts'

export function ModelsPage() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['models'], queryFn: async () => (await api.get('/models')).data })
  const promote = useMutation({ mutationFn: async (id: number) => (await api.post(`/models/${id}/promote`)).data, onSuccess: () => qc.invalidateQueries({ queryKey: ['models'] }) })

  return <div>
    <PageHeader title='Models' subtitle='Registry cards, drift and promotion flow' />
    <div className='grid kpi-grid'>{q.data?.map((m: any) => {
      let history: { ts: string; accuracy?: number; drift?: number }[] = []
      try { history = JSON.parse(m.history_json ?? '[]') } catch { history = [] }
      const accSeries = history.map((h, i) => ({ label: `${i + 1}`, value: Math.round((h.accuracy ?? 0) * 100) }))
      return <Card key={m.id}><h4 style={{ marginBottom: 6 }}>{m.name}</h4><div className='small'>Last trained: {new Date(m.last_trained_at).toLocaleDateString()}</div><div>Accuracy: {(m.accuracy * 100).toFixed(1)}%</div><div>Drift: {m.drift_score}</div><div style={{ margin: '8px 0' }}><Badge text={m.stage} tone={m.stage === 'Production' ? 'success' : 'running'} /></div><Button primary onClick={() => promote.mutate(m.id)}>Promote to Production</Button>{accSeries.length > 1 && <MiniLineChart title='Accuracy history' data={accSeries.slice(-8)} stroke='#22c55e' />}</Card>
    })}</div>
  </div>
}
