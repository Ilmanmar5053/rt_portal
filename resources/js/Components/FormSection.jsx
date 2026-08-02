import React from 'react';

export default function FormSection({
    title,
    description,
    color = 'blue',
    icon,
    children,
    className = '',
}) {
    const colorStyles = {
        blue: {
            badge: 'bg-blue-50 text-blue-600 border-blue-200',
            border: 'border-blue-200/80',
            bar: 'bg-blue-500',
            headerBg: 'bg-blue-50/40',
        },
        emerald: {
            badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
            border: 'border-emerald-200/80',
            bar: 'bg-emerald-500',
            headerBg: 'bg-emerald-50/40',
        },
        indigo: {
            badge: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            border: 'border-indigo-200/80',
            bar: 'bg-indigo-500',
            headerBg: 'bg-indigo-50/40',
        },
        amber: {
            badge: 'bg-amber-50 text-amber-600 border-amber-200',
            border: 'border-amber-200/80',
            bar: 'bg-amber-500',
            headerBg: 'bg-amber-50/40',
        },
        purple: {
            badge: 'bg-purple-50 text-purple-600 border-purple-200',
            border: 'border-purple-200/80',
            bar: 'bg-purple-500',
            headerBg: 'bg-purple-50/40',
        },
        rose: {
            badge: 'bg-rose-50 text-rose-600 border-rose-200',
            border: 'border-rose-200/80',
            bar: 'bg-rose-500',
            headerBg: 'bg-rose-50/40',
        },
        slate: {
            badge: 'bg-slate-100 text-slate-700 border-slate-300',
            border: 'border-slate-200',
            bar: 'bg-slate-600',
            headerBg: 'bg-slate-50',
        },
    };

    const currentStyle = colorStyles[color] || colorStyles.blue;

    return (
        <div className={`bg-white rounded-2xl border ${currentStyle.border} shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md mb-6 ${className}`}>
            <div className={`px-6 py-4 ${currentStyle.headerBg} border-b border-slate-100 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${currentStyle.badge} shadow-xs font-semibold flex-shrink-0`}>
                            {icon}
                        </div>
                    )}
                    <div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                            {title}
                        </h3>
                        {description && (
                            <p className="text-xs text-slate-500 mt-0.5 font-medium">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                <div className={`w-1.5 h-7 rounded-full ${currentStyle.bar} opacity-70`} />
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
