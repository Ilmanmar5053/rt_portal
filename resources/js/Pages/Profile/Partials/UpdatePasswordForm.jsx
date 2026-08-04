import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <header className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">
                    🔐
                </div>
                <div>
                    <h2 className="text-base font-extrabold text-gray-900">
                        Keamanan & Password
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                        Gunakan kombinasi kata sandi yang kuat dan aman.
                    </p>
                </div>
            </header>

            <form onSubmit={updatePassword} className="space-y-4 pt-1">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Password Saat Ini"
                        className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                    />
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
                            🔒
                        </span>
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type={showCurrent ? 'text' : 'password'}
                            className="pl-9 pr-10 text-sm font-semibold block w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600 font-bold"
                        >
                            {showCurrent ? '🙈 Sembunyikan' : '👁️ Lihat'}
                        </button>
                    </div>
                    <InputError message={errors.current_password} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password Baru" className="text-xs font-bold text-gray-700 uppercase tracking-wider" />
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
                            🔑
                        </span>
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showNew ? 'text' : 'password'}
                            className="pl-9 pr-10 text-sm font-semibold block w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600 font-bold"
                        >
                            {showNew ? '🙈 Sembunyikan' : '👁️ Lihat'}
                        </button>
                    </div>
                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Password Baru"
                        className="text-xs font-bold text-gray-700 uppercase tracking-wider"
                    />
                    <div className="relative mt-1">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
                            🛡️
                        </span>
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type={showNew ? 'text' : 'password'}
                            className="pl-9 text-sm font-semibold block w-full rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                            autoComplete="new-password"
                        />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <button 
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <span>🔑 Ganti Password</span>
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            ✓ Password Diperbarui
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
