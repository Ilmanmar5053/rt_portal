import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
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
        <GuestLayout>
            <Head title="Masuk Portal - RT 009 / RW 006" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">
                    Portal Lingkungan Digital
                </h2>
                <p className="text-xs font-semibold text-emerald-800 mt-1">
                    Silakan masuk dengan akun warga atau pengurus
                </p>
            </div>

            {status && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel
                        htmlFor="email"
                        value="Alamat Email"
                        className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
                    />
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                            </svg>
                        </div>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 pl-11 pr-3.5 transition-all placeholder:text-gray-400"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@email.com"
                            required
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-600" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <InputLabel
                            htmlFor="password"
                            value="Kata Sandi"
                            className="block text-xs font-bold text-gray-700 uppercase tracking-wider"
                        />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                Lupa sandi?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 pl-11 pr-3.5 transition-all placeholder:text-gray-400"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-600" />
                </div>

                <div className="flex items-center pt-1">
                    <label className="flex cursor-pointer items-center group">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 transition-colors"
                        />
                        <span className="ms-2 text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                            Ingat saya di perangkat ini
                        </span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className={`w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-700 to-rose-800 hover:from-emerald-700 hover:to-rose-900 shadow-lg shadow-emerald-700/25 transition-all transform focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        processing ? 'cursor-not-allowed opacity-75' : 'hover:-translate-y-0.5'
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
                        'Masuk ke Portal →'
                    )}
                </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                    Belum memiliki akun warga?{' '}
                    <Link href={route('register')} className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors">
                        Daftar di sini
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}

