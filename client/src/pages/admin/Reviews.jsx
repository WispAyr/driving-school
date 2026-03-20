import React, { useState, useEffect } from 'react';
import { api, getUser } from '../../api';
import { Star, Check, Trash2 } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const user = getUser();
  useEffect(() => { load(); }, []);
  const load = () => api.get(`/reviews?tenant_id=${user?.tenant_id || ''}`).then(setReviews).catch(() => {});

  const approve = async (id) => { await api.put(`/reviews/${id}/approve`); load(); };
  const remove = async (id) => { if (confirm('Delete review?')) { await api.delete(`/reviews/${id}`); load(); } };

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) return <div className="p-8 text-center text-gray-500">Admin access required.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>
      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className={`bg-white rounded-xl p-4 shadow-sm border ${!r.approved ? 'border-yellow-300' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.student_name}</span>
                <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />)}</div>
                {!r.approved && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>}
              </div>
              <div className="flex gap-2">
                {!r.approved && <button onClick={() => approve(r.id)} className="text-green-600 hover:text-green-800"><Check className="w-4 h-4" /></button>}
                <button onClick={() => remove(r.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {r.title && <p className="font-medium text-sm">{r.title}</p>}
            <p className="text-sm text-gray-600">{r.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
