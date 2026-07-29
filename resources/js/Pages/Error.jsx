import { Head, Link } from '@inertiajs/react';

export default function Error({ status }) {
    const title = {
        503: '503 - Layanan Tidak Tersedia',
        500: '500 - Kesalahan Server',
        404: '404 - Halaman Tidak Ditemukan',
        403: '403 - Akses Ditolak',
    }[status] || 'Error';

    const description = {
        503: 'Maaf, layanan kami sedang dalam pemeliharaan. Silakan coba lagi nanti.',
        500: 'Ups, terjadi kesalahan pada server kami.',
        404: 'Maaf, halaman yang Anda cari tidak dapat ditemukan.',
        403: 'Maaf, Anda tidak memiliki izin (Hak Akses) untuk membuka halaman ini.',
    }[status] || 'Terjadi kesalahan sistem.';

    return (
        <div className="antialiased min-h-screen flex items-center justify-center bg-gray-50">
            <Head title={title} />
            <div className="max-w-lg w-full px-6 py-12 bg-white shadow-xl shadow-red-900/5 rounded-3xl text-center border border-gray-100">
                <div className="mb-8 flex justify-center">
                    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center animate-bounce">
                        {status === 403 ? (
                            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        ) : (
                            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                    </div>
                </div>
                
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{title}</h1>
                <p className="text-lg text-gray-500 mb-8">{description}</p>
                
                <div className="space-y-4">
                    <Link href="/dashboard" className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 w-full sm:w-auto">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                        </svg>
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
