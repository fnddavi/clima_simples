# 🌤 Clima Agora

App mobile de clima minimalista, feito em HTML/CSS/JS puro — sem frameworks, sem dependências, zero build step.

![dark theme](https://img.shields.io/badge/tema-dark%20glassmorphism-0a0f1e?style=flat-square) ![zero deps](https://img.shields.io/badge/dependências-zero-4fc3f7?style=flat-square) ![single file](https://img.shields.io/badge/distribuição-2%20arquivos-b39ddb?style=flat-square)

---

## Funcionalidades

- **Localização automática** via Geolocation API do navegador
- **Dados em tempo real** via OpenWeatherMap (API gratuita)
- **Modo demo** automático quando nenhuma API key está configurada — padrão: São Paulo, BR
- Temperatura atual, sensação térmica, mín/máx do dia
- Umidade, velocidade do vento e visibilidade
- Cobertura de nuvens com barra de progresso animada
- Pressão atmosférica e precipitação da última hora
- Horários de nascer e pôr do sol com arco solar animado em SVG
- Tratamento de erros com mensagens específicas (permissão negada, timeout, API key inválida)
- Botão de atualização com animação de spin

## Visual

- Fundo escuro `#0a0f1e` com aurora animada em gradiente
- Cards com glassmorphism (backdrop-filter blur)
- Temperatura em tipografia display grande com gradiente
- Ícone do clima animado com float suave
- Fontes: IBM Plex Sans (display) + Public Sans (corpo)

---

## Estrutura

```
clima_simples/
├── clima.html   # Markup e estrutura da interface
├── clima.js     # Lógica, chamadas de API e renderização
└── clima.css    # Estilos, animações e variáveis de tema
```

---

## Como usar

### Modo demo (sem API key)

Abra `clima.html` diretamente no navegador. O app exibirá dados simulados de São Paulo automaticamente.

### Com dados reais

1. Crie uma conta gratuita em [openweathermap.org](https://openweathermap.org/api)
2. Gere uma API key (plano *Current Weather* é suficiente)
3. Edite `clima.html` e insira sua chave na linha:

```js
const API_KEY = ""; // substitua pelo seu token
```

4. Abra o arquivo no navegador e permita o acesso à localização quando solicitado

> **Nota:** A API key do OpenWeatherMap pode levar alguns minutos para ativar após o cadastro.

---

## Compatibilidade

Funciona em qualquer navegador moderno com suporte a:
- Geolocation API
- `backdrop-filter` (blur)
- CSS custom properties

Otimizado para mobile (viewport fixo, `safe-area-inset`, `100svh`). Funciona igualmente bem no desktop.

---

## Licença

MIT — use, modifique e distribua à vontade.
