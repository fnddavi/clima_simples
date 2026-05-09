/**
 * Testes para clima.js
 * Cobre todas as funções do aplicativo de clima
 */

// Variáveis globais do clima.js
global.currentWeatherData = null;
global.tomorrowPageData = null;

// Mock do DOM
const mockDOM = {};

function setupDOM() {
  // Limpar DOM anterior
  document.body.innerHTML = '';
  
  // Criar elementos necessários
  const elements = [
    'locName', 'tempVal', 'descVal', 'feelsLike', 'mainIcon',
    'humidity', 'windSpeed', 'visibility', 'minMax', 'cloudVal',
    'cloudBar', 'pressureVal', 'rainVal', 'sunriseTime', 'sunsetTime',
    'updateTime', 'errTitle', 'errMsg', 'errIcon',
    'tomorrowMinMax', 'tomorrowDesc', 'tomorrowTempVal', 'tomorrowDescVal',
    'tomorrowFeelsLike', 'tomorrowMainIcon', 'tomorrowHumidity',
    'tomorrowWindSpeed', 'tomorrowVisibility', 'tomorrowCard',
    'stateLoading', 'stateError', 'weatherContent', 'sunArcFill',
    'sunDot', 'btnRefresh'
  ];

  elements.forEach(id => {
    const el = document.createElement('div');
    el.id = id;
    if (id === 'sunArcFill') {
      el.style.strokeDashoffset = '0';
    }
    if (id === 'sunDot') {
      el.setAttribute('cx', '0');
      el.setAttribute('cy', '0');
    }
    if (id === 'btnRefresh') {
      el.classList.add('no-spin');
    }
    document.body.appendChild(el);
  });
}

// Importar as funções do clima.js APÓS setup do DOM
const {
  show,
  hide,
  set,
  fmtTime,
  animateSunArc,
  getLocalDateByOffset,
  extractDaySummaryFromForecast,
  extractTomorrowFromForecast,
  renderWeather,
  showError,
  renderTomorrowForecast,
  createTomorrowPageData,
  renderTomorrowCard,
  WEATHER_CODES
} = require('./clima.js');

// ===== Testes das funções utilitárias =====

describe('Funções utilitárias de DOM', () => {
  beforeEach(() => setupDOM());

  describe('show(id)', () => {
    test('deve remover a classe hidden', () => {
      const el = document.getElementById('locName');
      el.classList.add('hidden');
      expect(el.classList.contains('hidden')).toBe(true);
      
      show('locName');
      expect(el.classList.contains('hidden')).toBe(false);
    });

    test('não deve remover outras classes', () => {
      const el = document.getElementById('locName');
      el.classList.add('hidden', 'custom-class');
      show('locName');
      expect(el.classList.contains('custom-class')).toBe(true);
    });
  });

  describe('hide(id)', () => {
    test('deve adicionar a classe hidden', () => {
      const el = document.getElementById('locName');
      expect(el.classList.contains('hidden')).toBe(false);
      
      hide('locName');
      expect(el.classList.contains('hidden')).toBe(true);
    });

    test('não deve adicionar a classe duas vezes', () => {
      hide('locName');
      hide('locName');
      const el = document.getElementById('locName');
      expect(el.classList.contains('hidden')).toBe(true);
    });
  });

  describe('set(id, val)', () => {
    test('deve setar textContent do elemento', () => {
      set('locName', 'São Paulo, BR');
      expect(document.getElementById('locName').textContent).toBe('São Paulo, BR');
    });

    test('deve funcionar com números', () => {
      set('tempVal', '25');
      expect(document.getElementById('tempVal').textContent).toBe('25');
    });

    test('deve funcionar com string vazia', () => {
      set('tempVal', '');
      expect(document.getElementById('tempVal').textContent).toBe('');
    });

    test('deve fazer nada se elemento não existir', () => {
      expect(() => set('elemento-inexistente', 'valor')).not.toThrow();
    });
  });
});

// ===== Testes de formatação de tempo =====

describe('fmtTime(unix, tz)', () => {
  test('deve formatar timestamp com timezone offset numérico', () => {
    const unix = 1609459200; // 2021-01-01 00:00:00 UTC
    const tzOffset = 0;
    const result = fmtTime(unix, tzOffset);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  test('deve formatar timestamp com string de timezone', () => {
    const unix = 1609459200;
    const result = fmtTime(unix, 'UTC');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  test('deve formatar timestamp sem timezone', () => {
    const unix = 1609459200;
    const result = fmtTime(unix);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  test('deve retornar em formato português', () => {
    const unix = 1609459200;
    const result = fmtTime(unix, 'UTC');
    // Deve estar em formato HH:MM
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});

// ===== Testes de animação =====

describe('animateSunArc(progress)', () => {
  beforeEach(() => setupDOM());

  test('deve atualizar strokeDashoffset do arco', () => {
    const arc = document.getElementById('sunArcFill');
    animateSunArc(0.5);
    expect(arc.style.strokeDashoffset).toBe('100');
  });

  test('deve limitar progress entre 0 e 1', () => {
    const arc = document.getElementById('sunArcFill');
    animateSunArc(2);
    expect(Number(arc.style.strokeDashoffset)).toBeLessThanOrEqual(200);
  });

  test('deve atualizar posição do ponto do sol', () => {
    const dot = document.getElementById('sunDot');
    animateSunArc(0.5);
    expect(dot.getAttribute('cx')).toBe('60');
  });

  test('deve limitar cy do ponto entre 5 e 58', () => {
    const dot = document.getElementById('sunDot');
    animateSunArc(0);
    const cy = Number(dot.getAttribute('cy'));
    expect(cy).toBeGreaterThanOrEqual(5);
    expect(cy).toBeLessThanOrEqual(58);
  });

  test('deve colocar ponto no topo em progress 0', () => {
    const dot = document.getElementById('sunDot');
    animateSunArc(0);
    expect(Number(dot.getAttribute('cx'))).toBe(10);
  });
});

// ===== Testes de data com offset =====

describe('getLocalDateByOffset(unixSeconds, tzOffsetSeconds)', () => {
  test('deve retornar string de data ISO', () => {
    const unix = 1609459200; // 2021-01-01
    const result = getLocalDateByOffset(unix, 0);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('deve aplicar offset de timezone', () => {
    const unix = 1609459200; // 2021-01-01 00:00:00 UTC
    const tzOffset = 3600; // +1 hora
    const result = getLocalDateByOffset(unix, tzOffset);
    expect(result).toBe('2021-01-01');
  });

  test('deve funcionar com offset negativo', () => {
    const unix = 1609459200;
    const tzOffset = -3600; // -1 hora
    const result = getLocalDateByOffset(unix, tzOffset);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ===== Testes de extração de dados de previsão =====

describe('extractDaySummaryFromForecast', () => {
  const mockForecast = {
    city: { timezone: 0 },
    list: [
      {
        dt: 1609459200,
        main: { temp_min: 20, temp_max: 25 },
        weather: [{ description: 'Céu limpo' }]
      },
      {
        dt: 1609545600,
        main: { temp_min: 18, temp_max: 28 },
        weather: [{ description: 'Nuvens' }]
      }
    ]
  };

  test('deve retornar null se forecastData é null', () => {
    const result = extractDaySummaryFromForecast(null);
    expect(result).toBeNull();
  });

  test('deve retornar null se list é vazio', () => {
    const result = extractDaySummaryFromForecast({ city: {}, list: [] });
    expect(result).toBeNull();
  });

  test('deve extrair dados do dia atual', () => {
    const today = Math.floor(Date.now() / 1000);
    const forecast = {
      city: { timezone: 0 },
      list: [
        {
          dt: today,
          main: { temp_min: 15, temp_max: 30 },
          weather: [{ description: 'Ensolarado' }]
        }
      ]
    };
    
    const result = extractDaySummaryFromForecast(forecast, 0);
    expect(result).not.toBeNull();
    expect(result.tempMin).toBe(15);
    expect(result.tempMax).toBe(30);
    expect(result.description).toBe('Ensolarado');
  });

  test('deve mesclar com dados atuais do dia 0', () => {
    const today = Math.floor(Date.now() / 1000);
    const forecast = {
      city: { timezone: 0 },
      list: [{ dt: today, main: { temp_min: 15, temp_max: 25 }, weather: [{}] }]
    };
    const current = { main: { temp: 22 } };
    
    const result = extractDaySummaryFromForecast(forecast, 0, current);
    expect(result.tempMin).toBeLessThanOrEqual(22);
    expect(result.tempMax).toBeGreaterThanOrEqual(22);
  });
});

// ===== Testes de extração de previsão de amanhã =====

describe('extractTomorrowFromForecast', () => {
  test('deve retornar null se forecastData é null', () => {
    const result = extractTomorrowFromForecast(null);
    expect(result).toBeNull();
  });

  test('deve extrair dados de amanhã', () => {
    const tomorrow = Math.floor(Date.now() / 1000) + 86400;
    const forecast = {
      city: { timezone: 0 },
      list: [
        {
          dt: tomorrow,
          main: { temp_min: 18, temp_max: 26 },
          weather: [{ description: 'Parcialmente nublado' }]
        }
      ]
    };

    const result = extractTomorrowFromForecast(forecast);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.tempMin).toBe(18);
      expect(result.tempMax).toBe(26);
      expect(result.description).toBe('Parcialmente nublado');
    }
  });

  test('deve retornar null se não houver dados de amanhã', () => {
    const forecast = {
      city: { timezone: 0 },
      list: []
    };

    const result = extractTomorrowFromForecast(forecast);
    expect(result).toBeNull();
  });
});

// ===== Testes de renderização =====

describe('renderWeather', () => {
  beforeEach(() => setupDOM());

  const mockWeather = {
    name: 'São Paulo',
    sys: { country: 'BR', sunrise: 1609416000, sunset: 1609456800 },
    weather: [{ id: 800, description: 'Céu limpo' }],
    main: {
      temp_min: 18,
      temp_max: 28,
      feels_like: 27,
      humidity: 60
    },
    wind: { speed: 5 },
    visibility: 10000,
    clouds: { all: 10 },
    rain: { '1h': 0 }
  };

  test('deve setar nome da localização', () => {
    renderWeather(mockWeather);
    expect(document.getElementById('locName').textContent).toBe('São Paulo, BR');
  });

  test('deve setar temperatura', () => {
    renderWeather(mockWeather);
    expect(document.getElementById('tempVal').textContent).toContain('28');
    expect(document.getElementById('tempVal').textContent).toContain('18');
  });

  test('deve setar descrição do clima', () => {
    renderWeather(mockWeather);
    expect(document.getElementById('descVal').textContent).toBe('Céu limpo');
  });

  test('deve setar sensação térmica', () => {
    renderWeather(mockWeather);
    expect(document.getElementById('feelsLike').textContent).toContain('27');
  });

  test('deve setar umidade', () => {
    renderWeather(mockWeather);
    expect(document.getElementById('humidity').textContent).toBe('60%');
  });

  test('deve converter velocidade do vento para km/h', () => {
    renderWeather(mockWeather);
    expect(document.getElementById('windSpeed').textContent).toContain('18');
  });

  test('deve setar visibilidade', () => {
    renderWeather(mockWeather);
    expect(document.getElementById('visibility').textContent).toContain('10');
  });

  test('deve mostrar conteúdo e esconder erro/loading', () => {
    renderWeather(mockWeather);
    expect(document.getElementById('weatherContent').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('stateError').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('stateLoading').classList.contains('hidden')).toBe(true);
  });
});

describe('showError', () => {
  beforeEach(() => setupDOM());

  test('deve setar título do erro', () => {
    showError('Erro de Teste', 'Mensagem de teste');
    expect(document.getElementById('errTitle').textContent).toBe('Erro de Teste');
  });

  test('deve setar mensagem do erro', () => {
    showError('Título', 'Mensagem de teste');
    expect(document.getElementById('errMsg').textContent).toBe('Mensagem de teste');
  });

  test('deve setar ícone padrão', () => {
    showError('Erro', 'Msg');
    expect(document.getElementById('errIcon').textContent).toBe('⚠️');
  });

  test('deve setar ícone customizado', () => {
    showError('Erro', 'Msg', '🔑');
    expect(document.getElementById('errIcon').textContent).toBe('🔑');
  });

  test('deve esconder conteúdo e loading', () => {
    showError('Erro', 'Msg');
    expect(document.getElementById('weatherContent').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('stateLoading').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('stateError').classList.contains('hidden')).toBe(false);
  });
});

describe('renderTomorrowForecast', () => {
  beforeEach(() => setupDOM());

  test('deve setar temperatura quando dados existem', () => {
    const data = { tempMin: 16, tempMax: 24, description: 'Nublado' };
    renderTomorrowForecast(data);
    expect(document.getElementById('tomorrowMinMax').textContent).toContain('16');
    expect(document.getElementById('tomorrowMinMax').textContent).toContain('24');
  });

  test('deve setar descrição quando dados existem', () => {
    const data = { tempMin: 16, tempMax: 24, description: 'Nublado' };
    renderTomorrowForecast(data);
    expect(document.getElementById('tomorrowDesc').textContent).toBe('Nublado');
  });

  test('deve mostrar "—" quando dados são null', () => {
    renderTomorrowForecast(null);
    expect(document.getElementById('tomorrowMinMax').textContent).toBe('—');
    expect(document.getElementById('tomorrowDesc').textContent).toMatch(/indispon/);
  });
});

describe('createTomorrowPageData', () => {
  test('deve retornar null se currentData é null', () => {
    const result = createTomorrowPageData(null, {});
    expect(result).toBeNull();
  });

  test('deve retornar null se forecastData é null', () => {
    const result = createTomorrowPageData({}, null);
    expect(result).toBeNull();
  });

  test('deve criar dados para página de amanhã', () => {
    const tomorrow = Math.floor(Date.now() / 1000) + 86400;
    const current = {
      main: { temp: 25 },
      weather: [{ id: 800 }]
    };
    const forecast = {
      city: { timezone: 0 },
      list: [
        {
          dt: tomorrow,
          main: { temp_min: 18, temp_max: 26, humidity: 65, feels_like: 24 },
          wind: { speed: 4 },
          visibility: 12000,
          weather: [{ id: 802, description: 'Nublado' }]
        }
      ]
    };

    const result = createTomorrowPageData(current, forecast);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.main.temp_min).toBe(18);
      expect(result.main.temp_max).toBe(26);
      expect(result.main.humidity).toBe(65);
    }
  });
});

describe('renderTomorrowCard', () => {
  beforeEach(() => setupDOM());

  const mockData = {
    timezone: 'UTC',
    weather: [{ id: 802, description: 'Nublado' }],
    main: {
      temp_min: 18,
      temp_max: 26,
      humidity: 65,
      feels_like: 24
    },
    wind: { speed: 4 },
    visibility: 12000
  };

  test('deve mostrar card quando dados existem', () => {
    renderTomorrowCard(mockData);
    expect(document.getElementById('tomorrowCard').classList.contains('hidden')).toBe(false);
  });

  test('deve esconder card quando dados são null', () => {
    renderTomorrowCard(null);
    expect(document.getElementById('tomorrowCard').classList.contains('hidden')).toBe(true);
  });

  test('deve setar temperatura do card', () => {
    renderTomorrowCard(mockData);
    expect(document.getElementById('tomorrowTempVal').textContent).toContain('26');
  });

  test('deve setar descrição do card', () => {
    renderTomorrowCard(mockData);
    expect(document.getElementById('tomorrowDescVal').textContent).toBe('Nublado');
  });

  test('deve setar umidade do card', () => {
    renderTomorrowCard(mockData);
    expect(document.getElementById('tomorrowHumidity').textContent).toBe('65%');
  });

  test('deve converter velocidade do vento', () => {
    renderTomorrowCard(mockData);
    expect(document.getElementById('tomorrowWindSpeed').textContent).toContain('14');
  });
});

// ===== Testes de mapeamento de ícones =====

describe('WEATHER_CODES', () => {
  test('deve ter código para tempestade', () => {
    expect(WEATHER_CODES[200]).toBe('⛈');
  });

  test('deve ter código para céu limpo', () => {
    expect(WEATHER_CODES[800]).toBe('☀️');
  });

  test('deve ter código para neve', () => {
    expect(WEATHER_CODES[601]).toBe('❄️');
  });

  test('deve ter vários códigos de chuva', () => {
    expect(WEATHER_CODES[500]).toBe('🌧');
    expect(WEATHER_CODES[502]).toBe('🌧');
  });
});

// ===== Testes de integração =====

describe('Testes de integração', () => {
  beforeEach(() => setupDOM());

  test('fluxo completo: dados do clima → renderização', () => {
    const weather = {
      name: 'Rio de Janeiro',
      sys: { country: 'BR', sunrise: 1609416000, sunset: 1609456800 },
      weather: [{ id: 500, description: 'Chuva leve' }],
      main: { temp_min: 22, temp_max: 28, feels_like: 27, humidity: 70 },
      wind: { speed: 3 },
      visibility: 8000,
      clouds: { all: 40 },
      rain: { '1h': 2.5 }
    };

    renderWeather(weather);

    expect(document.getElementById('locName').textContent).toBe('Rio de Janeiro, BR');
    expect(document.getElementById('humidity').textContent).toBe('70%');
    expect(document.getElementById('rainVal').textContent).toBe('2.5');
  });

  test('fluxo de erro completo', () => {
    showError('Falha na Conexão', 'Impossível conectar à API', '🌐');
    
    expect(document.getElementById('errTitle').textContent).toBe('Falha na Conexão');
    expect(document.getElementById('errMsg').textContent).toContain('API');
    expect(document.getElementById('stateError').classList.contains('hidden')).toBe(false);
  });
});
