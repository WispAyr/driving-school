import React, { useState, useEffect } from 'react';
import { api, getUser } from '../../api';
import { MapPin, Plus } from 'lucide-react';

export default function AdminAreas() {
  const [areas, setAreas] = useState([]);
  const user = getUser();
  useEffect(() => { api.get(`/areas?tenant_id=${user?.tenant_id || ''}`).then(setAreas).catch(() => {}); }, []);

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) return <div className="p-8 text-center text-gray-500">Admin access required.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Coverage Areas</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {areas.map(a => (
          <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
            <div><p className="font-medium">{a.name}</p>{a.region && <p className="text-xs text-gray-500">{a.region}</p>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
