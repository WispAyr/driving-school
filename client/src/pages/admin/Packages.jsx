import React, { useState, useEffect } from 'react';
import { api, getUser } from '../../api';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const user = getUser();
  useEffect(() => { api.get(`/packages?tenant_id=${user?.tenant_id || ''}`).then(setPackages).catch(() => {}); }, []);

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) return <div className="p-8 text-center text-gray-500">Admin access required.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Lesson Packages</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">Package</th><th className="text-left p-3">Lessons</th><th className="text-left p-3">Price</th><th className="text-left p-3">Type</th><th className="text-left p-3">Transmission</th><th className="text-left p-3">Intensive</th></tr></thead>
          <tbody>
            {packages.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3"><div className="font-medium">{p.name}</div><div className="text-xs text-gray-400">{p.description}</div></td>
                <td className="p-3">{p.lesson_count}</td>
                <td className="p-3 font-semibold">£{p.price}</td>
                <td className="p-3 capitalize">{p.package_type}</td>
                <td className="p-3 capitalize">{p.transmission}</td>
                <td className="p-3">{p.intensive ? '✓' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
