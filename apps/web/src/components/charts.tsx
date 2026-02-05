import { Card } from './ui'

type Point = { label: string; value: number }

export function MiniLineChart({ title, data, stroke = '#0ea5e9' }: { title: string; data: Point[]; stroke?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const points = data
    .map((d, i) => `${(i / Math.max(data.length - 1, 1)) * 100},${90 - (d.value / max) * 70}`)
    .join(' ')
  return (
    <Card>
      <h4>{title}</h4>
      <svg viewBox='0 0 100 100' style={{ width: '100%', height: 180 }}>
        <polyline fill='none' stroke={stroke} strokeWidth='2.5' points={points} />
      </svg>
      <div className='small' style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{data[0]?.label}</span><span>{data[data.length - 1]?.label}</span>
      </div>
    </Card>
  )
}

export function MiniBarChart({ title, data, fill = '#f97316' }: { title: string; data: Point[]; fill?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const width = 100 / Math.max(data.length, 1)
  return (
    <Card>
      <h4>{title}</h4>
      <svg viewBox='0 0 100 100' style={{ width: '100%', height: 180 }}>
        {data.map((d, i) => {
          const h = (d.value / max) * 75
          return <rect key={d.label} x={i * width + 1} y={92 - h} width={Math.max(width - 2, 1)} height={h} fill={fill} rx='1' />
        })}
      </svg>
      <div className='small' style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{data[0]?.label}</span><span>{data[data.length - 1]?.label}</span>
      </div>
    </Card>
  )
}
