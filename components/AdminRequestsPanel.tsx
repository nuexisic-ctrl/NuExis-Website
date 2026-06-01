import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, CheckCircle, Clock, XCircle, Search, Mail, Eye, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface CatalogRequest {
  id: string;
  full_name: string;
  company_name: string;
  phone_number: string;
  email: string;
  catalog_name: string;
  product_name?: string; // from joined data if needed, or we rely on product_slug
  product_slug: string;
  status: 'pending' | 'contacted' | 'approved' | 'rejected';
  submitted_at: string;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  contacted: { label: 'Contacted', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

const AdminRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<CatalogRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('catalog_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      toast.error('Failed to load requests');
    } else {
      setRequests(data as CatalogRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: CatalogRequest['status']) => {
    setUpdating(id);
    const { error } = await supabase
      .from('catalog_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update status');
    } else {
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
      toast.success(`Request marked as ${newStatus}`);
    }
    setUpdating(null);
  };

  const handleContact = (email: string) => {
    window.location.href = `mailto:${email}?subject=NuExis Catalog Request`;
  };

  const filteredRequests = requests.filter(req => 
    req.full_name.toLowerCase().includes(search.toLowerCase()) ||
    req.company_name.toLowerCase().includes(search.toLowerCase()) ||
    req.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-brand-blue" />
            Catalog Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage user requests for protected catalogs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchRequests} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors">
             <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_120px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>User Details</span>
          <span>Contact</span>
          <span>Requested Area</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
           <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 text-brand-blue animate-spin" /></div>
        ) : filteredRequests.length === 0 ? (
           <div className="py-20 text-center">
             <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
             <p className="text-gray-500 font-medium">No requests found</p>
           </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRequests.map(req => {
              const statusConfig = STATUS_CONFIG[req.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div key={req.id} className="grid grid-cols-1 lg:grid-cols-[1.5fr_1.5fr_1.5fr_1fr_120px] gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                  
                  {/* User Details */}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{req.full_name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{req.company_name}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                       {new Date(req.submitted_at).toLocaleDateString()} at {new Date(req.submitted_at).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="min-w-0">
                    <p className="text-sm text-gray-800 truncate">{req.email}</p>
                    <p className="text-xs text-brand-blue font-medium truncate mt-0.5">{req.phone_number}</p>
                  </div>

                  {/* Requested Area */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{req.catalog_name || 'Generic Catalog'}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">Product: {req.product_slug}</p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                       <StatusIcon className="w-3.5 h-3.5" />
                       {statusConfig.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                     <button
                        onClick={() => handleContact(req.email)}
                        title="Contact by Email"
                        className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                     >
                        <Mail className="w-4 h-4" />
                     </button>

                     {updating === req.id ? (
                        <Loader2 className="w-4 h-4 text-brand-blue animate-spin mr-2" />
                     ) : (
                        <select
                           value={req.status}
                           onChange={e => handleStatusUpdate(req.id, e.target.value as any)}
                           className="text-xs font-medium border border-gray-200 rounded-lg py-1 px-2 focus:outline-none focus:border-brand-blue"
                        >
                           <option value="pending">Pending</option>
                           <option value="contacted">Contacted</option>
                           <option value="approved">Approved</option>
                           <option value="rejected">Rejected</option>
                        </select>
                     )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminRequestsPanel;
