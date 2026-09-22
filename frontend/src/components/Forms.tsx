import { useRef, useState, type ReactNode, type FormEvent } from 'react';
import { apiErrorMessage } from '../api/client';
export const inputClass = 'mt-1 block w-full border border-[#c9c1b0] bg-[#fbfaf5] p-3 font-sans text-sm';
export const buttonClass = 'rounded bg-[#193b31] px-4 py-2 font-sans text-sm text-white disabled:opacity-50';
export function Field({ name, label, value, type = 'text', required = true, min, max, minLength, maxLength, pattern }: { name: string; label: string; value?: string | number; type?: string; required?: boolean; min?: number; max?: number; minLength?: number; maxLength?: number; pattern?: string }) {
  return <label className="block font-sans text-sm">{label}{type === 'textarea' ? <textarea className={inputClass} name={name} defaultValue={value} required={required} rows={4} minLength={minLength} maxLength={maxLength} /> : <input className={inputClass} name={name} defaultValue={value} type={type} required={required} min={min ?? (type === 'number' ? 1 : undefined)} max={max} minLength={minLength} maxLength={maxLength} pattern={pattern} />}</label>;
}
export function ActionForm({ children, submit, label = 'Save', onDone, resetOnSuccess = false }: { children: ReactNode; submit: (data: FormData) => Promise<unknown>; label?: string; onDone?: () => void; resetOnSuccess?: boolean }) {
  const submitting = useRef(false);
  const [pending, setPending] = useState(false); const [error, setError] = useState(''); const [saved, setSaved] = useState(false);
  async function handle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    submitting.current = true; setPending(true); setError(''); setSaved(false);
    try { await submit(data); if (resetOnSuccess) form.reset(); setSaved(true); onDone?.(); }
    catch (err) { setError(apiErrorMessage(err)); }
    finally { submitting.current = false; setPending(false); }
  }
  return <form className="space-y-4 border border-[#d8d2c3] bg-[#fbfaf5] p-5" onSubmit={handle} onChange={() => setSaved(false)} aria-busy={pending}><fieldset disabled={pending} className="min-w-0 space-y-4">{children}</fieldset>{error && <p role="alert" className="text-red-700">{error}</p>}{saved && <p role="status">Saved successfully.</p>}<button type="submit" disabled={pending} className={buttonClass}>{pending ? 'Saving...' : label}</button></form>;
}
export function Page({ title, children }: { title: string; children: ReactNode }) { return <section className="mx-auto max-w-5xl space-y-6 px-5 py-12"><h1 className="text-4xl">{title}</h1>{children}</section>; }
export const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();
export const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
