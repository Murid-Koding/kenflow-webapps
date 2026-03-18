import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { MonthlyEvaluationPage } from './pages/MonthlyEvaluationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/evaluation/:year/:month" element={<MonthlyEvaluationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
