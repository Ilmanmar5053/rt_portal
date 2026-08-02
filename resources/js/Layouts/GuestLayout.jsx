import { Link, usePage } from '@inertiajs/react';
import { getNamaPerumahan, getNamaRt } from '@/Utils/profilHelper';

export default function GuestLayout({ children }) {
    const { profil } = usePage().props;
    const namaPerumahan = getNamaPerumahan(profil);
    const namaRt = getNamaRt(profil);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 mesh-residential-bg font-sans relative overflow-hidden selection:bg-emerald-600 selection:text-white">
            {/* Atmospheric subtle residential glow accents (Emerald & Maroon) */}
            <div className="absolute -top-16 -right-16 w-96 h-96 bg-emerald-500/15 rounded-full blur-[110px] pointer-events-none max-w-full"></div>
            <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-rose-600/10 rounded-full blur-[110px] pointer-events-none max-w-full"></div>

            {/* Optional Back to Home Link */}
            <Link 
                href="/" 
                className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-emerald-700 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200/80 shadow-sm hover:shadow transition-all z-20"
            >
                &larr; Beranda
            </Link>

            {/* Premium Residential Glassmorphism Card */}
            <div className="w-full max-w-sm sm:max-w-md mx-auto glass-card rounded-3xl border border-white/80 shadow-[0_25px_70px_-15px_rgba(5,150,105,0.12)] p-6 sm:p-8 relative z-10">
                {/* Clean Residential Logo Banner */}
                <div className="mb-6 text-center">
                    <Link href="/" className="inline-block group">
                        {profil?.logo_path ? (
                            <img 
                                src={`/storage/${profil.logo_path}`} 
                                alt="Logo Portal RT" 
                                className="w-16 h-16 object-contain bg-slate-50 p-2 rounded-2xl border border-emerald-100 shadow-sm mx-auto group-hover:scale-105 transition-transform" 
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-rose-800 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-emerald-600/25 mx-auto group-hover:scale-105 transition-transform">
                                RT
                            </div>
                        )}
                    </Link>
                    <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-bold">
                        <span>🏡 Perumahan {namaPerumahan}</span>
                    </div>
                </div>

                {children}
            </div>

            {/* Minimal Footer Info */}
            <p className="text-xs font-semibold text-gray-500 text-center mt-6 z-10">
                &copy; {new Date().getFullYear()} {namaRt} • Perumahan {namaPerumahan}
            </p>
        </div>
    );
}
