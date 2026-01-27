// Configurações globais
const CARTOLA_API_URL = '/.netlify/functions/cartola-api';
const GATOMESTRE_API_URL = '/.netlify/functions/gatomestre-api';
const CANVAS_WIDTH = 2900;
const CANVAS_HEIGHT = 4800;

// Mapeamento de posições
const POSITION_MAP = {
  'TEC': 'tecnicos',
  'GOL': 'goleiros',
  'LAT': 'laterais',
  'ZAG': 'zagueiros',
  'MEI': 'meias',
  'ATA': 'atacantes'
};

// Mapeamento de clubes (para NOME DE ESCUDO na arte) — mantido
const CLUB_MAP = {
  'FLAMENGO': 'flamengo',
  'PALMEIRAS': 'palmeiras',
  'CORINTHIANS': 'corinthians',
  'SÃO PAULO': 'são paulo',
  'SANTOS': 'santos',
  'VASCO': 'vasco',
  'BOTAFOGO': 'botafogo',
  'FLUMINENSE': 'fluminense',
  'ATLÉTICO-MG': 'atlético mg',
  'ATLÉTICO MG': 'atlético mg',
  'ATLETICO MG': 'atlético mg',
  'CRUZEIRO': 'cruzeiro',
  'GRÊMIO': 'gremio',
  'INTERNACIONAL': 'internacional',
  'BAHIA': 'bahia',
  'VITÓRIA': 'vitória',
  'RED BULL BRAGANTINO': 'red bull bragantino',
  'MIRASSOL': 'mirassol',
  'ATHLETICO-PR': 'athletico-pr',
  'ATHLETICO PR': 'athletico-pr',
  'ATHLETICO': 'athletico-pr',
  'CORITIBA': 'coritiba',
  'CHAPECOENSE': 'chapecoense',
  'REMO': 'remo'
};

// Variáveis globais
let cartolaData = null;
let gatoMestreData = null;
let gatoMestreToken = localStorage.getItem('gatoMestreToken') || '';
let playerData = [];

// Elementos DOM
let artLayout, canvas, ctx, generateBtn;

// --------------------- NORMALIZAÇÕES (CORREÇÃO CRÍTICA) ---------------------
// Normalize "de verdade" para nomes: remove acento, pontuação e normaliza espaços.
// NÃO remove "de/da/do", porque isso quebra match de nomes reais.
function normalizeName(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Para indicadores (cap/uni/rl) pode ser mais simples.
function normalizeIndicator(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// --------------------- CLUB NORMALIZATION (ESCUDO + MATCH) ------------------
function normalizeClubName(clubName) {
  const clubMap = {
    'flamengo': ['flamengo', 'fla', 'flam'],
    'palmeiras': ['palmeiras', 'pal', 'palm'],
    'corinthians': ['corinthians', 'cor', 'corintians'],
    'sao paulo': ['sao paulo', 'sao', 'spfc', 'são paulo'],
    'santos': ['santos', 'san'],
    'vasco': ['vasco', 'vas'],
    'botafogo': ['botafogo', 'bot', 'bota'],
    'fluminense': ['fluminense', 'flu', 'flumi'],
    'atletico mg': ['atletico-mg', 'atletico mg', 'atlético-mg', 'atlético mg', 'cam', 'galo'],
    'cruzeiro': ['cruzeiro', 'cru', 'cruz'],
    'gremio': ['gremio', 'grêmio', 'gre'],
    'internacional': ['internacional', 'inter', 'int', 'colorado'],
    'bahia': ['bahia', 'bah'],
    'vitoria': ['vitoria', 'vitória', 'vit'],
    'red bull bragantino': ['red bull bragantino', 'bragantino', 'rbr', 'red bull'],
    'mirassol': ['mirassol', 'mir'],
    'athletico-pr': ['athletico-pr', 'athletico pr', 'athletico', 'cap', 'furacao', 'furacão'],
    'coritiba': ['coritiba', 'coxa', 'cfc', 'curitiba'],
    'chapecoense': ['chapecoense', 'chape'],
    'remo': ['remo']
  };

  const normalized = normalizeName(clubName);

  for (const [key, variations] of Object.entries(clubMap)) {
    if (variations.some(v => normalizeName(v) === normalized)) {
      return key;
    }
  }

  return normalized; // fallback seguro
}

// --------------------- MATCH ROBUSTO (NÚCLEO DEFINITIVO) --------------------
const POSICAO_ID = { GOL: 1, LAT: 2, ZAG: 3, MEI: 4, ATA: 5, TEC: 6 };
function safePosId(posStr) {
  const key = (posStr || '').toUpperCase().trim();
  return POSICAO_ID[key] || null;
}

// Índices do mercado
let marketIndexBuilt = false;
let marketIndex = {
  byClubPos: new Map(),       // key: clubKey|posId => [atletas]
  byClubPosName: new Map(),   // key: clubKey|posId|nameNorm => atleta
  clubesById: {},
  clubKeyById: new Map()
};

function getAtletasArray() {
  if (!cartolaData || !cartolaData.atletas) return [];
  return Array.isArray(cartolaData.atletas) ? cartolaData.atletas : Object.values(cartolaData.atletas);
}

function buildMarketIndex() {
  if (!cartolaData || !cartolaData.atletas) return;

  marketIndexBuilt = false;
  marketIndex.byClubPos = new Map();
  marketIndex.byClubPosName = new Map();
  marketIndex.clubesById = cartolaData.clubes || {};
  marketIndex.clubKeyById = new Map();

  // clube_id => clubKey
  try {
    Object.entries(marketIndex.clubesById || {}).forEach(([id, clubeObj]) => {
      const nome = (clubeObj && clubeObj.nome) ? clubeObj.nome : '';
      const key = nome ? normalizeClubName(nome) : '';
      if (key) marketIndex.clubKeyById.set(Number(id), key);
    });
  } catch (e) {
    console.warn('Falha ao montar clubKeyById:', e);
  }

  const atletasArr = getAtletasArray();

  atletasArr.forEach(atleta => {
    if (!atleta || typeof atleta !== 'object') return;

    const nome = atleta.apelido || atleta.nome || '';
    const nomeNorm = normalizeName(nome);
    if (!nomeNorm) return;

    const posId = atleta.posicao_id != null ? Number(atleta.posicao_id) : null;
    if (!posId) return;

    // resolve clubKey
    let clubKey = '';
    if (atleta.clube && typeof atleta.clube === 'object' && atleta.clube.nome) {
      clubKey = normalizeClubName(atleta.clube.nome);
    } else if (atleta.clube_id != null) {
      clubKey = marketIndex.clubKeyById.get(Number(atleta.clube_id)) || '';
    } else if (typeof atleta.clube === 'string') {
      clubKey = normalizeClubName(atleta.clube);
    }
    if (!clubKey) return;

    const keyPos = `${clubKey}|${posId}`;
    if (!marketIndex.byClubPos.has(keyPos)) marketIndex.byClubPos.set(keyPos, []);
    marketIndex.byClubPos.get(keyPos).push(atleta);

    const keyFull = `${clubKey}|${posId}|${nomeNorm}`;
    if (!marketIndex.byClubPosName.has(keyFull)) {
      marketIndex.byClubPosName.set(keyFull, atleta);
    }
  });

  marketIndexBuilt = true;
  console.log('✅ Índice do mercado montado:', {
    keysClubPos: marketIndex.byClubPos.size,
    keysFull: marketIndex.byClubPosName.size
  });
}

// Gera variantes seguras para bater "WALTER CLAR" com "WALTER" quando for ÚNICO no clube/posição.
function buildNameVariants(nameNorm) {
  const tokens = nameNorm.split(' ').filter(Boolean);
  const variants = new Set();
  if (!tokens.length) return variants;

  variants.add(nameNorm);           // completo
  variants.add(tokens[0]);          // primeiro nome
  if (tokens.length >= 2) variants.add(`${tokens[0]} ${tokens[1]}`); // dois primeiros
  if (tokens.length >= 2) variants.add(tokens[tokens.length - 1]);   // último token (sobrenome)

  // Também versões sem espaço (alguns apelidos colam)
  variants.add(tokens.join(''));

  return variants;
}

function pickUniqueCandidate(candidates, targetNorm) {
  if (!candidates.length) return null;

  const targetVariants = buildNameVariants(targetNorm);

  // 1) match exato direto (apelido/nome)
  const exact = candidates.filter(a => {
    const an = normalizeName(a.apelido || a.nome || '');
    return an === targetNorm;
  });
  if (exact.length === 1) return { atleta: exact[0], kind: 'exact' };
  if (exact.length > 1) return null; // ambíguo

  // 2) match por variantes (primeiro nome / 2 tokens / último) — apenas se ficar ÚNICO
  const scored = candidates.map(a => {
    const an = normalizeName(a.apelido || a.nome || '');
    let score = 0;

    if (targetVariants.has(an)) score = 90;
    else {
      // startsWith seguro (ex.: "pedro" vs "pedro morisco") — mas só se for forte
      const tokensA = an.split(' ').filter(Boolean);
      const tokensT = targetNorm.split(' ').filter(Boolean);

      // se o primeiro token bate e o candidato tem 1 token só: costuma ser apelido curto (WALTER)
      if (tokensT[0] && tokensA[0] && tokensT[0] === tokensA[0] && tokensA.length === 1) score = 85;

      // se o candidato é prefixo do alvo ou vice-versa (sem virar bagunça)
      if (score === 0 && (an.startsWith(targetNorm) || targetNorm.startsWith(an))) score = 80;

      // se todos tokens do candidato estão no alvo (ex.: "cleiton" dentro de "cleiton algo") — raríssimo, mas seguro
      if (score === 0 && tokensA.length >= 1) {
        const setT = new Set(tokensT);
        const allIn = tokensA.every(t => setT.has(t));
        if (allIn) score = 75;
      }
    }

    return { atleta: a, an, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);

  if (!scored.length) return null;

  // aceita só se:
  // - top >= 80
  // - e é único (ou o segundo está bem abaixo)
  const top = scored[0];
  const second = scored[1];

  if (top.score >= 80) {
    if (!second || (top.score - second.score >= 10)) {
      return { atleta: top.atleta, kind: 'variant' };
    }
  }

  return null; // ambíguo → não chuta
}

function getPlayerPrice(playerName, clubName, posicao) {
  if (!cartolaData || !cartolaData.atletas) {
    return { price: null, found: false };
  }

  if (!marketIndexBuilt) buildMarketIndex();

  const targetNorm = normalizeName(playerName);
  const clubKey = normalizeClubName(clubName);
  const posId = safePosId(posicao);

  if (!targetNorm || !clubKey || !posId) return { price: null, found: false };

  // 1) match exato indexado
  const keyFull = `${clubKey}|${posId}|${targetNorm}`;
  const exact = marketIndex.byClubPosName.get(keyFull);
  if (exact) {
    const price = (exact.preco_num != null) ? Number(exact.preco_num) : (exact.preco != null ? Number(exact.preco) : null);
    return { price, found: true, player: exact };
  }

  // 2) candidatos por clube+posição
  const keyPos = `${clubKey}|${posId}`;
  const candidates = marketIndex.byClubPos.get(keyPos) || [];

  // 3) tentativa robusta/segura por variantes — somente se for único
  const picked = pickUniqueCandidate(candidates, targetNorm);
  if (picked && picked.atleta) {
    const a = picked.atleta;
    const price = (a.preco_num != null) ? Number(a.preco_num) : (a.preco != null ? Number(a.preco) : null);
    return { price, found: true, player: a, approx: picked.kind };
  }

  return { price: null, found: false };
}

// --------------------- DOM INIT ---------------------
function initializeDOM() {
  artLayout = document.getElementById('artLayout');
  canvas = document.getElementById('artCanvas');
  if (canvas) ctx = canvas.getContext('2d');
}

// --------------------- LISTENERS ---------------------
document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('fileInput');
  generateBtn = document.getElementById('generateBtn');
  const updateMarketBtn = document.getElementById('updateMarketBtn');
  const downloadPngBtn = document.getElementById('downloadPngBtn');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');
  const downloadPdfVectorBtn = document.getElementById('downloadPdfVectorBtn');
  const roundNumberInput = document.getElementById('roundNumber');
  const saveTokenBtn = document.getElementById('saveTokenBtn');
  const gatoMestreTokenInput = document.getElementById('gatoMestreToken');

  fileInput.addEventListener('change', handleFileUpload);
  generateBtn.addEventListener('click', generateArt);
  updateMarketBtn.addEventListener('click', updateMarketData);
  downloadPngBtn.addEventListener('click', () => downloadImage('png'));
  downloadPdfBtn.addEventListener('click', () => downloadImage('pdf'));
  downloadPdfVectorBtn.addEventListener('click', () => downloadImage('pdf-vector'));
  roundNumberInput.addEventListener('input', updateArtTitle);

  saveTokenBtn.addEventListener('click', () => {
    const token = gatoMestreTokenInput.value.trim();
    if (token) {
      setGatoMestreToken(token);
      alert('Token salvo com sucesso! Os dados de MPV serão carregados.');
    } else {
      alert('Por favor, insira um token válido.');
    }
  });

  if (gatoMestreToken) gatoMestreTokenInput.value = gatoMestreToken;

  loadCartolaData().then(() => {
    loadGatoMestreData();
    loadExampleData();
  });

  setInterval(() => {
    loadCartolaData();
  }, 5 * 60 * 1000);
});

// --------------------- UI HELPERS ---------------------
function updateMarketData() {
  const btn = document.getElementById('updateMarketBtn');
  btn.textContent = 'Atualizando...';
  btn.disabled = true;

  // Atualiza Cartola + (opcional) GatoMestre, mas não quebra nada se GM falhar
  Promise.allSettled([loadCartolaData(), loadGatoMestreData()]).finally(() => {
    btn.textContent = 'Atualizar Mercado';
    btn.disabled = false;
  });
}

function showErrorMessages(errors) {
  const errorDiv = document.getElementById('errorMessages');
  if (errors.length > 0) {
    errorDiv.innerHTML = '<strong>Jogadores não encontrados:</strong><br>' + errors.join('<br>');
    errorDiv.classList.add('show');
  } else {
    errorDiv.classList.remove('show');
  }
}

function updateArtTitle() {
  const roundNumber = document.getElementById('roundNumber').value;
  const artTitle = document.getElementById('artTitle');
  if (roundNumber && roundNumber.trim() !== '') {
    artTitle.textContent = `DICAS POR POSIÇÃO - TCC - RODADA ${roundNumber}`;
  } else {
    artTitle.textContent = 'DICAS POR POSIÇÃO - TCC';
  }
}

// --------------------- CARTOLA LOAD ---------------------
async function loadCartolaData() {
  try {
    const response = await fetch(CARTOLA_API_URL);
    if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

    const apiData = await response.json();

    if (apiData && apiData.atletas) {
      cartolaData = {
        atletas: apiData.atletas,
        clubes: apiData.clubes || {}
      };

      buildMarketIndex();
    } else {
      throw new Error('Estrutura de dados da API inválida');
    }
  } catch (error) {
    console.error('Erro ao carregar dados do Cartola:', error);
    await loadLocalCartolaData();
    buildMarketIndex();
  }
}

async function loadLocalCartolaData() {
  try {
    const response = await fetch('cartola_jogadores_time_posicao_preco.csv');
    const csvText = await response.text();
    cartolaData = parseLocalCSV(csvText);
  } catch (error) {
    console.error('Erro ao carregar dados locais:', error);
  }
}

function parseLocalCSV(csvText) {
  const lines = csvText.split('\n');
  const players = {};

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 4) {
      const playerName = values[0].trim();
      const team = values[1].trim();
      const position = values[2].trim();
      const price = parseFloat(values[3].trim());

      // fallback simples (não é o ideal, mas não quebra)
      players[playerName.toUpperCase()] = {
        nome: playerName,
        clube: team,
        posicao: position,
        preco_num: price,
        apelido: playerName,
        posicao_id: safePosId(position),
        clube_id: null,
        atleta_id: null
      };
    }
  }

  return { atletas: players, clubes: {} };
}

// --------------------- GATO MESTRE ---------------------
async function loadGatoMestreData() {
  if (!gatoMestreToken || gatoMestreToken.trim() === '') {
    return;
  }

  try {
    const response = await fetch(GATOMESTRE_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': gatoMestreToken, // aqui você cola "Bearer xxx"
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        alert('Token do Gato Mestre expirado. Atualize o token nas configurações.');
        return;
      }
      throw new Error(`Erro na API do Gato Mestre: ${response.status}`);
    }

    gatoMestreData = await response.json();
  } catch (error) {
    console.error('Erro ao carregar dados do Gato Mestre:', error);
    gatoMestreData = null;
  }
}

function setGatoMestreToken(token) {
  gatoMestreToken = token;
  localStorage.setItem('gatoMestreToken', token);
  loadGatoMestreData();
}

function getPlayerMPV(atletaId) {
  if (!gatoMestreData || !atletaId) return null;
  const p = gatoMestreData[atletaId];
  return (p && p.minimo_para_valorizar !== undefined) ? p.minimo_para_valorizar : null;
}

function getMPVColorClass(posicao, mpv) {
  const pos = (posicao || '').toUpperCase();

  if (pos === 'TEC' || pos === 'GOL' || pos === 'ZAG') {
    if (mpv <= 2.5) return 'mpv-green';
    if (mpv <= 6.0) return 'mpv-white';
    return 'mpv-red';
  }
  if (pos === 'LAT') {
    if (mpv <= 3.0) return 'mpv-green';
    if (mpv <= 6.5) return 'mpv-white';
    return 'mpv-red';
  }
  if (pos === 'MEI' || pos === 'ATA') {
    if (mpv <= 3.0) return 'mpv-green';
    if (mpv <= 7.0) return 'mpv-white';
    return 'mpv-red';
  }
  return 'mpv-white';
}

// --------------------- FILE UPLOAD / PARSE ---------------------
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    parsePlayerData(e.target.result);
  };
  reader.readAsText(file);
}

async function loadExampleData() {
  // não carrega automático
  playerData = [];
  const positions = ['tecnicos', 'goleiros', 'laterais', 'zagueiros', 'meias', 'atacantes'];
  positions.forEach(position => {
    const container = document.querySelector(`#${position} .players-list`);
    if (container) container.innerHTML = '';
  });
}

function parsePlayerData(content) {
  const lines = content.split('\n');
  playerData = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(',');
    if (parts.length >= 4) {
      const player = {
        posicao: parts[0].trim().toUpperCase(),
        nome: parts[1].trim(),
        clube: parts[2].trim(),
        confianca: parts[3].trim().toUpperCase(),
        capitao: false,
        unanimidade: false,
        luxo: false
      };

      for (let j = 4; j < parts.length; j++) {
        const indicator = normalizeIndicator(parts[j].trim());
        if (indicator === 'cap' || indicator === 'capitao' || indicator === 'captain') player.capitao = true;
        if (indicator === 'uni' || indicator === 'unanimidade' || indicator === 'unanime') player.unanimidade = true;
        if (indicator === 'rl' || indicator === 'luxo' || indicator === 'reserva luxo' || indicator === 'reserva de luxo') player.luxo = true;
      }

      playerData.push(player);
    }
  }

  generateBtn.disabled = false;
}

// --------------------- ART GENERATION ---------------------
function generateArt() {
  if (!playerData.length) {
    alert('Por favor, faça upload do arquivo CSV primeiro.');
    return;
  }

  if (!artLayout) initializeDOM();
  updateArtTitle();

  // Limpar listas existentes
  Object.values(POSITION_MAP).forEach(positionId => {
    const container = document.getElementById(positionId);
    if (container) container.innerHTML = '';
  });

  const playersByPosition = {};
  const notFoundPlayers = [];

  playerData.forEach(player => {
    const positionKey = POSITION_MAP[player.posicao];
    if (!positionKey) return;

    const priceData = getPlayerPrice(player.nome, player.clube, player.posicao);
    if (!priceData.found) notFoundPlayers.push(`${player.nome} (${player.clube})`);

    if (!playersByPosition[positionKey]) playersByPosition[positionKey] = [];
    playersByPosition[positionKey].push(player);
  });

  showErrorMessages(notFoundPlayers);

  Object.entries(playersByPosition).forEach(([positionId, players]) => {
    const container = document.getElementById(positionId);
    if (!container) return;

    const sortedPlayers = players.sort((a, b) => {
      if (a.unanimidade && !b.unanimidade) return -1;
      if (!a.unanimidade && b.unanimidade) return 1;

      if (a.confianca !== b.confianca) return a.confianca.localeCompare(b.confianca);

      return a.nome.localeCompare(b.nome);
    });

    sortedPlayers.forEach(player => container.appendChild(createPlayerElement(player)));
  });

  applyDynamicLayout(playersByPosition);

  const exportButtons = document.querySelector('.export-buttons');
  if (exportButtons) exportButtons.style.display = 'flex';
}

function applyDynamicLayout(playersByPosition) {
  const row1Count = (playersByPosition.tecnicos?.length || 0) + (playersByPosition.goleiros?.length || 0);
  const row2Count = (playersByPosition.laterais?.length || 0) + (playersByPosition.zagueiros?.length || 0);
  const row3Count = (playersByPosition.meias?.length || 0) + (playersByPosition.atacantes?.length || 0);

  const baseWeight1 = 0.2;
  const baseWeight2 = 0.25;
  const baseWeight3 = 0.55;
  const playerWeight = 0.1;

  const row1Weight = Math.max(baseWeight1, baseWeight1 + (row1Count * playerWeight));
  const row2Weight = Math.max(baseWeight2, baseWeight2 + (row2Count * playerWeight));
  const row3Weight = Math.max(baseWeight3, baseWeight3 + (row3Count * playerWeight * 1.5));

  const totalWeight = row1Weight + row2Weight + row3Weight;
  const normalizedRow1 = (row1Weight / totalWeight * 3).toFixed(2);
  const normalizedRow2 = (row2Weight / totalWeight * 3).toFixed(2);
  const normalizedRow3 = (row3Weight / totalWeight * 3).toFixed(2);

  const positionsGrid = document.querySelector('.positions-grid');
  if (positionsGrid) {
    positionsGrid.style.gridTemplateRows = `${normalizedRow1}fr ${normalizedRow2}fr ${normalizedRow3}fr`;
  }
}

function createPlayerElement(player) {
  const playerRow = document.createElement('div');
  playerRow.className = 'player-row';

  const priceData = getPlayerPrice(player.nome, player.clube, player.posicao);
  if (!priceData.found) playerRow.classList.add('player-not-found');

  const playerInfo = document.createElement('div');
  playerInfo.className = 'player-info';

  const playerName = document.createElement('span');
  playerName.className = 'player-name';
  playerName.textContent = player.nome.toUpperCase();

  // Escudo
  const teamBadgeWrapper = document.createElement('div');
  teamBadgeWrapper.className = 'team-badge-wrapper';

  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '85');
  svg.setAttribute('height', '85');
  svg.setAttribute('viewBox', '0 0 85 85');
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  svg.style.zIndex = '0';

  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', '42.5');
  circle.setAttribute('cy', '42.5');
  circle.setAttribute('r', '42.5');
  circle.setAttribute('fill', '#ffffff');
  svg.appendChild(circle);
  teamBadgeWrapper.appendChild(svg);

  const teamBadge = document.createElement('img');
  teamBadge.className = 'team-badge-img';
  const clubFileName = normalizeClubName(player.clube);

  teamBadge.src = `public/escudos/${clubFileName}.png`;
  teamBadge.alt = player.clube;
  teamBadge.onerror = function () { this.style.display = 'none'; };
  teamBadgeWrapper.appendChild(teamBadge);

  // Ícones
  const playerIcons = document.createElement('div');
  playerIcons.className = 'player-icons';

  if (player.luxo) {
    const luxoIcon = document.createElement('img');
    luxoIcon.src = 'public/icons/luxo.svg';
    luxoIcon.className = 'icon';
    luxoIcon.alt = 'RL';
    playerIcons.appendChild(luxoIcon);
  }

  if (player.unanimidade) {
    const uniIcon = document.createElement('img');
    uniIcon.src = 'public/icons/estrela.svg';
    uniIcon.className = 'icon';
    uniIcon.alt = 'Unanimidade';
    playerIcons.appendChild(uniIcon);
  }

  if (player.capitao) {
    const capIcon = document.createElement('img');
    capIcon.src = 'public/icons/capitao.svg';
    capIcon.className = 'icon';
    capIcon.alt = 'Capitão';
    playerIcons.appendChild(capIcon);
  }

  // Confiança
  const confidenceLevel = document.createElement('div');
  confidenceLevel.className = `confidence-level confidence-${player.confianca}`;
  confidenceLevel.textContent = player.confianca;

  // Preço
  const playerPrice = document.createElement('span');
  playerPrice.className = 'player-price';
  if (!priceData.found) {
    playerPrice.classList.add('price-error');
    playerPrice.textContent = 'N/E';
  } else {
    const price = priceData.price || 0;
    playerPrice.textContent = Number(price).toFixed(1);
  }

  // MPV
  const playerMPV = document.createElement('span');
  playerMPV.className = 'player-mpv';

  if (priceData.found && priceData.player && priceData.player.atleta_id) {
    const mpv = getPlayerMPV(priceData.player.atleta_id);
    if (mpv !== null) {
      playerMPV.textContent = Number(mpv).toFixed(1);
      const colorClass = getMPVColorClass(player.posicao, mpv);
      if (colorClass) playerMPV.classList.add(colorClass);
    } else {
      playerMPV.textContent = '-';
    }
  } else {
    playerMPV.textContent = '-';
  }

  const playerDataContainer = document.createElement('div');
  playerDataContainer.className = 'player-data';
  playerDataContainer.appendChild(confidenceLevel);
  playerDataContainer.appendChild(playerPrice);
  playerDataContainer.appendChild(playerMPV);

  playerInfo.appendChild(teamBadgeWrapper);
  playerInfo.appendChild(playerName);
  playerInfo.appendChild(playerIcons);

  playerRow.appendChild(playerInfo);
  playerRow.appendChild(playerDataContainer);

  return playerRow;
}

// --------------------- EXPORT (MANTIDO) ---------------------
function generateCanvasImage() {
  return new Promise((resolve) => {
    ctx.fillStyle = '#1e3c72';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    html2canvas(artLayout, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      scale: 1,
      useCORS: true,
      allowTaint: true
    }).then(c => {
      ctx.drawImage(c, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      resolve();
    });
  });
}

function downloadImage(format = 'png') {
  const exportSize = document.getElementById('exportSize').value;
  const [width, height] = exportSize.split('x').map(Number);

  const originalWidth = artLayout.style.width;
  const originalHeight = artLayout.style.height;
  const originalTransform = artLayout.style.transform;
  const originalTransformOrigin = artLayout.style.transformOrigin;

  artLayout.style.width = width + 'px';
  artLayout.style.height = 'auto';
  artLayout.style.transform = 'scale(1)';
  artLayout.style.transformOrigin = 'top left';
  artLayout.style.position = 'relative';
  artLayout.style.left = '0';
  artLayout.style.top = '0';

  const scaleFactor = width / 2900;
  document.documentElement.style.setProperty('--export-scale', scaleFactor);

  artLayout.offsetHeight;

  const contentHeight = artLayout.scrollHeight;
  const safetyMargin = Math.floor(height * 0.02);
  const optimizedHeight = Math.min(contentHeight + safetyMargin, height);

  artLayout.style.height = optimizedHeight + 'px';

  artLayout.classList.remove('export-1450', 'export-2900', 'export-4350');
  if (width === 1450) artLayout.classList.add('export-1450');
  else if (width === 2900) artLayout.classList.add('export-2900');
  else if (width === 4350) artLayout.classList.add('export-4350');

  const maxCanvasSize = 16384;
  const maxPixels = 50000000;
  const totalPixels = width * height;

  let safeScale = 1;
  if (width >= 2900 || totalPixels > maxPixels) safeScale = 1;
  else safeScale = Math.min(2, maxCanvasSize / Math.max(width, height));

  html2canvas(artLayout, {
    width: width,
    height: optimizedHeight,
    scale: safeScale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#1a1a1a',
    logging: false,
    imageTimeout: 15000,
    removeContainer: true,
    foreignObjectRendering: false,
    scrollX: 0,
    scrollY: 0,
    x: 0,
    y: 0,
    windowWidth: width,
    windowHeight: optimizedHeight,
    onclone: function (clonedDoc) {
      const wrappers = clonedDoc.querySelectorAll('.team-badge-wrapper');
      wrappers.forEach(wrapper => {
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.background = '#ffffff';
      });
    }
  }).then(c => {
    artLayout.style.width = originalWidth;
    artLayout.style.height = originalHeight;
    artLayout.style.transform = originalTransform;
    artLayout.style.transformOrigin = originalTransformOrigin;
    document.documentElement.style.removeProperty('--export-scale');
    artLayout.classList.remove('export-1450', 'export-2900', 'export-4350');

    if (format === 'png') downloadPNG(c, exportSize);
    else if (format === 'pdf') downloadPDF(c, exportSize);
    else if (format === 'pdf-vector') downloadPDFVector(exportSize);
  }).catch(error => {
    console.error('Erro ao gerar imagem:', error);
    alert('Erro ao gerar imagem. Tente novamente.');

    artLayout.style.width = originalWidth;
    artLayout.style.height = originalHeight;
    artLayout.style.transform = originalTransform;
    artLayout.style.transformOrigin = originalTransformOrigin;
    document.documentElement.style.removeProperty('--export-scale');
  });
}

function downloadPNG(canvas, size) {
  const link = document.createElement('a');
  link.download = `dicas-por-posicao-${size}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  link.click();
}

function downloadPDF(canvas, size) {
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert('Biblioteca jsPDF não carregada. Baixando PNG ao invés.');
    downloadPNG(canvas, size);
    return;
  }

  const [width, height] = size.split('x').map(Number);
  const pdf = new jsPDF({
    orientation: height > width ? 'portrait' : 'landscape',
    unit: 'px',
    format: [width, height]
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  pdf.addImage(imgData, 'PNG', 0, 0, width, height);
  pdf.save(`dicas-por-posicao-${size}.pdf`);
}

function downloadPDFVector(size) {
  alert('Exportação PDF vetorial requer servidor. Baixando PDF rápido ao invés.');
  downloadImage('pdf');
}

// Carregar html2canvas se necessário
if (typeof html2canvas === 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  document.head.appendChild(script);
}
