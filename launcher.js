// ── Helpers ────────────────────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }
function $(id) { return document.getElementById(id); }

// ── Defaults ───────────────────────────────────────────────────────────────
const DEFAULTS = {
  title: 'Launcher', showTitle: false,
  bg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
  linkTarget: '_blank',
  useBingBg: false,
  pinnedBgs: [],
  tutorialSeen: false,
  theme: {
    colorTheme: 'default',
    accentColor: '#7c9ef0',
    fontPairing: 'default',
    iconSize: 'medium',
    tileOpacity: 6,
    tileBlur: 12,
    clockFont: 'serif',
  },
  groups: ['Work','Personal','Tools'],
  tiles: [
    { id:uid(), name:'Gmail',    url:'https://mail.google.com',       group:'Work' },
    { id:uid(), name:'Outlook',  url:'https://outlook.office365.com', group:'Work' },
    { id:uid(), name:'Slack',    url:'https://slack.com',             group:'Work' },
    { id:uid(), name:'Teams',    url:'https://teams.microsoft.com',   group:'Work' },
    { id:uid(), name:'LinkedIn', url:'https://linkedin.com',          group:'Work' },
    { id:uid(), name:'GitHub',   url:'https://github.com',            group:'Tools' },
    { id:uid(), name:'ChatGPT',  url:'https://chatgpt.com',           group:'Tools' },
    { id:uid(), name:'Claude',   url:'https://claude.ai',             group:'Tools' },
    { id:uid(), name:'Notion',   url:'https://notion.so',             group:'Tools' },
    { id:uid(), name:'YouTube',  url:'https://youtube.com',           group:'Personal' },
    { id:uid(), name:'News',     url:'https://news.google.com',       group:'Personal' },
  ]
};

// ── State ─────────────────────────────────────────────────────────────────
// Startup priority: 1) localStorage  2) config.json  3) built-in defaults
// Changes save to localStorage automatically.
// 💾 downloads config.json for backup or setting up a new machine.

let state = JSON.parse(JSON.stringify(DEFAULTS));

function applyDefaults(s) {
  if (s.showTitle === undefined) s.showTitle = false;
  if (s.linkTarget === undefined) s.linkTarget = '_blank';
  if (s.weather === undefined) s.weather = { enabled: false, lat: '', lon: '', tz: 'UTC', locationName: '' };
  if (s.pinnedBgs === undefined) s.pinnedBgs = [];
  if (s.tutorialSeen === undefined) s.tutorialSeen = false;
  if (s.theme === undefined) s.theme = JSON.parse(JSON.stringify(DEFAULTS.theme));
  // Fill in any missing theme keys (for upgrades from older configs)
  const dt = DEFAULTS.theme;
  Object.keys(dt).forEach(k => { if (s.theme[k] === undefined) s.theme[k] = dt[k]; });
  return s;
}

// ── Theme Engine ───────────────────────────────────────────────────────────
const COLOR_THEMES = {
  default:   { name: 'Deep Blue',    surface: '255,255,255', accent: '#7c9ef0', bg: 'rgba(0,0,0,0.55)' },
  midnight:  { name: 'Midnight',     surface: '255,255,255', accent: '#a78bfa', bg: 'rgba(10,5,30,0.65)' },
  slate:     { name: 'Warm Slate',   surface: '255,255,255', accent: '#f0a87c', bg: 'rgba(0,0,0,0.50)' },
  forest:    { name: 'Forest',       surface: '200,255,210', accent: '#6ee7a0', bg: 'rgba(0,15,5,0.60)' },
  rose:      { name: 'Rose',         surface: '255,220,230', accent: '#f472b6', bg: 'rgba(20,0,10,0.58)' },
  gold:      { name: 'Gold',         surface: '255,240,200', accent: '#fbbf24', bg: 'rgba(15,10,0,0.60)' },
  ice:       { name: 'Ice',          surface: '200,235,255', accent: '#67e8f9', bg: 'rgba(0,10,20,0.55)' },
  mono:      { name: 'Monochrome',   surface: '255,255,255', accent: '#e0e0e0', bg: 'rgba(0,0,0,0.60)' },
};

const FONT_PAIRINGS = {
  default:    { name: 'DM Sans + DM Serif',   body: "'DM Sans', sans-serif",          display: "'DM Serif Display', serif",   url: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap' },
  editorial:  { name: 'Playfair + Source Sans', body: "'Source Sans 3', sans-serif",  display: "'Playfair Display', serif",   url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@300;400;600&display=swap' },
  modern:     { name: 'Outfit + Fraunces',    body: "'Outfit', sans-serif",            display: "'Fraunces', serif",           url: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,700&family=Outfit:wght@300;400;500;600&display=swap' },
  techno:     { name: 'Space Grotesk + Syne', body: "'Space Grotesk', sans-serif",    display: "'Syne', sans-serif",          url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&family=Syne:wght@700;800&display=swap' },
  elegant:    { name: 'Cormorant + Jost',     body: "'Jost', sans-serif",             display: "'Cormorant Garamond', serif", url: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Jost:wght@300;400;500&display=swap' },
  mono:       { name: 'Geist Mono',           body: "'Geist Mono', monospace",        display: "'Geist Mono', monospace",     url: 'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&display=swap' },
};

const ICON_SIZES = {
  small:  { tileW: '72px',  tileH: '64px',  iconSize: '22px' },
  medium: { tileW: '90px',  tileH: '80px',  iconSize: '28px' },
  large:  { tileW: '112px', tileH: '98px',  iconSize: '36px' },
  xlarge: { tileW: '132px', tileH: '116px', iconSize: '44px' },
};

let _loadedFontUrl = '';

function applyTheme() {
  const t = state.theme || DEFAULTS.theme;
  const root = document.documentElement;
  const theme = COLOR_THEMES[t.colorTheme] || COLOR_THEMES.default;
  const pairing = FONT_PAIRINGS[t.fontPairing] || FONT_PAIRINGS.default;
  const sizes = ICON_SIZES[t.iconSize] || ICON_SIZES.medium;

  // Accent — user override wins, else theme default
  const accent = t.accentColor || theme.accent;
  const accentRgb = hexToRgb(accent);
  const accentDim = accentRgb ? `rgba(${accentRgb},0.18)` : 'rgba(124,158,240,0.18)';

  // Surface uses theme surface tint + user opacity
  const opacity = (parseInt(t.tileOpacity) || 6) / 100;
  const blur = parseInt(t.tileBlur) || 12;

  root.style.setProperty('--surface', `rgba(${theme.surface},${opacity})`);
  root.style.setProperty('--surface-hover', `rgba(${theme.surface},${opacity + 0.05})`);
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-dim', accentDim);
  root.style.setProperty('--tile-blur', `${blur}px`);
  root.style.setProperty('--tile-w', sizes.tileW);
  root.style.setProperty('--tile-h', sizes.tileH);
  root.style.setProperty('--icon-size', sizes.iconSize);

  // Overlay tint on bg
  const bgEl = $('bg');
  if (bgEl) {
    const after = bgEl.querySelector('::after'); // won't work directly; use data-attr approach
    bgEl.dataset.overlayColor = theme.bg;
    // Inject a dynamic style for the pseudo-element
    let styleEl = document.getElementById('dynamic-theme-style');
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'dynamic-theme-style'; document.head.appendChild(styleEl); }
    styleEl.textContent = `
      #bg::after { background: linear-gradient(160deg, ${theme.bg.replace('rgba','rgba').replace('0.55','0.6')} 0%, ${theme.bg.replace('rgba','rgba').replace('0.55','0.35')} 100%) !important; }
      .tile { backdrop-filter: blur(${blur}px) !important; -webkit-backdrop-filter: blur(${blur}px) !important; }
      #clock { font-family: ${t.clockFont === 'mono' ? "'Geist Mono', 'Courier New', monospace" : t.clockFont === 'sans' ? "var(--font-body)" : "var(--font-display)"} !important; }
      body { font-family: var(--font-body) !important; }
      #clock, .modal h2, #site-title, .weather-temp { font-family: var(--font-display) !important; }
      ${t.clockFont === 'mono' ? '#clock { font-family: "Geist Mono", monospace !important; letter-spacing: 0.08em !important; }' : ''}
    `;

    // Load font if needed
    if (pairing.url && pairing.url !== _loadedFontUrl) {
      _loadedFontUrl = pairing.url;
      // Remove old dynamic font links
      document.querySelectorAll('link[data-dynamic-font]').forEach(l => l.remove());
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = pairing.url; link.dataset.dynamicFont = '1';
      document.head.appendChild(link);
    }
    root.style.setProperty('--font-body', pairing.body);
    root.style.setProperty('--font-display', pairing.display);
  }
}

function hexToRgb(hex) {
  if (!hex) return null;
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : null;
}

// Populate theme UI controls from state
function syncThemeUI() {
  const t = state.theme || DEFAULTS.theme;

  // Color theme buttons
  document.querySelectorAll('.color-theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === t.colorTheme);
  });

  // Font pairing select
  const fontSel = $('font-pairing-select');
  if (fontSel) fontSel.value = t.fontPairing || 'default';

  // Icon size buttons
  document.querySelectorAll('.icon-size-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.size === t.iconSize);
  });

  // Clock font buttons
  document.querySelectorAll('.clock-font-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.clockfont === t.clockFont);
  });

  // Sliders
  const opSlider = $('slider-tile-opacity');
  if (opSlider) { opSlider.value = t.tileOpacity; $('val-tile-opacity').textContent = t.tileOpacity + '%'; }
  const blurSlider = $('slider-tile-blur');
  if (blurSlider) { blurSlider.value = t.tileBlur; $('val-tile-blur').textContent = t.tileBlur + 'px'; }

  // Accent colour
  const accentInput = $('accent-color-input');
  if (accentInput) accentInput.value = t.accentColor || COLOR_THEMES[t.colorTheme]?.accent || '#7c9ef0';
}

// ── Tutorial ───────────────────────────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    target: null,
    title: 'Welcome to Launcher 👋',
    body: 'This quick tour will show you everything in about 30 seconds. You can skip at any time.',
    position: 'center',
  },
  {
    target: '#search',
    title: 'Search the web',
    body: 'Type here and press Enter to search Google. Press <kbd>/</kbd> anywhere on the page to jump straight to this box.',
    position: 'bottom',
  },
  {
    target: '#clock-wrap',
    title: 'Clock & date',
    body: 'The clock and date are always front and centre. You can enable a live weather widget in Settings → Weather.',
    position: 'bottom',
  },
  {
    target: '#groups',
    title: 'Your site tiles',
    body: 'Click any tile to open that site. Tiles are organised into groups — Work, Personal, Tools — and you can add as many as you like.',
    position: 'top',
  },
  {
    target: '#btn-edit',
    title: 'Edit mode',
    body: 'Click the pencil icon (or press <kbd>E</kbd>) to enter Edit Mode. You can then drag tiles to reorder them, add new ones, rename groups, or delete anything you don\'t need.',
    position: 'top',
  },
  {
    target: '#btn-settings',
    title: 'Settings',
    body: 'Open Settings to change your background, pick a colour theme, adjust fonts and tile sizes, set up weather, and manage groups.',
    position: 'top',
  },
  {
    target: '#btn-save-config',
    title: 'Export & Import',
    body: 'Use the download button to save your config as a <code>config.json</code> file — great for backing up or sharing your setup with someone else. The upload button imports it back.',
    position: 'top',
  },
  {
    target: null,
    title: 'You\'re all set! 🚀',
    body: 'That\'s everything. Remember: <kbd>E</kbd> for Edit Mode, <kbd>/</kbd> to search. You can replay this tour any time from Settings → General.',
    position: 'center',
  },
];

let tutorialStep = 0;
let tutorialActive = false;

function startTutorial() {
  tutorialStep = 0;
  tutorialActive = true;
  // Make sure edit mode is off so highlighted elements are in normal state
  if (editMode) toggleEdit();
  showTutorialStep();
}

function showTutorialStep() {
  const overlay = $('tutorial-overlay');
  const spotlight = $('tutorial-spotlight');
  const card = $('tutorial-card');
  if (!overlay) return;

  const step = TUTORIAL_STEPS[tutorialStep];
  const total = TUTORIAL_STEPS.length;
  const isFirst = tutorialStep === 0;
  const isLast = tutorialStep === total - 1;

  // Update progress pips
  const pips = $('tutorial-pips');
  pips.innerHTML = TUTORIAL_STEPS.map((_, i) =>
    `<div class="tut-pip${i === tutorialStep ? ' active' : ''}"></div>`
  ).join('');

  // Update text
  $('tutorial-title').innerHTML = step.title;
  $('tutorial-body').innerHTML = step.body;
  $('tutorial-next').textContent = isLast ? 'Done' : 'Next →';
  $('tutorial-prev').style.visibility = isFirst ? 'hidden' : 'visible';
  $('tutorial-step-count').textContent = (tutorialStep + 1) + ' of ' + total;

  overlay.classList.add('visible');

  if (!step.target) {
    // Centred card, no spotlight
    spotlight.style.display = 'none';
    positionCard(card, null, 'center');
    return;
  }

  const el = document.querySelector(step.target);
  if (!el) {
    spotlight.style.display = 'none';
    positionCard(card, null, 'center');
    return;
  }

  // Scroll element into view then position
  el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  requestAnimationFrame(() => {
    const rect = el.getBoundingClientRect();
    const pad = 10;

    spotlight.style.display = 'block';
    spotlight.style.left   = (rect.left   - pad) + 'px';
    spotlight.style.top    = (rect.top    - pad) + 'px';
    spotlight.style.width  = (rect.width  + pad * 2) + 'px';
    spotlight.style.height = (rect.height + pad * 2) + 'px';

    positionCard(card, rect, step.position);
  });
}

function positionCard(card, rect, position) {
  const margin = 18;
  const cardW = 320;
  // Reset
  card.style.left = ''; card.style.right = ''; card.style.top = ''; card.style.bottom = ''; card.style.transform = '';

  if (position === 'center' || !rect) {
    card.style.left = '50%';
    card.style.top  = '50%';
    card.style.transform = 'translate(-50%, -50%)';
    return;
  }

  // Horizontal: centre on element, clamp to viewport
  const elCentreX = rect.left + rect.width / 2;
  let cardLeft = elCentreX - cardW / 2;
  cardLeft = Math.max(margin, Math.min(cardLeft, window.innerWidth - cardW - margin));
  card.style.left = cardLeft + 'px';

  if (position === 'bottom') {
    card.style.top = (rect.bottom + margin) + 'px';
  } else {
    // top
    card.style.bottom = (window.innerHeight - rect.top + margin) + 'px';
  }
}

function tutorialNext() {
  if (tutorialStep < TUTORIAL_STEPS.length - 1) {
    tutorialStep++;
    showTutorialStep();
  } else {
    endTutorial(true);
  }
}

function tutorialPrev() {
  if (tutorialStep > 0) { tutorialStep--; showTutorialStep(); }
}

function endTutorial(completed) {
  tutorialActive = false;
  const overlay = $('tutorial-overlay');
  if (overlay) overlay.classList.remove('visible');
  if (completed) {
    state.tutorialSeen = true;
    persist();
    // Sync the toggle in settings if it's open
    const tog = $('toggle-tutorial');
    if (tog) tog.checked = false;
  }
}

function maybeStartTutorial() {
  if (!state.tutorialSeen) {
    // Small delay so the page finishes rendering first
    setTimeout(startTutorial, 600);
  }
}

// ── Layout: keep #groups below the fixed clock/weather block ──────────────
function adjustGroupsOffset() {
  const block = $('clock-weather-block');
  const groups = $('groups');
  if (!block || !groups) return;
  const blockBottom = block.getBoundingClientRect().bottom;
  const appTop = $('app').getBoundingClientRect().top;
  const gap = 8; // px breathing room below the block
  groups.style.marginTop = Math.max(blockBottom - appTop + gap, 20) + 'px';
}

// Save to localStorage — called after every change
function persist() {
  localStorage.setItem('launcher_config', JSON.stringify(state));
}

// Download config.json — for backup / new machine setup
/*function saveConfig() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'config.json'; a.click();
  URL.revokeObjectURL(url);
  const btn = $('btn-save-config');
  const orig = btn.textContent;
  btn.textContent = '✓';
  setTimeout(() => btn.textContent = orig, 1500);
}*/
function saveConfig() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'config.json'; a.click();
  URL.revokeObjectURL(url);
  
  // Find the internal material icon span element
  const btn = $('btn-save-config');
  const iconSpan = btn.querySelector('.material-symbols-rounded');
  
  if (iconSpan) {
    // Swap the text ligature from 'download' to 'check'
    iconSpan.textContent = 'check';
    
    // Smoothly snap it back to 'download' after 1.5 seconds
    setTimeout(() => {
      iconSpan.textContent = 'download';
    }, 1500);
  }
}

function importConfig(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      state = applyDefaults(imported);
      persist();
      render();
      applyWeatherVisibility();
      // Brief feedback on import button
      const btn = $('btn-import-config');
      const iconSpan = btn.querySelector('.material-symbols-rounded');
      if (iconSpan) {
        iconSpan.textContent = 'check';
        setTimeout(() => iconSpan.textContent = 'upload', 1500);
      }
      // Refresh pinned bgs shelf if settings modal happens to be open
      renderPinnedBgs();
    } catch(err) {
      alert('Could not read config.json — make sure it is a valid Launcher config file.');
    }
  };
  reader.readAsText(file);
}

// Load on startup:
//   1. localStorage (instant, always up to date)
//   2. config.json  (first run on a new machine)
//   3. built-in defaults
async function loadConfig() {
  // 1. Try localStorage first
  try {
    const cached = localStorage.getItem('launcher_config');
    if (cached) {
      state = applyDefaults(JSON.parse(cached));
      return;
    }
  } catch(e) {}

  // 2. Try config.json (new machine, or localStorage was cleared)
  try {
    const configUrl = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL)
      ? chrome.runtime.getURL('config.json') + '?_=' + Date.now()
      : 'config.json?_=' + Date.now();
    const res = await fetch(configUrl);
    if (!res.ok) throw new Error('not found');
    const loaded = await res.json();
    state = applyDefaults(loaded);
    persist(); // seed localStorage from config.json
    return;
  } catch(e) {}

  // 3. Fall back to built-in defaults
  state = applyDefaults(JSON.parse(JSON.stringify(DEFAULTS)));
  persist();
}




// ── Forecast popup ─────────────────────────────────────────────────────────
let lastDailyData = null;
let forecastVisible = false;

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildForecastPopup(d) {
  const popup = $('forecast-popup');
  if (!d) { popup.innerHTML = ''; return; }
  const today = new Date().getDay();
  popup.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    const date = new Date(d.time[i]);
    const dayName = i === 0 ? 'Today' : DAY_NAMES[date.getDay()];
    const icon = materialIcon(weatherIcon(d.weather_code[i], 1)); // use day icon for forecast
    const max = Math.round(d.temperature_2m_max[i]);
    const min = Math.round(d.temperature_2m_min[i]);
    const prob = d.precipitation_probability_max[i];
    const sum  = d.precipitation_sum[i];

    const row = document.createElement('div');
    row.className = 'forecast-row' + (i === 0 ? ' today' : '');

    const rainText = prob + '%';
    const amountText = sum > 0 ? sum + ' mm' : '';

    row.innerHTML =
      '<span class="forecast-day">' + dayName + '</span>' +
      '<span class="forecast-icon">' + icon + '</span>' +
      '<span class="forecast-minmax">' + min + '° / ' + max + '°</span>' +
      '<span class="forecast-rain">' + materialIcon('water_drop') + ' ' + rainText + '</span>' +
      '<span class="forecast-amount">' + amountText + '</span>';

    popup.appendChild(row);
  }
}

function toggleForecast(e) {
  e.stopPropagation();
  forecastVisible = !forecastVisible;
  $('forecast-popup').classList.toggle('visible', forecastVisible);
}

function hideForecast() {
  forecastVisible = false;
  $('forecast-popup').classList.remove('visible');
}

// ── Geocoding ──────────────────────────────────────────────────────────────
async function searchLocation(query, countryCode) {
  // Request more results so client-side filtering still leaves enough to choose from
  const count = countryCode ? 20 : 10;
  const url = 'https://geocoding-api.open-meteo.com/v1/search?name='
    + encodeURIComponent(query) + '&count=' + count + '&language=en&format=json';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  const data = await res.json();
  let results = data.results || [];
  // The API countrycode param is unreliable — filter client-side instead
  if (countryCode) {
    results = results.filter(r => r.country_code && r.country_code.toUpperCase() === countryCode.toUpperCase());
  }
  return results;
}

function showLocationResults(results) {
  const container = $('weather-search-results');
  container.innerHTML = '';
  if (!results.length) {
    container.innerHTML = '<div style="font-size:0.8rem;color:rgba(255,255,255,0.35);padding:0.4rem 0">No results found</div>';
    container.style.display = 'flex';
    return;
  }
  results.forEach(r => {
    const item = document.createElement('div');
    item.className = 'weather-result-item';
    const parts = [r.admin1, r.admin2, r.country].filter(Boolean);
    item.innerHTML = '<div class="weather-result-name">' + r.name + '</div>'
      + '<div class="weather-result-detail">' + parts.join(', ') + ' · ' + r.latitude.toFixed(4) + ', ' + r.longitude.toFixed(4) + '</div>';
    item.addEventListener('click', () => applyLocationResult(r));
    container.appendChild(item);
  });
  container.style.display = 'flex';
}

function applyLocationResult(r) {
  // Fill in all fields
  const displayName = r.name + (r.admin1 ? ', ' + r.admin1 : '') + (r.country ? ', ' + r.country : '');
  $('weather-location-name').value = displayName;
  $('weather-lat').value  = r.latitude;
  $('weather-lon').value  = r.longitude;
  $('weather-tz').value   = r.timezone || 'UTC';
  $('weather-search').value = displayName;
  // Hide results
  $('weather-search-results').style.display = 'none';
}

// ── Weather ────────────────────────────────────────────────────────────────
// WMO weather code → Material Symbols icon name
function weatherDescription(code) {
  const d = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Icy fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    56: 'Light freezing drizzle', 57: 'Freezing drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    66: 'Light freezing rain', 67: 'Freezing rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Light showers', 81: 'Showers', 82: 'Heavy showers',
    85: 'Snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
  };
  return d[code] || 'Unknown';
}

function weatherIcon(code, isDay) {
  if (code === 0)               return isDay ? 'clear_day'            : 'clear_night';
  if (code <= 2)                return isDay ? 'partly_cloudy_day'    : 'partly_cloudy_night';
  if (code === 3)               return 'cloudy';
  if (code <= 49)               return 'foggy';                        // fog, haze, rime
  if (code <= 59)               return isDay ? 'rainy_light'          : 'rainy_light';   // drizzle
  if (code <= 69)               return 'rainy';                        // rain
  if (code === 70 || code === 71 || code === 73 || code === 75 || code === 77) return 'weather_snowy'; // snow
  if (code === 72 || code === 74 || code === 76) return 'snowing_heavy';
  if (code <= 82)               return isDay ? 'rainy'                : 'rainy';         // showers
  if (code <= 84)               return 'weather_snowy';                // snow showers
  if (code <= 86)               return 'snowing_heavy';
  if (code <= 99)               return 'thunderstorm';                 // thunderstorm
  return 'thermometer';
}

function materialIcon(name) {
  return '<span class="material-symbols-rounded">' + name + '</span>';
}

function windDirection(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

async function fetchWeather() {
  const w = state.weather;
  if (!w || !w.enabled || !w.lat || !w.lon) return;
  try {
    const url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=' + w.lat
      + '&longitude=' + w.lon
      + '&current=temperature_2m,apparent_temperature,is_day,precipitation,cloud_cover,wind_speed_10m,wind_direction_10m,weather_code'
      + '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code'
      + '&forecast_days=7'
      + '&timezone=' + encodeURIComponent(w.tz || 'UTC');
    const res = await fetch(url);
    if (!res.ok) throw new Error('weather fetch failed');
    const data = await res.json();
    const c = data.current;
    const d = data.daily;
    lastDailyData = d; // store for popup
    buildForecastPopup(d);

    // Current conditions
    $('w-icon').innerHTML    = materialIcon(weatherIcon(c.weather_code, c.is_day));
    $('w-temp').textContent  = Math.round(c.temperature_2m) + '°C';
    $('w-feels').textContent = 'Feels like ' + Math.round(c.apparent_temperature) + '°C';
    $('w-condition').textContent = weatherDescription(c.weather_code);
    $('w-cloud').innerHTML   = materialIcon('cloud') + ' ' + c.cloud_cover + '%';
    $('w-wind').innerHTML    = materialIcon('air') + ' ' + Math.round(c.wind_speed_10m) + ' km/h ' + windDirection(c.wind_direction_10m);

    // Today's daily values (index 0 = today)
    const maxTemp   = Math.round(d.temperature_2m_max[0]);
    const minTemp   = Math.round(d.temperature_2m_min[0]);
    const rainProb  = d.precipitation_probability_max[0];
    const rainSum   = d.precipitation_sum[0];

    $('w-minmax').innerHTML  = materialIcon('thermostat') + ' ' + minTemp + '° / ' + maxTemp + '°';

    // Rain line: only show mm if there's meaningful precipitation
    let rainText = rainProb + '% chance of rain';
    if (rainSum > 0) rainText = rainProb + '% chance of ' + rainSum + ' mm';
    $('w-precip').innerHTML  = materialIcon('water_drop') + ' ' + rainText;

    // Location label
    const locEl = $('weather-location');
    locEl.textContent = w.locationName || '';
    locEl.classList.toggle('hidden', !w.locationName);

    $('weather-wrap').classList.remove('hidden');
  } catch(e) {
    console.warn('Weather fetch failed:', e);
  }
}

function applyWeatherVisibility() {
  const enabled = state.weather && state.weather.enabled;
  $('weather-wrap').classList.toggle('hidden', !enabled);
  const locEl = $('weather-location');
  if (!enabled) locEl.classList.add('hidden');
  if (enabled) fetchWeather();
  // Recalculate groups offset since weather widget changes block height
  requestAnimationFrame(adjustGroupsOffset);
}

// ── Clock ──────────────────────────────────────────────────────────────────
function tick() {
  const n = new Date();
  $('clock').textContent = String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  $('date-str').textContent = days[n.getDay()] + ', ' + n.getDate() + ' ' + months[n.getMonth()] + ' ' + n.getFullYear();
}
setInterval(tick, 1000); tick();

// ── Background ─────────────────────────────────────────────────────────────
const BG_PRESETS = [
  { label:'Mountains', url:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80', thumb:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=120&q=60' },
  { label:'Forest',    url:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&q=80', thumb:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=120&q=60' },
  { label:'Ocean',     url:'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1600&q=80', thumb:'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=120&q=60' },
  { label:'City night',url:'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&q=80', thumb:'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=120&q=60' },
  { label:'Desert',    url:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80', thumb:'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=120&q=60' },
  { label:'Abstract',  url:'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1600&q=80', thumb:'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=120&q=60' },
];

function applyBg(url) {
  $('bg').style.backgroundImage = 'url(' + url + ')';
  state.bg = url; 
  
  // Turn off automated Bing background if an explicit preset is chosen
  state.useBingBg = false;
  if ($('toggle-bing-bg')) $('toggle-bing-bg').checked = false;
  
  persist(); // Keeps your original saving mechanism intact
  document.querySelectorAll('.bg-preset').forEach(p => p.classList.toggle('active', p.dataset.url === url));
}

// ── Title ──────────────────────────────────────────────────────────────────
function applyTitleVisibility() {
  const el = $('site-title');
  el.textContent = state.title || 'Launcher';
  el.classList.toggle('visible', !!state.showTitle);
  document.title = state.title || 'Launcher';
}

// ── Icon helpers ───────────────────────────────────────────────────────────
function faviconUrl(url) {
  try { return 'https://www.google.com/s2/favicons?domain=' + new URL(url).hostname + '&sz=64'; }
  catch(e) { return ''; }
}

function makeIconEl(tile) {
  const wrap = document.createElement('div');
  wrap.className = 'tile-icon';
  if (tile.iconUrl) {
    wrap.classList.add('custom-img');
    const img = document.createElement('img');
    img.src = tile.iconUrl;
    img.onerror = () => { wrap.innerHTML = ''; wrap.classList.add('letter'); wrap.textContent = tile.name.charAt(0).toUpperCase(); };
    wrap.appendChild(img);
  } else {
    const img = document.createElement('img');
    img.src = faviconUrl(tile.url);
    img.alt = tile.name;
    img.onerror = () => { wrap.innerHTML = ''; wrap.classList.add('letter'); wrap.textContent = tile.name.charAt(0).toUpperCase(); };
    wrap.appendChild(img);
  }
  return wrap;
}

// ── Icon tab switching ─────────────────────────────────────────────────────
let iconTabMode = 'auto';

function switchIconTab(mode) {
  iconTabMode = mode;
  $('tab-auto').classList.toggle('active', mode === 'auto');
  $('tab-custom').classList.toggle('active', mode === 'custom');
  $('icon-auto-section').style.display = mode === 'auto' ? 'block' : 'none';
  $('icon-custom-section').style.display = mode === 'custom' ? 'block' : 'none';
}

function refreshFaviconPreview() {
  const url = $('t-url').value.trim();
  const preview = $('favicon-preview');
  preview.innerHTML = '';
  if (url) {
    const img = document.createElement('img');
    img.src = faviconUrl(url);
    preview.appendChild(img);
  }
}

function refreshCustomIconPreview() {
  const url = $('t-icon-url').value.trim();
  const preview = $('custom-icon-preview');
  preview.innerHTML = '';
  if (url) {
    const img = document.createElement('img');
    img.src = url;
    preview.appendChild(img);
  }
}

// ── Render ─────────────────────────────────────────────────────────────────
let editMode = false;

function render() {
  applyTitleVisibility();
  applyTheme();
  
  // 1. Sync the checkbox toggle visual state in the modal
  if ($('toggle-bing-bg')) {
    $('toggle-bing-bg').checked = !!state.useBingBg;
  }

  // 2. Hide manual inputs if Bing is enabled, show them if it's disabled
  if ($('manual-bg-section')) {
    $('manual-bg-section').style.display = state.useBingBg ? 'none' : 'block';
  }

  // 3. Pick the appropriate rendering pipeline
  if (state.useBingBg) {
    fetchBingImageOfTheDay();
  } else {
    $('bg').style.backgroundImage = 'url(' + (state.bg || DEFAULTS.bg) + ')';
  }

  const container = $('groups');
  container.innerHTML = '';

  state.groups.forEach(group => {
    const tiles = state.tiles.filter(t => t.group === group);
    const groupEl = document.createElement('div');

    const label = document.createElement('div');
    label.className = 'group-label';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'group-label-text';
    nameSpan.textContent = group;
    if (editMode) nameSpan.addEventListener('click', () => openRenameGroup(group));
    label.appendChild(nameSpan);
    if (editMode) {
      const btn = document.createElement('button');
      btn.textContent = '× remove';
      btn.addEventListener('click', () => removeGroup(group));
      label.appendChild(btn);
    }
    groupEl.appendChild(label);

    const row = document.createElement('div');
    row.className = 'tile-row';
    row.dataset.group = group;
    setupTileDropZone(row, group);
    tiles.forEach(t => row.appendChild(makeTile(t)));

    if (editMode) {
      const add = document.createElement('div');
      add.className = 'add-tile';
      add.innerHTML = '<span class="add-tile-icon">＋</span><span>Add</span>';
      add.addEventListener('click', () => openAddTile(group));
      row.appendChild(add);
    }

    groupEl.appendChild(row);
    container.appendChild(groupEl);
  });

  // Recalculate offset after DOM updates
  requestAnimationFrame(adjustGroupsOffset);
}

async function fetchBingImageOfTheDay() {
  try {
    const response = await fetch("https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-AU");
    if (!response.ok) throw new Error("Network response error");
    
    const payload = await response.json();
    if (payload && payload.images && payload.images.length > 0) {
      const resolvedPath = "https://www.bing.com" + payload.images[0].url;
      
      // Paint the CSS canvas wrapper without touching your toggle flags
      $('bg').style.backgroundImage = 'url(' + resolvedPath + ')';
      state.bg = resolvedPath;
      
      // Sync the placeholder textbox helper if present
      if ($('custom-bg')) {
        $('custom-bg').value = resolvedPath;
      }
    }
  } catch (error) {
    console.error("Automated background fetch sync failure:", error);
  }
}

function makeTile(tile) {
  const el = document.createElement('div');
  el.className = 'tile'; el.dataset.id = tile.id; el.draggable = true;
  el.appendChild(makeIconEl(tile));

  const name = document.createElement('div');
  name.className = 'tile-name'; name.textContent = tile.name;
  el.appendChild(name);

  const ctrl = document.createElement('div');
  ctrl.className = 'tile-controls';
  const editBtn = document.createElement('button');
  editBtn.className = 'tile-ctrl-btn edit'; editBtn.innerHTML = '<span class="material-symbols-rounded">edit</span>';
  editBtn.addEventListener('click', e => { e.stopPropagation(); openEditTile(tile.id); });
  const delBtn = document.createElement('button');
  delBtn.className = 'tile-ctrl-btn del'; delBtn.innerHTML = '<span class="material-symbols-rounded">close</span>';
  delBtn.addEventListener('click', e => { e.stopPropagation(); deleteTile(tile.id); });
  ctrl.appendChild(editBtn); ctrl.appendChild(delBtn);
  el.appendChild(ctrl);

  el.addEventListener('click', () => {
    if (!editMode) window.open(tile.url, state.linkTarget || '_blank');
  });
  el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', tile.id); setTimeout(() => el.classList.add('dragging'), 0); });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));
  return el;
}

// ── Tile drag & drop ───────────────────────────────────────────────────────
function setupTileDropZone(row, group) {
  row.addEventListener('dragover', e => {
    e.preventDefault(); row.classList.add('drag-over');
    const dragging = document.querySelector('.tile.dragging');
    if (!dragging) return;
    const after = [...row.querySelectorAll('.tile:not(.dragging)')].find(el => e.clientX < el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2);
    const addBtn = row.querySelector('.add-tile');
    if (after) row.insertBefore(dragging, after);
    else if (addBtn) row.insertBefore(dragging, addBtn);
    else row.appendChild(dragging);
  });
  row.addEventListener('dragleave', e => { if (!row.contains(e.relatedTarget)) row.classList.remove('drag-over'); });
  row.addEventListener('drop', e => {
    e.preventDefault(); row.classList.remove('drag-over');
    const id = e.dataTransfer.getData('text/plain');
    const tile = state.tiles.find(t => t.id === id);
    if (!tile) return;
    tile.group = group;
    const ordered = [];
    row.querySelectorAll('.tile').forEach(el => { const t = state.tiles.find(t => t.id === el.dataset.id); if (t) ordered.push(t); });
    state.tiles = state.tiles.filter(t => t.group !== group);
    state.tiles.push(...ordered);
    persist(); render();
  });
}

// ── Tile CRUD ──────────────────────────────────────────────────────────────
let editingTileId = null;

function openAddTile(group) {
  editingTileId = null;
  $('tile-modal-title').textContent = 'Add site';
  $('t-name').value = ''; $('t-url').value = ''; $('t-icon-url').value = '';
  $('favicon-preview').innerHTML = ''; $('custom-icon-preview').innerHTML = '';
  switchIconTab('auto');
  populateGroupSelect(group);
  openModal('tile-modal');
  setTimeout(() => $('t-name').focus(), 80);
}

function openEditTile(id) {
  editingTileId = id;
  const t = state.tiles.find(t => t.id === id); if (!t) return;
  $('tile-modal-title').textContent = 'Edit site';
  $('t-name').value = t.name; $('t-url').value = t.url;
  $('t-icon-url').value = t.iconUrl || '';
  if (t.iconUrl) {
    switchIconTab('custom');
    $('custom-icon-preview').innerHTML = '';
    const img = document.createElement('img'); img.src = t.iconUrl;
    $('custom-icon-preview').appendChild(img);
  } else {
    switchIconTab('auto');
    refreshFaviconPreview();
  }
  populateGroupSelect(t.group);
  openModal('tile-modal');
}

function populateGroupSelect(selected) {
  $('t-group').innerHTML = state.groups.map(g => '<option value="' + g + '"' + (g===selected?' selected':'') + '>' + g + '</option>').join('');
}

function saveTile() {
  let url = $('t-url').value.trim();
  const name = $('t-name').value.trim();
  const group = $('t-group').value;
  const iconUrl = iconTabMode === 'custom' ? $('t-icon-url').value.trim() : '';
  if (!name || !url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  if (editingTileId) {
    const t = state.tiles.find(t => t.id === editingTileId);
    if (t) { t.name = name; t.url = url; t.group = group; t.iconUrl = iconUrl; }
  } else {
    state.tiles.push({ id: uid(), name, url, group, iconUrl });
  }
  persist(); closeModal('tile-modal'); render();
}

function deleteTile(id) {
  state.tiles = state.tiles.filter(t => t.id !== id); persist(); render();
}

// ── Groups ─────────────────────────────────────────────────────────────────
function addGroup() {
  const name = $('new-group-name').value.trim();
  if (!name || state.groups.includes(name)) return;
  state.groups.push(name); persist();
  $('new-group-name').value = '';
  renderGroupList(); render();
}

function removeGroup(group) {
  if (!confirm('Remove group "' + group + '"? All tiles in it will be deleted.')) return;
  state.groups = state.groups.filter(g => g !== group);
  state.tiles = state.tiles.filter(t => t.group !== group);
  persist(); renderGroupList(); render();
}

let renamingGroup = null;

function openRenameGroup(group) {
  renamingGroup = group;
  $('rename-group-input').value = group;
  openModal('rename-group-modal');
  setTimeout(() => $('rename-group-input').focus(), 80);
}

function saveGroupRename() {
  const newName = $('rename-group-input').value.trim();
  if (!newName || !renamingGroup) { closeModal('rename-group-modal'); return; }
  if (newName === renamingGroup) { closeModal('rename-group-modal'); return; }
  if (state.groups.includes(newName)) { alert('A group called "' + newName + '" already exists.'); return; }
  const idx = state.groups.indexOf(renamingGroup);
  state.groups[idx] = newName;
  state.tiles.forEach(t => { if (t.group === renamingGroup) t.group = newName; });
  renamingGroup = null;
  persist(); closeModal('rename-group-modal'); renderGroupList(); render();
}

let dragSrcGroup = null;

function renderGroupList() {
  const list = $('group-list');
  list.innerHTML = '';
  state.groups.forEach(g => {
    const row = document.createElement('div');
    row.className = 'group-row'; row.draggable = true; row.dataset.group = g;

    const handle = document.createElement('span');
    handle.className = 'group-handle'; handle.textContent = '⠿⠿';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'group-row-name'; nameSpan.textContent = g;
    const actions = document.createElement('div');
    actions.className = 'group-row-actions';
    const renameBtn = document.createElement('button');
    renameBtn.className = 'group-action-btn rename'; renameBtn.title = 'Rename'; renameBtn.innerHTML = '<span class="material-symbols-rounded">edit</span>';
    renameBtn.addEventListener('click', () => openRenameGroup(g));
    const delBtn = document.createElement('button');
    delBtn.className = 'group-action-btn del'; delBtn.title = 'Delete'; delBtn.innerHTML = '<span class="material-symbols-rounded">close</span>';
    delBtn.addEventListener('click', () => removeGroup(g));
    actions.appendChild(renameBtn); actions.appendChild(delBtn);
    row.appendChild(handle); row.appendChild(nameSpan); row.appendChild(actions);

    row.addEventListener('dragstart', e => { dragSrcGroup = g; e.dataTransfer.effectAllowed = 'move'; setTimeout(() => row.classList.add('dragging'), 0); });
    row.addEventListener('dragend', () => { row.classList.remove('dragging'); list.querySelectorAll('.group-row').forEach(r => r.classList.remove('drag-over-group')); });
    row.addEventListener('dragover', e => { e.preventDefault(); list.querySelectorAll('.group-row').forEach(r => r.classList.remove('drag-over-group')); if (row.dataset.group !== dragSrcGroup) row.classList.add('drag-over-group'); });
    row.addEventListener('drop', e => {
      e.preventDefault(); row.classList.remove('drag-over-group');
      const src = dragSrcGroup, tgt = row.dataset.group;
      if (!src || src === tgt) return;
      const si = state.groups.indexOf(src), ti = state.groups.indexOf(tgt);
      state.groups.splice(si, 1); state.groups.splice(ti, 0, src);
      persist(); renderGroupList(); render();
    });
    list.appendChild(row);
  });
}

// ── Edit mode ──────────────────────────────────────────────────────────────
function toggleEdit() {
  editMode = !editMode;
  document.body.classList.toggle('edit-mode', editMode);
  render();
}

function renderPinnedBgs() {
  const shelf = $('pinned-bgs-shelf');
  const section = $('pinned-bgs-section');
  if (!shelf || !section) return;
  const pins = state.pinnedBgs || [];
  section.style.display = pins.length ? 'block' : 'none';
  shelf.innerHTML = '';
  pins.forEach((url, idx) => {
    const wrap = document.createElement('div');
    wrap.style.position = 'relative';
    wrap.style.display = 'inline-block';

    const btn = document.createElement('div');
    btn.className = 'bg-preset' + (state.bg === url ? ' active' : '');
    btn.style.backgroundImage = 'url(' + url + ')';
    btn.title = url;
    btn.addEventListener('click', () => applyBg(url));

    const del = document.createElement('button');
    del.className = 'pinned-del-btn';
    del.textContent = '✕';
    del.title = 'Remove';
    del.addEventListener('click', e => {
      e.stopPropagation();
      state.pinnedBgs.splice(idx, 1);
      persist();
      renderPinnedBgs();
    });

    wrap.appendChild(btn);
    wrap.appendChild(del);
    shelf.appendChild(wrap);
  });
}

function pinCurrentBg() {
  const url = $('custom-bg').value.trim();
  if (!url) return;
  if (!state.pinnedBgs) state.pinnedBgs = [];
  if (state.pinnedBgs.includes(url)) return;
  state.pinnedBgs.push(url);
  persist();
  renderPinnedBgs();
  // Brief feedback on pin button
  const btn = $('btn-pin-bg');
  const orig = btn.textContent;
  btn.textContent = '✓';
  setTimeout(() => btn.textContent = orig, 1500);
}

// ── Settings ───────────────────────────────────────────────────────────────
function openSettings() {
  const presets = $('bg-presets');
  presets.innerHTML = '';
  BG_PRESETS.forEach(p => {
    const btn = document.createElement('div');
    btn.className = 'bg-preset' + (state.bg === p.url ? ' active' : '');
    btn.style.backgroundImage = 'url(' + p.thumb + ')';
    btn.title = p.label; btn.dataset.url = p.url;
    btn.addEventListener('click', () => applyBg(p.url));
    presets.appendChild(btn);
  });
  
  // Add this line right here to ensure the switch stays aligned on load!
  if ($('toggle-bing-bg')) $('toggle-bing-bg').checked = !!state.useBingBg;
  
  $('toggle-title').checked = !!state.showTitle;
  $('settings-title-input').value = state.title || '';
  $('title-edit-row').style.display = state.showTitle ? 'block' : 'none';
  $('toggle-link-target').checked = (state.linkTarget === '_self');
  // Tutorial toggle — checked means "run again next load" i.e. tutorialSeen is false
  $('toggle-tutorial').checked = !state.tutorialSeen;
  // Weather settings
  const wEnabled = state.weather && state.weather.enabled;
  $('toggle-weather').checked = wEnabled;
  $('weather-settings-row').style.display = wEnabled ? 'block' : 'none';
  $('weather-location-name').value = (state.weather && state.weather.locationName) || '';
  $('weather-lat').value = (state.weather && state.weather.lat) || '';
  $('weather-lon').value = (state.weather && state.weather.lon) || '';
  $('weather-tz').value  = (state.weather && state.weather.tz)  || 'Australia/Sydney';
  $('weather-search').value = (state.weather && state.weather.locationName) || '';
  $('weather-search-results').style.display = 'none';
  renderGroupList();
  renderPinnedBgs();
  syncThemeUI();
  // Always open on General tab
  document.querySelectorAll('.settings-nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
  const defaultNav = document.querySelector('.settings-nav-btn[data-tab="general"]');
  const defaultPanel = document.querySelector('.settings-panel[data-panel="general"]');
  if (defaultNav) defaultNav.classList.add('active');
  if (defaultPanel) defaultPanel.classList.add('active');
  openModal('settings-modal');
}

// ── Modals ─────────────────────────────────────────────────────────────────
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

// ── Wire up all event listeners on DOMContentLoaded ───────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  await loadConfig();
  render();
  applyTheme();
  applyWeatherVisibility();
  maybeStartTutorial();
  window.addEventListener('resize', adjustGroupsOffset);
  // Refresh weather every 15 minutes
  setInterval(fetchWeather, 15 * 60 * 1000);

  // Settings tab switching
  document.querySelectorAll('.settings-nav-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.settings-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.querySelector(`.settings-panel[data-panel="${btn.dataset.tab}"]`);
      if (panel) panel.classList.add('active');
    });
  });

  // Action bar
  $('site-title').addEventListener('click', () => {
    $('title-input').value = state.title || '';
    openModal('title-modal');
    setTimeout(() => $('title-input').focus(), 80);
  });
  $('btn-save-config').addEventListener('click', saveConfig);
  $('btn-import-config').addEventListener('click', () => $('import-file-input').click());
  $('import-file-input').addEventListener('change', e => { importConfig(e.target.files[0]); e.target.value = ''; });
  $('btn-edit').addEventListener('click', toggleEdit);
  $('btn-settings').addEventListener('click', openSettings);

  // Tile modal
  $('t-url').addEventListener('input', refreshFaviconPreview);
  $('t-icon-url').addEventListener('input', refreshCustomIconPreview);
  $('tab-auto').addEventListener('click', () => switchIconTab('auto'));
  $('tab-custom').addEventListener('click', () => switchIconTab('custom'));
  $('tile-cancel').addEventListener('click', () => closeModal('tile-modal'));
  $('tile-save').addEventListener('click', saveTile);

  // Settings modal
  $('btn-custom-bg').addEventListener('click', () => { const v = $('custom-bg').value.trim(); if (v) applyBg(v); });
  $('btn-pin-bg').addEventListener('click', pinCurrentBg);
  $('toggle-title').addEventListener('change', e => {
    state.showTitle = e.target.checked; persist(); applyTitleVisibility();
    $('title-edit-row').style.display = e.target.checked ? 'block' : 'none';
  });
  $('btn-save-title-settings').addEventListener('click', () => {
    const v = $('settings-title-input').value.trim();
    if (v) { state.title = v; persist(); applyTitleVisibility(); }
  });
  $('toggle-link-target').addEventListener('change', e => {
    state.linkTarget = e.target.checked ? '_self' : '_blank'; persist();
  });
  // Tutorial toggle — on = will run next load; also offer instant preview
  $('toggle-tutorial').addEventListener('change', e => {
    state.tutorialSeen = !e.target.checked;
    persist();
  });
  $('btn-preview-tutorial').addEventListener('click', () => {
    closeModal('settings-modal');
    setTimeout(startTutorial, 200);
  });
  $('btn-add-group').addEventListener('click', addGroup);
  $('new-group-name').addEventListener('keydown', e => { if (e.key === 'Enter') addGroup(); });
  $('toggle-weather').addEventListener('change', e => {
    if (!state.weather) state.weather = { enabled: false, lat: '', lon: '', tz: 'UTC', locationName: '' };
    state.weather.enabled = e.target.checked;
    $('weather-settings-row').style.display = e.target.checked ? 'block' : 'none';
    persist(); applyWeatherVisibility();
  });
  $('btn-weather-search').addEventListener('click', async () => {
    const q = $('weather-search').value.trim();
    if (!q) return;
    const countryCode = $('weather-country') ? $('weather-country').value : '';
    const btn = $('btn-weather-search');
    btn.textContent = '…'; btn.disabled = true;
    try {
      const results = await searchLocation(q, countryCode);
      showLocationResults(results);
    } catch(e) {
      $('weather-search-results').innerHTML = '<div style="font-size:0.8rem;color:var(--danger);padding:0.4rem 0">Search failed — check your connection</div>';
      $('weather-search-results').style.display = 'flex';
    }
    btn.textContent = 'Search'; btn.disabled = false;
  });

  $('weather-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('btn-weather-search').click();
  });

  $('btn-save-weather').addEventListener('click', () => {
    if (!state.weather) state.weather = {};
    state.weather.locationName = $('weather-location-name').value.trim();
    state.weather.lat = $('weather-lat').value.trim();
    state.weather.lon = $('weather-lon').value.trim();
    state.weather.tz  = $('weather-tz').value.trim() || 'UTC';
    persist(); fetchWeather();
    // Brief feedback
    const btn = $('btn-save-weather');
    const orig = btn.textContent;
    btn.textContent = '✓ Saved';
    setTimeout(() => btn.textContent = orig, 1500);
  });
  // Handle the Daily Bing background toggle action switch
  if ($('toggle-bing-bg')) {
    $('toggle-bing-bg').addEventListener('change', e => {
      state.useBingBg = e.target.checked;
      
      persist(); // Save choice to config instantly
      render();  // Trigger UI changes and hide/show the manual options immediately
    });
  }
  $('settings-close').addEventListener('click', () => closeModal('settings-modal'));

  // Title modal
  $('title-cancel').addEventListener('click', () => closeModal('title-modal'));
  $('title-save').addEventListener('click', () => {
    state.title = $('title-input').value.trim() || 'Launcher';
    persist(); closeModal('title-modal'); applyTitleVisibility();
  });
  $('title-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('title-save').click(); });

  // Rename group modal
  $('rename-group-cancel').addEventListener('click', () => closeModal('rename-group-modal'));
  $('rename-group-save').addEventListener('click', saveGroupRename);
  $('rename-group-input').addEventListener('keydown', e => { if (e.key === 'Enter') saveGroupRename(); });

  // Close modals on backdrop click
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });

  // Weather click to show forecast
  $('weather-wrap').addEventListener('click', toggleForecast);
  document.addEventListener('click', e => {
    if (forecastVisible && !$('forecast-popup').contains(e.target) && e.target !== $('weather-wrap')) {
      hideForecast();
    }
  });

  // Search
  $('search').addEventListener('keydown', e => {
    if (e.key === 'Enter') { const q = e.target.value.trim(); if (q) window.open('https://www.google.com/search?q=' + encodeURIComponent(q), state.linkTarget || '_blank'); }
  });

  // Theme — color themes
  document.querySelectorAll('.color-theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.theme.colorTheme = btn.dataset.theme;
      // Reset accent to theme default when switching themes
      state.theme.accentColor = COLOR_THEMES[btn.dataset.theme]?.accent || '#7c9ef0';
      persist(); applyTheme(); syncThemeUI();
    });
  });

  // Theme — font pairing
  const fontSelect = $('font-pairing-select');
  if (fontSelect) {
    fontSelect.addEventListener('change', () => {
      state.theme.fontPairing = fontSelect.value;
      persist(); applyTheme();
    });
  }

  // Theme — icon sizes
  document.querySelectorAll('.icon-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.theme.iconSize = btn.dataset.size;
      persist(); applyTheme(); syncThemeUI(); render();
    });
  });

  // Theme — clock font
  document.querySelectorAll('.clock-font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.theme.clockFont = btn.dataset.clockfont;
      persist(); applyTheme(); syncThemeUI();
    });
  });

  // Theme — opacity slider
  const opSlider = $('slider-tile-opacity');
  if (opSlider) {
    opSlider.addEventListener('input', () => {
      state.theme.tileOpacity = parseInt(opSlider.value);
      $('val-tile-opacity').textContent = opSlider.value + '%';
      persist(); applyTheme();
    });
  }

  // Theme — blur slider
  const blurSlider = $('slider-tile-blur');
  if (blurSlider) {
    blurSlider.addEventListener('input', () => {
      state.theme.tileBlur = parseInt(blurSlider.value);
      $('val-tile-blur').textContent = blurSlider.value + 'px';
      persist(); applyTheme();
    });
  }

  // Theme — accent colour (colour picker)
  const accentInput = $('accent-color-input');
  if (accentInput) {
    accentInput.addEventListener('input', () => {
      state.theme.accentColor = accentInput.value;
      persist(); applyTheme();
    });
  }

  // Theme — accent colour preset dots (delegated to avoid inline onclick issues in extensions)
  document.querySelector('.accent-presets')?.addEventListener('click', e => {
    const dot = e.target.closest('.accent-preset-dot');
    if (!dot) return;
    const color = dot.dataset.color;
    if (!color) return;
    state.theme.accentColor = color;
    if (accentInput) accentInput.value = color;
    persist(); applyTheme(); syncThemeUI();
  });

  // Tutorial buttons
  $('tutorial-next').addEventListener('click', tutorialNext);
  $('tutorial-prev').addEventListener('click', tutorialPrev);
  $('tutorial-skip').addEventListener('click', () => endTutorial(true));

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (tutorialActive) {
      if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); tutorialNext(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); tutorialPrev(); return; }
      if (e.key === 'Escape') { endTutorial(true); return; }
    }
    if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    if (e.key === 'e' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') toggleEdit();
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); $('search').focus(); }
  });

});
