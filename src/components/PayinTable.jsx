import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const PayinTable = ({ payins, onEdit, onDelete, canEdit, canDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const filteredPayins = payins.filter(payin =>
    payin.payinName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payin.referror?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payin.mentor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return `₱${parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/20 rounded-2xl shadow-2xl shadow-yellow-500/10 overflow-hidden">
      {/* Search Bar */}
      <div className="p-6 border-b border-yellow-500/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name, referror, or mentor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-yellow-500/20">
              <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                Payin Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                Referror
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                C/O (Mentor)
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                Audit Info
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-yellow-500/10">
            {filteredPayins.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
                      <Search className="w-8 h-8 text-yellow-500/50" />
                    </div>
                    <p className="text-gray-400 text-lg">
                      {searchTerm ? 'No payins found matching your search' : 'No payins yet.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPayins.map((payin, index) => (
                <motion.tr
                  key={payin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-yellow-500/5 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white font-medium">{payin.payinName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-300">{payin.referror}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-yellow-500 font-semibold">{formatAmount(payin.amountPaid)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-300">{payin.mentor}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payin.isEncoded ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Encoded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div>Enc: {formatDate(payin.dateEncoded)}</div>
                    <div>Paid: {formatDate(payin.datePaid)}</div>
                    <div className="mt-1 text-gray-600 text-[10px]">
                      Created by: {payin.createdByName || payin.createdBy || 'System'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {canEdit && (
                        <Button
                          onClick={() => onEdit(payin)}
                          size="sm"
                          variant="ghost"
                          className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all duration-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          onClick={() => handleDeleteClick(payin.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      {!canEdit && !canDelete && (
                         <span className="text-gray-600 text-xs italic">Read Only</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-yellow-500">
              Delete Payin
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete this payin? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PayinTable;