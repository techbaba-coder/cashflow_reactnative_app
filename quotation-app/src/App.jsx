import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Particulars from './pages/Particulars';
import QuotationForm from './pages/QuotationForm';
import QuotationDetail from './pages/QuotationDetail';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"                element={<Dashboard />}       />
          <Route path="/particulars"     element={<Particulars />}     />
          <Route path="/new"             element={<QuotationForm />}   />
          <Route path="/quotation/:id"   element={<QuotationDetail />} />
          <Route path="/settings"        element={<Settings />}        />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
