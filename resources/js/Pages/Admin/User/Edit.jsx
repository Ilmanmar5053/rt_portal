import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit({ editUser, wargas }) {
    const { auth } = usePage().props;

    // Find currently linked warga
    const linkedWarga = wargas ? wargas.find(w => w.user_id === editUser.id) : null;

    const { data, setData, put, processing, errors } = useForm({
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        password: '',
        password_confirmation: '',
        warga_id: linkedWarga ? linkedWarga.id : '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', editUser.id));
    };

    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Pengguna</h2>}
        >
            <Head title="Edit Pengguna" />

            <div className="py-6 max-w-3xl mx-auto space-y-6">
                <div className="bg-white p-6 shadow-sm sm:rounded-xl border border-gray-100">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role Akses</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={data.role}
                                onChange={e => setData('role', e.target.value)}
                                required
                                disabled={auth.user.id === editUser.id}
                            >
                                <option value="superadmin">Administrator (Superadmin)</option>
                                <option value="rw">Ketua RW</option>
                                <option value="rt">Ketua RT</option>
                                <option value="bendahara">Bendahara</option>
                                <option value="sekretaris">Sekretaris</option>
                                <option value="warga_kk">Warga (Kepala Keluarga)</option>
                                <option value="warga_anggota">Warga (Anggota Keluarga)</option>
                            </select>
                            {errors.role && <div className="text-red-500 text-sm mt-1">{errors.role}</div>}
                            {auth.user.id === editUser.id && (
                                <p className="text-xs text-orange-600 mt-1">Anda tidak dapat mengubah role akun Anda sendiri.</p>
                            )}
                        </div>

                        {/* Link ke Data Warga */}
                        {(data.role === 'warga_kk' || data.role === 'warga_anggota') && wargas && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <label className="block text-sm font-semibold text-blue-800 mb-2">
                                    🔗 Hubungkan ke Data Warga
                                </label>
                                <select
                                    className="block w-full rounded-md border-blue-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    value={data.warga_id}
                                    onChange={e => setData('warga_id', e.target.value)}
                                >
                                    <option value="">-- Tidak Dihubungkan --</option>
                                    {wargas.map(w => (
                                        <option key={w.id} value={w.id}>{w.nama_lengkap}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-blue-600 mt-2">
                                    ⚠️ Warga harus dihubungkan ke akun user agar bisa menggunakan fitur Pengaduan, Surat Pengantar, dan Iuran.
                                </p>
                                {errors.warga_id && <div className="text-red-500 text-sm mt-1">{errors.warga_id}</div>}
                            </div>
                        )}

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Ubah Password <span className="text-sm font-normal text-gray-500">(Opsional)</span></h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password Baru</label>
                                    <input
                                        type="password"
                                        placeholder="Kosongkan jika tidak ingin diubah"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                    />
                                    {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                            <Link
                                href={route('admin.users.index')}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
