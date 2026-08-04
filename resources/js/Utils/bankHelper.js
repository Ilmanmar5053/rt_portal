export function getBankConfig(bankName = '') {
    const name = (bankName || '').toUpperCase().trim();
    if (name.includes('BCA')) {
        return {
            label: 'BCA',
            color: 'from-blue-600 to-indigo-700 text-white',
            badgeBg: 'bg-blue-600 text-white',
            logoText: 'BCA',
            icon: '🏦',
        };
    }
    if (name.includes('MANDIRI')) {
        return {
            label: 'Mandiri',
            color: 'from-amber-500 to-yellow-600 text-white',
            badgeBg: 'bg-amber-600 text-white',
            logoText: 'MANDIRI',
            icon: '🏦',
        };
    }
    if (name.includes('BNI')) {
        return {
            label: 'BNI',
            color: 'from-orange-500 to-emerald-600 text-white',
            badgeBg: 'bg-orange-600 text-white',
            logoText: 'BNI',
            icon: '🏦',
        };
    }
    if (name.includes('BRI')) {
        return {
            label: 'BRI',
            color: 'from-blue-700 to-sky-600 text-white',
            badgeBg: 'bg-blue-700 text-white',
            logoText: 'BRI',
            icon: '🏦',
        };
    }
    if (name.includes('BSI')) {
        return {
            label: 'BSI',
            color: 'from-teal-600 to-emerald-700 text-white',
            badgeBg: 'bg-teal-600 text-white',
            logoText: 'BSI',
            icon: '🕌',
        };
    }
    if (name.includes('JAGO')) {
        return {
            label: 'Bank Jago',
            color: 'from-orange-500 to-amber-500 text-white',
            badgeBg: 'bg-orange-500 text-white',
            logoText: 'JAGO',
            icon: '⚡',
        };
    }
    if (name.includes('SEABANK') || name.includes('SEA')) {
        return {
            label: 'SeaBank',
            color: 'from-orange-600 to-rose-600 text-white',
            badgeBg: 'bg-rose-600 text-white',
            logoText: 'SEABANK',
            icon: '🌊',
        };
    }
    if (name.includes('DANA')) {
        return {
            label: 'DANA',
            color: 'from-sky-500 to-blue-600 text-white',
            badgeBg: 'bg-sky-500 text-white',
            logoText: 'DANA',
            icon: '📱',
        };
    }
    if (name.includes('OVO')) {
        return {
            label: 'OVO',
            color: 'from-purple-600 to-indigo-700 text-white',
            badgeBg: 'bg-purple-600 text-white',
            logoText: 'OVO',
            icon: '📱',
        };
    }
    if (name.includes('GOPAY') || name.includes('GO-PAY')) {
        return {
            label: 'GoPay',
            color: 'from-emerald-500 to-teal-600 text-white',
            badgeBg: 'bg-emerald-600 text-white',
            logoText: 'GOPAY',
            icon: '📱',
        };
    }
    return {
        label: bankName || 'Bank',
        color: 'from-slate-700 to-gray-800 text-white',
        badgeBg: 'bg-slate-700 text-white',
        logoText: (bankName || 'BANK').substring(0, 7).toUpperCase(),
        icon: '💳',
    };
}
