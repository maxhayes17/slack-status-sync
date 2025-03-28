var EmojiConvertor = require("emoji-js");

var converter = new EmojiConvertor();

export const getEmojiFromName = (name: string): string => {
  return converter.replace_colons(`:${name}:`);
};
