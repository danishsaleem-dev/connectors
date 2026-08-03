import Link from "next/link";

/** Links through to the consultant's own page rather than opening a modal —
 * a full profile (bio, experience, education, the enquiry form) needs more
 * room than a modal gives it, and deserves its own shareable URL. */
export function ConsultantCard({
  id,
  name,
  photoUrl,
  expertise,
  yearsExperience,
}: {
  id: string;
  name: string;
  photoUrl: string | null;
  expertise: string[];
  yearsExperience: number | null;
}) {
  return (
    <Link
      href={`/consultants/${id}`}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-all hover:border-violet-400 hover:shadow-[0_28px_56px_-32px_rgba(20,20,26,0.35)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-sunken)]">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
          <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-3xl text-[var(--muted)]/40">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg">{name}</h3>
        {expertise.length > 0 && (
          <p className="mt-1 text-sm text-violet-600">{expertise.join(" · ")}</p>
        )}
        {yearsExperience != null && (
          <p className="mt-1 text-xs text-[var(--muted)]">
            {yearsExperience} years of experience
          </p>
        )}
      </div>
    </Link>
  );
}
