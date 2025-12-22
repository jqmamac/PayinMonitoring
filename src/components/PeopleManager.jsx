import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Users, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Save } from 'lucide-react';
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

const PeopleManager = ({ title, type, items, onAdd, onUpdate, onDelete, canCreate, canEdit, canDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = (item = null) => {
    setEditingItem(item);
    setFormData({ name: item ? item.name : '' });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData({ name: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      onUpdate({ ...editingItem, name: formData.name });
    } else {
      onAdd({ name: formData.name });
    }
    handleCloseForm();
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gradient-to-br from-gray-900 to-black border border-yellow-500/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 p-3 rounded-xl border border-yellow-500/30">
            {type === 'referror' ? (
              <Users className="w-8 h-8 text-yellow-500" />
            ) : (
              <UserCircle className="w-8 h-8 text-yellow-500" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-gray-400">{items.length} Registered {title}</p>
          </div>
        </div>
        {canCreate && (
          <Button
            onClick={() => handleOpenForm()}
            className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold shadow-lg shadow-yellow-500/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add {type === 'referror' ? 'Referror' : 'Mentor'}
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/20 rounded-2xl shadow-2xl shadow-yellow-500/10 overflow-hidden">
        {/* Search */}
        <div className="p-6 border-b border-yellow-500/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 w-5 h-5" />
            <Input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 bg-black/50 border-yellow-500/30 text-white placeholder:text-gray-500 focus:border-yellow-500 focus:ring-yellow-500/20"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-yellow-500/20">
                <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                  Audit
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-yellow-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-500/10">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <p className="text-gray-400">No {title.toLowerCase()} found.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-yellow-500/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">{item.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      <div>Created by: <span className="text-gray-400">{item.createdByName || item.createdBy || 'System'}</span></div>
                      {item.updatedAt && (
                         <div>Updated by: <span className="text-gray-400">{item.updatedByName || item.updatedBy}</span></div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {canEdit && (
                          <Button
                            onClick={() => handleOpenForm(item)}
                            size="sm"
                            variant="ghost"
                            className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            onClick={() => setDeleteId(item.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
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
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCloseForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-yellow-500/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-yellow-500">
                  {editingItem ? `Edit ${type === 'referror' ? 'Referror' : 'Mentor'}` : `New ${type === 'referror' ? 'Referror' : 'Mentor'}`}
                </h2>
                <button onClick={handleCloseForm} className="text-gray-400 hover:text-yellow-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-yellow-500 font-semibold">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    required
                    className="bg-black/50 border-yellow-500/30 text-white focus:border-yellow-500 focus:ring-yellow-500/20"
                    placeholder="Enter name"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <Button
                    type="button"
                    onClick={handleCloseForm}
                    variant="outline"
                    className="flex-1 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 text-black font-semibold"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-yellow-500">Delete Record</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PeopleManager;