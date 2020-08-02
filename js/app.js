const clock = document.getElementById("clock");
const dateDay = document.getElementById("dateDay");
const dateMonth = document.getElementById("dateMonth");
const daysSinceCounter = document.getElementById("daysSince");
const statsHR = document.getElementById("statsHR");
const statsSteps = document.getElementById("statsSteps");
const statsCals = document.getElementById("statsCals");
const statsTemp = document.getElementById("statsTemp");

let currentDate = new Date().getDate();
let lastWeatherUpdate = new Date("0").getTime();
const weatherUpdateInterval = 1000 * 60 * 15; // 15 minutes
let isAmbient = false;

const onAmbientChange = (ambientEvent) => {
  const { ambientMode } = ambientEvent.detail;
  isAmbient = ambientMode;
  updateAmbientView(isAmbient);
  updateClock(isAmbient);
};

const updateClock = (ambient) => {
  const now = new Date();

  const hours = padNumber(now.getHours());
  const minutes = padNumber(now.getMinutes());

  clock.innerHTML = `${hours}.${minutes}`;

  if (ambient) {
    return;
  }

  const month = monthNames[now.getMonth()];
  const day = now.getDate();
  dateDay.innerHTML = String(day);
  dateMonth.innerHTML = month;

  updateDays(now);
};

const updateAmbientView = (ambient) => {
  if (ambient) {
    document.body.classList.add("ambient-mode");
  } else {
    document.body.classList.remove("ambient-mode");
  }
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

const updateStats = () => {
  if (!tizen) {
    return;
  }

  try {
    updateHR();
  } catch (e) {
    tizen.ppm.requestPermission("http://tizen.org/privilege/healthinfo", () => {
      updateStats();
    });
  }

  updateWeather();
};

const updateHR = () => {
  tizen.humanactivitymonitor.getHumanActivityData("HRM", (hrmData) => {
    const hr = hrmData.heartRate;
    if (hr > 0) {
      statsHR.innerHTML = String(hr);
      localStorage.setItem("cafe.kat.lastKnownBPM", String(hr));
    } else {
      statsHR.innerHTML =
        localStorage.getItem("cafe.kat.lastKnownBPM") || "Unknown";
    }
  });
};

const onStepChange = (stepData) => {
  cleanupStepData(stepData);

  const stepOffset = Number(localStorage.getItem("cafe.kat.stepOffset")) || 0;

  if (stepOffset === 0) {
    localStorage.setItem(
      "cafe.kat.stepOffset",
      stepData.accumulativeTotalStepCount
    );

    return;
  }

  const currentSteps = stepData.accumulativeTotalStepCount;
  statsSteps.innerHTML = currentSteps - stepOffset;

  const calorieOffset =
    Number(localStorage.getItem("cafe.kat.calorieOffset")) || 0;

  if (calorieOffset === 0) {
    localStorage.setItem(
      "cafe.kat.calorieOffset",
      Math.floor(stepData.accumulativeCalorie)
    );

    return;
  }

  const currentCals = Math.floor(stepData.accumulativeCalorie);
  statsCals.innerHTML = currentCals - calorieOffset;
};

const updateWeather = (force = false) => {
  if (!force) {
    if (Date.now() - lastWeatherUpdate < weatherUpdateInterval) {
      // statsTemp.innerHTML = "E4";
      return;
    }
  }

  lastWeatherUpdate = Date.now();

  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      const request = new XMLHttpRequest();
      request.open(
        "GET",
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${window.__CONFIG__.openWeatherMapAppID}&units=imperial`
      );
      request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
          try {
            const data = JSON.parse(request.responseText);
            statsTemp.innerHTML = Math.round(data.main.temp);
          } catch (e) {
            statsTemp.innerHTML = "E1";
          }
        }
      };
      request.send();
    },
    () => {
      statsTemp.innerHTML = "E2";
    }
  );
};

const cleanupStepData = (stepData) => {
  const nextDate = new Date().getDate(); // now technically, but not the before.

  // when the date changes, update step counts
  if (nextDate != currentDate) {
    localStorage.setItem(
      "cafe.kat.calorieOffset",
      Math.floor(stepData.accumulativeCalorie)
    );
    localStorage.setItem(
      "cafe.kat.stepOffset",
      stepData.accumulativeTotalStepCount
    );
  }
};

const bootstrapSteps = () => {
  const storedCals = Number(localStorage.getItem("cafe.kat.calorieOffset"));
  const storedSteps = Number(localStorage.getItem("cafe.kat.stepOffset"));
  if (storedCals && storedSteps) {
    onStepChange({
      accumulativeCalorie: storedCals,
      accumulativeTotalStepCount: storedSteps,
    });
  }
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

document.addEventListener("ambientmodechanged", onAmbientChange);

updateClock(isAmbient);
setTimeout(() => updateClock(isAmbient), 500);
document.addEventListener("timetick", () => {
  updateClock(isAmbient);
});

// tizen.humanactivitymonitor.start("PEDOMETER");
tizen.humanactivitymonitor.start("HRM");
setInterval(() => updateStats(), 1000);

tizen.humanactivitymonitor.setAccumulativePedometerListener(onStepChange);
bootstrapSteps();
updateWeather(true);
