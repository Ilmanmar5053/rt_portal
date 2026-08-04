import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <header className="flex items-center gap-3 border-b border-rose-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-lg font-bold">
                    ⚠️
                </div>
                <div>
                    <h2 className="text-base font-extrabold text-rose-900">
                        Zona Bahaya: Hapus Akun
                    </h2>
                    <p className="text-xs text-rose-600 font-medium">
                        Penghapusan akun akan memusnahkan seluruh akses & data permanen.
                    </p>
                </div>
            </header>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <p className="text-xs text-gray-500 max-w-xl">
                    Pastikan Anda benar-benar yakin. Setelah akun dihapus, tidak ada opsi pemulihan data kembali.
                </p>
                <button 
                    onClick={confirmUserDeletion}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-500/20 transition-all cursor-pointer whitespace-nowrap"
                >
                    <span>🗑️ Minta Hapus Akun</span>
                </button>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold">
                            🚨
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-900">
                                Konfirmasi Hapus Akun Permanen
                            </h2>
                            <p className="text-xs text-gray-500">
                                Masukkan kata sandi akun Anda untuk melanjutkan tindakan ini.
                            </p>
                        </div>
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password"
                            value="Password Akun"
                            className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                        />
                        <div className="relative mt-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
                                🔒
                            </span>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="pl-9 text-sm font-semibold block w-full rounded-xl border-gray-200 focus:border-rose-500 focus:ring-rose-500"
                                isFocused
                                placeholder="Masukkan Password Anda"
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        <button 
                            type="button"
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                        >
                            Batal
                        </button>
                        <button 
                            disabled={processing}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition disabled:opacity-50"
                        >
                            {processing ? 'Memproses...' : 'Hapus Sekarang'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
