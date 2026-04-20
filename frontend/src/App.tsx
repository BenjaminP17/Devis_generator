import { BrowserRouter, Routes, Route } from 'react-router-dom';

/**
 * Root component — router and global layout will be wired here.
 * Feature pages will be added in development phase.
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes will be registered here during feature development */}
        <Route
          path="*"
          element={
            <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-brand-400">Générateur de Devis</h1>
                <p className="mt-4 text-slate-400">
                  L'environnement est opérationnel. Les fonctionnalités arrivent bientôt.
                </p>
              </div>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
