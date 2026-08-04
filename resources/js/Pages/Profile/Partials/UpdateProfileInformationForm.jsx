import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <header className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
                    👤
                </div>
                <div>
                    <h2 className="text-base font-extrabold text-gray-900">
                        Informasi Profil Akun
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                        Perbarui nama tampilan dan alamat email utama Anda.
                    </p>
                </div>
            </header>

            <form onSubmit={submit} className="space-y-4 pt-1">
                <div>
                    <InputLabel htmlFor="name" value="Nama Lengkap" className="text-xs font-bold text-gray-700 uppercase tracking-wider" />
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
                            👤
                        </span>
                        <TextInput
                            id="name"
                            className="pl-9 text-sm font-semibold block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>
                    <InputError className="mt-1" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Alamat Email" className="text-xs font-bold text-gray-700 uppercase tracking-wider" />
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
                            ✉️
                        </span>
                        <TextInput
                            id="email"
                            type="email"
                            className="pl-9 text-sm font-semibold block w-full rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <InputError className="mt-1" message={errors.email} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                        <p className="flex items-center gap-1.5 font-bold text-amber-800">
                            <span>⚠️ Email Belum Terverifikasi.</span>
                        </p>
                        <Link
                            href={route('verification.send')}
                            method="post"
                            as="button"
                            className="mt-1 text-xs text-blue-700 font-bold underline hover:text-blue-900"
                        >
                            Klik di sini untuk mengirim ulang link verifikasi.
                        </Link>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-xs font-bold text-emerald-700">
                                ✓ Link verifikasi baru telah dikirim ke email Anda.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <button 
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <span>💾 Simpan Perubahan</span>
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            ✓ Berhasil Disimpan
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
