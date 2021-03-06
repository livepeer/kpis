export const abbreviateNumber = (value, precision = 3) => {
  let newValue = value;
  const suffixes = ["", "K", "M", "B", "T"];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum++;
  }
  newValue = parseFloat(Number.parseFloat(newValue).toPrecision(precision));
  newValue += suffixes[suffixNum];
  return newValue;
};
