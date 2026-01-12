

const API_KEY = '50f0cd521848490789b145354251108'; // provided key
const BASE_URL = 'https://api.weatherapi.com/v1/current.json';

const qInput = document.getElementById('cityInput');
const form = document.getElementById('searchForm');
const searchBtn = document.getElementById('searchBtn');
const weatherCard = document.getElementById('weatherCard');
const messageEl = document.getElementById('message');

const cityNameEl = document.getElementById('cityName');
const localTimeEl = document.getElementById('localTime');
const temperatureEl = document.getElementById('temperature');
const conditionEl = document.getElementById('condition');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const feelsEl = document.getElementById('feelslike');
const iconWrap = document.getElementById('iconWrap');

let debounceTimer = null;


function showMessage(text, isError = false) {
  messageEl.textContent = text;
  messageEl.style.color = isError ? '#ffe6e6' : '';
  messageEl.hidden = false;
  weatherCard.hidden = true;
}


function renderIcon(iconUrl, conditionText) {
 
  const secureUrl = iconUrl?.startsWith('//') ? 'https:' + iconUrl : iconUrl;
  if (!secureUrl) {
    iconWrap.innerHTML = '';
    return;
  }

  iconWrap.innerHTML = `<img src="${secureUrl}" alt="${conditionText} icon" width="84" height="84" decoding="async" />`;
}


function formatLocalTime(localTime) {
  try {
    const dt = new Date(localTime.replace(' ', 'T'));
    const opts = { weekday: 'short', hour: 'numeric', minute: '2-digit' };
    return dt.toLocaleString(undefined, opts);
  } catch (e) {
    return localTime;
  }
}

async function fetchWeather(city) {
  showMessage('Loading…');
  const url = `${BASE_URL}?key=${encodeURIComponent(API_KEY)}&q=${encodeURIComponent(city)}&aqi=yes`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400) {
        throw new Error('City not found. Try a different name.');
      } else {
        throw new Error('Network response error: ' + res.statusText);
      }
    }
    const payload = await res.json();

    
    if (!payload || !payload.location || !payload.current) {
      throw new Error('Unexpected response from weather service.');
    }

    cityNameEl.textContent = `${payload.location.name}, ${payload.location.country}`;
    localTimeEl.textContent = formatLocalTime(payload.location.localtime);
    temperatureEl.textContent = `${Math.round(payload.current.temp_c)}°C`;
    conditionEl.textContent = payload.current.condition.text;
    humidityEl.textContent = `${payload.current.humidity}%`;
    windEl.textContent = `${payload.current.wind_kph} km/h`;
    feelsEl.textContent = `${Math.round(payload.current.feelslike_c)}°C`;

    renderIcon(payload.current.condition.icon, payload.current.condition.text);

 
    weatherCard.hidden = false;
    messageEl.hidden = true;

    weatherCard.animate([{ opacity: 0.85 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' });

  } catch (err) {
    console.error(err);
    showMessage(err.message || 'Failed to fetch weather. Try again later.', true);
  }
}

function debounceFetch(city) {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchWeather(city);
  }, 250);
}


form.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = qInput.value.trim();
  if (!city) {
    showMessage('Please enter a city name.', true);
    qInput.focus();
    return;
  }
  fetchWeather(city);
});

window.addEventListener('load', () => {
  qInput.focus();

});

qInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    qInput.value = '';
  }
});
