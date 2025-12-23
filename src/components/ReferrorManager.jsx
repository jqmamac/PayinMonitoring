import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ReferrorDialog from '@/components/ReferrorDialog';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { ref, push, set, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const ReferrorManager = ({ currentUser, roles }) => {
  const [referrors, setReferrors] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReferror, setEditingReferror] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const referrorsRef = ref(db, 'referrors');
    const unsubscribe = onValue(referrorsRef, (snapshot) => {
        const data = snapshot.val();
        setReferrors(data ? Object.values(data) : []);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (referrorData) => {
    try {
        let action;
        if (editingReferror) {
            if (!hasPermission(currentUser, PERMISSIONS.REFERROR_EDIT, roles)) return;
            action = 'updated';
            const referrorRef = ref(db, `referrors/${editingReferror.id}`);
            await set(referrorRef, { ...referrorData, id: editingReferror.id });
            
            logAudit({
                action: 'UPDATE',
                entity: 'Referror',
                entityId: editingReferror.id,
                details: `Updated referror: ${referrorData.name}`,
                user: currentUser.name
            });
        } else {
            if (!hasPermission(currentUser, PERMISSIONS.REFERROR_ADD, roles)) return;
            action = 'added';
            const newRef = push(ref(db, 'referrors'));
            const newId = newRef.key;
            await set(newRef, { ...referrorData, id: newId });
            
            logAudit({
                action: 'CREATE',
                entity: 'Referror',
                entityId: newId,
                details: `Created referror: ${referrorData.name}`,
                user: currentUser.name
            });
        }

        setIsDialogOpen(false);
        setEditingReferror(null);

        toast({
            title: "Success",
            description: `Referror ${action} successfully`,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to save referror",
            variant: "destructive"
        });
    }
  };

  const handleDelete = async (id) => {
    if (!hasPermission(currentUser, PERMISSIONS.REFERROR_DELETE, roles)) return;
    try {
        const referror = referrors.find(r => r.id === id);
        const referrorRef = ref(db, `referrors/${id}`);
        await remove(referrorRef);

        logAudit({
            action: 'DELETE',
            entity: 'Referror',
            entityId: id,
            details: `Deleted referror: ${referror?.name || 'Unknown'}`,
            user: currentUser.name
        });

        toast({
            title: "Success",
            description: "Referror deleted successfully",
        });
    } catch (error) {
         toast({
            title: "Error",
            description: "Failed to delete referror",
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
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Referror Manager
          </h1>
        </div>
        {hasPermission(currentUser, PERMISSIONS.REFERROR_ADD, roles) && (
          <Button
            onClick={() => {
              setEditingReferror(null);
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold shadow-lg hover:shadow-yellow-500/50 transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Referror
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {referrors.map((referror, index) => (
          <motion.div
            key={referror.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-900/30 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex gap-2">
                {hasPermission(currentUser, PERMISSIONS.REFERROR_EDIT, roles) && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingReferror(referror);
                      setIsDialogOpen(true);
                    }}
                    className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-600/30"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
                {hasPermission(currentUser, PERMISSIONS.REFERROR_DELETE, roles) && (
                  <Button
                    size="sm"
                    onClick={() => handleDelete(referror.id)}
                    className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-600/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{referror.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{referror.email}</p>
            <div className="pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-500">Phone: {referror.phone}</p>
              <p className="text-xs text-gray-500 mt-1">Status: <span className="text-green-400">{referror.status}</span></p>
            </div>
          </motion.div>
        ))}
      </div>

      {referrors.length === 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No referrors added yet</p>
        </div>
      )}

      <ReferrorDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingReferror(null);
        }}
        onSave={handleSave}
        editingReferror={editingReferror}
      />
    </div>
  );
};

export default ReferrorManager;