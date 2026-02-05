import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import { Button, Card, PageHeader, Table } from '../components/ui'

const users = [{ user: 'admin', role: 'admin' }, { user: 'analyst', role: 'analyst' }, { user: 'intern', role: 'viewer' }]

export function AdminPage() {
  const qc = useQueryClient()
  const seed = useMutation({ mutationFn: async () => (await api.post('/admin/demo/seed')).data, onSuccess: () => qc.invalidateQueries() })
  const reset = useMutation({ mutationFn: async () => (await api.post('/admin/demo/reset')).data, onSuccess: () => qc.invalidateQueries() })
  return <div>
    <PageHeader title='Admin' subtitle='Role management and demo data controls' actions={<><Button onClick={() => seed.mutate()}>Seed demo data</Button><Button onClick={() => reset.mutate()}>Reset demo data</Button></>} />
    <Card><Table><thead><tr><th>User</th><th>Role</th></tr></thead><tbody>{users.map((u) => <tr key={u.user}><td>{u.user}</td><td>{u.role}</td></tr>)}</tbody></Table></Card>
  </div>
}
