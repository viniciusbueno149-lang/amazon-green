// ============================================================================
// AMAZON GREEN - Data Layer
// Todos os bairros de Manaus organizados por zona com coordenadas geográficas
// Integração Meteorológica em Tempo Real (Open-Meteo) + Fallback Inteligente
// ============================================================================

const ZONAS = {
  'Zona Norte': { color: '#0A382C', icon: '🌿' },
  'Zona Sul': { color: '#145C47', icon: '🌊' },
  'Zona Leste': { color: '#1A7A5E', icon: '🌱' },
  'Zona Oeste': { color: '#2E9E7A', icon: '🍃' },
  'Zona Centro-Sul': { color: '#0D4736', icon: '🏙️' },
  'Zona Centro-Oeste': { color: '#3A6351', icon: '🌳' },
};

// Classificação de qualidade do ar (IQA)
const CLASSIFICACAO_AR = [
  { min: 0, max: 40, label: 'Excelente', color: '#06d6a0', emoji: '🌟', desc: 'Ar limpo, ideal para atividades e vegetação densa.' },
  { min: 41, max: 80, label: 'Ótima', color: '#2dc653', emoji: '😊', desc: 'Qualidade atmosférica satisfatória e segura.' },
  { min: 81, max: 120, label: 'Boa', color: '#57cc99', emoji: '👍', desc: 'Pequena concentração de particulados urbanos.' },
  { min: 121, max: 160, label: 'Regular', color: '#ffd166', emoji: '😐', desc: 'Indivíduos sensíveis podem sentir desconforto respiratório.' },
  { min: 161, max: 200, label: 'Ruim', color: '#ef476f', emoji: '😷', desc: 'Poluição significativa, demanda ação urgente de arborização.' },
  { min: 201, max: 500, label: 'Péssima', color: '#9b2226', emoji: '☠️', desc: 'Nível crítico. Fumaça de queimadas ou emissões industriais pesadas.' },
];

function getEspeciesRecomendadas(tipo) {
  const nativas = [
    { nome: 'Castanheira-do-Brasil', cientifico: 'Bertholletia excelsa', absorcaoCO2: 35, icon: '🌰' },
    { nome: 'Seringueira', cientifico: 'Hevea brasiliensis', absorcaoCO2: 28, icon: '🌳' },
    { nome: 'Açaizeiro', cientifico: 'Euterpe oleracea', absorcaoCO2: 15, icon: '🌴' },
    { nome: 'Mogno Brasileiro', cientifico: 'Swietenia macrophylla', absorcaoCO2: 32, icon: '🪵' },
    { nome: 'Andiroba', cientifico: 'Carapa guianensis', absorcaoCO2: 25, icon: '🌿' },
    { nome: 'Sumaúma', cientifico: 'Ceiba pentandra', absorcaoCO2: 40, icon: '🌲' },
    { nome: 'Ipê-amarelo', cientifico: 'Handroanthus serratifolius', absorcaoCO2: 22, icon: '🌼' },
    { nome: 'Pau-rosa', cientifico: 'Aniba rosaeodora', absorcaoCO2: 20, icon: '🌸' },
  ];
  const urbanas = [
    { nome: 'Oiti', cientifico: 'Licania tomentosa', absorcaoCO2: 20, icon: '🌳' },
    { nome: 'Mangueira', cientifico: 'Mangifera indica', absorcaoCO2: 25, icon: '🥭' },
    { nome: 'Jambeiro', cientifico: 'Syzygium malaccense', absorcaoCO2: 18, icon: '🍎' },
    { nome: 'Flamboiã', cientifico: 'Delonix regia', absorcaoCO2: 22, icon: '🌺' },
  ];

  if (tipo === 'industrial' || tipo === 'comercial') {
    return [...urbanas, ...nativas.slice(0, 3)];
  }
  return [...nativas.slice(0, 5), ...urbanas.slice(0, 2)];
}

function gerarDadosBairro(nome, zona, tipo, areaKm2, populacao, coberturaVegetal, lat, lng) {
  const tempBase = 28 + (Math.random() * 5 - 1.5);
  const umidadeBase = 72 + (Math.random() * 22);

  const fatorUrbanizacao = {
    'residencial': 0.75,
    'comercial': 1.25,
    'industrial': 1.85,
    'misto': 1.05,
    'rural': 0.38,
    'preservação': 0.22,
  };

  const fator = fatorUrbanizacao[tipo] || 1.0;
  const fatorVegetal = 1 - (coberturaVegetal / 100) * 0.65;

  const pm25 = Math.round((14 + Math.random() * 55) * fator * fatorVegetal);
  const pm10 = Math.round(pm25 * (1.4 + Math.random() * 0.5));
  const co = parseFloat(((0.4 + Math.random() * 3.8) * fator).toFixed(1));
  const no2 = Math.round((12 + Math.random() * 75) * fator * fatorVegetal);
  const o3 = Math.round((22 + Math.random() * 50) * (2 - fator));
  const so2 = Math.round((2 + Math.random() * 18) * fator);

  const iqa = Math.round(
    pm25 * 0.32 +
    pm10 * 0.16 +
    co * 10 * 0.14 +
    no2 * 0.15 +
    o3 * 0.13 +
    so2 * 0.10
  );

  const classificacao = CLASSIFICACAO_AR.find(c => iqa >= c.min && iqa <= c.max) || CLASSIFICACAO_AR[5];
  const diferencaIqa = Math.max(0, iqa - 40);
  const arvoresPorPontoIqa = areaKm2 * 14;
  const arvoresNecessarias = Math.round(diferencaIqa * arvoresPorPontoIqa);
  const co2Removido = arvoresNecessarias * 22;

  const temperatura = parseFloat((tempBase + (1 - coberturaVegetal / 100) * 3.2).toFixed(1));
  const umidade = Math.min(98, parseFloat((umidadeBase - (1 - coberturaVegetal / 100) * 11).toFixed(1)));

  return {
    nome,
    zona,
    tipo,
    areaKm2,
    populacao,
    coberturaVegetal,
    lat,
    lng,
    temperatura,
    umidade,
    poluentes: { pm25, pm10, co, no2, o3, so2 },
    iqa,
    classificacao: classificacao.label,
    classificacaoObj: classificacao,
    arvoresNecessarias,
    co2Removido,
    especiesRecomendadas: getEspeciesRecomendadas(tipo),
  };
}

// ============================================================================
// TODOS OS BAIRROS DE MANAUS COM COORDENADAS REAIS
// ============================================================================
const BAIRROS_MANAUS = [
  // --- ZONA NORTE ---
  gerarDadosBairro('Cidade Nova', 'Zona Norte', 'residencial', 12.5, 125000, 24, -3.0336, -59.9723),
  gerarDadosBairro('Novo Israel', 'Zona Norte', 'residencial', 5.8, 48000, 28, -3.0298, -60.0143),
  gerarDadosBairro('Colônia Terra Nova', 'Zona Norte', 'residencial', 8.2, 65000, 36, -3.0421, -60.0198),
  gerarDadosBairro('Santa Etelvina', 'Zona Norte', 'residencial', 7.4, 55000, 30, -2.9982, -60.0185),
  gerarDadosBairro('Monte das Oliveiras', 'Zona Norte', 'residencial', 6.1, 42000, 34, -3.0112, -60.0092),
  gerarDadosBairro('Novo Aleixo', 'Zona Norte', 'misto', 9.3, 78000, 22, -3.0478, -59.9572),
  gerarDadosBairro('Cidade de Deus', 'Zona Norte', 'residencial', 4.7, 38000, 21, -3.0195, -59.9567),
  gerarDadosBairro('Lago Azul', 'Zona Norte', 'residencial', 3.5, 28000, 42, -2.9754, -60.0210),
  gerarDadosBairro('Nova Cidade', 'Zona Norte', 'residencial', 5.2, 45000, 26, -3.0223, -59.9981),
  gerarDadosBairro('Amazonino Mendes', 'Zona Norte', 'residencial', 4.0, 32000, 33, -3.0382, -59.9821),
  gerarDadosBairro('Alfredo Nascimento', 'Zona Norte', 'residencial', 6.8, 52000, 24, -3.0267, -59.9612),
  gerarDadosBairro('Manôa', 'Zona Norte', 'residencial', 3.2, 22000, 44, -3.0361, -60.0125),
  gerarDadosBairro('Colônia Santo Antônio', 'Zona Norte', 'rural', 15.0, 8000, 68, -3.0512, -60.0278),
  gerarDadosBairro('Terra Nova', 'Zona Norte', 'residencial', 4.5, 35000, 31, -3.0401, -60.0160),

  // --- ZONA SUL ---
  gerarDadosBairro('Centro', 'Zona Sul', 'comercial', 2.3, 15000, 9, -3.1345, -60.0264),
  gerarDadosBairro('Praça 14 de Janeiro', 'Zona Sul', 'misto', 1.8, 12000, 14, -3.1256, -60.0129),
  gerarDadosBairro('Cachoeirinha', 'Zona Sul', 'misto', 2.1, 18000, 13, -3.1221, -60.0078),
  gerarDadosBairro('São Lázaro', 'Zona Sul', 'residencial', 1.5, 10000, 17, -3.1362, -59.9985),
  gerarDadosBairro('Aparecida', 'Zona Sul', 'misto', 1.2, 9000, 15, -3.1312, -60.0345),
  gerarDadosBairro('Presidente Vargas', 'Zona Sul', 'misto', 1.9, 14000, 16, -3.1205, -60.0256),
  gerarDadosBairro('Educandos', 'Zona Sul', 'misto', 2.5, 20000, 10, -3.1432, -60.0152),
  gerarDadosBairro('Santa Luzia', 'Zona Sul', 'residencial', 1.3, 11000, 12, -3.1451, -60.0098),
  gerarDadosBairro('Morro da Liberdade', 'Zona Sul', 'residencial', 1.1, 9500, 19, -3.1412, -60.0045),
  gerarDadosBairro('Betânia', 'Zona Sul', 'residencial', 0.9, 7000, 21, -3.1389, -59.9921),
  gerarDadosBairro('Colônia Oliveira Machado', 'Zona Sul', 'misto', 3.5, 25000, 17, -3.1472, -59.9882),
  gerarDadosBairro('Crespo', 'Zona Sul', 'residencial', 1.4, 10500, 16, -3.1356, -60.0034),
  gerarDadosBairro('Vila Buriti', 'Zona Sul', 'residencial', 0.8, 6000, 26, -3.1320, -59.9790),
  gerarDadosBairro('Japiim', 'Zona Sul', 'residencial', 3.8, 30000, 21, -3.1145, -59.9934),
  gerarDadosBairro('Petrópolis', 'Zona Sul', 'misto', 2.0, 16000, 23, -3.1189, -60.0012),
  gerarDadosBairro('Raiz', 'Zona Sul', 'residencial', 1.6, 13000, 18, -3.1301, -60.0054),

  // --- ZONA LESTE ---
  gerarDadosBairro('Armando Mendes', 'Zona Leste', 'residencial', 4.5, 35000, 19, -3.0945, -59.9452),
  gerarDadosBairro('Zumbi dos Palmares', 'Zona Leste', 'residencial', 6.2, 48000, 17, -3.0821, -59.9421),
  gerarDadosBairro('São José Operário', 'Zona Leste', 'misto', 8.5, 72000, 15, -3.0762, -59.9542),
  gerarDadosBairro('Tancredo Neves', 'Zona Leste', 'misto', 7.8, 68000, 16, -3.0645, -59.9512),
  gerarDadosBairro('Jorge Teixeira', 'Zona Leste', 'residencial', 10.2, 85000, 21, -3.0489, -59.9321),
  gerarDadosBairro('Coroado', 'Zona Leste', 'misto', 5.5, 42000, 24, -3.0978, -59.9812),
  gerarDadosBairro('Mauazinho', 'Zona Leste', 'residencial', 3.2, 22000, 29, -3.1456, -59.9412),
  gerarDadosBairro('Puraquequara', 'Zona Leste', 'rural', 20.0, 15000, 72, -3.0812, -59.8654),
  gerarDadosBairro('Colônia Antônio Aleixo', 'Zona Leste', 'rural', 18.0, 12000, 62, -3.1256, -59.9012),
  gerarDadosBairro('Distrito Industrial II', 'Zona Leste', 'industrial', 25.0, 5000, 32, -3.1123, -59.9212),
  gerarDadosBairro('Gilberto Mestrinho', 'Zona Leste', 'residencial', 4.8, 38000, 19, -3.0712, -59.9234),
  gerarDadosBairro('São Francisco', 'Zona Leste', 'residencial', 3.0, 24000, 27, -3.1134, -60.0098),
  gerarDadosBairro('Sharpe', 'Zona Leste', 'residencial', 2.8, 18000, 31, -3.1021, -59.9621),

  // --- ZONA OESTE ---
  gerarDadosBairro('Tarumã', 'Zona Oeste', 'preservação', 30.0, 8000, 82, -2.9612, -60.0982),
  gerarDadosBairro('Tarumã-Açu', 'Zona Oeste', 'preservação', 25.0, 5000, 86, -2.9345, -60.1123),
  gerarDadosBairro('Ponta Negra', 'Zona Oeste', 'misto', 15.0, 45000, 56, -3.0567, -60.0987),
  gerarDadosBairro('Santo Agostinho', 'Zona Oeste', 'residencial', 4.5, 28000, 34, -3.0812, -60.0754),
  gerarDadosBairro('Nova Esperança', 'Zona Oeste', 'residencial', 3.8, 22000, 29, -3.0921, -60.0612),
  gerarDadosBairro('Lírio do Vale', 'Zona Oeste', 'residencial', 3.2, 18000, 31, -3.0789, -60.0621),
  gerarDadosBairro('Planalto', 'Zona Oeste', 'residencial', 4.0, 25000, 28, -3.0734, -60.0456),
  gerarDadosBairro('Redenção', 'Zona Oeste', 'residencial', 2.8, 15000, 24, -3.0612, -60.0389),
  gerarDadosBairro('Compensa', 'Zona Oeste', 'misto', 5.5, 42000, 20, -3.1123, -60.0543),
  gerarDadosBairro('São Jorge', 'Zona Oeste', 'residencial', 3.5, 20000, 34, -3.1078, -60.0389),
  gerarDadosBairro('Santo Antônio', 'Zona Oeste', 'misto', 2.0, 12000, 23, -3.1234, -60.0432),
  gerarDadosBairro('Glória', 'Zona Oeste', 'residencial', 2.5, 14000, 27, -3.1278, -60.0412),
  gerarDadosBairro('São Raimundo', 'Zona Oeste', 'misto', 2.2, 16000, 18, -3.1298, -60.0382),
  gerarDadosBairro('Vila da Prata', 'Zona Oeste', 'residencial', 1.8, 10000, 29, -3.1189, -60.0456),

  // --- ZONA CENTRO-SUL ---
  gerarDadosBairro('Adrianópolis', 'Zona Centro-Sul', 'misto', 2.5, 18000, 31, -3.1089, -60.0134),
  gerarDadosBairro('Nossa Senhora das Graças', 'Zona Centro-Sul', 'residencial', 2.0, 14000, 36, -3.1156, -60.0189),
  gerarDadosBairro('São Geraldo', 'Zona Centro-Sul', 'residencial', 1.8, 12000, 26, -3.1182, -60.0245),
  gerarDadosBairro('Chapada', 'Zona Centro-Sul', 'misto', 3.0, 22000, 29, -3.0978, -60.0278),
  gerarDadosBairro('Flores', 'Zona Centro-Sul', 'residencial', 4.5, 35000, 33, -3.0765, -60.0210),
  gerarDadosBairro('Parque 10 de Novembro', 'Zona Centro-Sul', 'misto', 5.0, 45000, 27, -3.0889, -60.0098),
  gerarDadosBairro('Aleixo', 'Zona Centro-Sul', 'misto', 3.5, 28000, 32, -3.0934, -59.9967),
  gerarDadosBairro('Distrito Industrial I', 'Zona Centro-Sul', 'industrial', 20.0, 3000, 24, -3.1289, -59.9723),

  // --- ZONA CENTRO-OESTE ---
  gerarDadosBairro('Dom Pedro', 'Zona Centro-Oeste', 'comercial', 3.5, 25000, 19, -3.0945, -60.0456),
  gerarDadosBairro('Alvorada', 'Zona Centro-Oeste', 'misto', 5.0, 42000, 23, -3.0812, -60.0421),
  gerarDadosBairro('Da Paz', 'Zona Centro-Oeste', 'residencial', 3.0, 20000, 26, -3.0678, -60.0489)
];

// ============================================================================
// METEOROLOGY API (Open-Meteo Forecast + Past 7 Days Hourly Series)
// Variáveis: temperature_2m, relative_humidity_2m, apparent_temperature,
// visibility, temperature_80m (gradiente vertical) com past_days=7
// ============================================================================
async function fetchMeteorologiaAoVivoManaus() {
  const lat = -3.1019;
  const lon = -60.0250;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,visibility,temperature_80m,precipitation,wind_speed_10m,weather_code&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,visibility,temperature_80m&past_days=7&timezone=America%2FManaus`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha na resposta da API Open-Meteo');
    const data = await res.json();

    const curr = data.current || {};
    const visKm = curr.visibility !== undefined ? (curr.visibility / 1000).toFixed(1) : '10.0';
    const temp2m = curr.temperature_2m !== undefined ? curr.temperature_2m : 31.2;
    const temp80m = curr.temperature_80m !== undefined ? curr.temperature_80m : 29.8;
    const gradiente = (temp80m - temp2m).toFixed(1);

    return {
      temperatura: temp2m,
      sensacaoTermica: curr.apparent_temperature !== undefined ? curr.apparent_temperature : 35.8,
      umidade: curr.relative_humidity_2m !== undefined ? curr.relative_humidity_2m : 76,
      visibilidadeKm: visKm,
      temp80m: temp80m,
      gradienteVertical: gradiente,
      ventoKmH: curr.wind_speed_10m !== undefined ? curr.wind_speed_10m : 7.2,
      chuva: curr.precipitation || 0.0,
      codigoTempo: curr.weather_code || 1,
      origem: 'Open-Meteo (Estação Manaus · 7 Dias Históricos)',
      hourly: data.hourly || null,
      rawUrl: url
    };
  } catch (err) {
    console.warn('Usando telemetria de referência para Manaus (offline fallback):', err);
    
    // Geração sintética coerente de 7 dias passados (168h) para visualização offline
    const now = new Date();
    const mockHourlyTimes = [];
    const mockTemp2m = [];
    const mockHumid = [];
    const mockApparent = [];
    const mockVis = [];
    const mockTemp80m = [];

    for (let i = 168; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 3600 * 1000);
      mockHourlyTimes.push(t.toISOString().slice(0, 16));
      const hour = t.getHours();
      // Ciclo diurno equatorial amazônico
      const sun = Math.sin((hour - 6) / 24 * Math.PI * 2);
      const t2 = parseFloat((26.5 + Math.max(0, sun) * 6.8 + (Math.random() * 0.8 - 0.4)).toFixed(1));
      const t80 = parseFloat((t2 - 1.2 - Math.max(0, sun) * 0.6 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      const hum = Math.round(92 - Math.max(0, sun) * 28 + (Math.random() * 4 - 2));
      const app = parseFloat((t2 + (hum > 75 ? (hum - 70) * 0.15 : 0)).toFixed(1));
      const vis = Math.round((14000 - (hum > 85 ? (hum - 85) * 400 : 0) + Math.random() * 2000));

      mockTemp2m.push(t2);
      mockTemp80m.push(t80);
      mockHumid.push(hum);
      mockApparent.push(app);
      mockVis.push(vis);
    }

    return {
      temperatura: 31.4,
      sensacaoTermica: 36.2,
      umidade: 78,
      visibilidadeKm: '12.5',
      temp80m: 30.1,
      gradienteVertical: '-1.3',
      ventoKmH: 8.5,
      chuva: 0.0,
      codigoTempo: 1,
      origem: 'Simulação Estacional Amazonas (Modo Resiliente)',
      hourly: {
        time: mockHourlyTimes,
        temperature_2m: mockTemp2m,
        relative_humidity_2m: mockHumid,
        apparent_temperature: mockApparent,
        visibility: mockVis,
        temperature_80m: mockTemp80m
      },
      rawUrl: url
    };
  }
}

function getEstatisticasGerais() {
  const total = BAIRROS_MANAUS.length;
  const iqaMedia = Math.round(BAIRROS_MANAUS.reduce((sum, b) => sum + b.iqa, 0) / total);
  const tempMedia = parseFloat((BAIRROS_MANAUS.reduce((sum, b) => sum + b.temperatura, 0) / total).toFixed(1));
  const umidadeMedia = parseFloat((BAIRROS_MANAUS.reduce((sum, b) => sum + b.umidade, 0) / total).toFixed(1));
  const totalArvores = BAIRROS_MANAUS.reduce((sum, b) => sum + b.arvoresNecessarias, 0);
  const totalCO2 = BAIRROS_MANAUS.reduce((sum, b) => sum + b.co2Removido, 0);

  const contagem = {};
  CLASSIFICACAO_AR.forEach(c => contagem[c.label] = 0);
  BAIRROS_MANAUS.forEach(b => contagem[b.classificacao]++);

  return {
    totalBairros: total,
    iqaMedia,
    tempMedia,
    umidadeMedia,
    totalArvores,
    totalCO2,
    classificacaoMedia: CLASSIFICACAO_AR.find(c => iqaMedia >= c.min && iqaMedia <= c.max) || CLASSIFICACAO_AR[3],
    contagemClassificacao: contagem,
  };
}

function getBairrosPorZona(zona) {
  return BAIRROS_MANAUS.filter(b => b.zona === zona);
}

function getTopBairrosCriticos(n = 10) {
  return [...BAIRROS_MANAUS].sort((a, b) => b.iqa - a.iqa).slice(0, n);
}

function getRankingZonas() {
  const zonas = Object.keys(ZONAS);
  return zonas.map(zona => {
    const bairros = getBairrosPorZona(zona);
    const iqaMedia = Math.round(bairros.reduce((s, b) => s + b.iqa, 0) / bairros.length);
    const classificacao = CLASSIFICACAO_AR.find(c => iqaMedia >= c.min && iqaMedia <= c.max) || CLASSIFICACAO_AR[3];
    return {
      zona,
      iqaMedia,
      classificacao: classificacao.label,
      classificacaoObj: classificacao,
      totalBairros: bairros.length,
      totalArvores: bairros.reduce((s, b) => s + b.arvoresNecessarias, 0),
      ...ZONAS[zona],
    };
  }).sort((a, b) => a.iqaMedia - b.iqaMedia);
}
