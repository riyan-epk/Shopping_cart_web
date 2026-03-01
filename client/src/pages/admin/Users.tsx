import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api';
import type { User } from '../../types';
import toast from 'react-hot-toast';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchUsers = () => {
        adminApi.getUsers(page, 10).then((res) => {
            setUsers(res.data.data?.users || []);
            setTotal(res.data.pagination?.total || 0);
        });
    };

    useEffect(() => { document.title = 'Users — Admin'; fetchUsers(); }, [page]);

    const handleToggle = async (id: string) => {
        try { await adminApi.toggleUserActive(id); toast.success('User status updated'); fetchUsers(); }
        catch { toast.error('Failed'); }
    };

    const handleRoleChange = async (id: string, role: string) => {
        try { await adminApi.updateUserRole(id, role); toast.success('Role updated'); fetchUsers(); }
        catch { toast.error('Failed'); }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Users ({total})</h1>
            <div className="rounded-2xl overflow-x-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <table className="w-full text-sm min-w-[600px]">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th className="text-left px-6 py-4 font-semibold">User</th>
                            <th className="text-left px-6 py-4 font-semibold">Role</th>
                            <th className="text-left px-6 py-4 font-semibold">Status</th>
                            <th className="text-left px-6 py-4 font-semibold">Joined</th>
                            <th className="text-right px-6 py-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id} className="group hover:bg-primary-500/5 dark:hover:bg-primary-500/10 transition-colors relative" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td className="px-6 py-4 relative">
                                    <div className="absolute inset-y-0 left-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div>
                                        <p className="font-medium">{u.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                        className="px-2 py-1 rounded-lg text-xs outline-none capitalize" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                                        <option value="customer">Customer</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Super Admin</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleToggle(u._id)} className={`px-3 py-1 text-xs font-medium rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {u.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {Math.ceil(total / 10) > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: Math.ceil(total / 10) }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm ${p === page ? 'bg-primary-500 text-white' : ''}`}>{p}</button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
