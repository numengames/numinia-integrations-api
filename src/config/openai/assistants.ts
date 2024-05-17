type TAssistant = {
  name: string;
  openaiId: string;
};

const assistants: Record<string, TAssistant> = {
  ANUZ: {
    name: 'Anuz, the Archivist',
    openaiId: 'asst_lSj2A2rbACSuayuTeSQE87Ku',
  },
  URSA: {
    name: 'Ursa, the Machine Whisperer',
    openaiId: 'asst_KBxndjT0UnOeFzlP6w8jutE7',
  },
  ANTUNJ: {
    name: 'Antunj, the Inspiration of Ideas',
    openaiId: 'asst_GcsHHr5KLLR4Xp3AHe9RxqAI',
  },
  LESATH: {
    name: 'Lesath, the Town Crier',
    openaiId: 'asst_MKPA4B4y7EX7hg2G8WBcvZcV',
  },
  KHAMBALIA: {
    name: 'Khambalia, the Guardian of the Theasurus',
    openaiId: 'asst_1gSeW6j4cm6PrXLjlrSdgEO6',
  },
  RIMA: {
    name: 'Rima, the Legal Rabbit',
    openaiId: 'asst_ewk1GHxiwLApHFrTnp4GxysB',
  },
  ARLA: {
    name: 'Arla, the Pythia',
    openaiId: 'asst_IukiISal1ERxisEtjgjyYZv2',
  },
  DEDUN: {
    name: 'Dedun, the Wealth Keeper ',
    openaiId: 'asst_er2VFqho8SSEqkHGX6Hd9oSj',
  },
  GUMALA: {
    name: 'Gumala, the Goal Manager',
    openaiId: 'asst_W3FWQU4pAUnateGSMbbYmTgh',
  },
  SENET: {
    name: 'Senet, the Gambler',
    openaiId: 'asst_OellK1TR07uDJaxeipQS4Ys2',
  },
  THOTH: {
    name: 'Thoth, the Modern Prometheus',
    openaiId: 'asst_L1yRBrDU3EFGdMrVsYspfeXD',
  },
  PROCYON: {
    name: 'Procyon',
    openaiId: 'asst_KwCoshgx2q1xDmjNek3YFplT',
  },
  NIMROD: {
    name: 'Nimrod, the Gatekeeper',
    openaiId: 'asst_i6nbIFZnw9XEBZ9vrg2zxaUJ',
  },
  SENET_DUNGEON_WORLD_MASTER: {
    name: 'Senet Dungeon World Master',
    openaiId: 'asst_2psVgXP5Qtx0EcLf34yyK2YG',
  },
  // LYRA: {
  //   name: 'Lyra, the dictionary creator',
  //   openaiId: 'asst_N6paFuUYBW1yEZyU0Tui5EAn',
  // },
};

export default assistants;
