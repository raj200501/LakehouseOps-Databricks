import { useEffect, useMemo, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { OverviewPage } from './pages/OverviewPage'
import { RunsPage } from './pages/RunsPage'
import { TablesPage } from './pages/TablesPage'
import { QualityPage } from './pages/QualityPage'
import { LineagePage } from './pages/LineagePage'
import { ModelsPage } from './pages/ModelsPage'
import { AdminPage } from './pages/AdminPage'
import { Button } from './components/ui'

export function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') ?? 'light')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const nav = useMemo(
    () => [
      ['/', 'Overview'], ['/runs', 'Runs'], ['/tables', 'Tables'], ['/quality', 'Quality'], ['/lineage', 'Lineage'], ['/models', 'Models'], ['/admin', 'Admin'],
    ],
    [],
  )
  return <div className='shell'>
    <aside className='sidebar'>
      <h3 style={{ marginTop: 0 }}>🧱 LakehouseOps</h3>
      {nav.map(([to, label]) => <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>{label}</NavLink>)}
    </aside>
    <main className='main'>
      <div className='topbar'><div className='small'>Env: Demo • Workspace: Databricks Summer Lab</div><div style={{ display: 'flex', gap: 8 }}><input placeholder='Search assets...' style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} /><Button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</Button></div></div>
      <Routes>
        <Route path='/' element={<OverviewPage />} />
        <Route path='/runs' element={<RunsPage />} />
        <Route path='/runs/:runId' element={<RunsPage />} />
        <Route path='/tables' element={<TablesPage />} />
        <Route path='/quality' element={<QualityPage />} />
        <Route path='/lineage' element={<LineagePage />} />
        <Route path='/models' element={<ModelsPage />} />
        <Route path='/admin' element={<AdminPage />} />
      </Routes>
    </main>
  </div>
}
