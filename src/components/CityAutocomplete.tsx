import { useState, useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = "Choisir une ville",
  className = "",
}: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // fetch suggestions debounced
  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    if (!value) {
      setSuggestions([]);
      return;
    }
    timeout.current = setTimeout(async () => {
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(
            value
          )}`
        );
        const data: { display_name: string }[] = await resp.json();
        const rawList: string[] = data.map((d) => {
          const parts = d.display_name.split(",").map((p) => p.trim());
          const short = parts.slice(0, 2).join(", ");
          return short.length > 40 ? short.slice(0, 37) + "…" : short;
        });
        const set = Array.from(new Set(rawList));
        setSuggestions(set);
        setOpen(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, [value]);

  // close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        onFocus={() => value && suggestions.length && setOpen(true)}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-white border rounded shadow-sm max-h-60 overflow-auto text-sm">
          {suggestions.map((s, idx) => (
            <li
              key={`${s}-${idx}`}
              onMouseDown={() => {
                onChange(s);
                setOpen(false);
              }}
              className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
