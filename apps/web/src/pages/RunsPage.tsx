import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
export function RunsPage(){
  const qc = useQueryClient()
  const runs = useQuery({queryKey:['runs'], queryFn: async()=> (await api.get('/runs')).data})
  const createRun = useMutation({mutationFn: async()=> (await api.post('/runs',{pipeline_name:'demo'})).data, onSuccess:()=>qc.invalidateQueries({queryKey:['runs']})})
  return <div><h2>Runs</h2><button onClick={()=>createRun.mutate()}>Run pipeline</button>{runs.data?.map((r:any)=><div key={r.id}>#{r.id} {r.status} {r.logs}</div>)}</div>
}
