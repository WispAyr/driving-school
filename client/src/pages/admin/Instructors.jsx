import React, { useState, useEffect } from 'react';
import { api, getUser } from '../../api';
import { Users, Star } from 'lucide-react';

export default function AdminInstructors() {
  const [instructors, setInstructors] = useState([]);
  const user = getUser();

  useEffect(() => { api.get('/instructors').then(setInstructors).catch(() => {}); }, []);

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) return <div className="p-8 text-center text-gray-500">Admin access required.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Instructors</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Transmission</th><th className="text-left p-3">Pass Rate</th><th className="text-left p-3">Rate</th><th className="text-left p-3">Status</th></tr></thead>
          <tbody>
            {instructors.map(i => (
              <tr key={i.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{i.name}</td>
                <td className="p-3 text-gray-500">{i.email}</td>
                <td className="p-3">{i.phone}</td>
                <td className="p-3 capitalize">{i.transmission_types}</td>
                <td className="p-3">{i.pass_rate ? `${i.pass_rate}%` : '-'}</td>
                <td className="p-3">£{i.hourly_rate}/hr</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${i.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{i.active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
