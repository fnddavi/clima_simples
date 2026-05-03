const API_KEY = "2d22cc07eb8e5fbdcba276f57ee9a1d8"; // Deixe vazio para usar modo demo

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
  // Se 'tz' for um número (como -10800 vindo do OpenWeatherMap real)
  if (typeof tz === "number") {
    // Somamos o deslocamento em segundos ao unix timestamp
    const dataLocal = new Date((unix + tz) * 1000);
    return dataLocal.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC" // Forçamos UTC porque já embutimos o fuso no cálculo acima
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

function renderWeather(d) {
  const tzName = d.timezone || undefined;
  const icon = WEATHER_CODES[d.weather[0].id] || "🌡";
  const sunrise = d.sys.sunrise;
  const sunset = d.sys.sunset;
  const now = Math.floor(Date.now() / 1000);
  const dayProgress =
    now < sunrise ? 0 : now > sunset ? 1 : (now - sunrise) / (sunset - sunrise);

  set("locName", `${d.name}, ${d.sys.country}`);
  set("tempVal", Math.round(d.main.temp));
  set("descVal", d.weather[0].description);
  set("feelsLike", `Sensação térmica: ${Math.round(d.main.feels_like)}°C`);
  document.getElementById("mainIcon").textContent = icon;

  set("humidity", `${d.main.humidity}%`);
  set("windSpeed", `${Math.round(d.wind.speed * 3.6)}km/h`);
  set("visibility", d.visibility ? `${(d.visibility / 1000).toFixed(0)}km` : "N/D");

  set("minMax", `${Math.round(d.main.temp_min)}° / ${Math.round(d.main.temp_max)}°`);
  set("cloudVal", `${d.clouds.all}%`);
  document.getElementById("cloudBar").style.width = `${d.clouds.all}%`;
  set("pressureVal", d.main.pressure);
  set("rainVal", d.rain && d.rain["1h"] ? d.rain["1h"].toFixed(1) : "0.0");

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


async function fetchWeather(lat, lon) {
  // Se a chave da API for nula, vazia ou indefinida, dispara o erro.
  if (!API_KEY || API_KEY.trim() === "") {
    showError("Erro de Configuração", "A chave da API (API_KEY) está vazia ou não foi configurada.", "🔑");
    return;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=pt_br`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 401) throw new Error("API key inválida");
      throw new Error(`Erro ${res.status}`);
    }
    renderWeather(await res.json());
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
