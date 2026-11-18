# 🌤 [Clima Agora](https://clima-simples.netlify.app/)

Aplicação de clima responsiva, feita com HTML, CSS e JavaScript puro. Não usa frameworks, dependências de pacote nem etapa de build.

![tema dark glassmorphism](https://img.shields.io/badge/tema-dark%20glassmorphism-0a0f1e?style=flat-square) ![sem dependências de pacote](https://img.shields.io/badge/dependências-de%20pacote%20zero-4fc3f7?style=flat-square) ![HTML, CSS e JS](https://img.shields.io/badge/HTML-CSS%20%2B%20JS-b39ddb?style=flat-square)

## Funcionalidades

- Localização automática pela Geolocation API do navegador
- Condições atuais e previsão para hoje e amanhã pela API do OpenWeatherMap
- Nome detalhado da localização obtido pelo serviço de geocodificação reversa do OpenStreetMap (Nominatim)
- Temperatura, sensação térmica, mínima e máxima, umidade, vento e visibilidade
- Cobertura de nuvens, pressão atmosférica e precipitação da última hora
- Horários do nascer e pôr do sol com arco solar animado em SVG
- Mensagens de erro para problemas de localização ou da API
- Botão para atualizar os dados

## Visual

- Fundo escuro `#0a0f1e` com aurora em gradiente animada
- Cards com efeito glassmorphism (`backdrop-filter`)
- Temperatura em destaque com gradiente
- Ícone do clima com animação suave
- Fontes IBM Plex Sans e Public Sans, carregadas do Google Fonts
- Layout responsivo com ajustes para áreas seguras de dispositivos móveis

## Estrutura

```text
clima_simples/
├── index.html   # Estrutura da interface
├── clima.css    # Estilos, animações e variáveis visuais
├── clima.js     # Localização, chamadas de API e renderização
├── netlify/
│   └── functions/
│       └── weather.js  # Proxy serverless para a API do clima
└── favicon.svg  # Ícone do site
```

## Como executar

O aplicativo precisa de uma chave do OpenWeatherMap configurada no servidor e de acesso à localização. Como as funções serverless fazem parte da aplicação, use o Netlify CLI para desenvolver localmente:

```bash
npx netlify-cli dev
```

O comando disponibiliza o site e as funções em `http://localhost:8888`. A geolocalização funciona em `localhost`; permita o acesso quando solicitado.

### Configurar a API

1. Crie uma conta no [OpenWeatherMap](https://openweathermap.org/api) e obtenha uma chave que permita usar os endpoints de clima atual e previsão de 5 dias/3 horas.
2. Para desenvolvimento local, crie um arquivo `.env` na raiz do projeto:

   ```bash
   OPENWEATHER_API_KEY=sua-chave
   ```

   Esse arquivo é ignorado pelo Git.
3. Na Netlify, configure a variável `OPENWEATHER_API_KEY` nas variáveis de ambiente do site e faça um novo deploy.

O frontend chama a função `/.netlify/functions/weather`; ela consulta a API e retorna as condições atuais e a previsão sem enviar a chave ao navegador. A previsão de amanhã depende dos dados do endpoint de previsão. Sem uma chave válida configurada no servidor, os dados não são carregados. Chaves podem levar alguns minutos para serem ativadas após a criação.

> A função mantém a chave fora do frontend, mas seu endereço é público e pode ser chamado por terceiros, o que pode consumir sua cota da API. Para este exemplo, monitore o uso da chave no OpenWeatherMap.

## Compatibilidade

Requer Node.js para executar o Netlify CLI localmente e um navegador moderno com suporte à Geolocation API, `backdrop-filter` e propriedades customizadas de CSS. A geolocalização depende também da permissão do usuário e de uma origem segura (HTTPS ou `localhost`).

## Licença

MIT — consulte o arquivo [LICENSE](LICENSE).
