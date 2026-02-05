import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Button, PageHeader, Skeleton, StatCard } from '../components/ui'
import { MiniBarChart, MiniLineChart } from '../components/charts'

export function OverviewPage() {
  const qc = useQueryClient()
  const metrics = useQuery({ queryKey: ['metrics'], queryFn: async () => (await api.get('/overview/metrics')).data })
  const run = useMutation({ mutationFn: async () => (await api.post('/runs', { pipeline_name: 'demo_pipeline' })).data, onSuccess: () => qc.invalidateQueries() })
  const k = metrics.data?.kpis
  const runsSeries = (metrics.data?.runs_series ?? []).map((d: any) => ({ label: d.label, value: d.runs }))
  const failSeries = (metrics.data?.quality_failures_series ?? []).map((d: any) => ({ label: d.label, value: d.failures }))

  return <div>
    <PageHeader title='Overview' subtitle='Lakehouse health at a glance' actions={<Button primary onClick={() => run.mutate()}>Run Demo Pipeline</Button>} />
    {!k ? <Skeleton /> : <div className='grid kpi-grid'>
      <StatCard label='Runs last 24h' value={String(k.runs_24h)} delta='+12%' />
      <StatCard label='Success rate' value={`${k.success_rate}%`} delta='+1.1%' />
      <StatCard label='Avg duration' value={`${Math.round(k.avg_duration_ms / 1000)}s`} delta='-4%' />
      <StatCard label='Quality pass rate' value={`${k.quality_pass_rate}%`} delta='+2.3%' />
      <StatCard label='Cost estimate' value={`$${k.cost_estimate}`} delta='-$18' />
      <StatCard label='Drift score' value={`${k.drift_score}`} delta='stable' />
    </div>}
    <div className='grid' style={{ gridTemplateColumns: '1fr 1fr', marginTop: 12 }}>
      <MiniLineChart title='Runs over time' data={runsSeries.slice(-10)} />
      <MiniBarChart title='Quality failures trend' data={failSeries.slice(-10)} />
    </div>
  </div>
}
