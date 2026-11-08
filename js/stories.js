// Sample community stories for the Discover feed. Each one is written in its own
// language, with an English translation per scene so anyone can follow along.
// In production these come from the API (GET /api/stories), not from this file.

export const SAMPLE_STORIES = [
  {
    id: 'faro', lang: 'es', genre: 'fantasy', style: 'watercolor', author: 'Lucía M.', likes: 1284,
    title: 'El faro que soñaba', titleEn: 'The Lighthouse That Dreamed',
    scenes: [
      { text: 'En una isla sin nombre, un viejo faro soñaba con ver el mundo más allá del mar.', en: 'On a nameless island, an old lighthouse dreamed of seeing the world beyond the sea.' },
      { text: 'Una noche, su luz se volvió un camino dorado sobre las olas, y una niña se atrevió a seguirlo.', en: 'One night its light became a golden path across the waves, and a girl dared to follow it.' },
      { text: 'Volvió al amanecer con cuentos de cien puertos, y el faro, por fin, conoció el mundo a través de ella.', en: 'She returned at dawn with tales from a hundred ports, and through her the lighthouse finally knew the world.' },
    ],
  },
  {
    id: 'tsuki', lang: 'ja', genre: 'fantasy', style: 'anime', author: 'Haruto S.', likes: 2310,
    title: '月の図書館', titleEn: 'The Library on the Moon',
    scenes: [
      { text: '満月の夜だけ、空に階段があらわれる。その先には、忘れられた物語をしまう図書館がある。', en: 'Only on full-moon nights, a staircase appears in the sky. At the top is a library that keeps forgotten stories.' },
      { text: '司書のウサギは言った。「一冊だけ、持ち帰っていいよ。でも、最後まで読むこと。」', en: 'The rabbit librarian said, "You may take one book home. But you must read it to the end."' },
      { text: '少女が選んだのは、白紙の本だった。物語を書くのは、これからの彼女自身だった。', en: 'The girl chose a blank book. The one who would write its story was her future self.' },
    ],
  },
  {
    id: 'najm', lang: 'ar', genre: 'adventure', style: 'cinematic', author: 'Yousef A.', likes: 1876,
    title: 'حديقة النجوم', titleEn: 'The Garden of Stars',
    scenes: [
      { text: 'في قلب الصحراء، أخبر الجدّ حفيدته أن النجوم تُزرع كما تُزرع النخيل.', en: 'In the heart of the desert, a grandfather told his granddaughter that stars are planted like palm trees.' },
      { text: 'حملت ليلى بذرةً مضيئة وسارت ثلاث ليالٍ حتى وجدت الرمال الفضية.', en: 'Layla carried a glowing seed and walked for three nights until she found the silver sands.' },
      { text: 'وحين غرستها، ارتفع ضوءٌ جديد في السماء، وسمّاه الناس «نجمة ليلى».', en: 'When she planted it, a new light rose into the sky, and people named it "Layla\'s Star".' },
    ],
  },
  {
    id: 'baarish', lang: 'hi', genre: 'comedy', style: 'storybook', author: 'Ananya R.', likes: 964,
    title: 'बारिश का जादू', titleEn: 'The Magic of the Rain',
    scenes: [
      { text: 'मुंबई की एक गली में, चिंटू का छाता अचानक बोल पड़ा: "आज मैं उड़ना चाहता हूँ!"', en: 'In a Mumbai lane, Chintu\'s umbrella suddenly spoke: "Today I want to fly!"' },
      { text: 'छाता चिंटू को लेकर छतों के ऊपर उड़ा, और चायवाले ने कप उठाकर सलाम किया।', en: 'The umbrella flew Chintu over the rooftops, and the chai seller raised his cup in salute.' },
      { text: 'शाम को दोनों घर लौटे, भीगे हुए और हँसते हुए। माँ ने बस इतना कहा, "कल भी जाना।"', en: 'In the evening they came home, soaked and laughing. Mother only said, "Go again tomorrow."' },
    ],
  },
  {
    id: 'europa', lang: 'en', genre: 'scifi', style: 'cinematic', author: 'Maya K.', likes: 3021,
    title: 'Signal from Europa', titleEn: 'Signal from Europa',
    scenes: [
      { text: 'Under forty kilometres of ice, the probe heard something no one expected: a song.' },
      { text: 'Engineer Tomi stayed up for nine nights translating it, note by note, into numbers.' },
      { text: 'The numbers were coordinates. They pointed home, to Earth, to a beach where Tomi grew up.' },
      { text: 'Whoever was singing had been listening to us for a very long time.' },
    ],
  },
  {
    id: 'gato', lang: 'pt', genre: 'mystery', style: 'storybook', author: 'João P.', likes: 1450,
    title: 'O Gato Detetive de Lisboa', titleEn: 'The Detective Cat of Lisbon',
    scenes: [
      { text: 'Quando os pastéis de nata começaram a desaparecer da padaria, o gato Bolota assumiu o caso.', en: 'When the custard tarts began vanishing from the bakery, Bolota the cat took the case.' },
      { text: 'As pistas levavam ao elétrico 28: migalhas, açúcar e uma pena de gaivota.', en: 'The clues led to tram 28: crumbs, sugar and a seagull feather.' },
      { text: 'O culpado era uma gaivota com filhotes famintos. Bolota resolveu o caso — e dividiu o lanche.', en: 'The culprit was a seagull with hungry chicks. Bolota solved the case, and shared the snack.' },
    ],
  },
  {
    id: 'simba', lang: 'sw', genre: 'adventure', style: 'watercolor', author: 'Amani W.', likes: 1102,
    title: 'Simba na Mwezi', titleEn: 'The Lion and the Moon',
    scenes: [
      { text: 'Simba mdogo aliamini kwamba angeweza kuufikia mwezi kutoka juu ya Mlima Kilimanjaro.', en: 'A young lion believed he could reach the moon from the top of Mount Kilimanjaro.' },
      { text: 'Njiani, twiga, ndovu na kunguru walimsaidia kupanda kila hatua.', en: 'Along the way, a giraffe, an elephant and a crow helped him climb every step.' },
      { text: 'Hakuugusa mwezi, lakini aligundua kwamba marafiki zake walikuwa wanang\'aa kuliko nyota.', en: 'He never touched the moon, but he found that his friends shone brighter than the stars.' },
    ],
  },
  {
    id: 'bus', lang: 'ko', genre: 'romance', style: 'anime', author: '지민', likes: 2655,
    title: '서울의 마지막 버스', titleEn: 'The Last Bus in Seoul',
    scenes: [
      { text: '매일 밤 11시 40분, 같은 버스, 같은 자리. 그녀는 늘 창밖의 한강을 바라봤다.', en: 'Every night at 11:40, the same bus, the same seat. She always watched the Han River outside the window.' },
      { text: '어느 날 그녀가 우산을 두고 내렸다. 그는 다음 날 같은 시간에 우산을 들고 기다렸다.', en: 'One day she left her umbrella behind. The next day he waited at the same time, holding it.' },
      { text: '"고마워요." 그 한마디로, 마지막 버스는 두 사람의 첫 이야기가 되었다.', en: '"Thank you." With those words, the last bus became the first chapter of their story.' },
    ],
  },
];
