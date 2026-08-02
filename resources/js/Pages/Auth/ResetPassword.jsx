import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Atur Ulang Kata Sandi - Portal RT" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Atur Ulang Kata Sandi
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    Masukkan kata sandi baru untuk akun Anda
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 px-3.5 transition-all"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-600" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi Baru" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 px-3.5 transition-all"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-600" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Kata Sandi Baru"
                        className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1"
                    />
                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 px-3.5 transition-all"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        placeholder="••••••••"
                        required
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1.5 text-xs text-rose-600"
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className={`w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-700 to-rose-800 hover:from-emerald-700 hover:to-rose-900 shadow-lg shadow-emerald-700/25 transition-all transform focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        processing ? 'cursor-not-allowed opacity-75' : 'hover:-translate-y-0.5'
                    }`}
                >
                    {processing ? 'Memproses...' : 'Simpan Kata Sandi Baru →'}
                </button>
            </form>
        </GuestLayout>
    );
}
