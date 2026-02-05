import React, { ReactNode } from 'react'

export const Button = ({ children, primary, onClick }: { children: ReactNode; primary?: boolean; onClick?: () => void }) => (
  <button className={`btn ${primary ? 'primary' : 'ghost'}`} onClick={onClick}>{children}</button>
)

export const Card = ({ children, style }: { children: ReactNode; style?: React.CSSProperties }) => <div className='card' style={style}>{children}</div>

export const Badge = ({ text, tone }: { text: string; tone: 'success' | 'failed' | 'running' }) => <span className={`badge ${tone}`}>{text}</span>

export const Table = ({ children }: { children: ReactNode }) => <table className='table'>{children}</table>

export const Tabs = ({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (v: string) => void }) => (
  <div className='tabs'>{tabs.map((t) => <Button key={t} onClick={() => onChange(t)}>{value === t ? `● ${t}` : t}</Button>)}</div>
)

export const Modal = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) => !open ? null : (
  <div className='modal-backdrop' onClick={onClose}><div className='modal card' onClick={(e) => e.stopPropagation()}>{children}</div></div>
)

export const Tooltip = ({ text }: { text: string }) => <span className='small'>{text}</span>
export const Skeleton = () => <div className='skeleton' />
export const Toast = ({ message }: { message: string }) => <div className='toast'>{message}</div>

export const PageHeader = ({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) => (
  <div className='topbar'><div><h2 style={{ margin: 0 }}>{title}</h2><div className='small'>{subtitle}</div></div><div style={{ display: 'flex', gap: 8 }}>{actions}</div></div>
)

export const StatCard = ({ label, value, delta }: { label: string; value: string; delta: string }) => (
  <Card><div className='small'>{label}</div><div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span className='small'>{delta}</span><span className='small'>▁▃▅▂▆</span></div></Card>
)
