import { useQuery } from '@tanstack/react-query'

import { api } from '../api/client'

export function QualityPage() {
  const q = useQuery({
    queryKey: ['quality'],
    queryFn: async () => (await api.get('/quality')).data,
  })

  return (
    <div>
      <h2>Quality</h2>
      {q.data?.map((d: any, idx: number) => (
        <div key={idx}>
          {d.dataset}: {d.rule} {'->'} {d.passed ? 'pass' : 'fail'} ({d.failures})
        </div>
      ))}
    </div>
  )
}
