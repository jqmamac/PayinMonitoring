import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import RoleDialog from '@/components/RoleDialog';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { ref, push, set, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const RoleManager = ({ currentUser, roles }) => {
  // We receive roles from props (parent App component) but we can also listen locally if we want isolated updates.
  // Using the prop `roles` is faster since it's already fetched, but the component needs to handle updates.
  // Given App.jsx updates `roles` in state, props should be fine.
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const { toast } = useToast();

  const handleSave = async (roleData) => {
    try {
        let action;
        if (editingRole) {
            if (!hasPermission(currentUser, PERMISSIONS.ROLE_EDIT, roles)) {
                toast({
                    title: "Access Denied",
                    description: "You do not have permission to edit roles",
                    variant: "destructive"
                });
                return;
            }
            action = 'updated';
            const roleRef = ref(db, `roles/${editingRole.id}`);
            await set(roleRef, { ...roleData, id: editingRole.id });
        } else {
            if (!hasPermission(currentUser, PERMISSIONS.ROLE_ADD, roles)) {
                toast({
                    title: "Access Denied",
                    description: "You do not have permission to add roles",
                    variant: "destructive"
                });
                return;
            }
            action = 'added';
            const newRef = push(ref(db, 'roles'));
            const newId = newRef.key;
            await set(newRef, { ...roleData, id: newId });
        }

        setIsDialogOpen(false);
        setEditingRole(null);

        toast({
            title: "Success",
            description: `Role ${action} successfully`,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to save role",
            variant: "destructive"
        });
    }
  };

  const handleDelete = async (id) => {
    if (!hasPermission(currentUser, PERMISSIONS.ROLE_DELETE, roles)) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to delete roles",
        variant: "destructive"
      });
      return;
    }
    if (id === 'superadmin' || id === 'guest') {
      toast({
        title: "Error",
        description: "Cannot delete default system roles",
        variant: "destructive"
      });
      return;
    }

    try {
        const roleRef = ref(db, `roles/${id}`);
        await remove(roleRef);
        toast({
            title: "Success",
            description: "Role deleted successfully",
        });
    } catch (error) {
         toast({
            title: "Error",
            description: "Failed to delete role",
            variant: "destructive"
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-500 to-red-700 p-3 rounded-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Role Manager
          </h1>
        </div>
        {hasPermission(currentUser, PERMISSIONS.ROLE_ADD, roles) && (
          <Button
            onClick={() => {
              setEditingRole(null);
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold shadow-lg hover:shadow-yellow-500/50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Role
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-red-900/30 p-3 rounded-lg">
                <Lock className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex gap-2">
                {hasPermission(currentUser, PERMISSIONS.ROLE_EDIT, roles) && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingRole(role);
                      setIsDialogOpen(true);
                    }}
                    className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-600/30"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
                {hasPermission(currentUser, PERMISSIONS.ROLE_DELETE, roles) && role.id !== 'superadmin' && role.id !== 'guest' && (
                  <Button
                    size="sm"
                    onClick={() => handleDelete(role.id)}
                    className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-600/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{role.name}</h3>
            <p className="text-gray-400 text-sm">{role.permissions?.length || 0} permissions granted</p>
          </motion.div>
        ))}
      </div>

      <RoleDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingRole(null);
        }}
        onSave={handleSave}
        editingRole={editingRole}
      />
    </div>
  );
};

export default RoleManager;