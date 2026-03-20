import React, { useState, useEffect } from 'react';
import { api, getUser } from '../../api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const user = getUser();
  useEffect(() => { api.get('/admin/users').then(setUsers).catch(() => {}); }, []);

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) return <div className="p-8 text-center text-gray-500">Admin access required.</div>;

  const toggleActive = async (id, active) => {
    await api.put(`/admin/users/${id}`, { active: active ? 0 : 1 });
    setUsers(users.map(u => u.id === id ? { ...u, active: active ? 0 : 1 } : u));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Role</th><th className="text-left p-3">Status</th><th className="text-left p-3">Joined</th><th className="p-3"></th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-gray-500">{u.email}</td>
                <td className="p-3"><span className="capitalize text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{u.role}</span></td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${u.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{u.active ? 'Active' : 'Disabled'}</span></td>
                <td className="p-3 text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="p-3"><button onClick={() => toggleActive(u.id, u.active)} className="text-xs text-gray-500 hover:text-gray-800">{u.active ? 'Disable' : 'Enable'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
