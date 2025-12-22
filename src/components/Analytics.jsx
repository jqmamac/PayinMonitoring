import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, List, BarChart as BarChartIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-yellow-500/30 p-4 rounded-lg shadow-xl">
        <p className="text-yellow-500 font-bold mb-1">{label}</p>
        <p className="text-white text-sm">
          Count: <span className="font-mono">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const Analytics = ({ payins }) => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('charts'); // 'charts' or 'lists'

  // Filter payins based on date range
  const filteredPayins = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return payins;

    return payins.filter(p => {
      if (!p.datePaid) return false;
      const paidDate = new Date(p.datePaid);
      const start = dateRange.start ? new Date(dateRange.start) : null;
      const end = dateRange.end ? new Date(dateRange.end) : null;

      if (start && paidDate < start) return false;
      if (end) {
        // Set end date to end of day for inclusive comparison
        end.setHours(23, 59, 59, 999);
        if (paidDate > end) return false;
      }
      return true;
    });
  }, [payins, dateRange]);

  // Aggregate Data for Referrors
  const referrorStats = useMemo(() => {
    const stats = {};
    filteredPayins.forEach(p => {
      const name = p.referror || 'Unknown';
      if (!stats[name]) {
        stats[name] = { name, count: 0, totalAmount: 0 };
      }
      stats[name].count += 1;
      stats[name].totalAmount += parseFloat(p.amountPaid) || 0;
    });
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [filteredPayins]);

  // Aggregate Data for Mentors
  const mentorStats = useMemo(() => {
    const stats = {};
    filteredPayins.forEach(p => {
      const name = p.mentor || 'Unknown';
      if (!stats[name]) {
        stats[name] = { name, count: 0, totalAmount: 0 };
      }
      stats[name].count += 1;
      stats[name].totalAmount += parseFloat(p.amountPaid) || 0;
    });
    return Object.values(stats).sort((a, b) => b.count - a.count);
  }, [filteredPayins]);

  // Grand Totals
  const grandTotals = useMemo(() => {
    return filteredPayins.reduce((acc, curr) => ({
      count: acc.count + 1,
      amount: acc.amount + (parseFloat(curr.amountPaid) || 0)
    }), { count: 0, amount: 0 });
  }, [filteredPayins]);

  // Prepare data for charts (top 10)
  const referrorChartData = referrorStats.slice(0, 10);
  const mentorChartData = mentorStats.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Controls & Summary Header */}
      <div className="bg-gray-900/50 border border-yellow-500/20 rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-end">
          {/* Date Filters */}
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="space-y-2">
              <Label className="text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Start Date
              </Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="bg-black/50 border-gray-700 w-full md:w-40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> End Date
              </Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="bg-black/50 border-gray-700 w-full md:w-40"
              />
            </div>
          </div>

          {/* Grand Totals Display */}
          <div className="flex gap-4 md:text-right">
             <div className="bg-black/30 p-3 rounded-lg border border-yellow-500/10">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Payins</p>
                <p className="text-2xl font-bold text-white">{grandTotals.count}</p>
             </div>
             <div className="bg-black/30 p-3 rounded-lg border border-yellow-500/10">
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Amount</p>
                <p className="text-2xl font-bold text-yellow-500">
                  ₱{grandTotals.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
             </div>
          </div>
        </div>
      </div>

      {/* View Toggles */}
      <Tabs defaultValue="charts" value={viewMode} onValueChange={setViewMode} className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-gray-800/50 border border-yellow-500/20">
            <TabsTrigger value="charts" className="px-6 gap-2">
              <BarChartIcon className="w-4 h-4" /> Charts
            </TabsTrigger>
            <TabsTrigger value="lists" className="px-6 gap-2">
              <List className="w-4 h-4" /> Detailed Lists
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="charts" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Referrors Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 border border-yellow-500/20 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                Top Referrers
              </h3>
              <div className="h-[300px] w-full">
                {referrorChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={referrorChartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#666" 
                        tick={{ fill: '#999', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis stroke="#666" tick={{ fill: '#999' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#EAB308" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                   <div className="h-full flex items-center justify-center text-gray-500">No data available for selected range</div>
                )}
              </div>
            </motion.div>

            {/* Mentors Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 border border-yellow-500/20 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-yellow-500 rounded-full"></span>
                Top Mentors
              </h3>
              <div className="h-[300px] w-full">
                {mentorChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mentorChartData} margin={{ top: 10, right: 30, left: 0, bottom: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#666" 
                        tick={{ fill: '#999', fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                      />
                      <YAxis stroke="#666" tick={{ fill: '#999' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#EAB308" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">No data available for selected range</div>
                )}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="lists" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Referror List */}
              <div className="bg-gray-900/50 border border-yellow-500/20 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 bg-gray-900 border-b border-yellow-500/20">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     Referror Breakdown
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-yellow-500">Name</th>
                        <th className="px-4 py-3 text-center text-yellow-500">Count</th>
                        <th className="px-4 py-3 text-right text-yellow-500">Total Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {referrorStats.length > 0 ? (
                        referrorStats.map((stat, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-white font-medium">{stat.name}</td>
                            <td className="px-4 py-3 text-center text-gray-300">{stat.count}</td>
                            <td className="px-4 py-3 text-right text-yellow-500 font-mono">
                              ₱{stat.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="p-4 text-center text-gray-500">No data found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mentor List */}
              <div className="bg-gray-900/50 border border-yellow-500/20 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 bg-gray-900 border-b border-yellow-500/20">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     Mentor Breakdown
                  </h3>
                </div>
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-yellow-500">Name</th>
                        <th className="px-4 py-3 text-center text-yellow-500">Count</th>
                        <th className="px-4 py-3 text-right text-yellow-500">Total Handled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mentorStats.length > 0 ? (
                        mentorStats.map((stat, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-white font-medium">{stat.name}</td>
                            <td className="px-4 py-3 text-center text-gray-300">{stat.count}</td>
                            <td className="px-4 py-3 text-right text-yellow-500 font-mono">
                              ₱{stat.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="p-4 text-center text-gray-500">No data found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;