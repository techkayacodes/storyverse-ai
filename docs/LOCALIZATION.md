# Localization

## Current languages (20)

| Code | Language | Direction |
| --- | --- | --- |
| en | English | LTR |
| zh | Chinese (Simplified) | LTR |
| hi | Hindi | LTR |
| es | Spanish | LTR |
| fr | French | LTR |
| ar | Arabic | RTL |
| bn | Bengali | LTR |
| pt | Portuguese | LTR |
| ru | Russian | LTR |
| ur | Urdu | RTL |
| id | Indonesian | LTR |
| de | German | LTR |
| ja | Japanese | LTR |
| sw | Swahili | LTR |
| tr | Turkish | LTR |
| ko | Korean | LTR |
| vi | Vietnamese | LTR |
| it | Italian | LTR |
| tl | Filipino | LTR |
| fa | Persian | RTL |

These were chosen to cover the most widely spoken languages across every region. **All non-English files are first drafts and need review by native speakers before launch.**

## Adding a language

1. Copy `locales/en.json` to `locales/<code>.json` and translate every value. Keep the `{n}`, `{name}`, `{lang}` and `{idea}` placeholders.
2. Add one entry to `LANGUAGES` in `js/i18n.js`: code, English name, native name, `dir` (`ltr` or `rtl`) and a speech tag (for example `ta-IN`).
3. Open the app, choose the language, and check every page on a phone-sized screen.

Missing keys fall back to English, so a partly translated file still works.

## Rules for UI code

- Never hard-code visible text in JS or HTML. Add a key to `locales/en.json` and use `t('key')`.
- Use CSS logical properties (`margin-inline-start`, `inset-inline-end`, `text-align: start`) instead of left and right, so right-to-left layouts mirror automatically.
- Set `lang` and `dir` on any element that shows text in a language other than the UI's (story titles and scene text already do). This gives correct fonts, line breaking and screen-reader pronunciation.
- Format numbers with `formatNumber()` and language names with `languageName()`, both built on `Intl`.
- The templates `tpl.*` are used only by the demo generator. The real AI writes story text directly in the chosen language.
