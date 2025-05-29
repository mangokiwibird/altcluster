export function getRandomElements(list: any[], n: number): any[] {
  if (n > list.length) {
    throw new Error("n cannot be greater than the list length");
  }
  const shuffledList = [...list];
  for (let i = shuffledList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledList[i], shuffledList[j]] = [shuffledList[j], shuffledList[i]];
  }
  return shuffledList.slice(0, n);
}