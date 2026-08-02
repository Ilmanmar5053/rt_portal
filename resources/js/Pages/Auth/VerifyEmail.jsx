import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email - Portal RT" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Verifikasi Alamat Email
                </h2>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Terima kasih telah mendaftar! Sebelum mulai menggunakan portal, silakan verifikasi alamat email Anda dengan mengklik tautan yang baru saja kami kirimkan.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Tautan verifikasi baru telah dikirimkan ke alamat email yang Anda berikan saat pendaftaran.</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <button
                    type="submit"
                    disabled={processing}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg shadow-emerald-600/20 transition-all transform focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        processing ? 'cursor-not-allowed opacity-75' : 'hover:-translate-y-0.5'
                    }`}
                >
                    {processing ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi →'}
                </button>

                <div className="pt-3 text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-xs font-bold text-gray-500 hover:text-rose-600 transition-colors underline underline-offset-2"
                    >
                        Keluar dari akun (Log Out)
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
