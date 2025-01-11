export const getPercentage = (currentTime: number, duration: number) => {
  let result = (currentTime / duration) * 100;
  return result;
};

export const getSeconds = (value: number) => {
  return (
    Math.floor(value / 60) + ":" + ("0" + Math.floor(value % 60)).slice(-2)
  );
};

export const getRandomNumber = (limit: number) => {
  return Math.floor(Math.random() * limit);
};
