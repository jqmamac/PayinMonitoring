import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import UserDialog from '@/components/UserDialog';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { ref, push, set, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const UserManager = ({ currentUser, roles }) => {
  const [users, setUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        setUsers(data ? Object.values(data) : []);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (userData) => {
    try {
        let action;
        if (editingUser) {
            if (!hasPermission(currentUser, PERMISSIONS.USER_EDIT, roles)) {
                toast({
                    title: "Access Denied",
                    description: "You do not have permission to edit users",
                    variant: "destructive"
                });
                return;
            }
            action = 'updated';
            const userRef = ref(db, `users/${editingUser.id}`);
            await set(userRef, { ...userData, id: editingUser.id });
        } else {
            if (!hasPermission(currentUser, PERMISSIONS.USER_ADD, roles)) {
                toast({
                    title: "Access Denied",
                    description: "You do not have permission to add users",
                    variant: "destructive"
                });
                return;
            }
            action = 'added';
            const newRef = push(ref(db, 'users'));
            const newId = newRef.key;
            await set(newRef, { ...userData, id: newId });
        }

        setIsDialogOpen(false);
        setEditingUser(null);

        toast({
            title: "Success",
            description: `User ${action} successfully`,
        });
    } catch (error) {
         toast({
            title: "Error",
            description: "Failed to save user",
            variant: "destructive"
        });
    }
  };

  const handleDelete = async (id) => {
    if (!hasPermission(currentUser, PERMISSIONS.USER_DELETE, roles)) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to delete users",
        variant: "destructive"
      });
      return;
    }
    if (id === '1') { // Protect default admin
       toast({
         title: "Error",
         description: "Cannot delete the default Super Admin",
         variant: "destructive"
       });
       return;
    }

    try {
        const userRef = ref(db, `users/${id}`);
        await remove(userRef);
        toast({
            title: "Success",
            description: "User deleted successfully",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to delete user",
            variant: "destructive"
        });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-3 rounded-lg">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            User Manager
          </h1>
        </div>
        {hasPermission(currentUser, PERMISSIONS.USER_ADD, roles) && (
          <Button
            onClick={() => {
              setEditingUser(null);
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold shadow-lg hover:shadow-yellow-500/50"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add User
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => {
          const userRole = roles.find(r => r.id === user.roleId)?.name || 'Unknown';
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-indigo-900/30 p-3 rounded-lg">
                  <UserCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="flex gap-2">
                  {hasPermission(currentUser, PERMISSIONS.USER_EDIT, roles) && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingUser(user);
                        setIsDialogOpen(true);
                      }}
                      className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-600/30"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  {hasPermission(currentUser, PERMISSIONS.USER_DELETE, roles) && user.id !== '1' && (
                    <Button
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-600/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{user.name}</h3>
              <p className="text-gray-400 text-sm">Username: {user.username}</p>
              <div className="pt-3 border-t border-gray-700 mt-3">
                <p className="text-xs text-yellow-500">Role: {userRole}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSave}
        editingUser={editingUser}
        roles={roles}
      />
    </div>
  );
};

export default UserManager;