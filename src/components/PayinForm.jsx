import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const PayinForm = ({ payin, referrors, mentors, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    payinName: '',
    referror: '',
    amountPaid: '',
    mentor: '',
    isEncoded: false,
    dateEncoded: '',
    datePaid: '',
  });

  useEffect(() => {
    if (payin) {
      setFormData({
        payinName: payin.payinName || '',
        referror: payin.referror || '',
        amountPaid: payin.amountPaid || '',
        mentor: payin.mentor || '',
        isEncoded: payin.isEncoded || false,
        dateEncoded: payin.dateEncoded || '',
        datePaid: payin.datePaid || '',
      });
    }
  }, [payin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData(prev => ({ ...prev, isEncoded: checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500/30 rounded-2xl p-8 max-w-2xl w-full shadow-2xl shadow-yellow-500/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              {payin ? 'Edit Payin' : 'New Payin'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-yellow-500 transition-colors p-2 hover:bg-yellow-500/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="payinName" className="text-yellow-500 font-semibold">
                  Payin Name *
                </Label>
                <Input
                  id="payinName"
                  name="payinName"
                  value={formData.payinName}
                  onChange={handleChange}
                  required
                  className="bg-black/50 border-yellow-500/30 text-white focus:border-yellow-500 focus:ring-yellow-500/20"
                  placeholder="Enter payin name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referror" className="text-yellow-500 font-semibold">
                  Referror *
                </Label>
                {referrors.length > 0 ? (
                  <select
                    id="referror"
                    name="referror"
                    value={formData.referror}
                    onChange={handleChange}
                    required
                    className="flex h-11 w-full rounded-lg border border-yellow-500/30 bg-gray-900 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  >
                    <option value="" disabled>Select a referror</option>
                    {referrors.map((ref) => (
                      <option key={ref.id} value={ref.name}>{ref.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 text-red-400 text-sm p-2 border border-red-500/20 bg-red-500/10 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <span>No referrors available. Please add one first.</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amountPaid" className="text-yellow-500 font-semibold">
                  Amount Paid *
                </Label>
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  type="number"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  required
                  className="bg-black/50 border-yellow-500/30 text-white focus:border-yellow-500 focus:ring-yellow-500/20"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mentor" className="text-yellow-500 font-semibold">
                  C/O (Mentor Name) *
                </Label>
                {mentors.length > 0 ? (
                  <select
                    id="mentor"
                    name="mentor"
                    value={formData.mentor}
                    onChange={handleChange}
                    required
                    className="flex h-11 w-full rounded-lg border border-yellow-500/30 bg-gray-900 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                  >
                    <option value="" disabled>Select a mentor</option>
                    {mentors.map((men) => (
                      <option key={men.id} value={men.name}>{men.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-2 text-red-400 text-sm p-2 border border-red-500/20 bg-red-500/10 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <span>No mentors available. Please add one first.</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="datePaid" className="text-yellow-500 font-semibold">
                  Date Paid *
                </Label>
                <Input
                  id="datePaid"
                  name="datePaid"
                  type="date"
                  value={formData.datePaid}
                  onChange={handleChange}
                  required
                  className="bg-black/50 border-yellow-500/30 text-white focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateEncoded" className="text-yellow-500 font-semibold">
                  Date Encoded
                </Label>
                <Input
                  id="dateEncoded"
                  name="dateEncoded"
                  type="date"
                  value={formData.dateEncoded}
                  onChange={handleChange}
                  className="bg-black/50 border-yellow-500/30 text-white focus:border-yellow-500 focus:ring-yellow-500/20"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-black/30 rounded-lg border border-yellow-500/20">
              <Checkbox
                id="isEncoded"
                checked={formData.isEncoded}
                onCheckedChange={handleCheckboxChange}
                className="border-yellow-500/50 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
              />
              <Label
                htmlFor="isEncoded"
                className="text-white font-medium cursor-pointer"
              >
                Is Encoded
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400 hover:border-yellow-500/50 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={referrors.length === 0 || mentors.length === 0}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold shadow-lg shadow-yellow-500/20 transition-all duration-300 hover:shadow-yellow-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5 mr-2" />
                {payin ? 'Update Payin' : 'Create Payin'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PayinForm;