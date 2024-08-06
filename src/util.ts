export const randomId = (): string => {
    return Math.floor(Math.random() * Date.now()).toString();
  };

  export const standardizeUsername = (username: string): string => {
    let newU = username.toLowerCase().trim();
    if (newU.startsWith('u/')) {
      newU = newU.replace(`u/`, ``);
    }
    return newU;
  };