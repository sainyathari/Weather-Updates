const apiKey = "4cd90ff8b62b090408127330d021d566"
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city');
const weatherResult = document.getElementById('weather-result');
const forecastSection = document.getElementById('forecast');
const forecastCards = document.getElementById('forecast-cards');
const errorMsg = document.getElementById('error-message');
const toggleDarkBtn = document.getElementById('toggle-dark');
const getLocationBtn = document.getElementById('get-location');

toggleDarkBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

weatherForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    getWeatherByCity(city);
  }
});

getLocationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      error => {
        errorMsg.textContent = 'Unable to retrieve your location.';
      }
    );
  } else {
    errorMsg.textContent = 'Geolocation is not supported by your browser.';
  }
});

async function getWeatherByCity(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    if (!res.ok) throw new Error("City not found");
    const data = await res.json();
    displayCurrentWeather(data);
    getForecast(data.coord.lat, data.coord.lon);
  } catch (err) {
    weatherResult.classList.add('hidden');
    forecastSection.classList.add('hidden');
    errorMsg.textContent = err.message;
  }
}

async function getWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    if (!res.ok) throw new Error("Location not found");
    const data = await res.json();
    displayCurrentWeather(data);
    getForecast(lat, lon);
  } catch (err) {
    weatherResult.classList.add('hidden');
    forecastSection.classList.add('hidden');
    errorMsg.textContent = err.message;
  }
}

function displayCurrentWeather(data) {
  document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById('icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById('desc').textContent = `Weather: ${data.weather[0].description}`;
  document.getElementById('temp').textContent = `Temperature: ${data.main.temp}°C`;
  document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;
  document.getElementById('wind').textContent = `Wind Speed: ${data.wind.speed} m/s`;

  weatherResult.classList.remove('hidden');
  errorMsg.textContent = '';
    forecastSection.classList.add('hidden');
// 👇 Scroll smoothly to the results
weatherResult.scrollIntoView({ behavior: 'smooth' });

}

async function getForecast(lat, lon) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    if (!res.ok) throw new Error("Forecast data not available");
    const data = await res.json();
    displayForecast(data);
  } catch (err) {
    forecastSection.classList.add('hidden');
    errorMsg.textContent = err.message;
  }
}

function displayForecast(data) {
  forecastCards.innerHTML = '';
  const forecastMap = new Map();

  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!forecastMap.has(date)) {
      forecastMap.set(date, item);
    }
  });

  let count = 0;
  for (let [date, item] of forecastMap) {
    if (count >= 5) break;
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <h4>${new Date(date).toDateString()}</h4>
      <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="${item.weather[0].description}" />
      <p>${item.main.temp}°C</p>
      <p>${item.weather[0].description}</p>
    `;
    forecastCards.appendChild(card);
    count++;
  }

  forecastSection.classList.remove('hidden');
}
weatherResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
