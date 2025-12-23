import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const Analytics = ({ currentUser }) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    referror: '',
    mentor: ''
  });
  const [analytics, setAnalytics] = useState({
    totalPayins: 0,
    totalAmount: 0,
    avgAmount: 0,
    byReferror: [],
    byMentor: [],
    byMonth: []
  });
  const [referrors, setReferrors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [payins, setPayins] = useState([]);

  useEffect(() => {
    const payinsRef = ref(db, 'payins');
    const referrorsRef = ref(db, 'referrors');
    const mentorsRef = ref(db, 'mentors');

    const unsubPayins = onValue(payinsRef, (snapshot) => {
        setPayins(snapshot.exists() ? Object.values(snapshot.val()) : []);
    });
    const unsubRef = onValue(referrorsRef, (snapshot) => {
        setReferrors(snapshot.exists() ? Object.values(snapshot.val()) : []);
    });
    const unsubMen = onValue(mentorsRef, (snapshot) => {
        setMentors(snapshot.exists() ? Object.values(snapshot.val()) : []);
    });

    return () => {
        unsubPayins();
        unsubRef();
        unsubMen();
    }
  }, []);

  useEffect(() => {
    calculateAnalytics();
  }, [filters, payins]);

  const calculateAnalytics = () => {
    let filteredPayins = [...payins];

    // Apply filters
    if (filters.startDate) {
      filteredPayins = filteredPayins.filter(p => p.date >= filters.startDate);
    }
    if (filters.endDate) {
      filteredPayins = filteredPayins.filter(p => p.date <= filters.endDate);
    }
    if (filters.referror) {
      filteredPayins = filteredPayins.filter(p => p.referror === filters.referror);
    }
    if (filters.mentor) {
      filteredPayins = filteredPayins.filter(p => p.mentor === filters.mentor);
    }

    // Calculate totals
    const totalAmount = filteredPayins.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const avgAmount = filteredPayins.length > 0 ? totalAmount / filteredPayins.length : 0;

    // Group by referror
    const byReferror = filteredPayins.reduce((acc, p) => {
      const existing = acc.find(r => r.name === p.referror);
      if (existing) {
        existing.count++;
        existing.amount += parseFloat(p.amount || 0);
      } else {
        acc.push({ name: p.referror, count: 1, amount: parseFloat(p.amount || 0) });
      }
      return acc;
    }, []).sort((a, b) => b.amount - a.amount);

    // Group by mentor
    const byMentor = filteredPayins.reduce((acc, p) => {
      const existing = acc.find(m => m.name === p.mentor);
      if (existing) {
        existing.count++;
        existing.amount += parseFloat(p.amount || 0);
      } else {
        acc.push({ name: p.mentor, count: 1, amount: parseFloat(p.amount || 0) });
      }
      return acc;
    }, []).sort((a, b) => b.amount - a.amount);

    setAnalytics({
      totalPayins: filteredPayins.length,
      totalAmount,
      avgAmount,
      byReferror,
      byMentor
    });
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      referror: '',
      mentor: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-green-500 to-green-700 p-3 rounded-lg">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Referror</label>
            <select
              value={filters.referror}
              onChange={(e) => setFilters({ ...filters, referror: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Referrors</option>
              {referrors.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mentor</label>
            <select
              value={filters.mentor}
              onChange={(e) => setFilters({ ...filters, mentor: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Mentors</option>
              {mentors.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={resetFilters}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            Reset Filters
          </Button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border border-yellow-600/20 rounded-xl p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Total Payins</p>
          <p className="text-4xl font-bold text-yellow-400">{analytics.totalPayins}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-900/20 to-green-800/10 border border-green-600/20 rounded-xl p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Total Amount</p>
          <p className="text-4xl font-bold text-green-400">₱{analytics.totalAmount.toLocaleString()}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-600/20 rounded-xl p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Average Amount</p>
          <p className="text-4xl font-bold text-blue-400">₱{analytics.avgAmount.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* By Referror */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Performance by Referror</h2>
        <div className="space-y-3">
          {analytics.byReferror.map((ref, index) => (
            <div key={index} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{ref.name}</span>
                <span className="text-green-400 font-bold">₱{ref.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{ref.count} payins</span>
                <span>Avg: ₱{(ref.amount / ref.count).toFixed(2)}</span>
              </div>
            </div>
          ))}
          {analytics.byReferror.length === 0 && (
            <p className="text-center text-gray-500 py-8">No data available</p>
          )}
        </div>
      </motion.div>

      {/* By Mentor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Performance by Mentor</h2>
        <div className="space-y-3">
          {analytics.byMentor.map((mentor, index) => (
            <div key={index} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{mentor.name}</span>
                <span className="text-purple-400 font-bold">₱{mentor.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{mentor.count} payins</span>
                <span>Avg: ₱{(mentor.amount / mentor.count).toFixed(2)}</span>
              </div>
            </div>
          ))}
          {analytics.byMentor.length === 0 && (
            <p className="text-center text-gray-500 py-8">No data available</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;