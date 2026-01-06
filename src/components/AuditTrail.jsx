import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const AuditTrail = ({ currentUser, roles }) => {
  const [audits, setAudits] = useState([]);
  const [filteredAudits, setFilteredAudits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (hasPermission(currentUser, PERMISSIONS.VIEW_AUDIT, roles)) {
      const auditsRef = ref(db, 'audits');
      const unsubscribe = onValue(auditsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedAudits = data ? Object.values(data).reverse() : [];
        setAudits(loadedAudits);
        setFilteredAudits(loadedAudits);
      });
      return () => unsubscribe();
    }
  }, [currentUser, roles]);

  useEffect(() => {
    filterAudits();
  }, [searchTerm, filterAction, audits]);

  // Calculate pagination when filteredAudits changes
  useEffect(() => {
    const total = Math.ceil(filteredAudits.length / itemsPerPage);
    setTotalPages(total);
    
    // If current page is greater than total pages after filtering, reset to page 1
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
  }, [filteredAudits, itemsPerPage]);

  const filterAudits = () => {
    let filtered = audits;

    if (searchTerm) {
      filtered = filtered.filter(audit =>
        (audit.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (audit.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (audit.entity || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterAction) {
      filtered = filtered.filter(audit => audit.action === filterAction);
    }

    setFilteredAudits(filtered);
  };

  // Get current items for the page
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAudits.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      pageNumbers.push(1);
      
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'text-green-400 bg-green-900/20 border-green-600/30';
      case 'UPDATE':
        return 'text-blue-400 bg-blue-900/20 border-blue-600/30';
      case 'DELETE':
        return 'text-red-400 bg-red-900/20 border-red-600/30';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-600/30';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to render changes in audit log
  const renderChanges = (changes) => {
    if (!changes) return null;
    
    return (
      <div className="mt-2 text-xs text-gray-400 border-l-2 border-yellow-600/30 pl-3">
        {changes.old && changes.new && (
          <div>
            <strong>Changes:</strong>
            <ul className="mt-1 space-y-1">
              {changes.old.name !== changes.new.name && (
                <li>Name: <span className="text-red-400">{changes.old.name}</span> → <span className="text-green-400">{changes.new.name}</span></li>
              )}
              {changes.old.username !== changes.new.username && (
                <li>Username: <span className="text-red-400">{changes.old.username}</span> → <span className="text-green-400">{changes.new.username}</span></li>
              )}
              {changes.old.roleId !== changes.new.roleId && (
                <li>Role: <span className="text-red-400">{changes.old.roleId}</span> → <span className="text-green-400">{changes.new.roleId}</span></li>
              )}
              {changes.new.password && (
                <li>Password: <span className="text-yellow-400">[Reset]</span></li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  };

  if (!hasPermission(currentUser, PERMISSIONS.VIEW_AUDIT, roles)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-12 text-center">
        <div className="text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl font-semibold">Access Denied</p>
          <p className="mt-2">You do not have permission to view the Audit Trail.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-3 rounded-lg">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Audit Trail
        </h1>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by details, user, or entity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Pagination Controls - Top */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-sm text-gray-400">
            Showing <span className="font-bold text-yellow-400">{getCurrentItems().length}</span> of{' '}
            <span className="font-bold text-yellow-400">{filteredAudits.length}</span> audit logs
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400 whitespace-nowrap">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="bg-gray-900 border border-yellow-600/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-400">per page</span>
            </div>
          </div>
        </div>

        {/* Audit Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-3">
            {getCurrentItems().map((audit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-yellow-600/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getActionColor(audit.action)}`}>
                      {audit.action}
                    </span>
                    <span className="text-sm text-gray-400">{audit.entity}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatTimestamp(audit.timestamp)}</span>
                </div>
                <p className="text-white mb-2">{audit.details}</p>
                {audit.changes && renderChanges(audit.changes)}
                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                  <span>User: <span className="text-yellow-400">{audit.user}</span></span>
                  <span>ID: {audit.entityId}</span>
                </div>
              </motion.div>
            ))}
            {getCurrentItems().length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No audit logs found</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pagination Controls - Bottom */}
        {filteredAudits.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Page <span className="font-bold text-yellow-400">{currentPage}</span> of{' '}
              <span className="font-bold text-yellow-400">{totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* First Page Button */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              
              {/* Previous Page Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 min-w-[40px] ${
                          currentPage === page
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              
              {/* Last Page Button */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditTrail;