import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Calendar, TrendingUp, Filter, Download, 
  FileText, FileSpreadsheet, Eye, ChevronDown, ChevronUp, X,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
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
  const [expandedReferror, setExpandedReferror] = useState(null);
  const [selectedReferrorDetails, setSelectedReferrorDetails] = useState(null);

  // Pagination state for By Referror section
  const [referrorCurrentPage, setReferrorCurrentPage] = useState(1);
  const [referrorItemsPerPage, setReferrorItemsPerPage] = useState(5);
  const [referrorTotalPages, setReferrorTotalPages] = useState(1);

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

  // Calculate pagination for referror section
  useEffect(() => {
    const total = Math.ceil(analytics.byReferror.length / referrorItemsPerPage);
    setReferrorTotalPages(total);
    
    if (referrorCurrentPage > total && total > 0) {
      setReferrorCurrentPage(1);
    }
  }, [analytics.byReferror, referrorItemsPerPage]);

  // Get current referror items for the page
  const getCurrentReferrorItems = () => {
    const startIndex = (referrorCurrentPage - 1) * referrorItemsPerPage;
    const endIndex = startIndex + referrorItemsPerPage;
    return analytics.byReferror.slice(startIndex, endIndex);
  };

  // Handle referror page change
  const handleReferrorPageChange = (page) => {
    if (page >= 1 && page <= referrorTotalPages) {
      setReferrorCurrentPage(page);
    }
  };

  // Handle referror items per page change
  const handleReferrorItemsPerPageChange = (value) => {
    const newItemsPerPage = parseInt(value);
    setReferrorItemsPerPage(newItemsPerPage);
    setReferrorCurrentPage(1);
  };

  // Generate page numbers for referror pagination
  const getReferrorPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (referrorTotalPages <= maxPagesToShow) {
      for (let i = 1; i <= referrorTotalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(2, referrorCurrentPage - 1);
      const endPage = Math.min(referrorTotalPages - 1, referrorCurrentPage + 1);
      
      pageNumbers.push(1);
      
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < referrorTotalPages - 1) {
        pageNumbers.push('...');
      }
      
      pageNumbers.push(referrorTotalPages);
    }
    
    return pageNumbers;
  };

  // Function to check if a payin is encoded
  const isPayinEncoded = (payin) => {
    if (!payin) return false;
    
    if (payin.isEncoded === true || payin.isEncoded === 'true' || payin.isEncoded === 'True') {
      return true;
    }
    
    return false;
  };

  // Helper function to get encoded amount for a payin
  const getEncodedAmount = (payin) => {
    if (!isPayinEncoded(payin)) return 0;
    
    if (payin.encodedAmount !== undefined && payin.encodedAmount !== '') {
      return parseFloat(payin.encodedAmount || 0);
    }
    
    return parseFloat(payin.amount || 0);
  };

  // Function to get payins for a specific referror
  const getPayinsForReferror = (referrorName) => {
    let filtered = payins.filter(p => p.referror === referrorName);
    
    // Apply filters
    if (filters.startDate) {
      filtered = filtered.filter(p => p.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(p => p.date <= filters.endDate);
    }
    if (filters.mentor) {
      filtered = filtered.filter(p => p.mentor === filters.mentor);
    }
    
    return filtered;
  };

  // Function to get payins for a specific mentor
  const getPayinsForMentor = (mentorName) => {
    let filtered = payins.filter(p => p.mentor === mentorName);
    
    // Apply filters
    if (filters.startDate) {
      filtered = filtered.filter(p => p.date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(p => p.date <= filters.endDate);
    }
    if (filters.referror) {
      filtered = filtered.filter(p => p.referror === filters.referror);
    }
    
    return filtered;
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
    
    // Calculate encoded amount - using the helper function
    const totalAmountEncoded = filteredPayins.reduce((sum, p) => {
      return sum + getEncodedAmount(p);
    }, 0);
    
    // Calculate on-hand amount (total amount - encoded amount)
    const totalAmountOnHand = totalAmount - totalAmountEncoded;

    // Group by referror
    const byReferror = filteredPayins.reduce((acc, p) => {
      const refName = p.referror || 'Unknown Referror';
      const existing = acc.find(r => r.name === refName);
      const amount = parseFloat(p.amount || 0);
      const encoded = isPayinEncoded(p);
      const encodedAmount = getEncodedAmount(p);
      const onHandAmount = encoded ? (amount - encodedAmount) : amount;
      
      if (existing) {
        existing.count++;
        existing.totalAmount += amount;
        existing.encodedAmount += encodedAmount;
        existing.onHandAmount += onHandAmount;
        
        if (encoded) {
          existing.encodedCount++;
        } else {
          existing.onHandCount++;
        }
      } else {
        acc.push({ 
          name: refName, 
          count: 1,
          encodedCount: encoded ? 1 : 0,
          onHandCount: encoded ? 0 : 1,
          totalAmount: amount,
          encodedAmount: encodedAmount,
          onHandAmount: onHandAmount
        });
      }
      return acc;
    }, []).sort((a, b) => b.totalAmount - a.totalAmount);

    // Group by mentor
    const byMentor = filteredPayins.reduce((acc, p) => {
      const mentorName = p.mentor || 'Unknown Mentor';
      const existing = acc.find(m => m.name === mentorName);
      const amount = parseFloat(p.amount || 0);
      const encoded = isPayinEncoded(p);
      const encodedAmount = getEncodedAmount(p);
      const onHandAmount = encoded ? (amount - encodedAmount) : amount;
      
      if (existing) {
        existing.count++;
        existing.totalAmount += amount;
        existing.encodedAmount += encodedAmount;
        existing.onHandAmount += onHandAmount;
        
        if (encoded) {
          existing.encodedCount++;
        } else {
          existing.onHandCount++;
        }
      } else {
        acc.push({ 
          name: mentorName, 
          count: 1,
          encodedCount: encoded ? 1 : 0,
          onHandCount: encoded ? 0 : 1,
          totalAmount: amount,
          encodedAmount: encodedAmount,
          onHandAmount: onHandAmount
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

  const toggleReferrorExpansion = (referrorName) => {
    if (expandedReferror === referrorName) {
      setExpandedReferror(null);
    } else {
      setExpandedReferror(referrorName);
    }
  };

  const viewReferrorDetails = (referror) => {
    const payinsForReferror = getPayinsForReferror(referror.name);
    setSelectedReferrorDetails({
      ...referror,
      payins: payinsForReferror
    });
  };

  const closeReferrorDetails = () => {
    setSelectedReferrorDetails(null);
  };

  // Download PDF function
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
      ['Total Encoded Amount', `₱${analytics.totalAmountEncoded.toLocaleString()}`],
      ['Total Cash On-Hand', `₱${analytics.totalAmountOnHand.toLocaleString()}`],
      ['Encoding Rate', `${analytics.totalAmount > 0 ? ((analytics.totalAmountEncoded / analytics.totalAmount) * 100).toFixed(1) : 0}%`]
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
        `₱${ref.onHandAmount.toLocaleString()}`,
        `${ref.totalAmount > 0 ? ((ref.encodedAmount / ref.totalAmount) * 100).toFixed(1) : 0}%`
      ]);
      
      autoTable(doc, {
        startY: referrorY + 5,
        head: [['Referror', 'Total Payins', 'Total Amount', 'Encoded Amount', 'Cash On-Hand', 'Encoding %']],
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
        `₱${mentor.onHandAmount.toLocaleString()}`,
        `${mentor.totalAmount > 0 ? ((mentor.encodedAmount / mentor.totalAmount) * 100).toFixed(1) : 0}%`
      ]);
      
      autoTable(doc, {
        startY: mentorY + 5,
        head: [['Mentor', 'Total Payins', 'Total Amount', 'Encoded Amount', 'Cash On-Hand', 'Encoding %']],
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
      ['Total Cash On-Hand', analytics.totalAmountOnHand],
      ['Encoding Rate', analytics.totalAmount > 0 ? ((analytics.totalAmountEncoded / analytics.totalAmount) * 100).toFixed(1) + '%' : '0%'],
      []
    ];
    
    // Performance by Referror Sheet
    const referrorData = [
      ['Performance by Referror'],
      [],
      ['Referror', 'Total Payins', 'Total Amount', 'Encoded Amount', 'Cash On-Hand', 'Encoded Count', 'On-Hand Count', 'Encoding %']
    ];
    
    analytics.byReferror.forEach(ref => {
      referrorData.push([
        ref.name,
        ref.count,
        ref.totalAmount,
        ref.encodedAmount,
        ref.onHandAmount,
        ref.encodedCount,
        ref.onHandCount,
        ref.totalAmount > 0 ? ((ref.encodedAmount / ref.totalAmount) * 100).toFixed(1) + '%' : '0%'
      ]);
    });
    
    // Performance by Mentor Sheet
    const mentorData = [
      ['Performance by Mentor'],
      [],
      ['Mentor', 'Total Payins', 'Total Amount', 'Encoded Amount', 'Cash On-Hand', 'Encoded Count', 'On-Hand Count', 'Encoding %']
    ];
    
    analytics.byMentor.forEach(mentor => {
      mentorData.push([
        mentor.name,
        mentor.count,
        mentor.totalAmount,
        mentor.encodedAmount,
        mentor.onHandAmount,
        mentor.encodedCount,
        mentor.onHandCount,
        mentor.totalAmount > 0 ? ((mentor.encodedAmount / mentor.totalAmount) * 100).toFixed(1) + '%' : '0%'
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
          <p className="text-gray-400 text-sm mb-2">Total Encoded Amount</p>
          <p className="text-4xl font-bold text-blue-400">₱{analytics.totalAmountEncoded.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">
            {analytics.totalAmount > 0 
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
          <p className="text-gray-400 text-sm mb-2">Total Cash On-Hand</p>
          <p className="text-4xl font-bold text-red-400">₱{analytics.totalAmountOnHand.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">
            {analytics.totalAmount > 0 
              ? `${((analytics.totalAmountOnHand / analytics.totalAmount) * 100).toFixed(1)}% of total`
              : 'No data'
            }
          </p>
        </motion.div>
      </div>

      {/* By Referror with Pagination */}
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

        {/* Pagination Controls - Top */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-sm text-gray-400">
            Showing <span className="font-bold text-yellow-400">{getCurrentReferrorItems().length}</span> of{' '}
            <span className="font-bold text-yellow-400">{analytics.byReferror.length}</span> referrors
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400 whitespace-nowrap">Show:</label>
              <select
                value={referrorItemsPerPage}
                onChange={(e) => handleReferrorItemsPerPageChange(e.target.value)}
                className="bg-gray-900 border border-yellow-600/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
              <span className="text-sm text-gray-400">per page</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {getCurrentReferrorItems().map((ref, index) => {
            const payinsForReferror = getPayinsForReferror(ref.name);
            const isExpanded = expandedReferror === ref.name;
            
            return (
              <div key={index} className="bg-gray-900/50 border border-gray-700 rounded-lg">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{ref.name}</span>
                      <button
                        onClick={() => toggleReferrorExpansion(ref.name)}
                        className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show Details
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-green-400 font-bold">₱{ref.totalAmount.toLocaleString()}</span>
                      <button
                        onClick={() => viewReferrorDetails(ref)}
                        className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-900/30 to-blue-800/20 hover:from-blue-900/40 hover:to-blue-800/30 text-blue-400 border border-blue-600/30 rounded-md text-sm transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Encoded Amount</p>
                      <p className="text-lg font-bold text-blue-400">₱{ref.encodedAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {ref.encodedCount} payins • {ref.totalAmount > 0 ? `${((ref.encodedAmount/ref.totalAmount)*100).toFixed(0)}%` : '0%'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Cash On-Hand</p>
                      <p className="text-lg font-bold text-red-400">₱{ref.onHandAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {ref.onHandCount} payins • {ref.totalAmount > 0 ? `${((ref.onHandAmount/ref.totalAmount)*100).toFixed(0)}%` : '0%'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Total Payins</p>
                      <p className="text-lg font-bold text-yellow-400">{ref.count}</p>
                      <p className="text-xs text-gray-500">All time</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Payin Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden border-t border-gray-700"
                  >
                    <div className="p-4 bg-gray-950/50">
                      <h4 className="text-lg font-semibold text-yellow-400 mb-3">Payin Details</h4>
                      {payinsForReferror.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {payinsForReferror.map((payin, payinIndex) => (
                            <div
                              key={payinIndex}
                              className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-white">{payin.name}</p>
                                <div className="flex gap-4 text-sm text-gray-400">
                                  <span>Mentor: {payin.mentor}</span>
                                  <span>Date: {payin.date}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-yellow-400">₱{payin.amount}</p>
                                <div className="flex items-center gap-2 text-sm">
                                  {isPayinEncoded(payin) ? (
                                    <>
                                      <span className="text-green-400">Encoded</span>
                                      <span className="text-xs text-gray-500">
                                        ₱{getEncodedAmount(payin).toLocaleString()}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-red-400">Pending</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-4">No payin details available</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
          {getCurrentReferrorItems().length === 0 && (
            <p className="text-center text-gray-500 py-8">No data available</p>
          )}
        </div>

        {/* Pagination Controls - Bottom */}
        {analytics.byReferror.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Page <span className="font-bold text-yellow-400">{referrorCurrentPage}</span> of{' '}
              <span className="font-bold text-yellow-400">{referrorTotalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* First Page Button */}
              <button
                onClick={() => handleReferrorPageChange(1)}
                disabled={referrorCurrentPage === 1}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              
              {/* Previous Page Button */}
              <button
                onClick={() => handleReferrorPageChange(referrorCurrentPage - 1)}
                disabled={referrorCurrentPage === 1}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {getReferrorPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handleReferrorPageChange(page)}
                        className={`px-3 py-2 min-w-[40px] ${
                          referrorCurrentPage === page
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                        } border border-gray-600 rounded-lg transition-colors`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Next Page Button */}
              <button
                onClick={() => handleReferrorPageChange(referrorCurrentPage + 1)}
                disabled={referrorCurrentPage === referrorTotalPages}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Last Page Button */}
              <button
                onClick={() => handleReferrorPageChange(referrorTotalPages)}
                disabled={referrorCurrentPage === referrorTotalPages}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* By Mentor (No pagination) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Performance by Mentor</h2>
        <div className="space-y-3">
          {analytics.byMentor.map((mentor, index) => {
            const payinsForMentor = getPayinsForMentor(mentor.name);
            const isExpanded = expandedReferror === `mentor-${mentor.name}`;
            
            return (
              <div key={index} className="bg-gray-900/50 border border-gray-700 rounded-lg">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">{mentor.name}</span>
                      <button
                        onClick={() => toggleReferrorExpansion(`mentor-${mentor.name}`)}
                        className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Hide Details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Show Details
                          </>
                        )}
                      </button>
                    </div>
                    <span className="text-purple-400 font-bold">₱{mentor.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Encoded Amount</p>
                      <p className="text-lg font-bold text-blue-400">₱{mentor.encodedAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {mentor.encodedCount} payins • {mentor.totalAmount > 0 ? `${((mentor.encodedAmount/mentor.totalAmount)*100).toFixed(0)}%` : '0%'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Cash On-Hand</p>
                      <p className="text-lg font-bold text-red-400">₱{mentor.onHandAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {mentor.onHandCount} payins • {mentor.totalAmount > 0 ? `${((mentor.onHandAmount/mentor.totalAmount)*100).toFixed(0)}%` : '0%'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Total Payins</p>
                      <p className="text-lg font-bold text-yellow-400">{mentor.count}</p>
                      <p className="text-xs text-gray-500">All time</p>
                    </div>
                  </div>
                </div>

                {/* Expanded Payin Details for Mentor */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden border-t border-gray-700"
                  >
                    <div className="p-4 bg-gray-950/50">
                      <h4 className="text-lg font-semibold text-yellow-400 mb-3">Payin Details</h4>
                      {payinsForMentor.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {payinsForMentor.map((payin, payinIndex) => (
                            <div
                              key={payinIndex}
                              className="flex items-center justify-between p-3 bg-gray-800/30 border border-gray-700 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-white">{payin.name}</p>
                                <div className="flex gap-4 text-sm text-gray-400">
                                  <span>Referror: {payin.referror}</span>
                                  <span>Date: {payin.date}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-yellow-400">₱{payin.amount}</p>
                                <div className="flex items-center gap-2 text-sm">
                                  {isPayinEncoded(payin) ? (
                                    <>
                                      <span className="text-green-400">Encoded</span>
                                      <span className="text-xs text-gray-500">
                                        ₱{getEncodedAmount(payin).toLocaleString()}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-red-400">Pending</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-gray-500 py-4">No payin details available</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
          {analytics.byMentor.length === 0 && (
            <p className="text-center text-gray-500 py-8">No data available</p>
          )}
        </div>
      </motion.div>

      {/* Referror Details Modal */}
      {selectedReferrorDetails && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/30 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400">
                    {selectedReferrorDetails.name} - Payin Details
                  </h2>
                  <p className="text-gray-400">
                    Total: ₱{selectedReferrorDetails.totalAmount.toLocaleString()} • 
                    {selectedReferrorDetails.count} payins
                  </p>
                </div>
                <button
                  onClick={closeReferrorDetails}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-blue-600/30">
                  <p className="text-sm text-gray-400">Encoded Amount</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ₱{selectedReferrorDetails.encodedAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedReferrorDetails.encodedCount} payins encoded
                  </p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-red-600/30">
                  <p className="text-sm text-gray-400">Cash On-Hand</p>
                  <p className="text-2xl font-bold text-red-400">
                    ₱{selectedReferrorDetails.onHandAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedReferrorDetails.onHandCount} payins pending
                  </p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-yellow-600/30">
                  <p className="text-sm text-gray-400">Encoding Rate</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {selectedReferrorDetails.totalAmount > 0 
                      ? `${((selectedReferrorDetails.encodedAmount / selectedReferrorDetails.totalAmount) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    of total amount encoded
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">All Payins</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Amount</th>
                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Mentor</th>
                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Encoded Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReferrorDetails.payins.map((payin, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/30">
                          <td className="py-3 px-4 text-white font-medium">{payin.name}</td>
                          <td className="py-3 px-4">
                            <span className="text-yellow-400 font-bold">₱{payin.amount}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-300">{payin.mentor}</td>
                          <td className="py-3 px-4 text-gray-400">{payin.date}</td>
                          <td className="py-3 px-4">
                            {isPayinEncoded(payin) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                                <Eye className="w-3 h-3" />
                                Encoded
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs">
                                <Eye className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isPayinEncoded(payin) ? (
                              <span className="text-blue-400 font-medium">
                                ₱{getEncodedAmount(payin).toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {selectedReferrorDetails.payins.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No payins found</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={closeReferrorDetails}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Analytics;