import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
export function OverviewPage(){
  const runs = useQuery({queryKey:['runs'], queryFn: async()=> (await api.get('/runs')).data})
  const quality = useQuery({queryKey:['quality'], queryFn: async()=> (await api.get('/quality')).data})
  return <div><h2>Overview</h2><div>Runs: {runs.data?.length ?? 0}</div><div>Quality checks: {quality.data?.length ?? 0}</div></div>
}
