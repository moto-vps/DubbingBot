export const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ko', name: 'Korean' },
];

export const VOICE_LIST = [
    {
      name: 'Zephyr',
      gender: 'Female',
      description: "An energetic and bright voice with a clear mid-range pitch, sounding perky and enthusiastic. It projects positivity and youthfulness, making it very engaging."
    },
    {
      name: 'Puck',
      gender: 'Male',
      description: "A friendly, mid-pitched voice with a casual, 'everyman' quality. It sounds approachable and relatable, ideal for informal communication."
    },
    {
      name: 'Charon',
      gender: 'Male',
      description: "A deep, authoritative voice with a serious and commanding tone. It is resonant and powerful, with a measured, deliberate pace."
    },
    {
      name: 'Kore',
      gender: 'Female',
      description: "An energetic and youthful voice with a mid-to-high pitch, conveying confidence and enthusiasm. It is clear and bright, with a perky, engaging quality."
    },
    {
      name: 'Leda',
      gender: 'Female',
      description: "A composed and professional voice, mid-pitched with a slightly lower resonance, conveying authority and calm. It is articulate and measured, with a sophisticated and trustworthy feel."
    },
    {
      name: 'Iapetus',
      gender: 'Male',
      description: "A friendly, mid-pitched voice with a casual, 'everyman' quality, similar to Puck. It sounds approachable and relatable."
    },
    {
      name: 'Despina',
      gender: 'Female',
      description: "A warm and inviting voice with a smooth and clear delivery. It's described as reassuring and pleasant, with a gentle, persuasive quality."
    }
  ] as const;


export const VIDEO_CHUNK_DURATION_S = 4; // Process video in 4-second chunks