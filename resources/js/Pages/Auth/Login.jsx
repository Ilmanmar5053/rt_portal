import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { getNamaPerumahan, getNamaRt } from '@/Utils/profilHelper';

export default function Login({ status, canResetPassword }) {
    const { profil } = usePage().props;
    const namaPerumahan = getNamaPerumahan(profil);
    const namaRt = getNamaRt(profil);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-900/5 font-sans relative overflow-hidden selection:bg-emerald-600 selection:text-white">
            {/* Atmospheric subtle glow accents */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-300/25 rounded-full blur-[90px] pointer-events-none max-w-full"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-300/25 rounded-full blur-[90px] pointer-events-none max-w-full"></div>

            {/* Back to Home Button */}
            <Link 
                href="/" 
                className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-600 bg-white/80 backdrop-blur-sm px-3.5 py-2 rounded-full border border-gray-200 shadow-sm transition z-20"
            >
                &larr; Beranda
            </Link>

            <Head title="Masuk Portal - RT 009 / RW 006" />

            {/* Minimalist Centered Login Card */}
            <div className="w-[92%] max-w-[390px] mx-auto bg-white rounded-3xl border border-gray-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] p-7 sm:p-8 relative z-10">
                
                {/* Brand Header */}
                <div className="mb-7 text-center">
                    <Link href="/" className="inline-block group mb-3">
                        {profil?.logo_path ? (
                            <img 
                                src={`/storage/${profil.logo_path}`} 
                                alt="Logo Portal RT" 
                                className="w-14 h-14 object-contain bg-slate-50 p-2 rounded-2xl border border-gray-100 shadow-sm mx-auto group-hover:scale-105 transition-transform" 
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/20 mx-auto group-hover:scale-105 transition-transform">
                                RT
                            </div>
                        )}
                    </Link>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                        Portal RT 009 / RW 006
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                        Silakan masuk ke akun warga atau pengurus
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
                    {/* Alamat Email */}
                    <div>
                        <InputLabel 
                            htmlFor="email" 
                            value="Alamat Email" 
                            className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" 
                        />
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                                </svg>
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="pl-10 block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 transition-all placeholder:text-gray-400"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@email.com"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1.5 text-xs" />
                    </div>

                    {/* Kata Sandi */}
                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <InputLabel 
                                htmlFor="password" 
                                value="Kata Sandi" 
                                className="block text-xs font-bold text-gray-700 uppercase tracking-wider" 
                            />
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                    Lupa sandi?
                                </Link>
                            )}
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="pl-10 block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 transition-all placeholder:text-gray-400"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1.5 text-xs" />
                    </div>

                    {/* Ingat Saya Checkbox */}
                    <div className="flex items-center pt-1">
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300 text-emerald-600 shadow-sm focus:ring-emerald-500 transition-colors h-3.5 w-3.5"
                            />
                            <span className="ms-2 text-xs text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                                Ingat saya di perangkat ini
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className={`w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg shadow-emerald-600/20 transition-all transform focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            processing ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-0.5'
                        }`}
                    >
                        {processing ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses...
                            </span>
                        ) : (
                            "Masuk ke Portal →"
                        )}
                    </button>
                </form>

                {/* Footer Link inside Card */}
                <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">
                        Belum memiliki akun warga?{' '}
                        <Link href={route('register')} className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors">
                            Daftar di sini
                        </Link>
                    </p>
                </div>
            </div>

            {/* Minimal Footer Info */}
            <p className="text-[11px] text-gray-400 text-center mt-6 z-10">
                &copy; {new Date().getFullYear()} {namaRt} • {namaPerumahan}
            </p>
        </div>
    );
}
