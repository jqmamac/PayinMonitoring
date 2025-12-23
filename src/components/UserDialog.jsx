import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const UserDialog = ({ isOpen, onClose, onSave, editingUser, roles }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    roleId: ''
  });

  useEffect(() => {
    if (editingUser) {
      setFormData(editingUser);
    } else {
      setFormData({
        name: '',
        username: '',
        password: '',
        roleId: ''
      });
    }
  }, [editingUser, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-400">
            {editingUser ? 'Edit User' : 'Add New User'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-300">Full Name</Label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Username</Label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Password</Label>
            <input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Role</Label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
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
              {editingUser ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;