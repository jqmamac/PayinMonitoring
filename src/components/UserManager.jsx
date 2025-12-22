import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Shield, User, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
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

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { toast } = useToast();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'guest'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const stored = localStorage.getItem('users');
    if (stored) setUsers(JSON.parse(stored));
  };

  const saveUsers = (newUsers) => {
    localStorage.setItem('users', JSON.stringify(newUsers));
    setUsers(newUsers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Update
      const updated = users.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            // Only update password if provided
            ...(formData.password ? { password: formData.password } : {})
          };
        }
        return u;
      });
      saveUsers(updated);
      toast({ title: "Success", description: "User updated successfully" });
    } else {
      // Create
      if (!formData.password) {
        toast({ title: "Error", description: "Password is required for new users", variant: "destructive" });
        return;
      }
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        createdAt: new Date().toISOString()
      };
      saveUsers([...users, newUser]);
      toast({ title: "Success", description: "User created successfully" });
    }
    handleCloseForm();
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      const updated = users.filter(u => u.id !== deleteId);
      saveUsers(updated);
      setDeleteId(null);
      toast({ title: "Success", description: "User deleted successfully" });
    }
  };

  const handleOpenForm = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't show existing password
        role: user.role
      });
    } else {
      setFormData({ name: '', email: '', password: '', role: 'guest' });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gradient-to-br from-gray-900 to-black border border-yellow-500/20 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/10 p-3 rounded-xl">
            <Shield className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <p className="text-gray-400">Manage system access and roles</p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-gray-900/50 border border-yellow-500/20 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-yellow-500/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-yellow-500/20"
            />
          </div>
        </div>
        
        <table className="w-full">
          <thead>
            <tr className="bg-white/5">
              <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-500 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-yellow-500 uppercase">Role</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-yellow-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-white/5">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${user.role === 'super_admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                      user.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Guest'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenForm(user)}>
                      <Edit2 className="w-4 h-4 text-gray-400 hover:text-yellow-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(user.id)} disabled={user.role === 'super_admin' && user.id === '1'}>
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-yellow-500/30 rounded-xl p-6 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{editingUser ? 'Edit User' : 'New User'}</h3>
                <button onClick={handleCloseForm}><X className="w-5 h-5 text-gray-400 hover:text-white" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    className="bg-black/50 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                    className="bg-black/50 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password {editingUser && '(Leave blank to keep current)'}</Label>
                  <Input 
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!editingUser}
                    className="bg-black/50 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full h-10 rounded-md bg-black/50 border border-gray-700 text-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="guest">Guest</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                
                <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold mt-4">
                  <Save className="w-4 h-4 mr-2" />
                  Save User
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-gray-900 border-yellow-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete User?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-gray-700 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManager;