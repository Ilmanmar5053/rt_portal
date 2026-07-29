import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AdminLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Profil Akun</h2>}
        >
            <Head title="Profil Akun" />

            <div className="py-8 max-w-7xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-8 shadow-sm sm:rounded-2xl border border-gray-100 h-full flex flex-col">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="w-full flex-grow"
                        />
                    </div>

                    <div className="bg-white p-8 shadow-sm sm:rounded-2xl border border-gray-100 h-full flex flex-col">
                        <UpdatePasswordForm className="w-full flex-grow" />
                    </div>
                </div>

                <div className="bg-white p-8 shadow-sm sm:rounded-2xl border border-gray-100">
                    <DeleteUserForm className="w-full max-w-2xl" />
                </div>
            </div>
        </AdminLayout>
    );
}
