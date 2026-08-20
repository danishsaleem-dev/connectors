import Link from "next/link";

/** Links through to the consultant's own page rather than opening a modal —
 * a full profile (bio, experience, education, the enquiry form) needs more
 * room than a modal gives it, and deserves its own shareable URL.
 *
 * The portrait is the whole card, with the name over a scrim at the bottom.
 * The earlier version stacked every expertise tag under the name, which on a
 * consultant carrying twenty of them buried the photo under a wall of violet
 * text and made each card a different height. The tags still exist — they're
 * on the profile page, which has room to set them properly. */
export function ConsultantCard({
  slug,
  name,
  photoUrl,
}: {
  slug: string;
  name: string;
  photoUrl: string | null;
}) {
  return (
    <Link
      href={`/consultants/${slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--surface-sunken)] transition-all hover:shadow-[0_28px_56px_-32px_rgba(20,20,26,0.45)]"
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- private signed Storage URL
        <img
          src={photoUrl}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="font-display text-5xl text-[var(--muted)]/40">
            {name.charAt(0)}
          </span>
        </div>
      )}

      {/* Scrim rather than a solid bar — the name stays legible over a light
          or dark portrait without cropping the image behind it. */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-5 pb-5 pt-14">
        <h3 className="font-display text-lg text-white drop-shadow-sm">{name}</h3>
      </div>
    </Link>
  );
}
