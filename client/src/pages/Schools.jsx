import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { MapPin, Star, Users, Search } from 'lucide-react';

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [searchParams] = useSearchParams();
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => { api.get('/public/schools').then(s => { setSchools(s); setFiltered(s); }).catch(() => {}); }, []);

  useEffect(() => {
    if (!area) { setFiltered(schools); return; }
    const q = area.toLowerCase();
    setFiltered(schools.filter(s => s.areas?.some(a => a.toLowerCase().includes(q)) || s.city?.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)));
  }, [area, schools]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Find a Driving School</h1>
      <p className="text-gray-600 mb-6">Browse driving schools and compare instructors, prices, and reviews.</p>
      
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Search by area or school name..." value={area} onChange={e => setArea(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 py-12 text-center">No schools found. Try a different search term.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(school => (
            <Link key={school.id} to={`/school/${school.slug}`} className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition overflow-hidden group">
              <div className="h-2" style={{ backgroundColor: school.primary_color }}></div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-1 group-hover:text-blue-600">{school.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4" /> {school.city || 'UK'}
                  {school.avg_rating && <span className="ml-auto flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {school.avg_rating.toFixed(1)} ({school.review_count})</span>}
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {school.areas?.slice(0, 5).map(a => <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>)}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500"><Users className="w-4 h-4 inline mr-1" />{school.instructor_count} instructors</span>
                  {school.pass_rate && <span className="font-semibold text-green-600">{school.pass_rate}% pass rate</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
