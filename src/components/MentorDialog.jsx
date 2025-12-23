import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const MentorDialog = ({ isOpen, onClose, onSave, editingMentor }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    status: 'Active'
  });

  useEffect(() => {
    if (editingMentor) {
      setFormData(editingMentor);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        specialty: '',
        status: 'Active'
      });
    }
  }, [editingMentor, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-400">
            {editingMentor ? 'Edit Mentor' : 'Add New Mentor'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-300">Name *</Label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Email (Optional)</Label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Phone (Optional)</Label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Specialty (Optional)</Label>
            <input
              type="text"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g., Business Development, Marketing"
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Status</Label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold"
            >
              {editingMentor ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MentorDialog;