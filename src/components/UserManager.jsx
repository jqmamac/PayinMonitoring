import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import UserDialog from '@/components/UserDialog';
import { 
  hasPermission, 
  isSuperAdmin, 
  canEditUser, 
  canDeleteUser, 
  PERMISSIONS 
} from '@/lib/permissions';
import { ref, push, set, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const UserManager = ({ currentUser, roles }) => {
  const [users, setUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { toast } = useToast();

  // Check if user is editing their own profile
  const isEditingOwnProfile = editingUser && editingUser.id === currentUser.id;

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
            // Check edit permission
            if (!canEditUser(currentUser, editingUser.id, roles)) {
                toast({
                    title: "Access Denied",
                    description: "You do not have permission to edit this user",
                    variant: "destructive"
                });
                return;
            }
            
            // Non-Super Admin users cannot change roles
            if (!isSuperAdmin(currentUser) && userData.roleId !== editingUser.roleId) {
                toast({
                    title: "Access Denied",
                    description: "Only Super Admin can change user roles",
                    variant: "destructive"
                });
                return;
            }
            
            // If editing own profile and not Super Admin, preserve original role
            if (isEditingOwnProfile && !isSuperAdmin(currentUser)) {
                userData.roleId = editingUser.roleId;
            }
            
            action = 'updated';
            const userRef = ref(db, `users/${editingUser.id}`);
            await set(userRef, { ...userData, id: editingUser.id });
        } else {
            // Adding new user - only users with USER_ADD permission can do this
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
    if (!canDeleteUser(currentUser, id, roles)) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to delete this user",
        variant: "destructive"
      });
      return;
    }

    // Additional safety: Protect default Super Admin (id: '1')
    if (id === '1') {
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
            {isSuperAdmin(currentUser) ? 'User Manager' : 'User Profiles'}
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

      {/* Informational note for non-Super Admin users */}
      {!isSuperAdmin(currentUser) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 border border-blue-600/30 rounded-lg p-4"
        >
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> {hasPermission(currentUser, PERMISSIONS.USER_EDIT, roles) 
              ? "You can edit all users, but only Super Admin can change roles." 
              : "You can only edit your own profile. Role changes require Super Admin permission."}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => {
          const userRole = roles.find(r => r.id === user.roleId)?.name || 'Unknown';
          const isCurrentUser = user.id === currentUser.id;
          const showEditButton = canEditUser(currentUser, user.id, roles);
          const showDeleteButton = canDeleteUser(currentUser, user.id, roles);
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br from-gray-800 to-gray-900 border rounded-xl p-6 ${
                isCurrentUser 
                  ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/10' 
                  : 'border-yellow-600/20'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  isCurrentUser ? 'bg-yellow-900/30' : 'bg-indigo-900/30'
                }`}>
                  <UserCheck className={`w-6 h-6 ${
                    isCurrentUser ? 'text-yellow-400' : 'text-indigo-400'
                  }`} />
                </div>
                <div className="flex gap-2">
                  {showEditButton && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditingUser(user);
                        setIsDialogOpen(true);
                      }}
                      className={`${
                        isCurrentUser
                          ? 'bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400 border-yellow-600/30'
                          : 'bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border-blue-600/30'
                      } border`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  {showDeleteButton && user.id !== '1' && (
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
              <h3 className="text-xl font-bold text-white mb-2">
                {user.name}
                {isCurrentUser && (
                  <span className="ml-2 text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
                {user.roleId === 'superadmin' && !isCurrentUser && (
                  <span className="ml-2 text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded-full">
                    Super Admin
                  </span>
                )}
              </h3>
              <p className="text-gray-400 text-sm">Username: {user.username}</p>
              <div className="pt-3 border-t border-gray-700 mt-3">
                <p className={`text-xs ${user.roleId === 'superadmin' ? 'text-red-400' : 'text-yellow-500'}`}>
                  Role: {userRole}
                </p>
                {isCurrentUser && (
                  <p className="text-xs text-gray-500 mt-1">
                    Click edit to update your profile
                  </p>
                )}
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
        isSuperAdmin={isSuperAdmin(currentUser)}
        isEditingOwnProfile={isEditingOwnProfile}
      />
    </div>
  );
};

export default UserManager;