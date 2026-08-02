import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar Akun Portal - RT 009 / RW 006" />

            <div className="mb-5 text-center">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Daftar Akun Warga
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    Lengkapi data dasar untuk pendaftaran portal
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Nama Lengkap */}
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 px-3.5 transition-all placeholder:text-gray-400"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Nama Lengkap Warga"
                        required
                    />
                    <InputError message={errors.name} className="mt-1 text-xs" />
                </div>

                {/* Email */}
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 px-3.5 transition-all placeholder:text-gray-400"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="nama@email.com"
                        required
                    />
                    <InputError message={errors.email} className="mt-1 text-xs" />
                </div>

                {/* Kata Sandi */}
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 px-3.5 transition-all placeholder:text-gray-400"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <InputError message={errors.password} className="mt-1 text-xs" />
                </div>

                {/* Konfirmasi Kata Sandi */}
                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi"
                        className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
                    />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 px-3.5 transition-all placeholder:text-gray-400"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        placeholder="••••••••"
                        required
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1 text-xs"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className={`w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-700 to-rose-800 hover:from-emerald-700 hover:to-rose-900 shadow-lg shadow-emerald-700/25 transition-all transform focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        processing ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-0.5'
                    }`}
                >
                    {processing ? 'Mendaftarkan...' : 'Daftar Akun Sekarang →'}
                </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                    Sudah memiliki akun?{' '}
                    <Link href={route('login')} className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors">
                        Masuk ke portal
                    </Link>
                </p>
            </div>
        </GuestLayout>
    );
}
