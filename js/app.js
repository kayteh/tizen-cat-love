const clock = document.getElementById("clock");
const dateDay = document.getElementById("dateDay");
const dateMonth = document.getElementById("dateMonth");
const daysSinceCounter = document.getElementById("daysSince");

setInterval(() => {
  updateClock();
}, 500);

const updateClock = () => {
  const now = new Date();

  const hours = padNumber(now.getHours());
  const minutes = padNumber(now.getMinutes());
  const month = monthNames[now.getMonth()];
  const day = now.getDate();

  clock.innerHTML = `${hours}.${minutes}`;
  dateDay.innerHTML = String(day);
  dateMonth.innerHTML = month;

  updateDays(now);
};

const daysStart = 1594247400000; // start of cat time
const dayInterval = 84e6;
const updateDays = (now) => {
  const daysNow = now.getTime();
  const daysSince = (daysNow - daysStart) / dayInterval;

  daysSinceCounter.innerHTML = `${daysSince.toFixed(2)}`
    .slice(0, 5)
    .replace(/\.$/, "");
};

const padNumber = (input) => {
  let inputStr = String(input);

  if (inputStr.length === 1) {
    inputStr = `0${inputStr}`;
  }

  return inputStr;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
