/**
 * A fictional page for trying the page review. It is mostly sound, with a realistic handful
 * of problems: blocked zoom, an image and a link without text, a skipped heading level, no
 * meta description, a relative canonical link and a link that only runs JavaScript.
 */
export const SAMPLE_PAGE_URL = 'https://example.com/guides/trail-running-shoes';

export const SAMPLE_PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>Trail running shoes: how to choose | Example Outdoor</title>
  <link rel="canonical" href="/guides/trail-running-shoes">
  <meta property="og:title" content="Trail running shoes: how to choose">
  <script type="application/ld+json">
    {"@context": "https://schema.org", "@type": "Article", "headline": "Trail running shoes: how to choose"}
  </script>
</head>
<body>
  <header>
    <a href="/"><img src="/logo.svg" alt="Example Outdoor"></a>
    <nav>
      <a href="/guides">Guides</a>
      <a href="javascript:void(0)">Menu</a>
      <a href="/cart"><svg aria-hidden="true" viewBox="0 0 24 24"></svg></a>
    </nav>
  </header>
  <main>
    <h1>Trail running shoes: how to choose</h1>
    <p>Grip, fit and protection matter more than weight on rough ground.</p>
    <h3>Grip and lugs</h3>
    <img src="/images/lugs.jpg">
    <h2>Fit</h2>
    <img src="/images/divider.svg" alt="">
    <p>Read our <a href="https://example.org/sizing">sizing guide</a>.</p>
  </main>
</body>
</html>
`;
