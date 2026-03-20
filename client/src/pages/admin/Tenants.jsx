import React, { useState, useEffect } from 'react';
import { api, getUser } from '../../api';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

export default function AdminTenants() {
  const [tenants, setTenants] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', phone: '', email: '', city: '', postcode: '', tagline: '', primary_color: '#2563eb' });
  const user = getUser();
  if (user?.role !== 'superadmin') return <div className="p-8 text-center text-gray-500">Super admin access required.</div>;

  useEffect(() => { api.get('/tenants').then(setTenants).catch(() => {}); }, []);

  const save = async () => {
    try {
      if (editing) { await api.put(`/tenants/${editing}`, form); }
      else { await api.post('/tenants', form); }
      api.get('/tenants').then(setTenants);
      setEditing(null); setForm({ name: '', description: '', phone: '', email: '', city: '', postcode: '', tagline: '', primary_color: '#2563eb' });
    } catch (e) { alert(e.message); }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Schools</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '', phone: '', email: '', city: '', postcode: '', tagline: '', primary_color: '#2563eb' }); document.getElementById('tenantModal').showModal(); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Add School</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">School</th><th className="text-left p-3">City</th><th className="text-left p-3">Email</th><th className="text-left p-3">Plan</th><th className="text-left p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-3"><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: t.primary_color}}></div><span className="font-medium">{t.name}</span></div><div className="text-xs text-gray-400">{t.slug}</div></td>
                <td className="p-3">{t.city}</td>
                <td className="p-3 text-gray-500">{t.email}</td>
                <td className="p-3"><span className="capitalize text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{t.plan}</span></td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${t.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{t.active ? 'Active' : 'Inactive'}</span></td>
                <td className="p-3 text-right"><button onClick={() => { setEditing(t.id); setForm(t); document.getElementById('tenantModal').showModal(); }} className="text-blue-600 hover:text-blue-800 mr-2"><Edit className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dialog id="tenantModal" className="rounded-2xl p-6 w-full max-w-lg backdrop:bg-black/50">
        <h2 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'Add'} School</h2>
        <div className="space-y-3">
          {['name', 'email', 'phone', 'city', 'postcode', 'tagline', 'description'].map(f => (
            <div key={f}><label className="block text-sm font-medium mb-1 capitalize">{f}</label>
            {f === 'description' ? <textarea value={form[f]||''} onChange={e => setForm({...form, [f]: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" rows={2}></textarea>
            : <input type="text" value={form[f]||''} onChange={e => setForm({...form, [f]: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm" />}</div>
          ))}
          <div><label className="block text-sm font-medium mb-1">Primary Color</label><input type="color" value={form.primary_color} onChange={e => setForm({...form, primary_color: e.target.value})} className="w-12 h-8" /></div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
          <button onClick={() => document.getElementById('tenantModal').close()} className="bg-gray-200 px-4 py-2 rounded-lg text-sm">Cancel</button>
        </div>
      </dialog>
    </div>
  );
}
