import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PERMISSIONS } from '@/lib/permissions';

const RoleDialog = ({ isOpen, onClose, onSave, editingRole }) => {
  const [formData, setFormData] = useState({
    name: '',
    permissions: []
  });

  useEffect(() => {
    if (editingRole) {
      setFormData(editingRole);
    } else {
      setFormData({
        name: '',
        permissions: []
      });
    }
  }, [editingRole, isOpen]);

  const togglePermission = (perm) => {
    setFormData(prev => {
      if (prev.permissions.includes(perm)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== perm) };
      } else {
        return { ...prev, permissions: [...prev.permissions, perm] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Group permissions for better UI
  const groupedPermissions = {
    Payins: [PERMISSIONS.PAYIN_ADD, PERMISSIONS.PAYIN_EDIT, PERMISSIONS.PAYIN_DELETE],
    Referrors: [PERMISSIONS.REFERROR_ADD, PERMISSIONS.REFERROR_EDIT, PERMISSIONS.REFERROR_DELETE],
    Mentors: [PERMISSIONS.MENTOR_ADD, PERMISSIONS.MENTOR_EDIT, PERMISSIONS.MENTOR_DELETE],
    Users: [PERMISSIONS.USER_ADD, PERMISSIONS.USER_EDIT, PERMISSIONS.USER_DELETE],
    Roles: [PERMISSIONS.ROLE_ADD, PERMISSIONS.ROLE_EDIT, PERMISSIONS.ROLE_DELETE],
    Analytics: [PERMISSIONS.VIEW_ANALYTICS, PERMISSIONS.VIEW_AUDIT]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/30 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-yellow-400">
            {editingRole ? 'Edit Role' : 'Add New Role'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-gray-300">Role Name</Label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
          </div>
          
          <div className="space-y-4">
            <Label className="text-yellow-400 text-lg">Permissions</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-semibold text-blue-400 mb-3">{category}</h4>
                  <div className="space-y-2">
                    {perms.map((perm) => (
                      <div key={perm} className="flex items-center space-x-2">
                        <Checkbox 
                          id={perm} 
                          checked={formData.permissions.includes(perm)}
                          onCheckedChange={() => togglePermission(perm)}
                        />
                        <Label htmlFor={perm} className="text-sm cursor-pointer capitalize">
                          {perm.replace(/_/g, ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
              {editingRole ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleDialog;