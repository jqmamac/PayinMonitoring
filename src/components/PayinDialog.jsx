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
    encodedDate: '',
    encodedAmount: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingPayin) {
      // For old data that doesn't have encodedAmount but is encoded, pre-fill with amount
      const encodedAmount = editingPayin.isEncoded && !editingPayin.encodedAmount 
        ? editingPayin.amount 
        : (editingPayin.encodedAmount || '');
      
      setFormData({
        ...editingPayin,
        isEncoded: editingPayin.isEncoded || false,
        encodedDate: editingPayin.encodedDate || '',
        encodedAmount: encodedAmount
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        referror: '',
        mentor: '',
        date: new Date().toISOString().split('T')[0],
        isEncoded: false,
        encodedDate: '',
        encodedAmount: ''
      });
    }
    setErrors({});
  }, [editingPayin, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate amount
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    // Validate encoded fields if isEncoded is checked
    if (formData.isEncoded) {
      // Validate encoded date is required
      if (!formData.encodedDate) {
        newErrors.encodedDate = 'Encoded date is required when marking as encoded';
      }
      
      // Validate encoded amount is required
      if (!formData.encodedAmount || formData.encodedAmount.trim() === '') {
        newErrors.encodedAmount = 'Encoded amount is required';
      } else {
        const amount = parseFloat(formData.amount) || 0;
        const encodedAmount = parseFloat(formData.encodedAmount) || 0;
        
        if (encodedAmount <= 0) {
          newErrors.encodedAmount = 'Encoded amount must be greater than 0';
        } else if (encodedAmount > amount) {
          newErrors.encodedAmount = 'Encoded amount cannot be greater than the payin amount';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // If isEncoded is true, ensure encodedAmount has a value
    const submitData = {
      ...formData,
      encodedAmount: formData.isEncoded 
        ? (formData.encodedAmount || formData.amount)  // Fallback to amount if somehow empty
        : ''
    };
    
    onSave(submitData);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, amount: value });
    
    // If encoded amount exists and is greater than new amount, show error
    if (formData.encodedAmount && parseFloat(formData.encodedAmount) > parseFloat(value || 0)) {
      setErrors({
        ...errors,
        encodedAmount: 'Encoded amount cannot be greater than the payin amount'
      });
    } else if (errors.encodedAmount?.includes('cannot be greater')) {
      const newErrors = { ...errors };
      delete newErrors.encodedAmount;
      setErrors(newErrors);
    }
  };

  const handleEncodedAmountChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, encodedAmount: value });
    
    // Clear any previous encoded amount errors
    if (errors.encodedAmount) {
      const newErrors = { ...errors };
      delete newErrors.encodedAmount;
      setErrors(newErrors);
    }
    
    // Validate immediately if value exists
    if (value.trim() !== '') {
      const amount = parseFloat(formData.amount) || 0;
      const encodedAmount = parseFloat(value) || 0;
      
      if (encodedAmount <= 0) {
        setErrors({
          ...errors,
          encodedAmount: 'Encoded amount must be greater than 0'
        });
      } else if (encodedAmount > amount) {
        setErrors({
          ...errors,
          encodedAmount: 'Encoded amount cannot be greater than the payin amount'
        });
      }
    }
  };

  const handleIsEncodedChange = (checked) => {
    const newFormData = { 
      ...formData, 
      isEncoded: checked,
      encodedDate: checked ? (formData.encodedDate || new Date().toISOString().split('T')[0]) : '',
      // Pre-fill encoded amount with the regular amount when checking isEncoded
      encodedAmount: checked ? (formData.encodedAmount || formData.amount) : ''
    };
    
    setFormData(newFormData);
    
    // Clear errors when unchecking
    if (!checked) {
      const newErrors = { ...errors };
      delete newErrors.encodedAmount;
      delete newErrors.encodedDate;
      setErrors(newErrors);
    }
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
            <Label className="text-gray-300">Amount (₱) *</Label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={handleAmountChange}
              className={`w-full mt-1 px-3 py-2 bg-gray-900 border ${errors.amount ? 'border-red-500' : 'border-yellow-600/30'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
              required
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-400">{errors.amount}</p>
            )}
          </div>
          
          <div>
            <Label className="text-gray-300">Referror *</Label>
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
            <Label className="text-gray-300">Mentor *</Label>
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
            <Label className="text-gray-300">Date *</Label>
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
              onCheckedChange={handleIsEncodedChange}
            />
            <Label htmlFor="isEncoded" className="text-white cursor-pointer">Is Encoded? *</Label>
          </div>

          {formData.isEncoded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden space-y-4 border-t border-yellow-600/30 pt-4"
            >
              <div>
                <Label className="text-yellow-400">Encoded Date *</Label>
                <input
                  type="date"
                  value={formData.encodedDate}
                  onChange={(e) => setFormData({ ...formData, encodedDate: e.target.value })}
                  className={`w-full mt-1 px-3 py-2 bg-gray-900 border ${errors.encodedDate ? 'border-red-500' : 'border-yellow-600/30'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  required
                />
                {errors.encodedDate && (
                  <p className="mt-1 text-sm text-red-400">{errors.encodedDate}</p>
                )}
              </div>
              
              <div>
                <Label className="text-yellow-400">Encoded Amount (₱) *</Label>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">Payin amount:</span>
                  <span className="text-xs font-medium text-yellow-400">₱{formData.amount || '0.00'}</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.encodedAmount}
                  onChange={handleEncodedAmountChange}
                  placeholder="Enter encoded amount"
                  className={`w-full mt-1 px-3 py-2 bg-gray-900 border ${errors.encodedAmount ? 'border-red-500' : 'border-yellow-600/30'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                  required={formData.isEncoded}
                />
                {errors.encodedAmount ? (
                  <p className="mt-1 text-sm text-red-400">{errors.encodedAmount}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Must be ≤ ₱{formData.amount || '0.00'}
                  </p>
                )}
              </div>
              
              {/* Helper message about partial encoding */}
              {formData.encodedAmount && formData.amount && 
               parseFloat(formData.encodedAmount) < parseFloat(formData.amount) && (
                <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <p className="text-sm text-yellow-400 font-medium">Partial Encoding</p>
                  <p className="text-xs text-gray-400 mt-1">
                    The remaining ₱{(parseFloat(formData.amount) - parseFloat(formData.encodedAmount)).toFixed(2)} 
                    will be counted as on-hand amount.
                  </p>
                </div>
              )}
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