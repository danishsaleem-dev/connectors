import { clsx } from "clsx";
import { Check } from "lucide-react";

export function StepIndicator({
  titles,
  current,
}: {
  titles: readonly string[];
  current: number;
}) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center">
        {titles.map((title, i) => (
          <div key={title} className="flex flex-1 items-center last:flex-none">
            <span
              className={clsx(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                i === current && "bg-violet-600 text-white",
                i < current && "bg-violet-50 text-violet-600",
                i > current && "bg-grey-100 text-grey-300",
              )}
            >
              {i < current ? <Check size={13} /> : i + 1}
            </span>
            {i < titles.length - 1 && (
              <span
                className={clsx(
                  "mx-1.5 h-px flex-1 transition-colors",
                  i < current ? "bg-violet-300" : "bg-[var(--border)]",
                )}
              />
            )}
          </div>
        ))}
      </div>
      <p className="eyebrow">
        Step {current + 1} of {titles.length} — {titles[current]}
      </p>
    </div>
  );
}
