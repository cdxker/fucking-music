# Prompt for Creating fuckingmusic.com (fm)

Create a minimal website for fuckingmusic.com (also accessible as fm) using the existing Astro template with the following specifications:

## Existing Setup
- The site uses Astro with a basic template
- There's an empty styles.css file in /public/
- The index.astro file currently has a basic HTML structure
- Manual CSS only - NO TAILWIND or CSS frameworks
- Keep the minimal Astro approach

## Design Requirements
- Ultra-minimal aesthetic inspired by https://www.strwb.com/
- Clean, simple typography with no unnecessary elements
- Monospace or simple sans-serif font
- Black text on white background (or very subtle off-white)
- No images, icons, or decorative elements
- Responsive design that works on all devices

## Homepage Structure
- Site title/header: "fucking music" or "fm"
- A curated list of links organized in a simple, vertical layout
- Each link should be clearly clickable but without traditional button styling
- Links could be music-related resources such as:
  - Music streaming services
  - Music blogs/publications
  - Artist pages
  - Music tools/software
  - Record labels
  - Music communities/forums
  - Concert/event listings
  - Music education resources

## Technical Requirements
- Modify src/pages/index.astro to create the homepage
- Add minimal CSS to public/styles.css (note: index.astro references /style.css, may need to fix)
- Fast loading, minimal HTML/CSS
- No JavaScript unless absolutely necessary
- Semantic HTML5 markup
- Keep CSS in the external stylesheet (public/styles.css)
- No external dependencies or frameworks beyond Astro
- Links open in new tabs (target="_blank" with rel="noopener")

## Example Link Structure
```
fm

bandcamp
spotify
pitchfork
resident advisor
discogs
soundcloud
nts radio
fact magazine
boomkat
```

## Additional Pages (optional)
- /about - Brief explanation of the site's purpose
- /submit - Simple form to suggest new links

Keep it brutally simple. The entire site should feel like a text document that happens to have clickable links.