import { Link, usePage } from '@inertiajs/react';
import { getNamaPerumahan, getNamaRt } from '@/Utils/profilHelper';

export default function GuestLayout({ children }) {
    const { profil } = usePage().props;
    const namaPerumahan = getNamaPerumahan(profil);
    const namaRt = getNamaRt(profil);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-900/5 font-sans relative overflow-hidden selection:bg-emerald-600 selection:text-white">
            {/* Atmospheric subtle glow accents */}
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-300/25 rounded-full blur-[90px] pointer-events-none max-w-full"></div>
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-300/25 rounded-full blur-[90px] pointer-events-none max-w-full"></div>

            {/* Optional Back to Home Link */}
            <Link 
                href="/" 
                className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-emerald-600 bg-white/80 backdrop-blur-sm px-3.5 py-2 rounded-full border border-gray-200 shadow-sm transition z-20"
            >
                &larr; Beranda
            </Link>

            {/* Minimalist Centered Card */}
            <div className="w-[92%] max-w-[390px] mx-auto bg-white rounded-3xl border border-gray-200/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] p-7 sm:p-8 relative z-10">
                {/* Clean Logo Banner */}
                <div className="mb-6 text-center">
                    <Link href="/" className="inline-block group">
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
                </div>

                {children}
            </div>

            {/* Minimal Footer Info */}
            <p className="text-[11px] text-gray-400 text-center mt-6 z-10">
                &copy; {new Date().getFullYear()} {namaRt} • {namaPerumahan}
            </p>
        </div>
    );
}
