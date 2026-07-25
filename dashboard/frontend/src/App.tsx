import { Link, Route, Routes } from 'react-router-dom';
import './App.css';
import { RunHistoryPage } from './pages/RunHistoryPage';
import { RunDetailPage } from './pages/RunDetailPage';

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/">
          <h1>TFC Playwright Dashboard</h1>
        </Link>
      </header>
      <Routes>
        <Route path="/" element={<RunHistoryPage />} />
        <Route path="/runs/:runId" element={<RunDetailPage />} />
      </Routes>
    </div>
  );
}
