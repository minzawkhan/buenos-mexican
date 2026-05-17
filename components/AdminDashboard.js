'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'today'
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setBookings(data);
      }
      setLoading(false);
    };

    fetchBookings();

    // Subscribe to Realtime changes
    const channel = supabase
      .channel('admin-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          console.log('Change received!', payload);
          if (payload.eventType === 'INSERT') {
            setBookings((prev) => [payload.new, ...prev]);
            // Play notification sound
            if (audioRef.current) {
              audioRef.current.play().catch(e => console.log('Audio play blocked:', e));
            }
          } else if (payload.eventType === 'UPDATE') {
            setBookings((prev) =>
              prev.map((b) => (b.id === payload.new.id ? payload.new : b))
            );
          } else if (payload.eventType === 'DELETE') {
            setBookings((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  const updateStatus = async (id, status) => {
    await supabase.from('bookings').update({ status }).eq('id', id);
  };

  const deleteBooking = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this booking?')) {
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) alert('Error deleting booking: ' + error.message);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const filteredBookings = filter === 'today' 
    ? bookings.filter(b => b.date === getTodayDate())
    : bookings;

  return (
    <div className="admin-dashboard py-8 text-white relative z-10">
      {/* Background Overlay for Readability */}
      <div className="fixed inset-0 bg-black/70 -z-10 backdrop-blur-sm pointer-events-none"></div>
      
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 bg-black/40 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 shadow-2xl">
          <div>
            <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-primary via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tighter">Live Bookings</h1>
            <p className="text-gray-400 text-lg font-medium">Monitor and manage reservations in real-time.</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex bg-black/60 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
              <button 
                onClick={() => setFilter('all')}
                className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${filter === 'all' ? 'bg-primary text-white shadow-[0_0_25px_rgba(255,51,51,0.4)] scale-105' : 'text-gray-500 hover:text-gray-300'}`}
              >
                All Time
              </button>
              <button 
                onClick={() => setFilter('today')}
                className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${filter === 'today' ? 'bg-primary text-white shadow-[0_0_25px_rgba(255,51,51,0.4)] scale-105' : 'text-gray-500 hover:text-gray-300'}`}
              >
                Today Only
              </button>
            </div>
            
            <span className="bg-green-500/10 text-green-500 px-6 py-3 rounded-2xl text-sm font-black border border-green-500/20 flex items-center gap-3 backdrop-blur-md">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_#22c55e]"></span>
              Live Feed
            </span>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[40px] p-10 flex flex-col lg:flex-row justify-between items-center gap-10 hover:border-primary/40 transition-all group relative shadow-2xl overflow-hidden"
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-3 ${
                    booking.status === 'confirmed' ? 'bg-green-500 shadow-[0_0_30px_#22c55e]' : 
                    booking.status === 'pending' ? 'bg-orange-500 shadow-[0_0_30px_#f97316]' : 'bg-red-500 shadow-[0_0_30px_#ef4444]'
                  }`} />

                  <div className="flex flex-col md:flex-row items-center gap-10 w-full">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-orange-500/10 rounded-[32px] flex items-center justify-center text-primary text-4xl font-black border border-primary/20 shrink-0 shadow-inner relative z-10">
                      {booking.name.charAt(0)}
                    </div>
                    
                    <div className="flex-grow text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 mb-4">
                        <h3 className="text-3xl font-black tracking-tighter group-hover:text-primary transition-colors">{booking.name}</h3>
                        <span className={`text-[12px] uppercase font-black px-5 py-2 rounded-full tracking-widest shadow-lg ${
                          booking.status === 'confirmed' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 
                          booking.status === 'pending' ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 
                          'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 font-bold text-lg mb-8 flex items-center justify-center md:justify-start gap-2">
                        <span className="opacity-50 text-base">📧</span> {booking.email}
                      </p>
                      
                      <div className="flex flex-wrap justify-center md:justify-start gap-6">
                        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-base font-black text-gray-300 hover:bg-white/10 transition-colors">
                          <span className="text-xl">📅</span> {booking.date}
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-base font-black text-gray-300 hover:bg-white/10 transition-colors">
                          <span className="text-xl">🕐</span> {booking.time}
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-base font-black text-gray-300 hover:bg-white/10 transition-colors">
                          <span className="text-xl">👥</span> {booking.party_size} Guests
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto justify-center relative z-20">
                    <div className="flex gap-3">
                      {booking.status !== 'confirmed' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-green-500/20 active:scale-95 border-b-4 border-green-700 hover:border-green-600"
                        >
                          CONFIRM
                        </button>
                      )}
                      
                      {booking.status !== 'cancelled' && (
                        <button
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                          className="px-8 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-sm font-black rounded-2xl border-2 border-red-500/20 hover:border-red-500 transition-all shadow-xl active:scale-95"
                        >
                          CANCEL
                        </button>
                      )}
                    </div>

                    <div className="h-10 w-px bg-white/10 hidden sm:block mx-2"></div>

                    <button
                      onClick={() => deleteBooking(booking.id)}
                      className="p-4 bg-white/5 hover:bg-red-500 text-gray-400 hover:text-white rounded-2xl border-2 border-white/5 hover:border-red-500 transition-all shadow-xl active:scale-95 group/btn"
                      title="Delete Permanently"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredBookings.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-32 bg-[#111] rounded-[40px] border-2 border-dashed border-white/10"
              >
                <div className="text-7xl mb-6">🌮</div>
                <h3 className="text-3xl font-black text-white mb-3">No Bookings Yet</h3>
                <p className="text-gray-500 text-lg max-w-sm mx-auto font-medium">
                  {filter === 'today' ? "You're all caught up! No reservations scheduled for today." : "Wait for your first customer to book a table!"}
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-dashboard {
          font-family: 'Outfit', 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
