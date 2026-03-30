export default function SectionCard({ eyebrow, title, description, children }) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,24,0.96),rgba(9,14,14,0.98))] p-5 shadow-[0_24px_60px_rgba(2,6,23,0.34)] backdrop-blur sm:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/35 to-transparent" />
      <div className="pointer-events-none absolute -right-14 top-0 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-amber-300/8 blur-3xl" />
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-200/85">{eyebrow}</p>
      ) : null}
      {title ? <h2 className="mt-3 max-w-3xl text-[1.35rem] font-black tracking-tight text-white sm:text-2xl">{title}</h2> : null}
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">{description}</p> : null}
      <div className={title || description ? "relative mt-5" : "relative"}>{children}</div>
    </section>
  );
}
