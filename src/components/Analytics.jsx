import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Filter, FileText, FileSpreadsheet } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    totalAmountEncoded: 0,
    totalAmountOnHand: 0,
    byReferror: [],
    byMentor: [],
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

  // Function to check if a payin is encoded
  const isPayinEncoded = (payin) => {
    if (!payin) return false;
    
    // Check the isEncoded field directly
    if (payin.isEncoded === true || payin.isEncoded === 'true' || payin.isEncoded === 'True') {
      return true;
    }
    
    return false;
  };

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
    const totalAmountEncoded = filteredPayins
      .filter(p => isPayinEncoded(p))
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalAmountOnHand = filteredPayins
      .filter(p => !isPayinEncoded(p))
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    // Group by referror - FIXED: Now ordered by highest total amount (not count)
    const byReferror = filteredPayins.reduce((acc, p) => {
      const refName = p.referror || 'Unknown Referror';
      const existing = acc.find(r => r.name === refName);
      const amount = parseFloat(p.amount || 0);
      const encoded = isPayinEncoded(p);
      
      if (existing) {
        existing.count++;
        existing.totalAmount += amount;
        if (encoded) {
          existing.encodedAmount += amount;
          existing.encodedCount++;
        } else {
          existing.onHandAmount += amount;
          existing.onHandCount++;
        }
      } else {
        acc.push({ 
          name: refName, 
          count: 1,
          encodedCount: encoded ? 1 : 0,
          onHandCount: encoded ? 0 : 1,
          totalAmount: amount,
          encodedAmount: encoded ? amount : 0,
          onHandAmount: encoded ? 0 : amount
        });
      }
      return acc;
    }, []).sort((a, b) => b.totalAmount - a.totalAmount); // CHANGED: Now sorts by totalAmount instead of count

    // Group by mentor
    const byMentor = filteredPayins.reduce((acc, p) => {
      const mentorName = p.mentor || 'Unknown Mentor';
      const existing = acc.find(m => m.name === mentorName);
      const amount = parseFloat(p.amount || 0);
      const encoded = isPayinEncoded(p);
      
      if (existing) {
        existing.count++;
        existing.totalAmount += amount;
        if (encoded) {
          existing.encodedAmount += amount;
          existing.encodedCount++;
        } else {
          existing.onHandAmount += amount;
          existing.onHandCount++;
        }
      } else {
        acc.push({ 
          name: mentorName, 
          count: 1,
          encodedCount: encoded ? 1 : 0,
          onHandCount: encoded ? 0 : 1,
          totalAmount: amount,
          encodedAmount: encoded ? amount : 0,
          onHandAmount: encoded ? 0 : amount
        });
      }
      return acc;
    }, []).sort((a, b) => b.totalAmount - a.totalAmount);

    setAnalytics({
      totalPayins: filteredPayins.length,
      totalAmount,
      totalAmountEncoded,
      totalAmountOnHand,
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

  // Download PDF function - FIXED: Now properly uses autoTable
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Payin Analytics Report', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    
    // Filters info
    let filtersText = 'All Filters';
    if (filters.startDate || filters.endDate || filters.referror || filters.mentor) {
      filtersText = 'Filters: ';
      if (filters.startDate) filtersText += `From ${filters.startDate} `;
      if (filters.endDate) filtersText += `To ${filters.endDate} `;
      if (filters.referror) filtersText += `Referror: ${filters.referror} `;
      if (filters.mentor) filtersText += `Mentor: ${filters.mentor}`;
    }
    doc.text(filtersText, 14, 25);
    
    // Summary Stats
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Summary Statistics', 14, 40);
    
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    
    const summaryData = [
      ['Total Payins', analytics.totalPayins.toString()],
      ['Total Amount', `₱${analytics.totalAmount.toLocaleString()}`],
      ['Total Encoded', `₱${analytics.totalAmountEncoded.toLocaleString()}`],
      ['Total On-Hand', `₱${analytics.totalAmountOnHand.toLocaleString()}`]
    ];
    
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [255, 193, 7] },
      margin: { left: 14, right: 14 }
    });
    
    // Performance by Referror
    const referrorY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 60;
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Performance by Referror', 14, referrorY);
    
    if (analytics.byReferror.length > 0) {
      const referrorData = analytics.byReferror.map(ref => [
        ref.name,
        ref.count.toString(),
        `₱${ref.totalAmount.toLocaleString()}`,
        `₱${ref.encodedAmount.toLocaleString()}`,
        `₱${ref.onHandAmount.toLocaleString()}`
      ]);
      
      autoTable(doc, {
        startY: referrorY + 5,
        head: [['Referror', 'Total Payins', 'Total Amount', 'Encoded Amount', 'On-Hand Amount']],
        body: referrorData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 }
      });
    }
    
    // Performance by Mentor
    const mentorY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : referrorY + 20;
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Performance by Mentor', 14, mentorY);
    
    if (analytics.byMentor.length > 0) {
      const mentorData = analytics.byMentor.map(mentor => [
        mentor.name,
        mentor.count.toString(),
        `₱${mentor.totalAmount.toLocaleString()}`,
        `₱${mentor.encodedAmount.toLocaleString()}`,
        `₱${mentor.onHandAmount.toLocaleString()}`
      ]);
      
      autoTable(doc, {
        startY: mentorY + 5,
        head: [['Mentor', 'Total Payins', 'Total Amount', 'Encoded Amount', 'On-Hand Amount']],
        body: mentorData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        margin: { left: 14, right: 14 }
      });
    }
    
    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated on ${new Date().toLocaleDateString()} • Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }
    
    doc.save(`payin-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Download Excel function
  const downloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ['Payin Analytics Report'],
      ['Generated on:', new Date().toLocaleDateString()],
      ['Filters:', filters.startDate || filters.endDate || filters.referror || filters.mentor ? 
        `Start: ${filters.startDate || 'All'}, End: ${filters.endDate || 'All'}, Referror: ${filters.referror || 'All'}, Mentor: ${filters.mentor || 'All'}` : 
        'All Filters'
      ],
      [],
      ['Summary Statistics'],
      ['Metric', 'Value'],
      ['Total Payins', analytics.totalPayins],
      ['Total Amount', analytics.totalAmount],
      ['Total Encoded Amount', analytics.totalAmountEncoded],
      ['Total On-Hand Amount', analytics.totalAmountOnHand],
      []
    ];
    
    // Performance by Referror Sheet
    const referrorData = [
      ['Performance by Referror'],
      [],
      ['Referror', 'Total Payins', 'Total Amount', 'Encoded Amount', 'On-Hand Amount', 'Encoded Count', 'On-Hand Count']
    ];
    
    analytics.byReferror.forEach(ref => {
      referrorData.push([
        ref.name,
        ref.count,
        ref.totalAmount,
        ref.encodedAmount,
        ref.onHandAmount,
        ref.encodedCount,
        ref.onHandCount
      ]);
    });
    
    // Performance by Mentor Sheet
    const mentorData = [
      ['Performance by Mentor'],
      [],
      ['Mentor', 'Total Payins', 'Total Amount', 'Encoded Amount', 'On-Hand Amount', 'Encoded Count', 'On-Hand Count']
    ];
    
    analytics.byMentor.forEach(mentor => {
      mentorData.push([
        mentor.name,
        mentor.count,
        mentor.totalAmount,
        mentor.encodedAmount,
        mentor.onHandAmount,
        mentor.encodedCount,
        mentor.onHandCount
      ]);
    });
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const referrorSheet = XLSX.utils.aoa_to_sheet(referrorData);
    const mentorSheet = XLSX.utils.aoa_to_sheet(mentorData);
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(workbook, referrorSheet, 'By Referror');
    XLSX.utils.book_append_sheet(workbook, mentorSheet, 'By Mentor');
    
    XLSX.writeFile(workbook, `payin-analytics-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-500 to-green-700 p-3 rounded-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-md flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" />
            Download PDF
          </button>
          <button
            onClick={downloadExcel}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-md flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Excel
          </button>
        </div>
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
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <p className="text-gray-400 text-sm mb-2">Total Amount (Encoded)</p>
          <p className="text-4xl font-bold text-blue-400">₱{analytics.totalAmountEncoded.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">
            {analytics.totalPayins > 0 
              ? `${((analytics.totalAmountEncoded / analytics.totalAmount) * 100).toFixed(1)}% of total`
              : 'No data'
            }
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-600/20 rounded-xl p-6"
        >
          <p className="text-gray-400 text-sm mb-2">Total Amount (On-Hand)</p>
          <p className="text-4xl font-bold text-red-400">₱{analytics.totalAmountOnHand.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">
            {analytics.totalPayins > 0 
              ? `${((analytics.totalAmountOnHand / analytics.totalAmount) * 100).toFixed(1)}% of total`
              : 'No data'
            }
          </p>
        </motion.div>
      </div>

      {/* By Referror */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">Performance by Referror</h2>
          <span className="text-sm text-gray-400">Sorted by highest total amount</span>
        </div>
        <div className="space-y-3">
          {analytics.byReferror.map((ref, index) => (
            <div key={index} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{ref.name}</span>
                <span className="text-green-400 font-bold">₱{ref.totalAmount.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Encoded Amount</p>
                  <p className="text-lg font-bold text-blue-400">₱{ref.encodedAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{ref.encodedCount} payins ({ref.count > 0 ? `${((ref.encodedCount/ref.count)*100).toFixed(0)}%` : '0%'})</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">On-Hand Amount</p>
                  <p className="text-lg font-bold text-red-400">₱{ref.onHandAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{ref.onHandCount} payins ({ref.count > 0 ? `${((ref.onHandCount/ref.count)*100).toFixed(0)}%` : '0%'})</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Total Payins</p>
                  <p className="text-lg font-bold text-yellow-400">{ref.count}</p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
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
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Performance by Mentor</h2>
        <div className="space-y-3">
          {analytics.byMentor.map((mentor, index) => (
            <div key={index} className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{mentor.name}</span>
                <span className="text-purple-400 font-bold">₱{mentor.totalAmount.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="text-center">
                  <p className="text-sm text-gray-400">Encoded Amount</p>
                  <p className="text-lg font-bold text-blue-400">₱{mentor.encodedAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{mentor.encodedCount} payins ({mentor.count > 0 ? `${((mentor.encodedCount/mentor.count)*100).toFixed(0)}` : '0'}%)</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">On-Hand Amount</p>
                  <p className="text-lg font-bold text-red-400">₱{mentor.onHandAmount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{mentor.onHandCount} payins ({mentor.count > 0 ? `${((mentor.onHandCount/mentor.count)*100).toFixed(0)}` : '0'}%)</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Total Payins</p>
                  <p className="text-lg font-bold text-yellow-400">{mentor.count}</p>
                  <p className="text-xs text-gray-500">All time</p>
                </div>
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