# Storyverse product spec

## Positioning

Apps in the AI-companion and interactive-story space (Emochi is one example) let people chat with characters and play through text stories. Storyverse goes further on two points:

1. **Media-first stories.** Every scene has a generated image and a short (4–6 s) video clip, plus narration. Stories are watched like short vertical videos, not only read.
2. **International from day one.** The interface, the story text, the captions and the narration all work in the user's language. Stories can be read in their original language with a translation alongside.

We study competitors only through what is publicly visible: feature lists, user flows and app store pages. We don't copy their code, branding, characters, artwork or text. Tools like REA (`morluto/rea`) may be used only within the target service's terms of use, to understand public behaviour, never to extract protected assets or private APIs.

## Users

- **Creators:** people who want to turn an idea, a memory or a bedtime story into something shareable.
- **Viewers:** people who browse and watch short stories, often in their own language or while learning another.
- **Families and learners:** parents making stories for children, language learners reading with translations.

## MVP (this repository)

| Area | Status |
| --- | --- |
| Discover feed with multilingual sample stories | Done (sample data) |
| Create flow: prompt, language, length, genre, style | Done (demo generator) |
| Vertical story player: clips, captions, progress, tap navigation | Done (procedural art) |
| Read aloud in the story language | Done (browser speech, voice quality varies by device) |
| Translation toggle | Done for sample stories |
| Continue the story | Done for your own stories |
| 20 UI languages with RTL | Done (translations need native review) |
| Saved stories | Browser storage only |

## Next milestones

1. **Backend and real AI.** Implement `POST /api/stories` and `/continue` as described in [AI_PIPELINE.md](AI_PIPELINE.md), then set `window.STORYVERSE_API`.
2. **Accounts and storage.** Sign-in, cloud-saved stories, public or private sharing, share links with preview images.
3. **Safety.** Prompt and output moderation in every supported language, an age setting, reporting and blocking, and clear rules on how uploaded photos are used.
4. **Uploads.** Let creators add their own photos or short clips as scene references (image-to-image or image-to-video).
5. **Interactive branches.** "What happens next?" choices that the viewer picks, which generate the next scene.
6. **Characters.** Reusable characters with a consistent look across scenes and stories, and chat with a story's characters.
7. **Language growth.** Add languages based on demand and translation quality (see [LOCALIZATION.md](LOCALIZATION.md)). Strong next candidates: Tamil, Telugu, Marathi, Gujarati, Punjabi, Thai, Polish, Ukrainian, Dutch, Hausa, Yoruba, Amharic, Malay, Hebrew.
8. **Mobile apps.** The web app is mobile-first. A PWA comes next, then native wrappers if needed.

## Success measures

- Share of visitors who create a first story
- Stories watched to the last scene
- Shares per story
- Weekly active creators by language, to decide which languages to invest in next
