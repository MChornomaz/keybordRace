function isEnglishText(text: string) {
  const englishLettersRegex = /[a-zA-Z]/;

  return englishLettersRegex.test(text);
}

export function getRandomEnglishText(textsArray: string[]) {
  const randomIndex = Math.floor(Math.random() * textsArray.length);
  const randomText = textsArray[randomIndex];

  if (isEnglishText(randomText)) {
    return randomText;
  } else {
    return getRandomEnglishText(textsArray);
  }
}