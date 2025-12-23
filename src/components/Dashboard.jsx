import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, UserCog, TrendingUp, AlertCircle } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const Dashboard = ({ currentUser }) => {
  const [stats, setStats] = useState({
    totalPayins: 0,
    totalAmount: 0,
    activeReferrors: 0,
    activeMentors: 0,
    recentPayins: []
  });

  useEffect(() => {
    const payinsRef = ref(db, 'payins');
    const referrorsRef = ref(db, 'referrors');
    const mentorsRef = ref(db, 'mentors');

    let payinsData = [];
    let referrorsCount = 0;
    let mentorsCount = 0;

    const unsubPayins = onValue(payinsRef, (snapshot) => {
      payinsData = snapshot.exists() ? Object.values(snapshot.val()) : [];
      updateStats(payinsData, referrorsCount, mentorsCount);
    });

    const unsubReferrors = onValue(referrorsRef, (snapshot) => {
      referrorsCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      updateStats(payinsData, referrorsCount, mentorsCount);
    });

    const unsubMentors = onValue(mentorsRef, (snapshot) => {
      mentorsCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      updateStats(payinsData, referrorsCount, mentorsCount);
    });

    return () => {
      unsubPayins();
      unsubReferrors();
      unsubMentors();
    };
  }, []);

  const updateStats = (payins, refCount, menCount) => {
    const totalAmount = payins.reduce((sum, payin) => sum + parseFloat(payin.amount || 0), 0);
    const recentPayins = [...payins].slice(-5).reverse();

    setStats({
      totalPayins: payins.length,
      totalAmount,
      activeReferrors: refCount,
      activeMentors: menCount,
      recentPayins
    });
  };

  const statCards = [
    {
      title: 'Total Payins',
      value: stats.totalPayins,
      icon: DollarSign,
      gradient: 'from-yellow-500 to-yellow-700',
      bgGradient: 'from-yellow-900/20 to-yellow-800/10'
    },
    {
      title: 'Total Amount',
      value: `₱${stats.totalAmount.toLocaleString()}`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-700',
      bgGradient: 'from-green-900/20 to-green-800/10'
    },
    {
      title: 'Active Referrors',
      value: stats.activeReferrors,
      icon: Users,
      gradient: 'from-blue-500 to-blue-700',
      bgGradient: 'from-blue-900/20 to-blue-800/10'
    },
    {
      title: 'Active Mentors',
      value: stats.activeMentors,
      icon: UserCog,
      gradient: 'from-purple-500 to-purple-700',
      bgGradient: 'from-purple-900/20 to-purple-800/10'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Welcome back, {currentUser.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.bgGradient} border border-yellow-600/20 rounded-xl p-6 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-6">Recent Payins</h2>
        {stats.recentPayins.length > 0 ? (
          <div className="space-y-3">
            {stats.recentPayins.map((payin) => (
              <div
                key={payin.id}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-yellow-600/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{payin.name}</p>
                    <p className="text-sm text-gray-400">
                      Referror: {payin.referror} | Mentor: {payin.mentor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-yellow-400">₱{payin.amount}</p>
                    <p className="text-xs text-gray-500">{payin.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No payins recorded yet</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;