import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, Users, UserCog, TrendingUp, AlertCircle, 
  Trophy, Crown, Calendar, Filter, X, ChevronDown,
  ChevronLeft, ChevronRight, Eye, History, CalendarDays
} from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

// CalendarPicker component remains the same
const CalendarPicker = ({ selectedDate, onDateSelect, label, maxDate, minDate }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    return date ? new Date(date).toISOString().split('T')[0] : '';
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month - 1, 1);
    const prevMonthDays = getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
    
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push({
        day,
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isDisabled: true
      });
    }
    
    // Current month days
    const today = new Date();
    const todayFormatted = formatDate(today);
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateFormatted = formatDate(date);
      const isDisabled = 
        (maxDate && dateFormatted > maxDate) || 
        (minDate && dateFormatted < minDate);
      
      days.push({
        day,
        date,
        isCurrentMonth: true,
        isDisabled,
        isToday: dateFormatted === todayFormatted,
        isSelected: formatDate(selectedDate) === dateFormatted
      });
    }
    
    // Next month days
    const totalCells = 42;
    const nextMonthDays = totalCells - days.length;
    
    for (let day = 1; day <= nextMonthDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        day,
        date,
        isCurrentMonth: false,
        isDisabled: true
      });
    }
    
    return days;
  };

  const handleDateClick = (date, isDisabled) => {
    if (!isDisabled) {
      onDateSelect(formatDate(date));
      setShowCalendar(false);
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect(formatDate(today));
    setShowCalendar(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="relative" ref={calendarRef}>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          readOnly
          value={selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : 'Select date'}
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>
      
      {showCalendar && (
        <div className="absolute z-50 mt-1 w-72 bg-gray-800 border border-yellow-600/30 rounded-lg shadow-xl">
          {/* Calendar Header */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={prevMonth}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h3 className="text-white font-semibold">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="w-full py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold rounded-md text-sm"
            >
              Today
            </button>
          </div>
          
          {/* Day Names */}
          <div className="grid grid-cols-7 p-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 p-2">
            {generateCalendar().map((dayObj, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(dayObj.date, dayObj.isDisabled)}
                disabled={dayObj.isDisabled}
                className={`
                  h-8 flex items-center justify-center text-sm rounded-md
                  ${dayObj.isSelected 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold' 
                    : dayObj.isToday 
                      ? 'bg-blue-900/30 text-blue-400' 
                      : dayObj.isCurrentMonth 
                        ? 'text-white hover:bg-gray-700' 
                        : 'text-gray-600'
                  }
                  ${dayObj.isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {dayObj.day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Top Performers Count Selector Component
const TopPerformersSelector = ({ count, onChange, maxCount = 20 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef(null);

  const options = [5, 10, 15, 20];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectorRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-white transition-colors"
      >
        <Eye className="w-4 h-4" />
        <span>Top {count}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-40 bg-gray-800 border border-yellow-600/30 rounded-lg shadow-xl overflow-hidden">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                  count === option
                    ? 'bg-yellow-500/20 text-yellow-400 font-medium'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Top {option} Performers
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = ({ currentUser }) => {
  const [stats, setStats] = useState({
    totalSales: 0, // Changed from totalPayins
    totalAmount: 0,
    activeReferrors: 0,
    activeMentors: 0,
    recentSales: [], // Changed from recentPayins
    topPerformers: []
  });

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [allSales, setAllSales] = useState([]); // Changed from allPayins
  const [referrorsCount, setReferrorsCount] = useState(0);
  const [mentorsCount, setMentorsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [topPerformersCount, setTopPerformersCount] = useState(5);

  // Initialize with default "This Week" (Tuesday-Monday) on first load
  useEffect(() => {
    const salesRef = ref(db, 'payins'); // Note: Keeping database path as 'payins' if that's what exists
    const referrorsRef = ref(db, 'referrors');
    const mentorsRef = ref(db, 'mentors');

    let salesData = [];
    let refCount = 0;
    let menCount = 0;

    const unsubSales = onValue(salesRef, (snapshot) => {
      salesData = snapshot.exists() ? Object.values(snapshot.val()) : [];
      setAllSales(salesData);
      
      // Set default to "This Week" (Tuesday-Monday)
      const { startDate, endDate } = getThisWeekRange();
      setDateRange({ startDate, endDate });
      
      // Calculate stats immediately when sales load
      calculateAndSetStats(salesData, refCount, menCount);
      setIsLoading(false);
    });

    const unsubReferrors = onValue(referrorsRef, (snapshot) => {
      refCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      setReferrorsCount(refCount);
      
      // Update stats if sales are already loaded
      if (salesData.length > 0) {
        calculateAndSetStats(salesData, refCount, menCount);
      }
    });

    const unsubMentors = onValue(mentorsRef, (snapshot) => {
      menCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      setMentorsCount(menCount);
      
      // Update stats if sales are already loaded
      if (salesData.length > 0) {
        calculateAndSetStats(salesData, refCount, menCount);
      }
    });

    return () => {
      unsubSales();
      unsubReferrors();
      unsubMentors();
    };
  }, []);

  // Update stats when dateRange or topPerformersCount changes
  useEffect(() => {
    if (allSales.length > 0) {
      calculateAndSetStats(allSales, referrorsCount, mentorsCount);
    }
  }, [dateRange, topPerformersCount, allSales, referrorsCount, mentorsCount]);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Helper function to get current week range (Tuesday-Monday)
  const getThisWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
    
    let daysSinceLastTuesday;
    
    if (dayOfWeek >= 2) { // Tuesday (2) to Saturday (6)
      daysSinceLastTuesday = dayOfWeek - 2;
    } else { // Sunday (0) or Monday (1)
      daysSinceLastTuesday = (dayOfWeek + 7) - 2; // Go back to previous week's Tuesday
    }
    
    const lastTuesday = new Date(today);
    lastTuesday.setDate(today.getDate() - daysSinceLastTuesday);
    
    const nextMonday = new Date(lastTuesday);
    nextMonday.setDate(lastTuesday.getDate() + 6);
    
    return {
      startDate: lastTuesday.toISOString().split('T')[0],
      endDate: nextMonday.toISOString().split('T')[0]
    };
  };

  // Helper function to get last week range (Tuesday-Monday)
  const getLastWeekRange = () => {
    const { startDate: thisWeekStart, endDate: thisWeekEnd } = getThisWeekRange();
    const thisWeekStartDate = new Date(thisWeekStart);
    const thisWeekEndDate = new Date(thisWeekEnd);
    
    // Subtract 7 days from both start and end dates
    const lastWeekStartDate = new Date(thisWeekStartDate);
    lastWeekStartDate.setDate(thisWeekStartDate.getDate() - 7);
    
    const lastWeekEndDate = new Date(thisWeekEndDate);
    lastWeekEndDate.setDate(thisWeekEndDate.getDate() - 7);
    
    return {
      startDate: lastWeekStartDate.toISOString().split('T')[0],
      endDate: lastWeekEndDate.toISOString().split('T')[0]
    };
  };

  const applyQuickDatePreset = (preset) => {
    const today = new Date();
    let startDate = '';
    let endDate = getTodayDate();

    switch (preset) {
      case 'today':
        startDate = endDate;
        break;
      case 'lastWeek':
        // Use Last Week (Tuesday-Monday)
        const { startDate: lastWeekStart, endDate: lastWeekEnd } = getLastWeekRange();
        startDate = lastWeekStart;
        endDate = lastWeekEnd;
        break;
      case 'thisWeek':
        // Use Tuesday-Monday week
        const { startDate: weekStart, endDate: weekEnd } = getThisWeekRange();
        startDate = weekStart;
        endDate = weekEnd;
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'lastMonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = firstDayLastMonth.toISOString().split('T')[0];
        endDate = lastDayLastMonth.toISOString().split('T')[0];
        break;
      default:
        break;
    }

    setDateRange({ startDate, endDate });
  };

  // One-click All-Time Performance button
  const viewAllTimePerformance = () => {
    setDateRange({ startDate: '', endDate: '' });
  };

  // Calculate top performers based on date filter
  const calculateTopPerformers = useCallback((sales, startDate = null, endDate = null) => {
    let filteredSales = [...sales];
    
    // Apply date filter if set
    if (startDate) {
      filteredSales = filteredSales.filter(s => s.date >= startDate);
    }
    
    if (endDate) {
      filteredSales = filteredSales.filter(s => s.date <= endDate);
    }

    const referrorMap = new Map();
    
    filteredSales.forEach(sale => {
      const referrorName = sale.referror || 'Unknown';
      const amount = parseFloat(sale.amount || 0);
      
      if (referrorMap.has(referrorName)) {
        const existing = referrorMap.get(referrorName);
        existing.totalAmount += amount;
        existing.count += 1;
        existing.sales.push(sale);
      } else {
        referrorMap.set(referrorName, {
          name: referrorName,
          totalAmount: amount,
          count: 1,
          sales: [sale]
        });
      }
    });
    
    // Sort by totalAmount and take top N performers
    const performers = Array.from(referrorMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, topPerformersCount);
    
    return performers;
  }, [topPerformersCount]);

  // Calculate total amount from all sales (unfiltered)
  const calculateTotalAmount = useCallback((sales) => {
    return sales.reduce((sum, sale) => sum + parseFloat(sale.amount || 0), 0);
  }, []);

  // Main function to calculate and set stats
  const calculateAndSetStats = useCallback((sales, refCount, menCount) => {
    // Total Amount and Total Sales always show ALL data (unfiltered)
    const totalAmount = calculateTotalAmount(sales);
    const totalSales = sales.length;
    
    // Recent sales show filtered data if date filter is applied
    let recentSales = [...sales];
    if (dateRange.startDate) {
      recentSales = recentSales.filter(s => s.date >= dateRange.startDate);
    }
    if (dateRange.endDate) {
      recentSales = recentSales.filter(s => s.date <= dateRange.endDate);
    }
    
    // Sort by date and take top 5
    const recentFilteredSales = [...recentSales]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    // Top performers use the date filter
    const topPerformers = calculateTopPerformers(sales, dateRange.startDate, dateRange.endDate);

    setStats({
      totalSales, // Always ALL sales
      totalAmount, // Always ALL amount
      activeReferrors: refCount,
      activeMentors: menCount,
      recentSales: recentFilteredSales,
      topPerformers
    });
  }, [dateRange, calculateTopPerformers, calculateTotalAmount]);

  const handleDateRangeChange = () => {
    calculateAndSetStats(allSales, referrorsCount, mentorsCount);
    setShowDateFilter(false);
  };

  const resetDateRange = () => {
    const { startDate, endDate } = getThisWeekRange();
    setDateRange({ startDate, endDate });
  };

  const statCards = [
    {
      title: 'Total Package Sold', // Changed from 'Total Payins'
      value: stats.totalSales,
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
      title: 'Active Members',
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

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if current view is all-time (no date filter)
  const isAllTimeView = !dateRange.startDate && !dateRange.endDate;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Welcome back, {currentUser.name}</p>
        </div>
        
        <div className="flex gap-2">
          {/* All-Time Performance Button */}
          {(!isAllTimeView) && (
            <button
              onClick={viewAllTimePerformance}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold rounded-md flex items-center gap-2 transition-all"
            >
              <History className="w-4 h-4" />
              All-Time Performance
            </button>
          )}
          
          {/* Clear Filter Button (only show when not default week) */}
          {(dateRange.startDate && dateRange.endDate && 
            JSON.stringify(dateRange) !== JSON.stringify(getThisWeekRange())) && (
            <button
              onClick={resetDateRange}
              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold rounded-md flex items-center gap-2 transition-all"
            >
              <X className="w-4 h-4" />
              This Week
            </button>
          )}
          
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold rounded-md flex items-center gap-2 transition-all"
          >
            <Calendar className="w-4 h-4" />
            {dateRange.startDate || dateRange.endDate ? 'Adjust Date Range' : 'Filter Top Performers'}
          </button>
        </div>
      </div>

      {/* Current View Banner */}
      {dateRange.startDate || dateRange.endDate ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-xl p-4 ${
            isAllTimeView 
              ? 'bg-gradient-to-r from-purple-900/20 to-purple-800/10 border border-purple-600/20' 
              : 'bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-600/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAllTimeView ? (
                <History className="w-5 h-5 text-purple-400" />
              ) : (
                <CalendarDays className="w-5 h-5 text-blue-400" />
              )}
              <div>
                <p className={`font-medium ${isAllTimeView ? 'text-purple-400' : 'text-blue-400'}`}>
                  {isAllTimeView ? 'All-Time Performance View' : 'Weekly Performance View'}
                </p>
                <p className="text-sm text-gray-400">
                  {isAllTimeView 
                    ? 'Showing all-time performance data' 
                    : dateRange.startDate && dateRange.endDate
                      ? `${formatDisplayDate(dateRange.startDate)} to ${formatDisplayDate(dateRange.endDate)}`
                      : 'Custom date range'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Showing top {topPerformersCount} performers</p>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* Date Range Filter with Custom Calendar */}
      {showDateFilter && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Filter Top Performers by Date</h2>
            </div>
            <button
              onClick={() => setShowDateFilter(false)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          
          {/* Quick Date Presets */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 mb-2">Quick Date Presets</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Today', preset: 'today' },
                { label: 'Last Week (Tue-Mon)', preset: 'lastWeek' },
                { label: 'This Week (Tue-Mon)', preset: 'thisWeek' },
                { label: 'This Month', preset: 'thisMonth' },
                { label: 'Last Month', preset: 'lastMonth' }
              ].map(({ label, preset }) => (
                <button
                  key={preset}
                  onClick={() => applyQuickDatePreset(preset)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    preset === 'thisWeek' && 
                    JSON.stringify(dateRange) === JSON.stringify(getThisWeekRange())
                      ? 'bg-yellow-500 text-black font-medium'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <CalendarPicker
              label="Start Date"
              selectedDate={dateRange.startDate}
              onDateSelect={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
              maxDate={dateRange.endDate || getTodayDate()}
            />
            <CalendarPicker
              label="End Date"
              selectedDate={dateRange.endDate}
              onDateSelect={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
              minDate={dateRange.startDate}
              maxDate={getTodayDate()}
            />
          </div>

          {/* Selected Date Preview */}
          {(dateRange.startDate || dateRange.endDate) && (
            <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
              <p className="text-sm text-yellow-400">
                {dateRange.startDate 
                  ? formatDisplayDate(dateRange.startDate)
                  : 'Beginning'} 
                to {dateRange.endDate 
                  ? formatDisplayDate(dateRange.endDate)
                  : 'Present'}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={resetDateRange}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex-1"
            >
              This Week
            </button>
            <button
              onClick={handleDateRangeChange}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold rounded-md transition-colors flex-1"
            >
              Apply Filter
            </button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-700 rounded mb-4 w-1/3"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Summary Stats - ALWAYS SHOW ALL DATA */}
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

          {/* Top Performers Section - WITH SELECTOR AND DATE FILTER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-2 rounded-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400">Top Performers</h2>
                  <p className="text-sm text-gray-400">
                    {isAllTimeView 
                      ? 'All-time performance' 
                      : dateRange.startDate && dateRange.endDate
                        ? `Weekly performance (${formatDisplayDate(dateRange.startDate)} - ${formatDisplayDate(dateRange.endDate)})`
                        : 'Based on selected date range'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-400">
                    {stats.topPerformers.length} performers shown
                  </p>
                </div>
                <TopPerformersSelector 
                  count={topPerformersCount}
                  onChange={setTopPerformersCount}
                  maxCount={20}
                />
              </div>
            </div>
            {stats.topPerformers.length > 0 ? (
              <div className="space-y-4">
                {stats.topPerformers.map((performer, index) => (
                  <motion.div
                    key={performer.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-yellow-600/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-700' :
                          index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                          index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900' :
                          'bg-gradient-to-br from-gray-800 to-gray-900'
                        }`}>
                          <span className="text-white">
                            {index === 0 ? <Crown className="w-5 h-5" /> : `#${index + 1}`}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{performer.name}</p>
                          <p className="text-sm text-gray-400">
                            {performer.count} sale{performer.count !== 1 ? 's' : ''} {/* Changed from payins */}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-400">₱{performer.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    {/* Sale Details */}
                    <div className="mt-3 border-t border-gray-700 pt-3">
                      <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer text-sm text-yellow-400 hover:text-yellow-300">
                          <span>View {performer.count} sale details</span> {/* Changed from payin details */}
                          <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                        </summary>
                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                          {performer.sales.slice(0, 10).map((sale, saleIndex) => ( // Changed from payins to sales
                            <div key={saleIndex} className="flex items-center justify-between p-2 bg-gray-800/30 rounded text-sm">
                              <div>
                                <span className="text-white">{sale.name}</span>
                                <span className="text-gray-400 ml-2">• {sale.date}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-gray-400">Mentor: {sale.mentor}</span>
                                <span className="text-yellow-400 font-medium">₱{sale.amount}</span>
                              </div>
                            </div>
                          ))}
                          {performer.sales.length > 10 && (
                            <p className="text-xs text-gray-500 text-center">
                              ... and {performer.sales.length - 10} more sales {/* Changed from payins */}
                            </p>
                          )}
                        </div>
                      </details>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No performance data available {dateRange.startDate || dateRange.endDate ? 'for selected date range' : 'yet'}</p>
                {dateRange.startDate || dateRange.endDate ? (
                  <button
                    onClick={viewAllTimePerformance}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold rounded-md transition-colors"
                  >
                    View All Performers
                  </button>
                ) : null}
              </div>
            )}
          </motion.div>

          {/* Recent Sales Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-yellow-400">Recent Sales</h2> {/* Changed from Recent Payins */}
              <span className="text-sm text-gray-400">
                {stats.recentSales.length} shown
              </span>
            </div>
            {stats.recentSales.length > 0 ? (
              <div className="space-y-3">
                {stats.recentSales.map((sale) => ( // Changed from payin to sale
                  <div
                    key={sale.id}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-yellow-600/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{sale.name}</p>
                        <p className="text-sm text-gray-400">
                          Referror: {sale.referror} | Mentor: {sale.mentor}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-yellow-400">₱{sale.amount}</p>
                        <p className="text-xs text-gray-500">{sale.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No sales recorded {dateRange.startDate || dateRange.endDate ? 'in selected date range' : 'yet'}</p> {/* Changed from payins */}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Dashboard;