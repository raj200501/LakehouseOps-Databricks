import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
export function TablesPage(){
  const q = useQuery({queryKey:['datasets'], queryFn: async()=> (await api.get('/datasets')).data})
  return <div><h2>Tables</h2>{q.data?.map((d:any)=><div key={d.id}>{d.layer}.{d.name}</div>)}</div>
}
