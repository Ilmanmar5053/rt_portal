export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-bold text-slate-800 mb-1.5 tracking-tight ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
