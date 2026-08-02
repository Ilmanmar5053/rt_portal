import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Konfirmasi Kata Sandi - Portal RT" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Konfirmasi Keamanan
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    Ini adalah area yang aman. Harap konfirmasi kata sandi Anda sebelum melanjutkan.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="password" value="Kata Sandi" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm py-2.5 px-3.5 transition-all"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-600" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className={`w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-700 to-rose-800 hover:from-emerald-700 hover:to-rose-900 shadow-lg shadow-emerald-700/25 transition-all transform focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        processing ? 'cursor-not-allowed opacity-75' : 'hover:-translate-y-0.5'
                    }`}
                >
                    {processing ? 'Memverifikasi...' : 'Konfirmasi Kata Sandi →'}
                </button>
            </form>
        </GuestLayout>
    );
}
