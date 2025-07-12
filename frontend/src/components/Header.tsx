
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="w-full bg-white shadow flex items-center justify-between px-8 py-4 mb-8">
    <div className="text-2xl font-bold text-blue-700">
      <Link to="/">ReWear</Link>
    </div>
    <nav className="flex gap-4">
      <Link className="hover:text-blue-600" to="/">Home</Link>
      <Link className="hover:text-blue-600" to="/dashboard">Dashboard</Link>
      <Link className="hover:text-blue-600" to="/admin">Admin</Link>
      <Link className="hover:text-blue-600" to="/login">Login</Link>
      <Link className="hover:text-blue-600" to="/register">Sign Up</Link>
    </nav>
  </header>
);

export default Header; 