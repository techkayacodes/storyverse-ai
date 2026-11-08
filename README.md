# Storyverse

AI-powered multilingual story app. Write an idea in your own language and get a short illustrated story. Each scene has a picture, a short video clip, captions and narration.

This is the first working version (MVP front end). It runs fully in the browser in **demo mode**. Stories are assembled from templates on the device and scenes use procedural animated art. The AI calls all sit behind one file (`js/providers.js`), so connecting real text, image, video and voice models doesn't change the UI.

## What's in it

- **Discover feed.** Community stories written in their own languages (Spanish, Japanese, Arabic, Hindi, English, Portuguese, Swahili, Korean). Cards play a short looping clip on hover. Filter by "All languages" or "In my language".
- **Create flow.** Prompt, story language, length (3 or 5 scenes), genre and art style, with live style previews.
- **Story player.** Vertical 9:16 clips, one per scene, with progress segments, tap to go back or forward, captions, an English translation toggle, and read-aloud in the story's language (browser speech).
- **Continue the story.** Adds a new scene to your own stories.
- **20 interface languages.** English, Chinese, Hindi, Spanish, French, Arabic, Bengali, Portuguese, Russian, Urdu, Indonesian, German, Japanese, Swahili, Turkish, Korean, Vietnamese, Italian, Filipino and Persian. Right-to-left layout works for Arabic, Urdu and Persian. The app picks your browser's language automatically.
- **My stories.** Saved in your browser until accounts exist.

## Run it locally

No build step. Serve the folder with any static server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. A server is needed because the JavaScript uses ES modules and loads the language files with `fetch`.

## Project layout

```
index.html          app shell
css/styles.css      styles (logical properties, so RTL mirrors automatically)
js/app.js           routing, views, story player
js/i18n.js          language registry, translation loader, number/language-name formatting
js/providers.js     AI provider layer (demo generator now, backend API later)
js/scene.js         procedural scene art and clip animation (placeholder for AI images/video)
js/stories.js       sample Discover stories
locales/*.json      one file per interface language
docs/               product spec, AI pipeline, localization guide
```

## Docs

- [Product spec and roadmap](docs/PRODUCT_SPEC.md)
- [AI pipeline: text, image, video and voice](docs/AI_PIPELINE.md)
- [Adding and reviewing languages](docs/LOCALIZATION.md)
