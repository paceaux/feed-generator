const profanityRegex = /(fuck|shit|dick|cock|ass|wtf|stfu|wth)+(\w+)?/gi;

export function getWordList(text:string) : string[] {
    const wordList: string[] = [];

    if (text) {
      const words = text.trim().split(' ');
      words.forEach((word) => {
        wordList.push(word);
      });
    }

    return wordList;
  }

export function getAdjacentWords(wordList: string[], pronoun: string, rangeSize: number = 1) : string[] {
    let adjacentWords: string[] = [];
    const pronounIndex = wordList.indexOf(pronoun);

    if (pronounIndex > -1) {
      let startIndex = pronounIndex - rangeSize;
      let endIndex = pronounIndex + rangeSize;

      if (startIndex < 0) {
        startIndex = 0;
      }

      if (endIndex > wordList.length - 1) {
        endIndex = wordList.length - 1;
      }

      adjacentWords = wordList.slice(startIndex, endIndex + 1);

    }

    return adjacentWords;
  }

export function getPronounPlacement(text: string = '', pronoun: string = '') {
    const wordList = getWordList(text);
    const pronounIndex = wordList.indexOf(pronoun);

    let position;

    switch (pronounIndex) {
      case 0:
        position = 'start';
        break;
      case wordList.length - 1:
        position = 'end';
        break;
      default:
        position = 'middle';
        break;
    }
    return position; 
  }

export function hasProfanity(text: string = '') {
  if (!text) return false;

  return profanityRegex.test(text);
}