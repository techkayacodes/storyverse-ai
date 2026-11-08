# AI pipeline

The front end calls two functions in `js/providers.js`: `generateStory(input)` and `continueStory(story)`. With no backend configured they run the on-device demo generator. Set `window.STORYVERSE_API = 'https://your-api'` (for example in a small script tag before `js/app.js`) and they call the API below instead.

API keys must live on the server. Never put them in the front end.

## Endpoints

### `POST /api/stories`

Request:

```json
{ "prompt": "un dragón tímido que abre una panadería en Lagos", "lang": "es", "genre": "fantasy", "style": "storybook", "scenes": 3 }
```

Response (a Story):

```json
{
  "id": "abc123",
  "lang": "es", "genre": "fantasy", "style": "storybook",
  "title": "…", "author": "…", "likes": 0, "mine": true,
  "scenes": [
    { "text": "…", "en": "…optional English translation…", "image": "https://…/1.webp", "video": "https://…/1.mp4", "audio": "https://…/1.mp3" }
  ]
}
```

`image`, `video` and `audio` are optional. The player falls back to procedural art and browser speech when they are missing. Wiring the player to use these URLs is the next front-end task: show `<video>` in place of the canvas when `scene.video` is set.

### `POST /api/stories/:id/continue`

Returns one new Scene in the same shape.

## Generation steps (server)

1. **Moderate the prompt** in its own language.
2. **Write the story** with a text model. Ask for JSON: a title, then per scene the `text` written directly in `lang` (not translated from English), an `en` translation, and an English `visual` description used only for image prompts. Writing directly in the target language gives more natural stories than translating.
3. **Generate images**, one per scene, from `visual` plus a style preset (watercolor, anime, cinematic, storybook) and a fixed character description, so characters look the same across scenes.
4. **Generate clips** with an image-to-video model: 4–6 s, 9:16, using each scene image as the first frame. This is the slowest and most expensive step. Run it in a background job and let the player show still images until the clips are ready.
5. **Narrate** with a text-to-speech model that supports `lang`. Use the browser's speech as a fallback.
6. **Moderate outputs** (text and images), then store the media on a CDN and save the story.

## Cost and speed

- Return the text first (a few seconds), then stream images and clips in as they finish.
- Cache by `(prompt, lang, style)` for repeat requests. Limit free users per day, especially for video.
- Keep model choice behind one server-side interface per step, so providers can be swapped by price, quality or language coverage.
