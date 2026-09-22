# Speed and multilingual SEO optimization

## Goal
Make all public pages feel faster while preserving the existing design, and strengthen search visibility in English, Arabic, and Persian for Dr. Arman Molazadeh / Dr. Arman Eye Care searches.

## Changes
- Reduce first-load blocking work: remove unnecessary third-party connections/scripts, avoid replaying scripts that do not need to rerun, and keep non-critical images/videos lazy.
- Improve navigation preloading so the next language/page is ready sooner without downloading every page upfront.
- Keep content caching effective so public pages do not repeatedly wait on the CMS.
- Review every English, Arabic, and Persian public page for unique titles, descriptions, canonical URLs, social metadata, and language alternates.
- Add consistent multilingual physician/clinic structured data and correct sitemap language entries.
- Fix the SEO scanner's language detection issue without changing visible content.

## Verification
- Check build and runtime logs.
- Test homepage and page-to-page navigation timing in a real browser.
- Verify rendered metadata, `lang`/`dir`, sitemap, and key pages across all three languages.
- Mark scanner findings fixed only after the matching correction is confirmed.

## Notes
- Search optimization improves crawlability and relevance but cannot guarantee a specific Google ranking.
- No redesign or editor workflow changes are included.
