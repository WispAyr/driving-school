import React, { useState, useEffect } from 'react';
import { api, getUser } from '../api';
import { Users, BookOpen, Star, TrendingUp, Clock, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const user = getUser();

  useEffect(() => { api.get('/dashboard').then(setStats).catch(() => {}); }, []);

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
    return <div className="p-8 text-center text-gray-500">Access denied. Admin login required.</div>;
  }

  if (!stats) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  const cards = [
    { label: 'Instructors', value: stats.instructors, icon: Users, color: 'blue' },
    { label: 'Students', value: stats.students, icon: Users, color: 'green' },
    { label: 'Total Bookings', value: stats.bookings_total, icon: BookOpen, color: 'purple' },
    { label: 'Pending Bookings', value: stats.bookings_pending, icon: Clock, color: 'orange' },
    { label: 'Reviews', value: stats.reviews_total, icon: Star, color: 'yellow' },
    { label: 'Avg Rating', value: stats.avg_rating?.toFixed(1) || 'N/A', icon: TrendingUp, color: 'indigo' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border">
            <c.icon className={`w-5 h-5 text-${c.color}-600 mb-2`} />
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      {stats.bookings_pending > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <span className="text-sm text-orange-800">You have {stats.bookings_pending} pending booking{stats.bookings_pending !== 1 ? 's' : ''} to review.</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        <h2 className="text-lg font-bold p-4 border-b">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Type</th><th className="text-left p-3">Status</th><th className="text-left p-3">Date</th></tr></thead>
            <tbody>
              {stats.recent_bookings?.map(b => (
                <tr key={b.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{b.name}</td>
                  <td className="p-3 text-gray-500">{b.email}</td>
                  <td className="p-3"><span className="capitalize text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{b.booking_type}</span></td>
                  <td className="p-3"><span className={`capitalize text-xs px-2 py-0.5 rounded-full ${b.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : b.status === 'confirmed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{b.status}</span></td>
                  <td className="p-3 text-gray-500">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
