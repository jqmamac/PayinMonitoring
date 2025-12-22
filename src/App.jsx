import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Plus, Coins, LogOut, BarChart3, Users as UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import PayinForm from '@/components/PayinForm';
import PayinTable from '@/components/PayinTable';
import PeopleManager from '@/components/PeopleManager';
import Login from '@/components/Login';
import Analytics from '@/components/Analytics';
import UserManager from '@/components/UserManager';

function Dashboard() {
  const [payins, setPayins] = useState([]);
  const [referrors, setReferrors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayin, setEditingPayin] = useState(null);
  const { toast } = useToast();
  const { user, logout, hasPermission } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storedPayins = localStorage.getItem('payins');
      const storedReferrors = localStorage.getItem('referrors');
      const storedMentors = localStorage.getItem('mentors');
      
      if (storedPayins) setPayins(JSON.parse(storedPayins));
      if (storedReferrors) setReferrors(JSON.parse(storedReferrors));
      if (storedMentors) setMentors(JSON.parse(storedMentors));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data from storage",
        variant: "destructive",
      });
    }
  };

  const savePayins = (updatedPayins) => {
    try {
      localStorage.setItem('payins', JSON.stringify(updatedPayins));
      setPayins(updatedPayins);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save payins", variant: "destructive" });
    }
  };

  const saveReferrors = (updatedReferrors) => {
    try {
      localStorage.setItem('referrors', JSON.stringify(updatedReferrors));
      setReferrors(updatedReferrors);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save referrors", variant: "destructive" });
    }
  };

  const saveMentors = (updatedMentors) => {
    try {
      localStorage.setItem('mentors', JSON.stringify(updatedMentors));
      setMentors(updatedMentors);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save mentors", variant: "destructive" });
    }
  };

  // Helper for audit trail
  const addAudit = (data) => ({
    ...data,
    createdBy: user.email,
    createdByName: user.name,
    createdAt: new Date().toISOString()
  });

  const updateAudit = (data) => ({
    ...data,
    updatedBy: user.email,
    updatedByName: user.name,
    updatedAt: new Date().toISOString()
  });

  // Payin Handlers
  const handleCreatePayin = (payinData) => {
    const newPayin = {
      id: Date.now().toString(),
      ...addAudit(payinData),
    };
    const updatedPayins = [...payins, newPayin];
    savePayins(updatedPayins);
    setIsFormOpen(false);
    toast({ title: "Success", description: "Payin created successfully" });
  };

  const handleUpdatePayin = (payinData) => {
    const updatedPayins = payins.map(p => 
      p.id === editingPayin.id ? { ...p, ...updateAudit(payinData) } : p
    );
    savePayins(updatedPayins);
    setEditingPayin(null);
    setIsFormOpen(false);
    toast({ title: "Success", description: "Payin updated successfully" });
  };

  const handleDeletePayin = (id) => {
    const updatedPayins = payins.filter(p => p.id !== id);
    savePayins(updatedPayins);
    toast({ title: "Success", description: "Payin deleted successfully" });
  };

  // Referror Handlers
  const handleAddReferror = (data) => {
    const newReferror = { id: Date.now().toString(), ...addAudit(data) };
    const updated = [...referrors, newReferror];
    saveReferrors(updated);
    toast({ title: "Success", description: "Referror added successfully" });
  };

  const handleUpdateReferror = (data) => {
    const updated = referrors.map(r => r.id === data.id ? { ...r, ...updateAudit(data) } : r);
    saveReferrors(updated);
    toast({ title: "Success", description: "Referror updated successfully" });
  };

  const handleDeleteReferror = (id) => {
    const updated = referrors.filter(r => r.id !== id);
    saveReferrors(updated);
    toast({ title: "Success", description: "Referror deleted successfully" });
  };

  // Mentor Handlers
  const handleAddMentor = (data) => {
    const newMentor = { id: Date.now().toString(), ...addAudit(data) };
    const updated = [...mentors, newMentor];
    saveMentors(updated);
    toast({ title: "Success", description: "Mentor added successfully" });
  };

  const handleUpdateMentor = (data) => {
    const updated = mentors.map(m => m.id === data.id ? { ...m, ...updateAudit(data) } : m);
    saveMentors(updated);
    toast({ title: "Success", description: "Mentor updated successfully" });
  };

  const handleDeleteMentor = (id) => {
    const updated = mentors.filter(m => m.id !== id);
    saveMentors(updated);
    toast({ title: "Success", description: "Mentor deleted successfully" });
  };

  const handleEdit = (payin) => {
    setEditingPayin(payin);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPayin(null);
  };

  const handleNewPayin = () => {
    setEditingPayin(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="payins" className="w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-xl shadow-lg shadow-yellow-500/20">
                  <Coins className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                    Payin Monitoring
                  </h1>
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
                    Welcome, <span className="text-yellow-500 font-medium">{user?.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs text-gray-400 border border-gray-700 capitalize">
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
                <TabsList className="bg-gray-800/50 border border-yellow-500/20 p-1 w-full sm:w-auto overflow-x-auto">
                  <TabsTrigger value="payins" className="px-4">Payins</TabsTrigger>
                  <TabsTrigger value="referrors" className="px-4">Referrors</TabsTrigger>
                  <TabsTrigger value="mentors" className="px-4">Mentors</TabsTrigger>
                  {hasPermission('manage_users') && (
                    <>
                      <TabsTrigger value="analytics" className="px-4"><BarChart3 className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
                      <TabsTrigger value="users" className="px-4"><UsersIcon className="w-4 h-4 mr-2" />Users</TabsTrigger>
                    </>
                  )}
                  {!hasPermission('manage_users') && hasPermission('update') && (
                    <TabsTrigger value="analytics" className="px-4"><BarChart3 className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
                  )}
                </TabsList>
                
                <Button variant="ghost" onClick={logout} className="text-red-400 hover:text-red-300 hover:bg-red-950/20">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>

          <TabsContent value="payins" className="space-y-6">
            {/* Payins Stats & Table */}
            {hasPermission('create') && (
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleNewPayin}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold shadow-lg shadow-yellow-500/20 transition-all duration-300 hover:shadow-yellow-500/40 hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Payin
                </Button>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500/20 rounded-xl p-6 shadow-lg"
              >
                <p className="text-gray-400 text-sm mb-1">Total Payins</p>
                <p className="text-3xl font-bold text-yellow-500">{payins.length}</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500/20 rounded-xl p-6 shadow-lg"
              >
                <p className="text-gray-400 text-sm mb-1">Encoded</p>
                <p className="text-3xl font-bold text-green-500">
                  {payins.filter(p => p.isEncoded).length}
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500/20 rounded-xl p-6 shadow-lg"
              >
                <p className="text-gray-400 text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold text-orange-500">
                  {payins.filter(p => !p.isEncoded).length}
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500/20 rounded-xl p-6 shadow-lg"
              >
                <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-yellow-500">
                  ₱{payins.reduce((sum, p) => sum + (parseFloat(p.amountPaid) || 0), 0).toLocaleString()}
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <PayinTable
                payins={payins}
                onEdit={handleEdit}
                onDelete={handleDeletePayin}
                canEdit={hasPermission('update')}
                canDelete={hasPermission('delete')}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="referrors">
            <PeopleManager
              title="Referrors"
              type="referror"
              items={referrors}
              onAdd={handleAddReferror}
              onUpdate={handleUpdateReferror}
              onDelete={handleDeleteReferror}
              canCreate={hasPermission('create')}
              canEdit={hasPermission('update')}
              canDelete={hasPermission('delete')}
            />
          </TabsContent>

          <TabsContent value="mentors">
            <PeopleManager
              title="Mentors"
              type="mentor"
              items={mentors}
              onAdd={handleAddMentor}
              onUpdate={handleUpdateMentor}
              onDelete={handleDeleteMentor}
              canCreate={hasPermission('create')}
              canEdit={hasPermission('update')}
              canDelete={hasPermission('delete')}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics payins={payins} />
          </TabsContent>

          <TabsContent value="users">
            <UserManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Payin Form Modal */}
      {isFormOpen && (
        <PayinForm
          payin={editingPayin}
          referrors={referrors}
          mentors={mentors}
          onSubmit={editingPayin ? handleUpdatePayin : handleCreatePayin}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

function App() {
  const { user } = useAuth();
  
  return (
    <>
      <Helmet>
        <title>Payin Monitoring System - Track & Manage Payments</title>
        <meta name="description" content="Professional payin monitoring system to track, manage, and analyze payment records." />
      </Helmet>
      
      {user ? <Dashboard /> : <Login />}
      <Toaster />
    </>
  );
}

export default function AppWithAuth() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}