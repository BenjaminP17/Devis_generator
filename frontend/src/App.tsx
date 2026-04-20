import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import QuoteGeneratorPage from './pages/QuoteGenerator/index';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<QuoteGeneratorPage />} />
        <Route path="/devis"  element={<QuoteGeneratorPage />} />
        {/* Redirect any unknown route to the generator */}
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
