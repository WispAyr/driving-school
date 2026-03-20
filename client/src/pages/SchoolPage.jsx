import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { Star, MapPin, Phone, Mail, Globe, Award, Car, Clock, CheckCircle, Send, User } from 'lucide-react';

function Stars({ rating }) {
  return <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />)}</div>;
}

export default function SchoolPage() {
  const { slug } = useParams();
  const [school, setSchool] = useState(null);
  const [tab, setTab] = useState('overview');
  const [booking, setBooking] = useState({ name: '', email: '', phone: '', transmission: 'manual', pickup_postcode: '', notes: '', preferred_date: '', preferred_time: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get(`/public/school/${slug}`).then(setSchool).catch(() => {}); }, [slug]);

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bookings', { ...booking, tenant_id: school.id, booking_type: 'enquiry' });
      setSubmitted(true);
    } catch (err) { setError(err.message); }
  };

  if (!school) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  const tabs = ['overview', 'instructors', 'packages', 'reviews', 'areas', 'theory', 'book'];

  return (
    <div>
      {/* School Header */}
      <div className="text-white py-12" style={{ background: `linear-gradient(135deg, ${school.primary_color}, ${school.secondary_color})` }}>
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold mb-2">{school.name}</h1>
          <p className="text-xl opacity-90 mb-4">{school.tagline}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            {school.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {school.city}, {school.postcode}</span>}
            {school.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {school.phone}</span>}
            {school.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {school.email}</span>}
            {school.pass_rate && <span className="flex items-center gap-1"><Award className="w-4 h-4" /> {school.pass_rate}% pass rate</span>}
            {school.review_stats?.avg_rating && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-current" /> {school.review_stats.avg_rating.toFixed(1)} ({school.review_stats.total} reviews)</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition capitalize whitespace-nowrap ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview */}
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h2 className="text-2xl font-bold mb-4">About {school.name}</h2>
                <p className="text-gray-700 leading-relaxed">{school.about || school.description}</p>
                {school.founded_year && <p className="text-sm text-gray-500 mt-4">Established {school.founded_year}</p>}
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold mb-4">What We Offer</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {['Manual & Automatic Lessons', 'Block Booking Discounts', 'Intensive Courses', 'Theory Test Support', 'Pass Plus Courses', 'Flexible Scheduling', 'Patient Instructors', 'Door-to-Door Pickup'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {f}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="font-bold mb-3">Quick Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Instructors</span><span className="font-semibold">{school.instructors?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Pass Rate</span><span className="font-semibold text-green-600">{school.pass_rate || 'N/A'}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Total Passes</span><span className="font-semibold">{school.total_passes?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Areas Covered</span><span className="font-semibold">{school.areas?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Rating</span><span className="font-semibold">{school.review_stats?.avg_rating?.toFixed(1) || 'N/A'} ★</span></div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Book a Lesson</h3>
                <p className="text-sm text-blue-700 mb-4">Get started with your first lesson today.</p>
                <button onClick={() => setTab('book')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition">
                  Enquire Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructors */}
        {tab === 'instructors' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Instructors</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {school.instructors?.map(inst => (
                <div key={inst.id} className="bg-white rounded-2xl p-6 shadow-sm border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{inst.name}</h3>
                      <p className="text-sm text-gray-500">{inst.adi_grade ? `Grade ${inst.adi_grade} ADI` : 'Approved Instructor'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{inst.bio}</p>
                  <div className="space-y-2 text-sm">
                    {inst.experience_years > 0 && <div className="flex justify-between"><span className="text-gray-500">Experience</span><span>{inst.experience_years} years</span></div>}
                    {inst.pass_rate && <div className="flex justify-between"><span className="text-gray-500">Pass Rate</span><span className="text-green-600 font-semibold">{inst.pass_rate}%</span></div>}
                    {inst.total_passes > 0 && <div className="flex justify-between"><span className="text-gray-500">Students Passed</span><span>{inst.total_passes}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500">Transmission</span><span className="capitalize">{inst.transmission_types}</span></div>
                    {inst.car_make && <div className="flex justify-between"><span className="text-gray-500">Car</span><span>{inst.car_make} {inst.car_model}</span></div>}
                    {inst.hourly_rate && <div className="flex justify-between"><span className="text-gray-500">From</span><span className="font-bold text-lg">£{inst.hourly_rate}/hr</span></div>}
                  </div>
                  {inst.areas?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {inst.areas.map(a => <span key={a.name} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{a.name}</span>)}
                    </div>
                  )}
                  {inst.specialities && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {inst.specialities.split(',').map(s => <span key={s} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{s.trim()}</span>)}
                    </div>
                  )}
                  {inst.avg_rating && (
                    <div className="mt-3 flex items-center gap-2">
                      <Stars rating={Math.round(inst.avg_rating)} />
                      <span className="text-sm text-gray-500">({inst.review_count} reviews)</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Packages */}
        {tab === 'packages' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Lesson Packages & Pricing</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {school.packages?.map(pkg => (
                <div key={pkg.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${pkg.intensive ? 'ring-2 ring-orange-400' : ''}`}>
                  {pkg.intensive ? <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">Intensive</span> : null}
                  {pkg.discount_percent > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium ml-1">Save {pkg.discount_percent}%</span>}
                  <h3 className="text-xl font-bold mt-2">{pkg.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 mb-4">{pkg.description}</p>
                  <p className="text-3xl font-extrabold text-blue-600">£{pkg.price}</p>
                  <div className="text-sm text-gray-500 mt-1 mb-4">
                    {pkg.lesson_count} {pkg.lesson_count === 1 ? 'lesson' : 'lessons'} · {pkg.duration_hours}hrs · {pkg.transmission}
                  </div>
                  <button onClick={() => setTab('book')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition">
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {tab === 'reviews' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
            {school.review_stats?.avg_rating && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-blue-600">{school.review_stats.avg_rating.toFixed(1)}</p>
                  <Stars rating={Math.round(school.review_stats.avg_rating)} />
                  <p className="text-sm text-gray-500 mt-1">{school.review_stats.total} reviews</p>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {school.reviews?.map(r => (
                <div key={r.id} className="bg-white rounded-xl p-5 shadow-sm border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold">{r.student_name}</span>
                      {r.passed ? <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Passed</span> : null}
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  {r.title && <p className="font-medium mb-1">{r.title}</p>}
                  <p className="text-gray-600 text-sm">{r.content}</p>
                  {r.test_center && <p className="text-xs text-gray-400 mt-2">Test centre: {r.test_center}</p>}
                  {r.instructor_name && <p className="text-xs text-gray-400">Instructor: {r.instructor_name}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas */}
        {tab === 'areas' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Areas We Cover</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {school.areas?.map(a => (
                <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm border flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{a.name}</p>
                    {a.region && <p className="text-xs text-gray-500">{a.region}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Theory */}
        {tab === 'theory' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Theory Test Practice</h2>
            <p className="text-gray-600 mb-6">Practice theory questions to prepare for your test.</p>
            <a href="/theory" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium">Go to Theory Practice</a>
          </div>
        )}

        {/* Booking */}
        {tab === 'book' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Book a Lesson / Enquire</h2>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-800 mb-2">Enquiry Submitted!</h3>
                <p className="text-green-700">We'll be in touch shortly to arrange your lessons.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
                {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                    <input required type="text" value={booking.name} onChange={e => setBooking({...booking, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input required type="email" value={booking.email} onChange={e => setBooking({...booking, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input type="tel" value={booking.phone} onChange={e => setBooking({...booking, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Pickup Postcode</label>
                    <input type="text" value={booking.pickup_postcode} onChange={e => setBooking({...booking, pickup_postcode: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Transmission</label>
                    <select value={booking.transmission} onChange={e => setBooking({...booking, transmission: e.target.value})} className="w-full border rounded-lg px-3 py-2">
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Preferred Date</label>
                    <input type="date" value={booking.preferred_date} onChange={e => setBooking({...booking, preferred_date: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Preferred Time</label>
                    <input type="time" value={booking.preferred_time} onChange={e => setBooking({...booking, preferred_time: e.target.value})} className="w-full border rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea rows={3} value={booking.notes} onChange={e => setBooking({...booking, notes: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Any additional information..."></textarea>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" /> Submit Enquiry
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
