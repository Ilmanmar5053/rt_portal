import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ users, filters }) {
    const { flash, auth } = usePage().props;
    const { data, setData, get } = useForm({
        name: filters.name || '',
        email: filters.email || '',
        role: filters.role || 'Semua',
        registered: filters.registered || '',
    });
    const [sortField, setSortField] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');

    const handleFilter = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        router.get(route('admin.users.index'), {
            name: data.name || undefined,
            email: data.email || undefined,
            role: (data.role && data.role !== 'Semua') ? data.role : undefined,
            registered: data.registered || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleResetFilter = () => {
        setData({
            name: '',
            email: '',
            role: 'Semua',
            registered: '',
        });
        router.get(route('admin.users.index'), {}, { preserveState: true, replace: true });
    };

    const handleRoleChange = (e) => {
        const value = e.target.value;
        setData('role', value);
        router.get(route('admin.users.index'), {
            name: data.name || undefined,
            email: data.email || undefined,
            role: (value && value !== 'Semua') ? value : undefined,
            registered: data.registered || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortField(field);
        setSortDirection(newDirection);
        router.get(route('admin.users.index'), { ...data, sort_field: field, sort_direction: newDirection }, { preserveState: true, replace: true });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus akun ini?')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'superadmin': return 'Administrator';
            case 'rw': return 'Ketua RW';
            case 'rt': return 'Ketua RT';
            case 'bendahara': return 'Bendahara';
            case 'sekretaris': return 'Sekretaris';
            case 'warga_kk': return 'Warga (KK)';
            case 'warga_anggota': return 'Warga (Anggota)';
            default: return role;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'superadmin': return 'bg-purple-100 text-purple-800';
            case 'rw': return 'bg-indigo-100 text-indigo-800';
            case 'rt': return 'bg-blue-100 text-blue-800';
            case 'bendahara': return 'bg-green-100 text-green-800';
            case 'sekretaris': return 'bg-yellow-100 text-yellow-800';
            case 'warga_kk':
            case 'warga_anggota': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Manajemen User</h2>}
        >
            <Head title="Manajemen User" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
                        {flash.error}
                    </div>
                )}

                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-xs border border-gray-100">
                    <div className="text-xs font-bold text-gray-500">
                        Total Akun User: <span className="text-gray-900 font-extrabold">{users.total || 0}</span>
                    </div>
                    <Link href={route('admin.users.create')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-xs transition flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                        Tambah Akun
                    </Link>
                </div>

                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                <th className="px-4 py-3">Nama</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Terdaftar</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                                <tr className="bg-white border-b border-gray-200 text-sm text-gray-600">
                                <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                            placeholder="Filter nama"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </td>
                                <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            name="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                            placeholder="Filter email"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </td>
                                <td className="px-4 py-2">
                                        <select
                                            name="role"
                                            value={data.role}
                                            onChange={handleRoleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="Semua">Semua</option>
                                            <option value="superadmin">Administrator</option>
                                            <option value="rw">Ketua RW</option>
                                            <option value="rt">Ketua RT</option>
                                            <option value="bendahara">Bendahara</option>
                                            <option value="sekretaris">Sekretaris</option>
                                            <option value="warga_kk">Warga (KK)</option>
                                            <option value="warga_anggota">Warga (Anggota)</option>
                                        </select>
                                    </td>
                                <td className="px-4 py-2">
                                        <input
                                            type="date"
                                            name="registered"
                                            value={data.registered}
                                            onChange={(e) => setData('registered', e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFilter(e)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </td>
                                <td className="px-4 py-2 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                onClick={handleFilter}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-extrabold shadow-2xs transition"
                                                title="Terapkan Filter"
                                            >
                                                Terapkan
                                            </button>
                                            {(data.name || data.email || (data.role && data.role !== 'Semua') || data.registered) && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetFilter}
                                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition"
                                                    title="Reset Filter"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {users.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                            {u.name}
                                            {u.id === auth.user.id && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">Anda</span>}
                                        </td>
                                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                    <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleColor(u.role)}`}>
                                                {getRoleLabel(u.role)}
                                            </span>
                                        </td>
                                    <td className="px-4 py-3 text-gray-600">
                                            {new Date(u.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="inline-flex items-center justify-end gap-1">
                                            <Link
                                                href={route('admin.users.edit', u.id)}
                                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-900 transition"
                                                title="Edit"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </Link>
                                            {u.id !== auth.user.id && (
                                                <button
                                                    onClick={() => handleDelete(u.id)}
                                                    className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition"
                                                    title="Hapus"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                        Tidak ada data pengguna ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                    
                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        Menampilkan {users.from || 0} hingga {users.to || 0} dari {users.total} entri
                    </span>
                    <div className="flex gap-1">
                        {users.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-3 py-1 text-sm border rounded-md ${
                                    link.active 
                                        ? 'bg-blue-600 text-white border-blue-600' 
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
                </div>
            </div>
        </AdminLayout>
    );
}
