import React, { useState, useEffect } from 'react';
import SimpleSelect from '@/components/ui/SimpleSelect';


const UserDialog = ({ isOpen, onClose, onSave, editingUser, roles, isSuperAdmin, isEditingOwnProfile }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.name || '');
      setUsername(editingUser.username || '');
      setRoleId(editingUser.roleId || '');
      setPassword('');
    } else {
      setName('');
      setUsername('');
      setPassword('');
      setRoleId(roles.length > 0 ? roles[0].id : '');
    }
  }, [editingUser, roles]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      name,
      username,
      roleId
    };
    
    if (password) {
      userData.password = password;
    }
    
    onSave(userData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-600/30 rounded-lg w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-yellow-600/30">
          <h2 className="text-xl font-bold text-white">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
                disabled={editingUser && !isSuperAdmin && !isEditingOwnProfile}
              />
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                required
                disabled={editingUser && !isSuperAdmin && !isEditingOwnProfile}
              />
            </div>

            {/* Password Field */}
            {(!editingUser || isEditingOwnProfile) && (
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required={!editingUser}
                  minLength={6}
                />
              </div>
            )}

            {/* Role Field using custom Select */}
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-300">
    Role
  </label>
  <SimpleSelect
    value={roleId}
    onChange={setRoleId}
    disabled={!isSuperAdmin && editingUser}
    placeholder="Select a role"
    options={roles
      .filter(role => role.id !== 'guest')
      .map(role => ({
        value: role.id,
        label: role.name,
        className: role.id === 'superadmin' ? 'text-red-300' : ''
      }))}
  />
</div>
          </div>

          <div className="px-6 py-4 border-t border-yellow-600/30 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 text-black font-bold rounded-md hover:from-yellow-700 hover:to-yellow-800 transition-all"
            >
              {editingUser ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDialog;