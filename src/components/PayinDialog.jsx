import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const PayinDialog = ({ isOpen, onClose, onSave, editingPayin, referrorsList = [], mentorsList = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    referror: '',
    mentor: '',
    date: new Date().toISOString().split('T')[0],
    isEncoded: false,
    encodedDate: ''
  });

  useEffect(() => {
    if (editingPayin) {
      setFormData({
        ...editingPayin,
        isEncoded: editingPayin.isEncoded || false,
        encodedDate: editingPayin.encodedDate || ''
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        referror: '',
        mentor: '',
        date: new Date().toISOString().split('T')[0],
        isEncoded: false,
        encodedDate: ''
      });
    }
  }, [editingPayin, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-400">
            {editingPayin ? 'Edit Payin' : 'Add New Payin'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-300">Name</Label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Amount (₱)</Label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Referror</Label>
            <select
              value={formData.referror}
              onChange={(e) => setFormData({ ...formData, referror: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">Select Referror</option>
              {referrorsList.map((ref) => (
                <option key={ref.id} value={ref.name}>{ref.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <Label className="text-gray-300">Mentor</Label>
            <select
              value={formData.mentor}
              onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">Select Mentor</option>
              {mentorsList.map((mentor) => (
                <option key={mentor.id} value={mentor.name}>{mentor.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <Label className="text-gray-300">Date</Label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>

          <div className="flex items-center space-x-2 py-2">
            <Checkbox 
              id="isEncoded" 
              checked={formData.isEncoded}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                isEncoded: checked,
                encodedDate: checked ? (formData.encodedDate || new Date().toISOString().split('T')[0]) : ''
              })}
            />
            <Label htmlFor="isEncoded" className="text-white cursor-pointer">Is Encoded?</Label>
          </div>

          {formData.isEncoded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <Label className="text-yellow-400">Encoded Date *</Label>
              <input
                type="date"
                value={formData.encodedDate}
                onChange={(e) => setFormData({ ...formData, encodedDate: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </motion.div>
          )}
          
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
              {editingPayin ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PayinDialog;