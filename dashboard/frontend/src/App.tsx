import { NavLink, Route, Routes } from 'react-router-dom';
import './App.css';
import { OverviewPage } from './pages/OverviewPage';
import { RunHistoryPage } from './pages/RunHistoryPage';
import { RunDetailPage } from './pages/RunDetailPage';
import { ConnectionBadge } from './components/ConnectionBadge';
import { AutoUpdateBadge } from './components/AutoUpdateBadge';
import { UpdateBanner } from './components/UpdateBanner';
import { AppliedFixesBanner } from './components/AppliedFixesBanner';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">▶</span>
          <span className="sidebar-title">
            I Want TFC v2
            <small>Playwright Dashboard</small>
          </span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">◆</span> Overview
          </NavLink>
          <NavLink to="/runs" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <span className="sidebar-link-icon">☰</span> Run history
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-badges">
            <ConnectionBadge />
            <AutoUpdateBadge />
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </aside>

      <main className="app-main">
        <UpdateBanner />
        <AppliedFixesBanner />
        <Routes>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/runs" element={<RunHistoryPage />} />
          <Route path="/runs/:runId" element={<RunDetailPage />} />
        </Routes>
      </main>
    </div>
  );
}
