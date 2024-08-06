export const randomId = (): string => {
    return Math.floor(Math.random() * Date.now()).toString();
  };