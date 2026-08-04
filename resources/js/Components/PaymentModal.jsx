import React, { useState } from 'react';
import { getBankConfig } from '@/Utils/bankHelper';

export default function PaymentModal({ isOpen, onClose, profil, tagihanInfo, namaRt }) {
    const [copiedIndex, setCopiedIndex] = useState(null);

    if (!isOpen) return null;

    // Default rekening if profil does not have any yet
    const rekeningList = (profil?.rekening_bank && profil.rekening_bank.length > 0)
        ? profil.rekening_bank
        : [
            {
                bank: 'BCA',
                nomor_rekening: '54800012345',
                atas_nama: 'Pengurus RT 009 / RW 006',
                catatan: 'Rekening Utama Kas RT'
            },
            {
                bank: 'Mandiri',
                nomor_rekening: '1230009876543',
                atas_nama: 'Kas RT 009',
                catatan: 'Iuran Warga & Kebersihan'
            },
            {
                bank: 'BSI',
                nomor_rekening: '7123456789',
                atas_nama: 'Lingkungan RT 009',
                catatan: 'Bank Syariah / Sosial'
            }
        ];

    const handleCopy = (text, idx) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            setCopiedIndex(idx);
            setTimeout(() => setCopiedIndex(null), 2000);
        }
    };

    const waNumber = profil?.nomor_wa ? profil.nomor_wa.replace(/[^0-9]/g, '') : '';
    const formattedWa = waNumber.startsWith('0') ? '62' + waNumber.slice(1) : waNumber;
    const waText = encodeURIComponent(
        `Halo Bendahara/Pengurus ${namaRt || 'RT'}, saya ingin konfirmasi pembayaran iuran lingkungan untuk periode ${tagihanInfo?.periode || 'ini'} sebesar Rp ${(tagihanInfo?.total || 0).toLocaleString('id-ID')}. Berikut saya sertakan bukti transfernya.`
    );
    const waUrl = formattedWa ? `https://wa.me/${formattedWa}?text=${waText}` : null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white flex items-center justify-between relative overflow-hidden shrink-0">
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
                    <div className="flex items-center gap-3.5 z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20 shadow-inner">
                            💳
                        </div>
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200">
                                {namaRt || 'RT 009 / RW 006'}
                            </span>
                            <h3 className="font-black text-lg leading-tight text-white mt-0.5">
                                Pembayaran Iuran & Tagihan
                            </h3>
                            {tagihanInfo?.periode && (
                                <p className="text-xs text-emerald-100 mt-1 font-medium">
                                    Periode: <strong className="text-white">{tagihanInfo.periode}</strong>
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10 shrink-0 font-bold"
                        title="Tutup"
                    >
                        ✕
                    </button>
                </div>

                {/* Tagihan Summary Bar */}
                {tagihanInfo?.total !== undefined && (
                    <div className="bg-emerald-50/80 px-6 py-3.5 border-b border-emerald-100 flex items-center justify-between shrink-0">
                        <span className="text-xs font-bold text-gray-600">Total Nominal Tagihan:</span>
                        <span className="text-lg font-black text-emerald-800">
                            Rp {Number(tagihanInfo.total).toLocaleString('id-ID')}
                        </span>
                    </div>
                )}

                {/* Body (Scrollable account list) */}
                <div className="p-6 overflow-y-auto space-y-4 flex-grow">
                    <div>
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                            <span>🏦</span>
                            <span>Pilih Tujuan Transfer / Rekening RT</span>
                        </h4>

                        <div className="space-y-3">
                            {rekeningList.map((item, idx) => {
                                const cfg = getBankConfig(item.bank);
                                return (
                                    <div 
                                        key={idx}
                                        className="p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 hover:border-emerald-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center font-black text-sm shadow-md shrink-0 border border-white/20`}>
                                                {cfg.logoText}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black text-gray-900">{item.bank}</span>
                                                    {item.catatan && (
                                                        <span className="px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-[10px] font-bold">
                                                            {item.catatan}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-base font-black text-gray-900 font-mono tracking-wider mt-1">
                                                    {item.nomor_rekening}
                                                </div>
                                                <div className="text-xs text-gray-500 font-semibold mt-0.5">
                                                    A/N: <strong className="text-gray-800">{item.atas_nama}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleCopy(item.nomor_rekening, idx)}
                                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center justify-center gap-1.5 ${
                                                copiedIndex === idx
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'bg-emerald-100/80 text-emerald-900 hover:bg-emerald-200/90 border border-emerald-200'
                                            }`}
                                        >
                                            {copiedIndex === idx ? (
                                                <>
                                                    <span>✓</span>
                                                    <span>Tersalin!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>📋</span>
                                                    <span>Salin No. Rek</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Panduan Pembayaran */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 space-y-1.5">
                        <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                            <span>💡</span>
                            <span>Cara Konfirmasi Pembayaran Mandiri:</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1 pl-1 text-gray-700 font-medium">
                            <li>Transfer nominal iuran ke salah satu rekening atau E-Wallet di atas.</li>
                            <li>Simpan atau screenshot bukti transaksi transfer Anda.</li>
                            <li>Klik tombol <strong>Konfirmasi via WhatsApp</strong> di bawah untuk melampirkan bukti kepada Bendahara RT agar status langsung menjadi <strong>Lunas</strong>.</li>
                        </ol>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs transition"
                    >
                        Tutup
                    </button>
                    {waUrl && (
                        <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <span>💬</span>
                            <span>Konfirmasi via WhatsApp</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
