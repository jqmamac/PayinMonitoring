import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import PayinDialog from '@/components/PayinDialog';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { ref, push, set, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const PayinManager = ({ currentUser, roles }) => {
  const [payins, setPayins] = useState([]);
  const [referrors, setReferrors] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [filteredPayins, setFilteredPayins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayin, setEditingPayin] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for Payins
    const payinsRef = ref(db, 'payins');
    const unsubPayins = onValue(payinsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedPayins = data ? Object.values(data) : [];
      setPayins(loadedPayins);
    });

    // Fetch Referrors and Mentors for filtering/display logic if needed
    // (Also passed to Dialog, but good to have here for robust filtering if we filter by IDs later)
    const referrorsRef = ref(db, 'referrors');
    const unsubReferrors = onValue(referrorsRef, (snapshot) => {
        const data = snapshot.val();
        setReferrors(data ? Object.values(data) : []);
    });

    const mentorsRef = ref(db, 'mentors');
    const unsubMentors = onValue(mentorsRef, (snapshot) => {
        const data = snapshot.val();
        setMentors(data ? Object.values(data) : []);
    });

    return () => {
        unsubPayins();
        unsubReferrors();
        unsubMentors();
    };
  }, []);

  useEffect(() => {
    filterPayins();
  }, [searchTerm, payins]);

  const filterPayins = () => {
    if (!searchTerm) {
      setFilteredPayins(payins);
    } else {
      const filtered = payins.filter(payin =>
        payin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payin.referror || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payin.mentor || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPayins(filtered);
    }
  };

  const handleSavePayin = async (payinData) => {
    try {
        let action;
        if (editingPayin) {
            if (!hasPermission(currentUser, PERMISSIONS.PAYIN_EDIT, roles)) return;
            action = 'updated';
            const payinRef = ref(db, `payins/${editingPayin.id}`);
            await set(payinRef, { ...payinData, id: editingPayin.id });
            
            logAudit({
                action: 'UPDATE',
                entity: 'Payin',
                entityId: editingPayin.id,
                details: `Updated payin: ${payinData.name}`,
                user: currentUser.name
            });
        } else {
            if (!hasPermission(currentUser, PERMISSIONS.PAYIN_ADD, roles)) return;
            action = 'added';
            const newPayinRef = push(ref(db, 'payins'));
            const newId = newPayinRef.key;
            await set(newPayinRef, { ...payinData, id: newId });
            
            logAudit({
                action: 'CREATE',
                entity: 'Payin',
                entityId: newId,
                details: `Created payin: ${payinData.name}`,
                user: currentUser.name
            });
        }

        setIsDialogOpen(false);
        setEditingPayin(null);

        toast({
            title: "Success",
            description: `Payin ${action} successfully`,
        });
    } catch (error) {
        console.error(error);
        toast({
            title: "Error",
            description: "Failed to save payin",
            variant: "destructive"
        });
    }
  };

  const handleEdit = (payin) => {
    if (!hasPermission(currentUser, PERMISSIONS.PAYIN_EDIT, roles)) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to edit payins",
        variant: "destructive",
      });
      return;
    }
    setEditingPayin(payin);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!hasPermission(currentUser, PERMISSIONS.PAYIN_DELETE, roles)) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to delete payins",
        variant: "destructive",
      });
      return;
    }

    try {
        const payin = payins.find(p => p.id === id);
        const payinRef = ref(db, `payins/${id}`);
        await remove(payinRef);

        logAudit({
            action: 'DELETE',
            entity: 'Payin',
            entityId: id,
            details: `Deleted payin: ${payin?.name || 'Unknown'}`,
            user: currentUser.name
        });

        toast({
            title: "Success",
            description: "Payin deleted successfully",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to delete payin",
            variant: "destructive"
        });
    }
  };

  const logAudit = async (auditEntry) => {
    const auditRef = push(ref(db, 'audits'));
    await set(auditRef, {
      ...auditEntry,
      timestamp: new Date().toISOString(),
      id: auditRef.key
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Payin Management
        </h1>
        {hasPermission(currentUser, PERMISSIONS.PAYIN_ADD, roles) && (
          <Button
            onClick={() => {
              setEditingPayin(null);
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold shadow-lg hover:shadow-yellow-500/50 transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Payin
          </Button>
        )}
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, referror, or mentor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-yellow-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-yellow-400 font-semibold">Name</th>
                <th className="text-left py-4 px-4 text-yellow-400 font-semibold">Amount</th>
                <th className="text-left py-4 px-4 text-yellow-400 font-semibold">Referror</th>
                <th className="text-left py-4 px-4 text-yellow-400 font-semibold">Mentor</th>
                <th className="text-left py-4 px-4 text-yellow-400 font-semibold">Date</th>
                <th className="text-left py-4 px-4 text-yellow-400 font-semibold">Encoded</th>
                {(hasPermission(currentUser, PERMISSIONS.PAYIN_EDIT, roles) || hasPermission(currentUser, PERMISSIONS.PAYIN_DELETE, roles)) && (
                  <th className="text-left py-4 px-4 text-yellow-400 font-semibold">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredPayins.map((payin, index) => (
                <motion.tr
                  key={payin.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-all"
                >
                  <td className="py-4 px-4 text-white font-medium">{payin.name}</td>
                  <td className="py-4 px-4 text-green-400 font-bold">₱{payin.amount}</td>
                  <td className="py-4 px-4 text-gray-300">{payin.referror}</td>
                  <td className="py-4 px-4 text-gray-300">{payin.mentor}</td>
                  <td className="py-4 px-4 text-gray-400">{payin.date}</td>
                  <td className="py-4 px-4">
                    {payin.isEncoded ? (
                      <div className="flex flex-col">
                        <div className="flex items-center text-green-400 gap-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Yes</span>
                        </div>
                        <span className="text-xs text-gray-500">{payin.encodedDate}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500 gap-1">
                        <XCircle className="w-4 h-4" />
                        <span className="text-xs">No</span>
                      </div>
                    )}
                  </td>
                  {(hasPermission(currentUser, PERMISSIONS.PAYIN_EDIT, roles) || hasPermission(currentUser, PERMISSIONS.PAYIN_DELETE, roles)) && (
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        {hasPermission(currentUser, PERMISSIONS.PAYIN_EDIT, roles) && (
                          <Button
                            size="sm"
                            onClick={() => handleEdit(payin)}
                            className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-600/30"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {hasPermission(currentUser, PERMISSIONS.PAYIN_DELETE, roles) && (
                          <Button
                            size="sm"
                            onClick={() => handleDelete(payin.id)}
                            className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-600/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredPayins.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No payins found</p>
            </div>
          )}
        </div>
      </div>

      <PayinDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingPayin(null);
        }}
        onSave={handleSavePayin}
        editingPayin={editingPayin}
        referrorsList={referrors}
        mentorsList={mentors}
      />
    </div>
  );
};

export default PayinManager;