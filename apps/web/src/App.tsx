import { Link, Route, Routes } from 'react-router-dom'
import { OverviewPage } from './pages/OverviewPage'
import { RunsPage } from './pages/RunsPage'
import { TablesPage } from './pages/TablesPage'
import { QualityPage } from './pages/QualityPage'
import { LineagePage } from './pages/LineagePage'
import { ModelsPage } from './pages/ModelsPage'
import { AdminPage } from './pages/AdminPage'

export function App() {
  const nav = ['/', '/runs', '/tables', '/quality', '/lineage', '/models', '/admin']
  return <div style={{fontFamily:'Inter, sans-serif', padding:16}}>
    <h1>LakehouseOps Dashboard</h1>
    <div style={{display:'flex', gap:12, marginBottom:16}}>{nav.map((n)=><Link key={n} to={n}>{n === '/' ? 'overview' : n.slice(1)}</Link>)}</div>
    <Routes>
      <Route path='/' element={<OverviewPage/>} />
      <Route path='/runs' element={<RunsPage/>} />
      <Route path='/tables' element={<TablesPage/>} />
      <Route path='/quality' element={<QualityPage/>} />
      <Route path='/lineage' element={<LineagePage/>} />
      <Route path='/models' element={<ModelsPage/>} />
      <Route path='/admin' element={<AdminPage/>} />
    </Routes>
  </div>
}
