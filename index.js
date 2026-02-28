const wInput = document.getElementById('WeatherInput');
const wBtn = document.getElementById('weather-btn');
const wResult = document.getElementById('resultContainer');
const toggleUnitBtn = document.getElementById('toggleUnit');
const unitsContainer = document.getElementById('units');

const tempPreview = document.getElementById('tempPreview');
const condPreview = document.getElementById('condPreview');
const metaPreview = document.getElementById('metaPreview');
const forecastRow = document.getElementById('forecastRow');

let currentUnit = 'metric';
let lastSearchedCity = "";

// initialize unit display
if (unitsContainer) unitsContainer.textContent = currentUnit === 'metric' ? 'Current Unit: °C' : 'Current Unit: °F';
if (toggleUnitBtn) toggleUnitBtn.textContent = currentUnit === 'metric' ? 'Switch to °F' : 'Switch to °C';

// click handler (keeps input value so user can re-run)
if (wBtn) {
  wBtn.addEventListener('click', () => {
    const city = wInput.value.trim();
    if (!city) return;
    lastSearchedCity = city;
    handleWeather(city);
  });
}

if (toggleUnitBtn) {
  toggleUnitBtn.addEventListener('click', () => {
    if (currentUnit === 'metric') {
      currentUnit = 'imperial';
      unitsContainer.textContent = 'Current Unit: °F';
      toggleUnitBtn.textContent = 'Switch to °C';
    } else {
      currentUnit = 'metric';
      unitsContainer.textContent = 'Current Unit: °C';
      toggleUnitBtn.textContent = 'Switch to °F';
    }
    // refresh last search using new units
    if (lastSearchedCity) handleWeather(lastSearchedCity);
  });
}

if (wInput) {
  wInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter'){
      if (wBtn) wBtn.click();
    }
  });
}

async function handleWeather(city) {
  if (!city) {
    if (wResult) wResult.innerHTML = `<p>Please enter a city name.</p>`;
    resetPreview();
    return;
  }
  await fetchWeather(city);
}

function resetPreview(){
  if (tempPreview) tempPreview.textContent = '--°';
  if (condPreview) condPreview.textContent = '--';
  if (metaPreview) metaPreview.textContent = '--';
  if (forecastRow) forecastRow.style.opacity = '0.28';
}

async function fetchWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=290a443028ca2051984b12dd7e1fb2f9&units=${currentUnit}`;
    if (wResult) wResult.innerHTML = `<p>Loading...</p>`;

    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weather data');
    }

    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    const speedUnit = currentUnit === 'metric' ? 'm/s' : 'mph';

    // populate card preview
    if (tempPreview) tempPreview.textContent = `${Math.round(data.main.temp)}${unitSymbol}`;
    if (condPreview) condPreview.textContent = `${data.weather[0].description}`;
    if (metaPreview) metaPreview.textContent = `Feels like ${Math.round(data.main.feels_like)}${unitSymbol} · Hum ${data.main.humidity}% · Wind ${Math.round(data.wind.speed)} ${speedUnit}`;
    if (forecastRow) forecastRow.style.opacity = '1';

    // put extended details in the result container
    if (wResult) wResult.innerHTML = `
      <div class="detail">
        <p style="margin:0.18rem 0">Location: <strong>${data.name}, ${data.sys.country}</strong></p>
        <p style="margin:0.18rem 0">Pressure: ${data.main.pressure} hPa</p>
        <p style="margin:0.18rem 0">Visibility: ${data.visibility} m</p>
      </div>
    `;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    if (wResult) wResult.innerHTML = `<p>Error: ${error.message}</p>`;
    resetPreview();
  }
}

// initial state
resetPreview();
