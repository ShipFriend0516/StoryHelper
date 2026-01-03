export const debounce = (callback: () => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      callback();
    }, delay);
  };
};
