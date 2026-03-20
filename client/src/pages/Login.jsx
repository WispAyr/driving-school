import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, setAuth } from '../api';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user, token } = await api.post('/auth/login', { email, password });
      setAuth(token, user);
      navigate(user.role === 'superadmin' || user.role === 'admin' ? '/dashboard' : '/');
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"><LogIn className="w-5 h-5" /> Sign In</button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link></p>
        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Demo Accounts:</p>
          <p>Super Admin: admin@drivingschool.local-connect.uk / admin123</p>
          <p>School Admin: admin@ayrdrivingschool.co.uk / admin123</p>
        </div>
      </div>
    </div>
  );
}
