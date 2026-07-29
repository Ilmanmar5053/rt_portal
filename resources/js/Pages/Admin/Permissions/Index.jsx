import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, usePage } from '@inertiajs/react';

export default function Index({ matrix, roles }) {
    const { flash } = usePage().props;

    const handleToggle = (module, role, currentStatus) => {
        router.post(route('admin.permissions.update'), {
            module: module,
            role: role,
            is_active: !currentStatus
        }, {
            preserveScroll: true,
            preserveState: true,
        });
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

    return (
        <AdminLayout header="Matriks Manajemen Akses">
            <Head title="Manajemen Hak Akses" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="p-4 text-sm text-green-800 rounded-lg bg-green-50 shadow-sm border border-green-100">
                        {flash.success}
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
                    <div className="flex gap-4 items-start">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 mb-1">Pengaturan Matriks Modul</h3>
                            <p className="text-sm text-blue-800">
                                Gunakan tombol *toggle* di bawah ini untuk mengaktifkan atau menonaktifkan akses sebuah modul bagi role tertentu. 
                                Jika dinonaktifkan, menu akan hilang dari navigasi *sidebar* dan URL akan ditutup untuk role tersebut.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                                    <th className="px-6 py-4 border-r border-gray-200">Modul \ Role</th>
                                    {roles.map(role => (
                                        <th key={role} className="px-4 py-4 text-center border-r border-gray-200 min-w-[120px]">
                                            {getRoleLabel(role)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {Object.keys(matrix).map((modKey) => (
                                    <tr key={modKey} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-200 bg-white">
                                            {matrix[modKey].name}
                                        </td>
                                        {roles.map((role) => {
                                            const isActive = matrix[modKey].roles[role];
                                            return (
                                                <td key={role} className="px-4 py-4 text-center border-r border-gray-200">
                                                    <button 
                                                        onClick={() => handleToggle(modKey, role, isActive)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}
                                                    >
                                                        <span className="sr-only">Toggle {matrix[modKey].name} for {role}</span>
                                                        <span 
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`}
                                                        />
                                                    </button>
                                                    <div className="mt-1 text-xs text-gray-500 font-medium">
                                                        {isActive ? 'Aktif' : 'Nonaktif'}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
