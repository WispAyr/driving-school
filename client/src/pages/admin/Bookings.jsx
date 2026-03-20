import React, { useState, useEffect } from 'react';
import { api, getUser } from '../../api';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const user = getUser();
  useEffect(() => { api.get('/bookings').then(setBookings).catch(() => {}); }, []);

  const updateStatus = async (id, status) => {
    await api.put(`/bookings/${id}`, { status });
    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
  };

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) return <div className="p-8 text-center text-gray-500">Admin access required.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bookings & Enquiries</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Type</th><th className="text-left p-3">Transmission</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{b.name}</td>
                <td className="p-3 text-gray-500">{b.email}</td>
                <td className="p-3">{b.phone || '-'}</td>
                <td className="p-3 capitalize">{b.booking_type}</td>
                <td className="p-3 capitalize">{b.transmission}</td>
                <td className="p-3"><span className={`capitalize text-xs px-2 py-0.5 rounded-full ${b.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : b.status === 'confirmed' ? 'bg-green-50 text-green-700' : b.status === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{b.status}</span></td>
                <td className="p-3 text-gray-500 text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-center">
                  {b.status === 'pending' && (
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => updateStatus(b.id, 'confirmed')} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Confirm</button>
                      <button onClick={() => updateStatus(b.id, 'cancelled')} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Cancel</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
