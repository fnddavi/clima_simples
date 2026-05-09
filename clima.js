console.log("Clima app loaded");

const API_KEY = "e5681d06a9ea812ed966648cd8224afc";

const WEATHER_CODES = {
  200: "⛈", 201: "⛈", 202: "⛈",
  210: "🌩", 211: "🌩", 212: "🌩", 221: "🌩",
  230: "⛈", 231: "⛈", 232: "⛈",
  300: "🌦", 301: "🌦", 302: "🌧",
  310: "🌦", 311: "🌧", 312: "🌧", 313: "🌦", 314: "🌧", 321: "🌦",
  500: "🌧", 501: "🌧", 502: "🌧", 503: "🌧", 504: "🌧",
  511: "🌨", 520: "🌦", 521: "🌦", 522: "🌧", 531: "🌦",
  600: "🌨", 601: "❄️", 602: "❄️",
  611: "🌨", 612: "🌨", 613: "🌨", 615: "🌨", 616: "🌨",
  620: "🌨", 621: "❄️", 622: "❄️",
  701: "🌫", 711: "🌫", 721: "🌫", 731: "🌫",
  741: "🌫", 751: "🌫", 761: "🌫", 762: "🌋",
  771: "💨", 781: "🌪",
  800: "☀️", 801: "🌤", 802: "⛅️", 803: "🌥", 804: "☁️",
};

function show(id) {
  document.getElementById(id).classList.remove("hidden");
}

function hide(id) {
  document.getElementById(id).classList.add("hidden");
}

function set(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function fmtTime(unix, tz) {
  if (typeof tz === "number") {
    // Somamos o deslocamento em segundos ao unix timestamp
    const dataLocal = new Date((unix + tz) * 1000);
    return dataLocal.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC"
    });
  }

  // Se 'tz' for uma string (como "America/Sao_Paulo" do seu loadDemo) ou indefinido
  return new Date(unix * 1000).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz || undefined,
  });
}

function animateSunArc(progress) {
  const arc = document.getElementById("sunArcFill");
  const dot = document.getElementById("sunDot");
  const len = 200;
  arc.style.strokeDashoffset = len - len * Math.max(0, Math.min(1, progress));

  const t = Math.max(0, Math.min(1, progress));
  const x = 10 + t * 100;
  const y = 55 + -4 * t * (1 - t) * 240;
  dot.setAttribute("cx", x);
  dot.setAttribute("cy", Math.max(5, Math.min(58, y)));
}

function getLocalDateByOffset(unixSeconds, tzOffsetSeconds) {
  return new Date((unixSeconds + tzOffsetSeconds) * 1000).toISOString().slice(0, 10);
}

function extractDaySummaryFromForecast(forecastData, dayOffset = 0, currentData = null) {
  if (!forecastData || !forecastData.list || !forecastData.city) return null;

  const tzOffset = forecastData.city.timezone || 0;
  const nowUnix = Math.floor(Date.now() / 1000);
  const targetDate = getLocalDateByOffset(nowUnix + dayOffset * 86400, tzOffset);

  const dayItems = forecastData.list.filter((item) => {
    return getLocalDateByOffset(item.dt, tzOffset) === targetDate;
  });

  if (!dayItems.length && !currentData) return null;

  const tempsMin = dayItems.map((item) => item.main.temp_min);
  const tempsMax = dayItems.map((item) => item.main.temp_max);

  if (currentData && dayOffset === 0) {
    tempsMin.push(currentData.main.temp);
    tempsMax.push(currentData.main.temp);
  }

  if (!tempsMin.length || !tempsMax.length) return null;

  const firstWeather = dayItems[0]?.weather?.[0];
  return {
    tempMin: Math.min(...tempsMin),
    tempMax: Math.max(...tempsMax),
    description: firstWeather ? firstWeather.description : "—",
  };
}

function renderWeather(data, todaySummary = null) {
  const tzName = data.timezone || undefined;
  const icon = WEATHER_CODES[data.weather[0].id] || "🌡";
  const sunrise = data.sys.sunrise;
  const sunset = data.sys.sunset;
  const now = Math.floor(Date.now() / 1000);
  const dayProgress =
    now < sunrise ? 0 : now > sunset ? 1 : (now - sunrise) / (sunset - sunrise);

  set("locName", `${d.name}, ${d.sys.country}`);
  set("tempVal", `${Math.round(d.main.temp_max)}° / ${Math.round(d.main.temp_min)}°`);
  set("descVal", d.weather[0].description);
  set("feelsLike", `Sensação térmica: ${Math.round(d.main.feels_like)}°C`);
  document.getElementById("mainIcon").textContent = icon;

  set("humidity", `${data.main.humidity}%`);
  set("windSpeed", `${Math.round(data.wind.speed * 3.6)}km/h`);
  set("visibility", data.visibility ? `${(data.visibility / 1000).toFixed(0)}km` : "N/D");

  set("minMax", `${Math.round(dailyMin)}° / ${Math.round(dailyMax)}°`);
  set("cloudVal", `${data.clouds.all}%`);
  document.getElementById("cloudBar").style.width = `${data.clouds.all}%`;
  set("pressureVal", data.main.pressure);
  set("rainVal", data.rain && data.rain["1h"] ? data.rain["1h"].toFixed(1) : "0.0");

  set("sunriseTime", fmtTime(sunrise, tzName));
  set("sunsetTime", fmtTime(sunset, tzName));
  setTimeout(() => animateSunArc(dayProgress), 300);

  set(
    "updateTime",
    `Atualizado às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
  );

  hide("stateLoading");
  hide("stateError");
  show("weatherContent");
}

function showError(title, msg, icon = "⚠️") {
  set("errTitle", title);
  set("errMsg", msg);
  document.getElementById("errIcon").textContent = icon;
  hide("stateLoading");
  hide("weatherContent");
  show("stateError");
}

function extractTomorrowFromForecast(forecastData) {
  if (!forecastData || !forecastData.list || !forecastData.city) return null;
  const tzOffset = forecastData.city.timezone || 0;
  const nowLocal = new Date((Date.now() / 1000 + tzOffset) * 1000);
  const tomorrowLocal = new Date(nowLocal.getTime() + 86400000);
  const tomorrowDate = tomorrowLocal.toISOString().slice(0, 10);

  const tomorrowItems = forecastData.list.filter((item) => {
    const itemDate = new Date((item.dt + tzOffset) * 1000).toISOString().slice(0, 10);
    return itemDate === tomorrowDate;
  });

  if (!tomorrowItems.length) return null;

  const tempMin = Math.min(...tomorrowItems.map((item) => item.main.temp_min));
  const tempMax = Math.max(...tomorrowItems.map((item) => item.main.temp_max));
  const firstWeather = tomorrowItems[0].weather && tomorrowItems[0].weather[0];
  return {
    tempMin,
    tempMax,
    description: firstWeather ? firstWeather.description : "—",
  };
}

function renderTomorrowForecast(data) {
  if (!data) {
    set("tomorrowMinMax", "—");
    set("tomorrowDesc", "Dados indisponíveis");
    return;
  }

  set("tomorrowMinMax", `${Math.round(data.tempMin)}° / ${Math.round(data.tempMax)}°`);
  set("tomorrowDesc", data.description);
}

function createTomorrowPageData(currentData, forecastData) {
  if (!currentData || !forecastData || !forecastData.list || !forecastData.city) return null;

  const tzOffset = forecastData.city.timezone || 0;
  const nowLocal = new Date((Date.now() / 1000 + tzOffset) * 1000);
  const tomorrowDate = new Date(nowLocal.getTime() + 86400000).toISOString().slice(0, 10);

  const tomorrowItems = forecastData.list.filter((item) => {
    const itemDate = new Date((item.dt + tzOffset) * 1000).toISOString().slice(0, 10);
    return itemDate === tomorrowDate;
  });

  if (!tomorrowItems.length) return null;

  const tempMin = Math.min(...tomorrowItems.map((item) => item.main.temp_min));
  const tempMax = Math.max(...tomorrowItems.map((item) => item.main.temp_max));
  const representative = tomorrowItems[Math.floor(tomorrowItems.length / 2)] || tomorrowItems[0];
  const weather = representative.weather || [{ id: 800, description: "—" }];

  return {
    timezone: forecastData.city.timezone,
    weather,
    main: {
      feels_like: representative.main.feels_like,
      temp_min: tempMin,
      temp_max: tempMax,
      humidity: representative.main.humidity,
    },
    wind: { speed: representative.wind.speed },
    visibility: representative.visibility,
  };
}

function renderTomorrowCard(data) {
  if (!data) {
    hide("tomorrowCard");
    return;
  }

  const icon = WEATHER_CODES[data.weather[0].id] || "🌡";

  set("tomorrowTempVal", `${Math.round(data.main.temp_max)}° / ${Math.round(data.main.temp_min)}°`);
  set("tomorrowDescVal", data.weather[0].description);
  set("tomorrowFeelsLike", `Sensação térmica: ${Math.round(data.main.feels_like)}°C`);
  document.getElementById("tomorrowMainIcon").textContent = icon;

  set("tomorrowHumidity", `${data.main.humidity}%`);
  set("tomorrowWindSpeed", `${Math.round(data.wind.speed * 3.6)}km/h`);
  set("tomorrowVisibility", data.visibility ? `${(data.visibility / 1000).toFixed(0)}km` : "N/D");

  show("tomorrowCard");
}

async function fetchWeather(lat, lon) {
  if (!API_KEY || API_KEY.trim() === "") {
    showError("Erro de Configuração", "A chave da API (API_KEY) está vazia ou não foi configurada.", "🔑");
    return;
  }

  try {
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;

    const [currentRes, forecastRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)]);

    if (!currentRes.ok || !forecastRes.ok) {
      if (currentRes.status === 401 || forecastRes.status === 401) throw new Error("API key inválida");
      const status = !currentRes.ok ? currentRes.status : forecastRes.status;
      throw new Error(`Erro ${status}`);
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();
    const todaySummary = extractDaySummaryFromForecast(forecastData, 0, currentData);
    const tomorrowSummary = extractDaySummaryFromForecast(forecastData, 1);

    currentWeatherData = currentData;
    tomorrowPageData = createTomorrowPageData(currentData, forecastData);

    renderWeather(currentData);
    renderTomorrowForecast(extractTomorrowFromForecast(forecastData));
    renderTomorrowCard(tomorrowPageData);
  } catch (e) {
    showError("Erro na API", e.message || "Não foi possível obter dados climáticos.", "🌐");
  }
}

function loadWeather() {
  hide("weatherContent");
  hide("stateError");
  show("stateLoading");

  const btn = document.getElementById("btnRefresh");
  btn.classList.add("spinning");
  setTimeout(() => btn.classList.remove("spinning"), 700);

  if (!navigator.geolocation) {
    showError("Sem geolocalização", "Seu navegador não suporta geolocalização.", "📍");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
    (err) => {
      const msgs = {
        1: ["Permissão negada", "Permita o acesso à localização nas configurações do navegador para ver o clima da sua cidade.", "🔒"],
        2: ["Localização indisponível", "Não foi possível determinar sua posição atual.", "📡"],
        3: ["Tempo esgotado", "A solicitação de localização demorou demais.", "⏱"],
      };
      const [t, m, i] = msgs[err.code] || ["Erro", "Erro desconhecido.", "⚠️"];
      showError(t, m, i);
    },
    { timeout: 10000, maximumAge: 60000 },
  );
}

loadWeather();