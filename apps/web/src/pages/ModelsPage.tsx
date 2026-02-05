import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
export function ModelsPage(){
  const q = useQuery({queryKey:['models'], queryFn: async()=> (await api.get('/models')).data})
  return <div><h2>Models</h2>{q.data?.map((m:any)=><div key={m.id}>{m.name} [{m.stage}] acc={m.accuracy}</div>)}</div>
}
