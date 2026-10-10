export default function PaletteLabel({ index, fontSize, isActive }) {
  return (
    <div className="h-full overflow-visible" aria-hidden="true">
      <span
        className={`block font-serif leading-[0.72] tabular-nums whitespace-nowrap
          transition-[font-size,color] duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isActive ? 'text-primary' : 'text-primary/60'}`}
        style={{ fontSize }}
      >
        {index + 1}
      </span>
    </div>
  );
}