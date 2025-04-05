export const randomId = (): string => {
  return Math.floor(Math.random() * Date.now()).toString();
};

export const standardizeUsername = (username: string): string => {
  let newU = username.toLowerCase().trim();
  if (newU.startsWith("u/")) {
    newU = newU.replace(`u/`, ``);
  }
  return newU;
};

export const deepClone = <T>(object: T): T =>
  JSON.parse(JSON.stringify(object));

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    while (Date.now() - startTime < ms) {
      // do nothing
    }
    resolve();
  });
}
