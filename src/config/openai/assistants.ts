type TAssistant = {
  name: string,
  openaiId: string,
};

const assistants: Record<string, TAssistant> = {
  BOBA: {
    name: 'Boba, the tea servant',
    openaiId: 'asst_loV42lYPajq6clFeuc7NUYJD',
  },
  GUMALA: {
    name: 'Gumala, the mission creator',
    openaiId: 'asst_gaoi2gtedrZCkI7okaLLYKm1',
  },
  THOTH: {
    name: 'Thoth, the character creator',
    openaiId: 'asst_0JIwwGF60gNCmZg9KI9zaO4O',
  },
  LYRA: {
    name: 'Lyra, the dictionary creator',
    openaiId: 'asst_N6paFuUYBW1yEZyU0Tui5EAn',
  },
  SENET: {
    name: 'Senet',
    openaiId: 'asst_pb1FVuV7vhmB2De2mdBIKpwq',
  },
  NIMROD: {
    name: 'Nimrod',
    openaiId: 'asst_Pww75H9CwZvkUnjrJLCp4W4Z',
  },
  PROCYON: {
    name: 'Procyon',
    openaiId: 'asst_KwCoshgx2q1xDmjNek3YFplT'
  },
  SENET_DUNGEON_WORLD_MASTER: {
    name: 'Senet Dungeon World Master',
    openaiId: 'asst_2psVgXP5Qtx0EcLf34yyK2YG'
  },
};

export default assistants;