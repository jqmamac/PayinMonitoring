import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import MentorDialog from '@/components/MentorDialog';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { ref, push, set, remove, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';

const MentorManager = ({ currentUser, roles }) => {
  const [mentors, setMentors] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const mentorsRef = ref(db, 'mentors');
    const unsubscribe = onValue(mentorsRef, (snapshot) => {
        const data = snapshot.val();
        setMentors(data ? Object.values(data) : []);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (mentorData) => {
    try {
        let action;
        if (editingMentor) {
            if (!hasPermission(currentUser, PERMISSIONS.MENTOR_EDIT, roles)) return;
            action = 'updated';
            const mentorRef = ref(db, `mentors/${editingMentor.id}`);
            await set(mentorRef, { ...mentorData, id: editingMentor.id });
            
            logAudit({
                action: 'UPDATE',
                entity: 'Mentor',
                entityId: editingMentor.id,
                details: `Updated mentor: ${mentorData.name}`,
                user: currentUser.name
            });
        } else {
            if (!hasPermission(currentUser, PERMISSIONS.MENTOR_ADD, roles)) return;
            action = 'added';
            const newRef = push(ref(db, 'mentors'));
            const newId = newRef.key;
            await set(newRef, { ...mentorData, id: newId });
            
            logAudit({
                action: 'CREATE',
                entity: 'Mentor',
                entityId: newId,
                details: `Created mentor: ${mentorData.name}`,
                user: currentUser.name
            });
        }

        setIsDialogOpen(false);
        setEditingMentor(null);

        toast({
            title: "Success",
            description: `Mentor ${action} successfully`,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to save mentor",
            variant: "destructive"
        });
    }
  };

  const handleDelete = async (id) => {
    if (!hasPermission(currentUser, PERMISSIONS.MENTOR_DELETE, roles)) return;
    try {
        const mentor = mentors.find(m => m.id === id);
        const mentorRef = ref(db, `mentors/${id}`);
        await remove(mentorRef);

        logAudit({
            action: 'DELETE',
            entity: 'Mentor',
            entityId: id,
            details: `Deleted mentor: ${mentor?.name || 'Unknown'}`,
            user: currentUser.name
        });

        toast({
            title: "Success",
            description: "Mentor deleted successfully",
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to delete mentor",
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
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-3 rounded-lg">
            <UserCog className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Mentor Manager
          </h1>
        </div>
        {hasPermission(currentUser, PERMISSIONS.MENTOR_ADD, roles) && (
          <Button
            onClick={() => {
              setEditingMentor(null);
              setIsDialogOpen(true);
            }}
            className="bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-black font-bold shadow-lg hover:shadow-yellow-500/50 transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Mentor
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor, index) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-6 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-900/30 p-3 rounded-lg">
                <UserCog className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex gap-2">
                {hasPermission(currentUser, PERMISSIONS.MENTOR_EDIT, roles) && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingMentor(mentor);
                      setIsDialogOpen(true);
                    }}
                    className="bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 border border-blue-600/30"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
                {hasPermission(currentUser, PERMISSIONS.MENTOR_DELETE, roles) && (
                  <Button
                    size="sm"
                    onClick={() => handleDelete(mentor.id)}
                    className="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-600/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{mentor.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{mentor.email}</p>
            <div className="pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-500">Phone: {mentor.phone}</p>
              <p className="text-xs text-gray-500 mt-1">Specialty: <span className="text-purple-400">{mentor.specialty}</span></p>
              <p className="text-xs text-gray-500 mt-1">Status: <span className="text-green-400">{mentor.status}</span></p>
            </div>
          </motion.div>
        ))}
      </div>

      {mentors.length === 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-600/20 rounded-xl p-12 text-center">
          <UserCog className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No mentors added yet</p>
        </div>
      )}

      <MentorDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingMentor(null);
        }}
        onSave={handleSave}
        editingMentor={editingMentor}
      />
    </div>
  );
};

export default MentorManager;