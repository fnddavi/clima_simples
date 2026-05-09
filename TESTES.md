# Guia de Testes - Clima Simples

## Instalação

### 1. Instalar Node.js (se não tiver)
```bash
# macOS
brew install node

# Ubuntu/Debian
sudo apt-get install nodejs npm

# Windows
# Baixar de https://nodejs.org/
```

### 2. Instalar dependências do projeto

```bash
npm install
```

Isso instalará:
- **jest**: Framework de testes
- **jest-environment-jsdom**: Ambiente DOM para testes

## Como executar os testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch (reexecuta ao salvar arquivos)
```bash
npm test -- --watch
```

### Executar teste específico
```bash
npm test clima.test.js
```

### Gerar relatório de cobertura
```bash
npm test -- --coverage
```

## Estrutura dos testes

O arquivo `clima.test.js` contém **60+ testes** organizados em grupos:

### 1. **Funções utilitárias de DOM**
- `show(id)` - Remove classe "hidden"
- `hide(id)` - Adiciona classe "hidden"
- `set(id, val)` - Altera textContent

### 2. **Formatação de tempo**
- `fmtTime(unix, tz)` - Formata timestamp para hora

### 3. **Animação**
- `animateSunArc(progress)` - Anima arco do sol

### 4. **Data com timezone**
- `getLocalDateByOffset()` - Calcula data local

### 5. **Extração de dados de previsão**
- `extractDaySummaryFromForecast()` - Resumo do dia
- `extractTomorrowFromForecast()` - Previsão de amanhã

### 6. **Renderização**
- `renderWeather()` - Renderiza clima atual
- `showError()` - Mostra tela de erro
- `renderTomorrowForecast()` - Previsão de amanhã
- `createTomorrowPageData()` - Dados para página
- `renderTomorrowCard()` - Card de amanhã

### 7. **Ícones de clima**
- `WEATHER_CODES` - Mapeamento de códigos para emojis

### 8. **Testes de integração**
- Fluxo completo: clima → renderização
- Fluxo de erro

## Cobertura de testes

A cobertura esperada:
- **Funções**: 100% das 15 funções
- **Branches**: >70%
- **Linhas**: >80%

## O que cada teste valida

| Função | Testes | Validações |
|--------|--------|-----------|
| `show()` | 2 | Remove hidden, preserva outras classes |
| `hide()` | 2 | Adiciona hidden, não duplica |
| `set()` | 4 | TextContent, números, string vazia, elemento inexistente |
| `fmtTime()` | 4 | Timezone offset, string, undefined, formato |
| `animateSunArc()` | 4 | StrokeDashoffset, limites, posição, extremidades |
| `getLocalDateByOffset()` | 3 | Formato ISO, offset positivo, offset negativo |
| `extractDaySummaryFromForecast()` | 4 | Null, lista vazia, extração, merge com current |
| `extractTomorrowFromForecast()` | 3 | Null, extração, sem dados |
| `renderWeather()` | 8 | Localização, temp, descrição, umidade, vento, etc |
| `showError()` | 5 | Título, mensagem, ícones, state |
| `renderTomorrowForecast()` | 3 | Dados, null, formatação |
| `createTomorrowPageData()` | 3 | Null checks, criação dados |
| `renderTomorrowCard()` | 6 | Show/hide, temp, descrição, umidade |
| `WEATHER_CODES` | 4 | Vários tipos de clima |
| **Integração** | 2 | Fluxo completo, fluxo erro |

## Dicas

### Executar teste específico por padrão de nome
```bash
npm test -- --testNamePattern="show"
```

### Ver cobertura em HTML
```bash
npm test -- --coverage
open coverage/lcov-report/index.html
```

### Parar no primeiro erro
```bash
npm test -- --bail
```

## Próximos passos

1. **Testes de API**: Adicionar testes mock para `fetchWeather()` e `loadWeather()`
2. **E2E**: Adicionar testes end-to-end com Cypress ou Playwright
3. **Performance**: Medir tempo de renderização
4. **Acessibilidade**: Validar ARIA labels

---

Criado para el Projeto Clima Simples - 2026
