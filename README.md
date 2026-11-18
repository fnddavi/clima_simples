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
└── favicon.svg  # Ícone do site
```

## Como executar

O aplicativo precisa de uma chave do OpenWeatherMap e de acesso à localização. A geolocalização requer uma origem segura: use `localhost` durante o desenvolvimento ou HTTPS quando publicado. Por exemplo, com Python instalado:

```bash
python3 -m http.server 8000
```

Depois, abra `http://localhost:8000` no navegador e permita o acesso à localização.

### Configurar a API

1. Crie uma conta no [OpenWeatherMap](https://openweathermap.org/api) e obtenha uma chave que permita usar os endpoints de clima atual e previsão de 5 dias/3 horas.
2. No arquivo `clima.js`, configure a constante `API_KEY`:

   ```js
   const API_KEY = "sua-chave";
   ```

3. Recarregue o aplicativo. A previsão de amanhã depende dos dados retornados pelo endpoint de previsão.

O aplicativo **não tem modo demo**: sem uma chave válida, os dados não são carregados. A chave usada no frontend fica visível para qualquer pessoa que acesse o site; para uma publicação, restrinja-a conforme os recursos disponíveis no provedor ou use um backend para proteger o segredo. Chaves podem levar alguns minutos para serem ativadas após a criação.

## Compatibilidade

Requer um navegador moderno com suporte à Geolocation API, `backdrop-filter` e propriedades customizadas de CSS. A geolocalização depende também da permissão do usuário e de uma origem segura (HTTPS ou `localhost`).

## Licença

MIT — consulte o arquivo [LICENSE](LICENSE).
