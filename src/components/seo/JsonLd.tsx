/**
 * Renders one or more JSON-LD blocks.
 *
 * The `<` escape matters: a `</script>` sequence inside the serialised JSON
 * would otherwise close this tag early and let arbitrary content into the
 * document.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(block).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
