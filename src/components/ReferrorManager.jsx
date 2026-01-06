import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ReferrorDialog from '@/components/ReferrorDialog';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { ref, push, set, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const ReferrorManager = ({ currentUser, roles }) => {
  const [referrors, setReferrors] = useState([]);
  const [filteredReferrors, setFilteredReferrors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReferror, setEditingReferror] = useState(null);
  const { toast } = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const referrorsRef = ref(db, 'referrors');
    const unsubscribe = onValue(referrorsRef, (snapshot) => {
        const data = snapshot.val();
        const loadedReferrors = data ? Object.values(data) : [];
        setReferrors(loadedReferrors);
        setFilteredReferrors(loadedReferrors);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterReferrors();
  }, [searchTerm, referrors]);

  // Calculate pagination when filteredReferrors changes
  useEffect(() => {
    const total = Math.ceil(filteredReferrors.length / itemsPerPage);
    setTotalPages(total);
    
    // If current page is greater than total pages after filtering, reset to page 1
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
  }, [filteredReferrors, itemsPerPage]);

  const filterReferrors = () => {
    if (!searchTerm) {
      setFilteredReferrors(referrors);
    } else {
      const filtered = referrors.filter(referror =>
        referror.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (referror.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (referror.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReferrors(filtered);
    }
  };

  // Get current items for the page
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReferrors.slice(startIndex, endIndex);
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
    
    toast({
      title: "Display Updated",
      description: `Showing ${newItemsPerPage} items per page`,
    });
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

  const handleSave = async (referrorData) => {
    try {
        let action;
        if (editingReferror) {
            if (!hasPermission(currentUser, PERMISSIONS.REFERROR_EDIT, roles)) return;
            action = 'updated';
            const referrorRef = ref(db, `referrors/${editingReferror.id}`);
            await set(referrorRef, { ...referrorData, id: editingReferror.id });
            
            logAudit({
                action: 'UPDATE',
                entity: 'Referror',
                entityId: editingReferror.id,
                details: `Updated referror: ${referrorData.name}`,
                user: currentUser.name
            });
        } else {
            if (!hasPermission(currentUser, PERMISSIONS.REFERROR_ADD, roles)) return;
            action = 'added';
            const newRef = push(ref(db, 'referrors'));
            const newId = newRef.key;
            await set(newRef, { ...referrorData, id: newId });
            
            logAudit({
                action: 'CREATE',
                entity: 'Referror',
                entityId: newId,
                details: `Created referror: ${referrorData.name}`,
                user: currentUser.name
            });
        }

        setIsDialogOpen(false);
        setEditingReferror(null);

        toast({
            title: "Success",
            description: `Referror ${action} successfully`,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to save referror",
            variant: "destructive"
        });
    }
  };

  const handleDelete = async (id) => {
    if (!hasPermission(currentUser, PERMISSIONS.REFERROR_DELETE, roles)) return;
    try {
        const referror = referrors.find(r => r.id === id);
        const referrorRef = ref(db, `referrors/${id}`);
        await remove(referrorRef);

        logAudit({
            action: 'DELETE',
            entity: 'Referror',
            entityId: id,
            details: `Deleted referror: ${referror?.name || 'Unknown'}`,
            user: currentUser.name
        });

        toast({
            title: "Success",
            description: "Referror deleted successfully",
        });
    } catch (error) {
         toast({
            title: "Error",
            description: "Failed to delete referror",
            variant: "destructive"
        });
    }
  };

  const logAudit = async (auditEntry) => {
    const auditRef = push(ref(db, 'audits'));
    await set(auditRef, {
      ...auditEntry,
      timestamp: new Date().toISOString(),
      id: auditRef.key
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Referror Manager
          </h1>
        </div>
        {hasPermission(currentUser, PERMISSIONS.REFERROR_ADD, roles) && (
          <Button
            onClick={() => {
              setEditingReferror(null);
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold shadow-lg hover:shadow-yellow-500/50 transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Referror
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6">
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search referrors by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Pagination Controls - Top */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="text-sm text-gray-400">
            Showing <span className="font-bold text-yellow-400">{getCurrentItems().length}</span> of{' '}
            <span className="font-bold text-yellow-400">{filteredReferrors.length}</span> referrors
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400 whitespace-nowrap">Show:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value)}
                className="bg-gray-900 border border-yellow-600/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-400">per page</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getCurrentItems().map((referror, index) => (
            <motion.div
              key={referror.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-900/30 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex gap-2">
                  {hasPermission(currentUser, PERMISSIONS.REFERROR_EDIT, roles) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingReferror(referror);
                        setIsDialogOpen(true);
                      }}
                      className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-600/30"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  {hasPermission(currentUser, PERMISSIONS.REFERROR_DELETE, roles) && (
                    <Button
                      size="sm"
                      onClick={() => handleDelete(referror.id)}
                      className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-600/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{referror.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{referror.email}</p>
              <div className="pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">Phone: {referror.phone}</p>
                <p className="text-xs text-gray-500 mt-1">Status: <span className="text-green-400">{referror.status}</span></p>
              </div>
            </motion.div>
          ))}
        </div>

        {getCurrentItems().length === 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No referrors found</p>
          </div>
        )}

        {/* Pagination Controls - Bottom */}
        {filteredReferrors.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Page <span className="font-bold text-yellow-400">{currentPage}</span> of{' '}
              <span className="font-bold text-yellow-400">{totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* First Page Button */}
              <Button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                size="sm"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              
              {/* Previous Page Button */}
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Page Numbers */}
              <div className="flex gap-1">
                {getPageNumbers().map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                      <Button
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 min-w-[40px] ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-bold'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                        } border border-gray-600 rounded-lg`}
                        size="sm"
                      >
                        {page}
                      </Button>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              {/* Next Page Button */}
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              
              {/* Last Page Button */}
              <Button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                size="sm"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ReferrorDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingReferror(null);
        }}
        onSave={handleSave}
        editingReferror={editingReferror}
      />
    </div>
  );
};

export default ReferrorManager;