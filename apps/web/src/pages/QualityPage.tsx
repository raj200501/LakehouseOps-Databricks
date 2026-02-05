import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Badge, Card, PageHeader, Table } from '../components/ui'

export function QualityPage() {
  const q = useQuery({ queryKey: ['quality'], queryFn: async () => (await api.get('/quality')).data })
  const failing = (q.data ?? []).filter((d: any) => !d.passed)
  return <div>
    <PageHeader title='Data Quality' subtitle='Rulesets, trends, failing samples and top offending rules' />
    <div className='grid' style={{ gridTemplateColumns: '2fr 1fr' }}>
      <Card><h4>Results</h4><Table><thead><tr><th>Dataset</th><th>Rule</th><th>Result</th><th>Failures</th></tr></thead><tbody>{(q.data ?? []).slice(0, 12).map((d: any, idx: number) => <tr key={idx}><td>{d.dataset}</td><td>{d.rule}</td><td><Badge text={d.passed ? 'pass' : 'fail'} tone={d.passed ? 'success' : 'failed'} /></td><td>{d.failures}</td></tr>)}</tbody></Table></Card>
      <Card><h4>Top failing rules</h4>{failing.slice(0, 5).map((f: any, i: number) => <div key={i}>{f.rule} ({f.failures})</div>)}</Card>
    </div>
    <Card style={{} as any}><h4>Failing rows sample</h4><pre>{failing[0]?.failing_rows_json ?? '[]'}</pre></Card>
  </div>
}
