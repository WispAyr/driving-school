import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Search, Star, Users, Award, MapPin, ArrowRight, Car, Shield, Clock, CheckCircle } from 'lucide-react';

export default function Home() {
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { api.get('/public/schools').then(setSchools).catch(() => {}); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/schools?area=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Find Your Perfect<br />
              <span className="text-blue-300">Driving Instructor</span>
            </h1>
            <p className="text-xl text-blue-200 mb-8 max-w-xl">
              Compare driving schools, read reviews, and book lessons with qualified instructors near you.
            </p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-lg">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your area or postcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
              <button type="submit" className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2">
                <Search className="w-5 h-5" /> Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, label: 'Qualified Instructors', value: '50+' },
            { icon: Award, label: 'Average Pass Rate', value: '92%' },
            { icon: Star, label: 'Student Reviews', value: '4.8★' },
            { icon: Car, label: 'Schools Registered', value: `${schools.length || '10'}+` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <Icon className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Verified Instructors', desc: 'All instructors are ADI qualified and DBS checked. View their badge numbers, grades, and pass rates.' },
              { icon: Clock, title: 'Flexible Booking', desc: 'Book individual lessons or save with block packages. Intensive courses available for fast-track learners.' },
              { icon: CheckCircle, title: 'Proven Results', desc: 'Track record of high pass rates. Read genuine reviews from students who passed their test.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-sm border hover:shadow-md transition">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schools List */}
      {schools.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Featured Driving Schools</h2>
              <Link to="/schools" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schools.slice(0, 6).map((school) => (
                <Link key={school.id} to={`/school/${school.slug}`} className="bg-white rounded-2xl shadow-sm border hover:shadow-lg transition overflow-hidden group">
                  <div className="h-3" style={{ backgroundColor: school.primary_color || '#2563eb' }}></div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-1 group-hover:text-blue-600 transition">{school.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <MapPin className="w-4 h-4" /> {school.city || 'UK'}
                      {school.avg_rating && <span className="ml-auto flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {school.avg_rating.toFixed(1)}</span>}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {school.areas?.slice(0, 4).map(a => (
                        <span key={a} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{a}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{school.instructor_count} instructor{school.instructor_count !== 1 ? 's' : ''}</span>
                      {school.pass_rate && <span className="font-semibold text-green-600">{school.pass_rate}% pass rate</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA for schools */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Run a Driving School?</h2>
          <p className="text-blue-200 text-lg mb-8">Join our platform to manage your instructors, attract new students, and grow your business. Full management tools included.</p>
          <Link to="/register" className="inline-block bg-orange-500 hover:bg-orange-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition">
            Register Your School
          </Link>
        </div>
      </section>
    </div>
  );
}
