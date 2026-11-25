import type { InputHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> { label: string }

export default function Field({ label, ...props }: FieldProps) 
{
    return (
        <label className="block" >
            <span className="mb-1 block text-sm font-medium text-slate-700" > {label} </span>
            < input {...props} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"/>
        </label>
    )
}