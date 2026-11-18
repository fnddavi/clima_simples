function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return jsonResponse(405, { error: "Método não permitido." });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, {
      error: "A chave da API não está configurada no servidor.",
    });
  }

  const { lat, lon } = event.queryStringParameters || {};
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (
    !lat ||
    !lon ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return jsonResponse(400, { error: "Coordenadas inválidas." });
  }

  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    appid: apiKey,
    units: "metric",
    lang: "pt_br",
  });

  try {
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`),
    ]);

    const failedResponse = [currentResponse, forecastResponse].find(
      (response) => !response.ok,
    );
    if (failedResponse) {
      const error =
        failedResponse.status === 401
          ? "Chave OpenWeatherMap inválida."
          : `OpenWeatherMap respondeu com erro (${failedResponse.status}).`;
      return jsonResponse(502, { error });
    }

    const [current, forecast] = await Promise.all([
      currentResponse.json(),
      forecastResponse.json(),
    ]);

    return jsonResponse(200, { current, forecast });
  } catch (error) {
    console.error("Falha ao consultar OpenWeatherMap:", error);
    return jsonResponse(502, {
      error: "Não foi possível consultar os dados climáticos.",
    });
  }
};
