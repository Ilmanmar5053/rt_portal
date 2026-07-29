import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi - Portal RT" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Reset Kata Sandi
                </h2>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    Masukkan alamat email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
                </p>
            </div>

            {status && (
                <div className="mb-5 text-xs font-semibold text-emerald-800 bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email Terdaftar" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 px-3.5 transition-all placeholder:text-gray-400"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="nama@email.com"
                        required
                    />
                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className={`w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg shadow-emerald-600/20 transition-all transform focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        processing ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-0.5'
                    }`}
                >
                    {processing ? 'Mengirim...' : 'Kirim Tautan Reset →'}
                </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <Link href={route('login')} className="text-xs font-bold text-gray-600 hover:text-emerald-600 transition-colors">
                    &larr; Kembali ke halaman Masuk
                </Link>
            </div>
        </GuestLayout>
    );
}
