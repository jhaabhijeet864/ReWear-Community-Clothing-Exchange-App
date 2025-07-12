import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login, Register, Landing, ItemEdit, Dashboard, ProductDetail, AdminPanel } from './pages/index';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/item/edit" element={<ItemEdit />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
