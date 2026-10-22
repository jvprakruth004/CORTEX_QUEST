/* ================= CORTEX QUEST — beginner-friendly vanilla JS =================
   Sections: 1 Data | 2 State & helpers | 3 Auth | 4 Views | 5 Quiz engine | 6 Brain game | 7 Rewards */

/* ---------- 1. DATA ---------- */
// Question format: [text, [4 options], correctIndex, explanation]
const MODS = [
 {id:'apt',n:'General Aptitude',e:'🧮',t:'Percentages',x:'A percentage is a number out of 100. Convert it to a fraction to calculate.',p:['x% of y = x × y / 100','Profit% = profit / cost × 100'],f:'x% of y = (x × y) / 100',q:[
  ['What is 20% of 150? 🪙',['20','30','25','35'],1,'150 × 20 / 100 = 30'],
  ['A shirt costs ₹400 and sells at ₹500. Profit %? 👕',['20%','25%','30%','10%'],1,'Profit 100 / cost 400 = 25%'],
  ['If 5 pens cost ₹50, 8 pens cost? 🖊️',['₹70','₹75','₹80','₹90'],2,'1 pen = ₹10, so 8 pens = ₹80'],
  ['Average of 10, 20, 30? 📊',['15','20','25','30'],1,'60 / 3 = 20']]},
 {id:'di',n:'Data Interpretation',e:'📈',t:'Reading Tables & Charts',x:'Read the labels and units first, then compare values step by step.',p:['Check units','Change % = (new − old) / old × 100'],f:'Change % = (New − Old) / Old × 100',q:[
  ['Sales rose from 40 to 50. Growth? 📈',['20%','25%','10%','15%'],1,'10 / 40 = 25%'],
  ['A pie chart sector of 90° is what % of the pie? 🥧',['20%','25%','30%','40%'],1,'90 / 360 = 25%'],
  ['Marks: 60, 70, 80. Total? ✏️',['200','210','220','190'],1,'60 + 70 + 80 = 210'],
  ['Ratio 3:2 with total 50. Larger part? ⚖️',['20','30','25','35'],1,'3/5 × 50 = 30']]},
 {id:'rea',n:'Reasoning',e:'🧩',t:'Logical Reasoning',x:'Spot the rule hiding in a pattern, then apply it.',p:['Look for differences','Test your rule on every item'],f:'Arithmetic term: aₙ = a + (n − 1)d',q:[
  ['Next: 2, 4, 8, 16, ? 🔢',['24','32','30','20'],1,'Each term doubles'],
  ['All cats are animals. Tom is a cat. So Tom is…? 🐱',['A plant','An animal','A dog','Unknown'],1,'Cat ⊂ animals'],
  ['Odd one out: Apple, Mango, Carrot, Banana 🍎',['Apple','Mango','Carrot','Banana'],2,'Carrot is a vegetable'],
  ['If A=1, B=2, then C+D=? 🔤',['5','6','7','8'],2,'3 + 4 = 7']]},
 {id:'gk',n:'General Knowledge',e:'🌍',t:'World Basics',x:'Build a base of facts about the world and keep revising them.',p:['Revise a little daily','Link facts to stories'],f:'Tip: 7 continents, 5 oceans',q:[
  ['Capital of India? 🇮🇳',['Mumbai','New Delhi','Chennai','Kolkata'],1,'New Delhi is the capital'],
  ['Largest planet? 🪐',['Earth','Mars','Jupiter','Venus'],2,'Jupiter is the largest'],
  ['How many continents? 🗺️',['5','6','7','8'],2,'There are 7'],
  ['H₂O is…? 💧',['Salt','Water','Gas','Acid'],1,'Two hydrogen, one oxygen']]},
 {id:'prog',n:'Programming',e:'💻',t:'Programming Basics',x:'A program is a list of clear steps. Variables store values; loops repeat work.',p:['Variables hold data','Loops repeat steps'],f:'for (i = 0; i < n; i++)',q:[
  ['Which stores a value? 📦',['Loop','Variable','Comment','Bug'],1,'Variables store values'],
  ['Which repeats code? 🔁',['if','loop','var','print'],1,'Loops repeat'],
  ['Result of 2 + 3 * 4? ➕',['20','14','24','10'],1,'Multiply first: 2 + 12'],
  ['JavaScript runs mostly in the…? 🌐',['Browser','Printer','Cable','Battery'],0,'Browsers run JS']]},
 {id:'cs',n:'Computer Science',e:'🖥️',t:'How Computers Work',x:'Computers process binary (0 and 1) using a CPU, memory and storage.',p:['CPU = brain','RAM = short-term memory'],f:'1 byte = 8 bits',q:[
  ['Brain of a computer? 🧠',['RAM','CPU','Mouse','Disk'],1,'The CPU processes'],
  ['Binary uses digits…? 0️⃣',['0-9','0 and 1','1-2','A-Z'],1,'Binary = 0 and 1'],
  ['1 byte = ? bits 🔢',['4','8','16','2'],1,'8 bits'],
  ['Short-term memory is…? ⚡',['RAM','SSD','CD','USB'],0,'RAM is temporary']]},
 {id:'eng',n:'Engineering',e:'⚙️',t:'Basic Mechanics',x:'Forces make things move. Ohm and Newton cover many everyday problems.',p:['Newton: F = ma','Ohm: V = IR'],f:"Ohm's Law: V = I × R",q:[
  ['Unit of force? 💪',['Joule','Newton','Watt','Volt'],1,'Force is in Newtons'],
  ['V = 10, R = 5. Current? ⚡',['2 A','5 A','50 A','0.5 A'],0,'I = V / R = 2'],
  ['F = ma: m = 2, a = 3. F? 🚀',['5','6','8','9'],1,'2 × 3 = 6'],
  ['A lever helps to…? 🔧',['Lift loads easily','Make light','Store data','Cool air'],0,'Levers multiply force']]},
 {id:'med',n:'Medical Basics',e:'🩺',t:'Human Body Basics',x:'The body is made of systems that work together, such as the heart pumping blood.',p:['Heart pumps blood','Lungs bring in oxygen'],f:'Normal pulse ≈ 60–100 beats/min',q:[
  ['Which organ pumps blood? ❤️',['Lungs','Heart','Liver','Kidney'],1,'The heart pumps'],
  ['Which helps us breathe? 🫁',['Lungs','Stomach','Skin','Ear'],0,'Lungs'],
  ['Vitamin from sunlight? ☀️',['A','C','D','K'],2,'Vitamin D'],
  ['Normal adult pulse? 💓',['20','75','200','300'],1,'60–100 per minute']]},
{id:'brain',n:'Brain Games',e:'🎮',go:'challenges',x:'Number puzzles and patterns'},
  {id:'mock',n:'Mock Tests',e:'📝',go:'mock',x:'Timed full tests'}
];

// Submodules: 8 modules × 3 submodules each = 24 submodules
// Each submodule has 50 levels
const SUBMODULES = {
  apt: [
    {id:'arithmetic', n:'Arithmetic', e:'🔢', desc:'Basic arithmetic operations and number sense'},
    {id:'quantitative', n:'Quantitative Aptitude', e:'📊', desc:'Advanced quantitative problems and data analysis'},
    {id:'timework', n:'Time and Work', e:'⏱️', desc:'Time, work, and efficiency problems'}
  ],
  di: [
    {id:'tables', n:'Tables and Charts', e:'📋', desc:'Reading and interpreting data tables and charts'},
    {id:'graphs', n:'Graph Analysis', e:'📈', desc:'Analyzing various types of graphs and visualizations'},
    {id:'caselets', n:'Caselet Analysis', e:'📑', desc:'Complex caselet-based data interpretation'}
  ],
  rea: [
    {id:'verbal', n:'Verbal Reasoning', e:'📝', desc:'Word-based logical reasoning and analogies'},
    {id:'analytical', n:'Analytical Reasoning', e:'🔍', desc:'Logic puzzles and analytical thinking'},
    {id:'nonverbal', n:'Non-Verbal Reasoning', e:'🧩', desc:'Pattern recognition and visual reasoning'}
  ],
  gk: [
    {id:'scitech', n:'Science and Technology', e:'🔬', desc:'Scientific discoveries and technological advances'},
    {id:'histgeo', n:'History and Geography', e:'🗺️', desc:'Historical events and geographical knowledge'},
    {id:'current', n:'Current Affairs', e:'📰', desc:'Recent events and contemporary issues'}
  ],
  prog: [
    {id:'fundamentals', n:'Programming Fundamentals', e:'💻', desc:'Core programming concepts and syntax'},
    {id:'control', n:'Control Statements and Loops', e:'🔁', desc:'Conditionals, loops, and flow control'},
    {id:'arrays', n:'Arrays and Data Structures', e:'📚', desc:'Arrays, lists, and basic data structures'}
  ],
  cs: [
    {id:'os', n:'Operating Systems', e:'🖥️', desc:'OS concepts, processes, and memory management'},
    {id:'dbms', n:'Database Management Systems', e:'🗄️', desc:'Database design, SQL, and data modeling'},
    {id:'networks', n:'Computer Networks', e:'🌐', desc:'Network protocols, layers, and communication'}
  ],
  eng: [
    {id:'electrical', n:'Electrical Fundamentals', e:'⚡', desc:'Basic electrical engineering concepts'},
    {id:'mechanical', n:'Mechanical Fundamentals', e:'⚙️', desc:'Mechanical engineering principles'},
    {id:'engmath', n:'Engineering Mathematics', e:'📐', desc:'Applied mathematics for engineering'}
  ],
  med: [
    {id:'anatomy', n:'Human Anatomy', e:'🫀', desc:'Structure of the human body'},
    {id:'physiology', n:'Human Physiology', e:'🫁', desc:'Functions and processes of the human body'},
    {id:'medsci', n:'Basic Medical Science', e:'🩺', desc:'Fundamental medical concepts and terminology'}
  ]
};
const API_MODULES = {apt: 'apt', di: 'di', rea: 'lr', gk: 'gk', prog: 'prog', cs: 'cs', eng: 'eng', med: 'med'};
const API_SUBMODULES = {
  'apt|arithmetic': 'apt-arithmetic', 'apt|quantitative': 'apt-quantitative', 'apt|timework': 'apt-time-work',
  'di|tables': 'di-tables-charts', 'di|graphs': 'di-graph-analysis', 'di|caselets': 'di-caselet-analysis',
  'rea|verbal': 'lr-verbal-reasoning', 'rea|analytical': 'lr-analytical-reasoning', 'rea|nonverbal': 'lr-nonverbal-reasoning',
  'gk|scitech': 'gk-science-tech', 'gk|histgeo': 'gk-history-geography', 'gk|current': 'gk-current-affairs',
  'prog|fundamentals': 'prog-fundamentals', 'prog|control': 'prog-control-loops', 'prog|arrays': 'prog-arrays-ds',
  'cs|os': 'cs-operating-systems', 'cs|dbms': 'cs-dbms', 'cs|networks': 'cs-networks',
  'eng|electrical': 'eng-electrical', 'eng|mechanical': 'eng-mechanical', 'eng|engmath': 'eng-math',
  'med|anatomy': 'med-anatomy', 'med|physiology': 'med-physiology', 'med|medsci': 'med-basic-science'
};
const FRONT_MODULES = Object.fromEntries(Object.entries(API_MODULES).map(([front, api]) => [api, front]));
const FRONT_SUBMODULES = Object.fromEntries(Object.entries(API_SUBMODULES).map(([front, api]) => [api, front.split('|')[1]]));
const QMODS = MODS.filter(m => m.q);
const DIFFS = ['Easy','Medium','Hard'];
const MORE = {
 apt:[['Simple interest on ₹1000 at 10% for 2 years? 💰',['₹100','₹200','₹300','₹150'],1,'1000×10×2/100 = 200'],['Speed 60 km/h for 2 h. Distance? 🚗',['100 km','120 km','60 km','150 km'],1,'60 × 2 = 120']],
 di:[['Bar heights 4, 6, 8. Mean? 📊',['5','6','7','8'],1,'18 / 3 = 6'],['A is 40% of 200. A = ? 🔢',['60','80','100','120'],1,'0.4 × 200 = 80']],
 rea:[['Next: 1, 4, 9, 16, ? 🔢',['20','25','24','36'],1,'Square numbers'],['Odd one out: 2, 4, 6, 9 🔎',['2','4','6','9'],3,'9 is odd, the rest are even']],
 gk:[['Fastest land animal? 🐆',['Lion','Cheetah','Horse','Deer'],1,'The cheetah'],['Currency of Japan? 💴',['Yuan','Won','Yen','Dollar'],2,'The yen']],
 prog:[['Which symbol starts a JS comment? 💬',['//','##','<>','**'],0,'// begins a comment'],['What is an array? 📚',['A list of values','A bug','A color','A file'],0,'An ordered list of values']],
 cs:[['Which is an input device? ⌨️',['Monitor','Keyboard','Speaker','Printer'],1,'A keyboard sends input'],['What does a URL give? 🔗',['A web address','A chip','A cable','A fan'],0,'It locates web resources']],
 eng:[['Unit of electric power? 🔌',['Watt','Newton','Pascal','Meter'],0,'Power is in Watts'],['Gears are used to…? ⚙️',['Transmit motion','Store heat','Make light','Cut metal'],0,'Gears transfer motion']],
 med:[['Largest organ of the body? 🧴',['Heart','Skin','Liver','Brain'],1,'The skin'],['Blood carries what to cells? 🩸',['Oxygen','Sound','Light','Ink'],0,'Oxygen']]};
QMODS.forEach(m => m.q.push(...MORE[m.id]));
const LOGIC = [
 ['I have keys but open no locks. What am I? ⌨️',['Keyboard','Door','Car','Box'],0,'A keyboard has keys'],
 ['Mon, Wed, Fri, ? 📅',['Sat','Sun','Tue','Thu'],1,'Skip a day each time: Sunday'],
 ['Tom is taller than Ravi, Ravi taller than Sam. Shortest? 📏',['Tom','Ravi','Sam','Unknown'],2,'Sam is shortest'],
 ['1 kg of iron or 1 kg of cotton — heavier? 🪶',['Iron','Cotton','Same','Unknown'],2,'Both weigh 1 kg'],
 ['3 cats catch 3 mice in 3 min. 1 cat, 1 mouse? 🐱',['1 min','3 min','9 min','0.3 min'],1,'Still 3 minutes'],
 ['Missing number: 3, 6, 9, ?, 15 🔢',['10','11','12','13'],2,'Add 3 each time']];
const LANG = {Hindi:['होम','मॉड्यूल','चुनौतियाँ','लीडरबोर्ड','प्रोफ़ाइल'],Kannada:['ಮುಖಪುಟ','ಮಾಡ್ಯೂಲ್','ಸವಾಲು','ಲೀಡರ್‌ಬೋರ್ಡ್','ಪ್ರೊಫೈಲ್']};
const AVATARS = ['🦊','🐼','🦉','🐙','🦄','🐯'];
const QUOTES = ['Every mistake is a step forward 💪','Brains grow when challenged 🌱','Almost there, try the next one! 🚀','Learning is a journey, keep going ✨'];
const BOTS = [['Aarav',2400,'🦁'],['Meera',2100,'🦊'],['Kabir',1750,'🐼'],['Zoya',1500,'🦄'],['Rohan',1100,'🐯'],['Isha',800,'🐙']];
const BADGES = [
  {id:'s10',n:'Solver',e:'🧠',g:10,v:()=>S.solved},{id:'s30',n:'Big Brain',e:'🏆',g:30,v:()=>S.solved},
  {id:'lv3',n:'Level 3',e:'🚀',g:3,v:()=>lvl()},
  {id:'mock',n:'Test Taker',e:'📝',g:1,v:()=>S.tests},{id:'form',n:'Formula Fan',e:'📐',g:3,v:()=>S.formulas.length},
  {id:'str',n:'On Fire',e:'🔥',g:3,v:()=>S.streak},{id:'star',n:'Star Collector',e:'⭐',g:3,v:()=>S.stars}];

/* ---------- 2. STATE & HELPERS ---------- */
const $ = s => document.querySelector(s);
const app = $('#app');
let S = null, G = null, timer = null, P = null;
const API_BASE = 'http://127.0.0.1:8001/api';
let accessToken = null, backendAccount = null, authBusy = false, backendProgressReady = false, refreshPromise = null;
async function authRequest(path, options = {}, retry = true) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  let response; const controller = new AbortController(), requestTimeout = setTimeout(() => controller.abort(), 15000);
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: options.signal || controller.signal, credentials: 'include' });
  } catch (_) {
    throw new Error('Cannot reach the server or the request timed out. Check that Cortex Quest is available and try again.');
  } finally { clearTimeout(requestTimeout); }
  if (response.status === 401 && retry && path !== '/auth/login' && path !== '/auth/register' && path !== '/auth/guest' && path !== '/auth/refresh' && path !== '/auth/logout') {
    if (!refreshPromise) refreshPromise = authRequest('/auth/refresh', { method: 'POST' }, false).then(data => { accessToken = data.access_token; return data; }).catch(() => null).finally(() => { refreshPromise = null; });
    const refreshed = await refreshPromise;
    if (refreshed?.access_token) return authRequest(path, options, false);
  }
  if (!response.ok) {
    let message = '';
    try { const data = await response.json(); const detail = data.detail; message = Array.isArray(detail) ? detail.map(x => x.msg).join(' ') : (typeof detail === 'string' ? detail : ''); } catch (_) {}
    if (response.status === 401) message = 'Invalid username or password.';
    if (response.status === 409) message = 'That username is already registered.';
    const error = new Error(message || `The server could not complete this request (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}
const THEMES = [
  {id: 'dark', name: 'Forest Dark', swatch: '#3A5311'},
  {id: 'light', name: 'Forest Light', swatch: '#4a6b18'},
  {id: 'midnight', name: 'Midnight Violet', swatch: '#8b5cf6'},
  {id: 'ocean', name: 'Ocean Breeze', swatch: '#06b6d4'},
  {id: 'sunrise', name: 'Sunrise Glow', swatch: '#e85d75'},
  {id: 'berry', name: 'Berry Pop', swatch: '#e84393'}
];
const today = () => new Date().toDateString();
const lvl = () => Math.floor(S.xp / 200) + 1;
const save = () => { if (S) localStorage.setItem('cq_s_' + S.user, JSON.stringify(S)); };
const newState = (user, name, av) => ({user, name, av, id: 'CQ' + Math.floor(1000 + Math.random() * 9000), xp: 0, coins: 0, diamonds: 0, stars: 0, streak: 1, lastDay: today(),
  solved: 0, correct: 0, tests: 0, done: {}, bm: [], formulas: [], mistakes: [], badges: [], last: null,
  subs: {}, // submodule progress: { 'apt|arithmetic': {unlocked: 1, completed: [], stars: {}} }
  daily: {d: today(), solved: 0, levels: 0, brain: 0, rev: 0, claimed: false}, set: {theme: 'dark', sound: true, notif: true, lang: 'English', privacy: 'Public'},
  earned: {coins: 0, diamonds: 0}, spent: {coins: 0, diamonds: 0}, transactions: [], inventory: {hint: 0, '5050': 0}, powerups: {used5050: {}, usedHint: {}}, certificates: []});

function beep(f = 660) { if (!S || !S.set.sound) return; try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.value = .06; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + .12); } catch (e) {} }
function confetti() { const em = ['🎉', '✨', '🎊', '⭐', '💜']; for (let i = 0; i < 36; i++) { const s = document.createElement('span'); s.className = 'conf'; s.textContent = em[i % 5]; s.style.left = Math.random() * 100 + 'vw'; s.style.animationDelay = Math.random() * .6 + 's'; document.body.appendChild(s); setTimeout(() => s.remove(), 3200); } }
function floatXP(t) { const d = document.createElement('div'); d.className = 'float-xp'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 1200); }
function popup(em, title, text, big) { const p = document.createElement('div'); p.className = 'pop'; p.innerHTML = `<div><div class="big">${em}</div><h4>${title}</h4><p class="text-mut">${text}</p><button class="btn btn-cq">Awesome!</button></div>`; p.onclick = e => { if (e.target === p || e.target.tagName === 'BUTTON') p.remove(); }; $('#pops').appendChild(p); if (big) confetti(); beep(880); }
const bar = (v, max) => `<div class="progress"><div class="progress-bar" style="width:${Math.min(100, v / max * 100)}%"></div></div>`;

/* ---------- BLOCK PUZZLE GAME ---------- */
const PUZZLE_SIZE = 8;
const BLOCK_SHAPES = [
  [[1]], [[1,1]], [[1,1,1]], [[1,1,1,1]],
  [[1,1],[1,1]], [[1,0],[1,1]], [[0,1],[1,1]], [[1,1],[1,0]], [[1,1],[0,1]],
  [[1,1,1],[1,0,0]], [[1,1,1],[0,0,1]], [[1,1,1],[0,1,0]],
  [[1,1],[1,1],[1,1]], [[1,1,1,1],[1,0,0,0]], [[1,1,1,1],[0,0,0,1]]
];
const BLOCK_COLORS = ['#d4a843','#4ade80','#60a5fa','#f472b6','#a78bfa','#fb923c','#22d3ee','#f87171'];

function initPuzzle() {
  P = {
    grid: Array(PUZZLE_SIZE).fill(null).map(() => Array(PUZZLE_SIZE).fill(0)),
    score: 0,
    nextBlocks: [],
    animating: false
  };
  fillNextBlocks();
}

function fillNextBlocks() {
  if (!P) return;
  // Preserve unplayed previews instead of replacing the queue after each answer.
  let correctCount = P.nextBlocks.filter(block => block.correct).length;
  let wrongCount = P.nextBlocks.filter(block => block.wrong).length;
  while (correctCount < 2) {
    const shape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
    const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];
    P.nextBlocks.push({shape, color, correct: true, wrong: false});
    correctCount++;
  }
  while (wrongCount < 1) {
    const shape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
    P.nextBlocks.push({shape, color: '#ef4444', correct: false, wrong: true});
    wrongCount++;
  }
}

function canPlace(shape, r, c) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        const nr = r + i, nc = c + j;
        if (nr >= PUZZLE_SIZE || nc >= PUZZLE_SIZE || nr < 0 || nc < 0) return false;
        if (P.grid[nr][nc]) return false;
      }
    }
  }
  return true;
}

function findValidPlacement(shape) {
  const placements = [];
  
  // Keep blocks resting on existing pieces or the bottom while preferring line clears.
  for (let c = 0; c <= PUZZLE_SIZE - shape[0].length; c++) {
    for (let r = PUZZLE_SIZE - shape.length; r >= 0; r--) {
      if (canPlace(shape, r, c)) {
        const grid = P.grid.map(row => row.slice());
        shape.forEach((line, i) => line.forEach((cell, j) => {
          if (cell) grid[r + i][c + j] = 1;
        }));
        const rows = grid.filter(row => row.every(cell => cell !== 0));
        const cols = Array.from({length: PUZZLE_SIZE}, (_, col) =>
          grid.every(row => row[col] !== 0));
        const cleared = rows.length + cols.filter(Boolean).length;
        const nearComplete = grid.reduce((score, row) => {
          const filled = row.filter(cell => cell !== 0).length;
          return score + (filled === PUZZLE_SIZE ? 0 : filled * filled);
        }, 0) + Array.from({length: PUZZLE_SIZE}, (_, col) => {
          const filled = grid.filter(row => row[col] !== 0).length;
          return filled === PUZZLE_SIZE ? 0 : filled * filled;
        }).reduce((sum, score) => sum + score, 0);
        placements.push({r, c, cleared, nearComplete});
        break;
      }
    }
  }
  
  if (placements.length === 0) return null;
  placements.sort((a, b) => b.cleared - a.cleared || b.nearComplete - a.nearComplete || b.r - a.r);
  return placements[0];
}

function placeBlock(shape, color, r, c) {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j]) {
        P.grid[r + i][c + j] = color;
      }
    }
  }
}

function clearLines() {
  let cleared = 0;
  const clearedRows = [];
  const clearedCols = [];
  
  // Check rows
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    if (P.grid[r].every(cell => cell !== 0)) {
      clearedRows.push(r);
      cleared++;
    }
  }
  // Check columns
  for (let c = 0; c < PUZZLE_SIZE; c++) {
    let full = true;
    for (let r = 0; r < PUZZLE_SIZE; r++) {
      if (P.grid[r][c] === 0) { full = false; break; }
    }
    if (full) {
      clearedCols.push(c);
      cleared++;
    }
  }
  
  if (cleared > 0) {
    if (S && S.set.sound && mon) {
      const audio = new Audio(TRACKS.victory);
      audio.loop = false;
      audio.volume = MVOL;
      tryPlay(audio);
    }
    // Trigger clearing animation with particles
    triggerLineClearAnimation(clearedRows, clearedCols);
    
    // Clear the model immediately so later answers cannot be overwritten by
    // an earlier animation timeout. Keep remaining cells anchored together.
    clearedRows.forEach(r => { P.grid[r] = Array(PUZZLE_SIZE).fill(0); });
    clearedCols.forEach(c => { for (let r = 0; r < PUZZLE_SIZE; r++) P.grid[r][c] = 0; });
    applyGravity();
    setTimeout(() => renderPuzzle(), 400);
    
    P.score += cleared * 100 * cleared;
    beep(800 + cleared * 100);
  }
  return cleared;
}

function applyGravity() {
  // Make blocks fall down after row clearing
  for (let c = 0; c < PUZZLE_SIZE; c++) {
    let writeRow = PUZZLE_SIZE - 1;
    for (let r = PUZZLE_SIZE - 1; r >= 0; r--) {
      if (P.grid[r][c] !== 0) {
        if (writeRow !== r) {
          P.grid[writeRow][c] = P.grid[r][c];
          P.grid[r][c] = 0;
        }
        writeRow--;
      }
    }
  }
}

function triggerLineClearAnimation(clearedRows, clearedCols) {
  const gridEl = document.getElementById('puzzle-grid');
  if (!gridEl) return;
  gridEl.classList.add('line-clear');
  setTimeout(() => gridEl.classList.remove('line-clear'), 500);
  
  // Add clearing class to cells
  clearedRows.forEach(r => {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      const cell = gridEl.children[r * PUZZLE_SIZE + c];
      if (cell) cell.classList.add('clearing');
    }
  });
  clearedCols.forEach(c => {
    for (let r = 0; r < PUZZLE_SIZE; r++) {
      const cell = gridEl.children[r * PUZZLE_SIZE + c];
      if (cell) cell.classList.add('clearing');
    }
  });
  
  // Create particle burst at cleared positions
  createClearParticles(clearedRows, clearedCols, gridEl);
}

function createClearParticles(clearedRows, clearedCols, gridEl) {
  const rect = gridEl.getBoundingClientRect();
  const cellWidth = rect.width / PUZZLE_SIZE;
  const cellHeight = rect.height / PUZZLE_SIZE;
  const colors = ['#4ade80', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#22d3ee', '#f87171', '#d4a843'];
  
  [...clearedRows, ...clearedCols].forEach((idx, i) => {
    const isRow = i < clearedRows.length;
    const r = isRow ? idx : Math.floor(Math.random() * PUZZLE_SIZE);
    const c = isRow ? Math.floor(Math.random() * PUZZLE_SIZE) : idx;
    
    for (let p = 0; p < 8; p++) {
      const particle = document.createElement('div');
      particle.className = 'puzzle-particle';
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = (c * cellWidth + cellWidth / 2) + 'px';
      particle.style.top = (r * cellHeight + cellHeight / 2) + 'px';
      
      const angle = (Math.PI * 2 * p) / 8;
      const distance = 50 + Math.random() * 30;
      particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
      particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
      
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }
  });
}

function triggerPuzzleBlock(correct) {
  if (!P || P.animating) return;
  P.animating = true;
  
  // Select the appropriate block: correct answer uses a correct block, wrong answer uses the wrong block
  let block, placement;
  if (correct) {
    const correctBlocks = P.nextBlocks.filter(b => b.correct);
    if (correctBlocks.length > 0) {
      const options = correctBlocks.map(block => ({block, placement: findValidPlacement(block.shape)}))
        .filter(option => option.placement)
        .sort((a, b) => b.placement.cleared - a.placement.cleared ||
          b.placement.nearComplete - a.placement.nearComplete ||
          b.placement.r - a.placement.r);
      const selected = options[0];
      if (selected) {
        const idx = P.nextBlocks.indexOf(selected.block);
        block = P.nextBlocks.splice(idx, 1)[0];
        placement = selected.placement;
      }
    }
  } else {
    // Use the wrong block
    const wrongBlocks = P.nextBlocks.filter(b => b.wrong);
    if (wrongBlocks.length > 0) {
      const idx = P.nextBlocks.indexOf(wrongBlocks[0]);
      block = P.nextBlocks.splice(idx, 1)[0];
    }
  }
  
  // Never let the answer type select the opposite color block as a fallback.
  if (!block) {
    handleGameOver();
    P.animating = false;
    return;
  }
  fillNextBlocks();
  placement = placement || findValidPlacement(block.shape);
  if (placement) {
    if (!canPlace(block.shape, placement.r, placement.c)) { P.animating = false; return; }
    placeBlock(block.shape, block.color, placement.r, placement.c);
    renderPuzzle();
    clearLines();
    
    // Show motivational feedback near puzzle
    showPuzzleFeedback(correct);
    // Audio feedback is played via MutationObserver when showFb() renders .fb .say
  } else {
    // No valid placement - game over
    handleGameOver();
    P.animating = false;
    return;
  }
  
  P.animating = false;
}

function showPuzzleFeedback(correct) {
  const gridEl = document.getElementById('puzzle-grid');
  if (!gridEl) return;
  
  // Remove any existing feedback
  const existing = gridEl.querySelector('.puzzle-feedback');
  if (existing) existing.remove();
  
  const feedback = document.createElement('div');
  feedback.className = 'puzzle-feedback ' + (correct ? 'good' : 'bad');
  feedback.textContent = correct ? pickW(CHEER) : pickW(OOPS);
  gridEl.appendChild(feedback);
  if (G?.mock) speak(feedback.textContent);
  
  setTimeout(() => feedback.remove(), 1000);
}

function handleGameOver() {
  const gridEl = document.getElementById('puzzle-grid');
  if (!gridEl) return;
  
  // Remove any existing game over
  const existing = gridEl.querySelector('.puzzle-game-over');
  if (existing) existing.remove();
  
  const gameOver = document.createElement('div');
  gameOver.className = 'puzzle-game-over';
  gameOver.innerHTML = `
    <h4>🧩 Puzzle Complete!</h4>
    <p>Final Score: <b>${P.score}</b></p>
    <button class="btn btn-cq" onclick="resetPuzzle()">Play Again</button>
  `;
  gridEl.appendChild(gameOver);
  
  beep(200);
  speak('Level complete!');
}

function resetPuzzle() {
  initPuzzle();
  renderPuzzle();
}

function renderPuzzle() {
  const gridEl = document.getElementById('puzzle-grid');
  const scoreEl = document.getElementById('puzzle-score');
  const nextEl = document.getElementById('puzzle-next');
  if (!gridEl || !scoreEl || !nextEl) return;
  
  if (scoreEl) scoreEl.textContent = P.score;
  
  const feedback = gridEl.querySelector('.puzzle-feedback');
  gridEl.innerHTML = '';
  for (let r = 0; r < PUZZLE_SIZE; r++) {
    for (let c = 0; c < PUZZLE_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'puzzle-cell';
      cell.style.gridRow = r + 1;
      cell.style.gridColumn = c + 1;
      if (P.grid[r][c]) {
        cell.classList.add('filled');
        cell.style.background = P.grid[r][c];
      }
      gridEl.appendChild(cell);
    }
  }
  if (feedback) gridEl.appendChild(feedback);
  
  nextEl.innerHTML = '';
  P.nextBlocks.forEach((block, idx) => {
    const preview = document.createElement('div');
    preview.className = 'puzzle-preview' + (block.wrong ? ' wrong-block' : '');
    preview.innerHTML = block.shape.map(row => 
      '<div class="puzzle-preview-row">' + row.map(v => 
        v ? '<div class="puzzle-preview-cell filled"></div>' : '<div class="puzzle-preview-cell"></div>'
      ).join('') + '</div>'
    ).join('');
    preview.querySelectorAll('.puzzle-preview-cell.filled').forEach(c => c.style.background = block.color);
    nextEl.appendChild(preview);
  });
}

/* ---------- 7. REWARDS ---------- */
function addXP(xp, coins) {
  const before = lvl(); S.xp += xp; S.coins += coins; floatXP(`+${xp} XP${coins ? ' +' + coins + '🪙' : ''}`);
  S.earned.coins += coins;
  if (lvl() > before) { S.diamonds++; S.earned.diamonds++; popup('🎊🏆🚀', 'Level Up!', `You reached Level ${lvl()}! +1 💎`, true); }
  checkBadges(); save(); hdr();
}
function checkBadges() {
  BADGES.forEach(b => { if (!S.badges.includes(b.id) && b.v() >= b.g) { S.badges.push(b.id); const bonus = backendAccount ? 0 : 10; S.coins += bonus; S.earned.coins += bonus; popup('🏅✨', 'Badge Unlocked!', `${b.e} ${b.n}${bonus ? ' (+10 🪙)' : ''}`, true); } });
}
function hdr() { $('#hdrStats').innerHTML = `<span class="level-chip">Lv ${lvl()}</span><span>🪙 ${S.coins}</span><span>💎 ${S.diamonds}</span><span>⭐ ${S.stars}</span><span>🔥 ${S.streak}</span>`; }

function lifelineInventory() {
  if (!S) return null;
  if (!S.inventory) S.inventory = {hint: 0, '5050': 0};
  S.inventory.hint = Math.max(0, Number(S.inventory.hint) || 0);
  S.inventory['5050'] = Math.max(0, Number(S.inventory['5050']) || 0);
  return S.inventory;
}
const renderHeaderStats = hdr;
hdr = function() {
  renderHeaderStats();
  if (!S) return;
  const stock = lifelineInventory();
  const target = $('#hdrStats');
  target.insertAdjacentHTML('beforeend', `<span class="inventory-chip" title="Available uses">💡 Hint: ${stock.hint}</span><span class="inventory-chip" title="Available uses">🎯 50/50: ${stock['5050']}</span>`);
};

/* ---------- 7a. STORE ---------- */
const STORE_ITEMS = [
  {id: 'hint', name: '💡 HINT', desc: 'Get a useful clue for the current question', price: 10, currency: 'coins', icon: '💡'},
  {id: '5050', name: '🎯 50/50', desc: 'Remove two incorrect answer options', price: 5, currency: 'diamonds', icon: '🎯'}
];

async function purchaseItem(itemId) {
  const item = STORE_ITEMS.find(i => i.id === itemId);
  if (!item) return popup('❌', 'Item not found', 'The requested item is not available.');

  if (backendAccount) {
    if (S.storePurchaseBusy) return;
    if (!confirm(`Purchase ${item.name} for ${item.price} ${item.currency === 'coins' ? '🪙' : '💎'}?`)) return;
    S.storePurchaseBusy = true;
    try {
      applyStoreStatus(await authRequest('/store/purchase', {
        method: 'POST',
        body: JSON.stringify({
          item_id: itemId,
          request_id: globalThis.crypto?.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => {
            const value = Math.random() * 16 | 0;
            return (character === 'x' ? value : (value & 3 | 8)).toString(16);
          })
        })
      }));
      save(); hdr(); go('store');
      popup('✅', 'Purchase Complete', `You bought ${item.name}! Check your inventory.`);
    } catch (e) {
      popup('❌', 'Purchase failed', e.message);
    } finally {
      S.storePurchaseBusy = false;
    }
    return;
  }

  if (item.currency === 'coins' && S.coins < item.price) return popup('❌', 'Not enough Coins', `You need ${item.price} 🪙 but only have ${S.coins}.`);
  if (item.currency === 'diamonds' && S.diamonds < item.price) return popup('❌', 'Not enough Diamonds', `You need ${item.price} 💎 but only have ${S.diamonds}.`);
  
  if (!confirm(`Purchase ${item.name} for ${item.price} ${item.currency === 'coins' ? '🪙' : '💎'}?`)) return;
  
  const before = item.currency === 'coins' ? S.coins : S.diamonds;
  if (item.currency === 'coins') S.coins -= item.price;
  else S.diamonds -= item.price;
  const stock = lifelineInventory();
  stock[itemId]++;
  
  const txn = {id: 'txn_' + Date.now() + '_' + Math.floor(Math.random() * 1000), item: itemId, name: item.name, currency: item.currency, amount: item.price, before, after: before - item.price, date: new Date().toISOString()};
  S.transactions.push(txn);
  S.spent[item.currency] += item.price;
  
  save(); hdr(); go('store');
  popup('✅', 'Purchase Complete', `You bought ${item.name}! Check your inventory.`);
}

function store() {
  const stock = lifelineInventory();
  return `<h3>🛒 Store</h3>
  <div class="cq-card mb-3">
    <div class="d-flex justify-content-between mb-2"><span>🪙 Coins</span><b>${S.coins}</b></div>
    <div class="d-flex justify-content-between mb-2"><span>💎 Diamonds</span><b>${S.diamonds}</b></div>
    <div class="d-flex justify-content-between"><span>📈 Total Earned</span><b class="text-mut">${S.earned.coins} 🪙 · ${S.earned.diamonds} 💎</b></div>
    <div class="d-flex justify-content-between"><span>📉 Total Spent</span><b class="text-mut">${S.spent.coins} 🪙 · ${S.spent.diamonds} 💎</b></div>
  </div>
  <div class="cq-card mb-3"><b>Available uses</b><div class="d-flex gap-3 mt-1"><span>💡 Hint: ${stock.hint}</span><span>🎯 50/50: ${stock['5050']}</span></div></div>
  <div class="row g-3 mb-3">${STORE_ITEMS.map(i => `
    <div class="col-12 col-md-6"><div class="cq-card">
      <div class="d-flex justify-content-between"><h5>${i.icon} ${i.name}</h5><span class="badge" style="background:var(--gold);color:#000;padding:.3rem .6rem;border-radius:12px">${i.price} ${i.currency === 'coins' ? '🪙' : '💎'}</span></div>
      <p class="small text-mut">${i.desc}</p>
      <button class="btn btn-cq w-100" ${S.storePurchaseBusy ? 'disabled' : ''} onclick="purchaseItem('${i.id}')">Buy · ${stock[i.id]} owned</button>
    </div></div>`).join('')}</div>
  <div class="cq-card"><h5>🧾 Transaction History</h5>
  ${S.transactions.length ? S.transactions.slice().reverse().map(t => `
    <div class="d-flex justify-content-between py-2 border-bottom" style="border-color:var(--card2)">
      <div><b>${t.name}</b><br><span class="small text-mut">${new Date(t.date).toLocaleString()}</span></div>
      <div class="text-end"><span class="text-danger">-${t.amount} ${t.currency === 'coins' ? '🪙' : '💎'}</span><br><span class="small text-mut">${t.before} → ${t.after}</span></div>
    </div>`).join('') : '<p class="text-mut">No transactions yet.</p>'}
  </div>`;
}

/* ---------- 3. AUTH ---------- */
function start() {
  document.documentElement.dataset.theme = localStorage.getItem('cq_theme') || 'dark';
  const sess = localStorage.getItem('cq_session');
  app.innerHTML = `<div class="splash"><img src="logo.png" alt="Cortex Quest" width="110" height="110" /><h1 class="mt-3 fw-bold">Cortex Quest</h1><p class="text-mut">Learn. Play. Level up. 🧠</p></div>`;
  setTimeout(restoreBackendSession, 2000);
}
let authTab = 'login', pickedAv = AVATARS[0];
async function restoreBackendSession() {
  try {
    let me;
    try { me = await authRequest('/auth/me', {}, false); }
    catch (e) {
      if (e.status !== 401) throw e;
      const refreshed = await authRequest('/auth/refresh', { method: 'POST' }, false);
      accessToken = refreshed.access_token;
      me = await authRequest('/auth/me', {}, false);
    }
    backendAccount = me.account;
    await enterBackend(me.account, me.profile);
  } catch (_) { authView(); }
}
function authView() {
  const t = authTab;
  app.innerHTML = `<div class="view mx-auto pt-5" style="max-width:420px"><div class="cq-card"><h3 class="text-center">Who is playing? ${pickedAv}</h3>
  <div class="d-flex gap-2 mb-3"><button class="btn ${t == 'login' ? 'btn-cq' : 'btn-soft'} flex-fill" onclick="authTab='login';authView()">Login</button><button class="btn ${t == 'reg' ? 'btn-cq' : 'btn-soft'} flex-fill" onclick="authTab='reg';authView()">Register</button><button class="btn ${t == 'guest' ? 'btn-cq' : 'btn-soft'} flex-fill" onclick="authTab='guest';authView()">Guest</button></div>
  ${t != 'login' ? `<div class="text-center mb-2">${AVATARS.map(a => `<button class="btn btn-soft m-1 ${a == pickedAv ? 'border border-2' : ''}" onclick="pickedAv='${a}';authView()">${a}</button>`).join('')}</div>` : ''}
  ${t == 'guest' ? '' : '<input id="u" class="form-control mb-2" placeholder="Username"><input id="pw" type="password" class="form-control mb-2" placeholder="Password">'}
  ${t == 'reg' ? '<input id="nm" class="form-control mb-2" placeholder="Display name">' : ''}
  <div id="err" class="text-danger small mb-2"></div><button class="btn btn-cq w-100" onclick="doAuth()">${t == 'login' ? 'Login 🚀' : t == 'reg' ? 'Create player ✨' : 'Play as guest 🎮'}</button></div></div>`;
}
function doAuth() {
  if (authBusy) return;
  const users = JSON.parse(localStorage.getItem('cq_users') || '{}'), err = m => $('#err').textContent = m;
  authBusy = true;
  const button = app.querySelector('button.btn-cq.w-100');
  if (button) button.disabled = true;
  const finish = () => { authBusy = false; if (button) button.disabled = false; };
  if (authTab == 'guest') {
    authRequest('/auth/guest', { method: 'POST', body: JSON.stringify({ avatar: pickedAv }) }).then(async data => {
      accessToken = data.access_token; backendAccount = data.account; await enterBackend(data.account, data.profile);
    }).catch(e => err(e.message)).finally(finish);
    return;
  }
  const u = $('#u').value.trim().toLowerCase(), p = $('#pw').value;
  if (!u || !p) { err('Enter a username and password.'); finish(); return; }
  if (p.length < 8) { err('Password must be at least 8 characters.'); finish(); return; }
  if (authTab == 'reg' && !/^[a-zA-Z0-9_]{3,50}$/.test(u)) { err('Username must be 3-50 characters: letters, digits, underscores only.'); finish(); return; }
  if (authTab == 'reg') {
    const name = $('#nm').value.trim() || u;
    if (name.length > 50) { err('Display name must be 50 characters or fewer.'); finish(); return; }
    authRequest('/auth/register', { method: 'POST', body: JSON.stringify({ username: u, password: p, display_name: name, avatar: pickedAv }) }).then(async data => {
      accessToken = data.access_token; backendAccount = data.account; await enterBackend(data.account, data.profile);
    }).catch(e => err(e.message)).finally(finish);
    return;
  }
  authRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username: u, password: p }) }).then(async data => {
    accessToken = data.access_token; backendAccount = data.account; await enterBackend(data.account, data.profile);
  }).catch(e => {
    const localOnly = Object.prototype.hasOwnProperty.call(users, u);
    err(localOnly && /Invalid username or password/i.test(e.message)
      ? 'Login failed. If this username is from an older local-only account, that account cannot sign in to the server. Its saved game data is unchanged and is not transferred. Use its server password or register a server account with a different username.'
      : e.message);
  }).finally(finish);
}
function applyServerProfile(profile, preserveLegacyLocal = false) {
  if (!S) return;
  if (!S.serverProfile) S.serverProfile = {};
  for (const field of ['xp', 'coins', 'diamonds', 'stars', 'streak']) {
    const value = Number(profile[field]);
    if (!Number.isFinite(value)) continue;
    const previousServerValue = Number(S.serverProfile[field]);
    const localDelta = Number.isFinite(previousServerValue)
      ? Number(S[field] || 0) - previousServerValue
      : (preserveLegacyLocal ? Math.max(0, Number(S[field] || 0) - value) : 0);
    S.serverProfile[field] = value;
    S[field] = Math.max(0, value + localDelta);
  }
}
function applyServerBalances(profile) {
  for (const field of ['coins', 'diamonds']) {
    const value = Number(profile[field]);
    if (!Number.isFinite(value)) continue;
    const localDelta = Number(S[field] || 0) - Number(S.serverProfile?.[field] || 0);
    if (!S.serverProfile) S.serverProfile = {};
    S.serverProfile[field] = value;
    S[field] = Math.max(0, value + localDelta);
  }
}
function applyStoreStatus(status) {
  if (!S || !status) return;
  applyServerBalances(status.balances || {});
  S.inventory = {
    hint: Math.max(0, Number(status.inventory?.hint) || 0),
    '5050': Math.max(0, Number(status.inventory?.fifty_fifty) || 0)
  };
  const localTransactions = (S.transactions || []).filter(transaction =>
    !String(transaction.id).startsWith('server_'));
  const serverTransactions = (status.transactions || []).map(transaction => ({
    id: `server_${transaction.id}`,
    item: transaction.item_id,
    name: STORE_ITEMS.find(item => item.id === transaction.item_id)?.name || transaction.item_id,
    currency: transaction.currency,
    amount: Number(transaction.amount),
    before: Number(transaction.balance_before),
    after: Number(transaction.balance_after),
    date: transaction.created_at
  }));
  S.transactions = [...localTransactions, ...serverTransactions]
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  S.spent = S.transactions.reduce((spent, transaction) => {
    if (transaction.currency === 'coins' || transaction.currency === 'diamonds') {
      spent[transaction.currency] += Number(transaction.amount) || 0;
    }
    return spent;
  }, {coins: 0, diamonds: 0});
}
function applyServerAttemptStats(stats) {
  if (!S || !stats || !Number.isFinite(Number(stats.total_questions)) || !Number.isFinite(Number(stats.total_correct))) return;
  const serverQuestions = Math.max(0, Number(stats.total_questions));
  const serverCorrect = Math.max(0, Number(stats.total_correct));
  const sessionTypes = Array.isArray(stats.by_session_type) ? stats.by_session_type : [];
  const serverMockAttempts = Math.max(0, Number(sessionTypes.find(item => item.session_type === 'mock')?.attempts) || 0);
  const oldServerStats = S.serverStats || {};
  const previousQuestions = Number.isFinite(Number(oldServerStats.total_questions)) ? Number(oldServerStats.total_questions) : serverQuestions;
  const previousCorrect = Number.isFinite(Number(oldServerStats.total_correct)) ? Number(oldServerStats.total_correct) : serverCorrect;
  const previousMockAttempts = Number.isFinite(Number(oldServerStats.mock_attempts)) ? Number(oldServerStats.mock_attempts) : serverMockAttempts;
  if (!Number.isFinite(Number(S.localSolved))) S.localSolved = Math.max(0, Number(S.solved || 0) - previousQuestions);
  if (!Number.isFinite(Number(S.localCorrect))) S.localCorrect = Math.max(0, Number(S.correct || 0) - previousCorrect);
  if (!Number.isFinite(Number(S.localTests))) S.localTests = Math.max(0, Number(S.tests || 0) - previousMockAttempts);
  S.serverStats = {total_questions: serverQuestions, total_correct: serverCorrect, total_attempts: Math.max(0, Number(stats.total_attempts) || 0), mock_attempts: serverMockAttempts};
  S.solved = S.localSolved + serverQuestions;
  S.correct = S.localCorrect + serverCorrect;
  S.tests = S.localTests + serverMockAttempts;
}
function trackLocalSolve(correct) {
  if (!backendAccount) return;
  if (!Number.isFinite(Number(S.localSolved))) S.localSolved = Math.max(0, Number(S.solved || 0) - Number(S.serverStats?.total_questions || 0) - 1);
  else S.localSolved++;
  if (correct) {
    if (!Number.isFinite(Number(S.localCorrect))) S.localCorrect = Math.max(0, Number(S.correct || 0) - Number(S.serverStats?.total_correct || 0) - 1);
    else S.localCorrect++;
  }
}
function trackLocalTest() {
  if (!backendAccount) return;
  if (!Number.isFinite(Number(S.localTests))) {
    const mockAttempts = Number(S.serverStats?.mock_attempts || 0);
    S.localTests = Math.max(0, Number(S.tests || 0) - mockAttempts - 1);
  } else S.localTests++;
}
async function syncBackendState() {
  const [me, progress, storeStatus] = await Promise.all([
    authRequest('/auth/me'),
    authRequest('/quiz/progress/v2'),
    authRequest('/store')
  ]);
  if (!S || !backendAccount) throw new Error('No active account.');
  const profile = progress.profile || me.profile;
  S.name = profile.display_name || me.profile.display_name;
  S.av = profile.avatar || me.profile.avatar;
  S.id = profile.player_id || me.profile.player_id;
  applyServerProfile(profile, false);
  applyStoreStatus(storeStatus);
  try { applyServerAttemptStats(await authRequest('/quiz/attempts/summary')); } catch (_) { /* Keep the last known server and local counters. */ }

  const dbDone = {}, dbSubs = {};
  for (const module of progress.modules || []) {
    const modId = FRONT_MODULES[module.module_slug];
    if (!modId) continue;
    for (const difficulty of module.difficulties || []) {
      const diff = DIFFS.find(d => d.toLowerCase() === difficulty.difficulty)?.toLowerCase();
      if (!diff) continue;
      for (const submodule of difficulty.submodules || []) {
        const subId = submodule.submodule ? FRONT_SUBMODULES[submodule.submodule] : null;
        if (submodule.submodule && !subId) continue;
        for (const level of submodule.levels || []) {
          if (!level.completed) continue;
          if (subId) {
            const key = `${modId}|${subId}`;
            const target = dbSubs[key] || (dbSubs[key] = {unlocked: 1, completed: [], stars: {}});
            if (!target.completed.includes(level.level)) target.completed.push(level.level);
            target.stars[level.level] = Math.max(target.stars[level.level] || 0, level.stars_earned || 0);
            dbDone[`${modId}|${subId}|${level.level}|${diff}`] = 1;
          } else dbDone[`${modId}|${DIFFS.find(d => d.toLowerCase() === diff)}|${level.level}`] = 1;
        }
      }
    }
  }
  Object.values(dbSubs).forEach(state => {
    state.completed.sort((a, b) => a - b);
    state.unlocked = 1;
    while (state.unlocked < 50 && state.completed.includes(state.unlocked)) state.unlocked++;
  });
  S.dbDone = dbDone;
  S.dbSubs = dbSubs;
  backendProgressReady = true;
  save();
  hdr();
  return true;
}
async function enterBackend(account, profile) {
  const user = 'backend_' + account.id, key = 'cq_s_' + user;
  backendAccount = account;
  backendProgressReady = false;
  const storedState = JSON.parse(localStorage.getItem(key) || 'null');
  S = storedState || newState(user, profile.display_name, profile.avatar);
  S.user = user; S.name = profile.display_name; S.av = profile.avatar;
  S.id = profile.player_id; applyServerProfile(profile, !!storedState);
  localStorage.setItem('cq_session', user);
  if (!S.earned) S.earned = {coins: 0, diamonds: 0};
  if (!S.spent) S.spent = {coins: 0, diamonds: 0};
  if (!S.transactions) S.transactions = [];
  if (!S.powerups) S.powerups = {used5050: {}, usedHint: {}};
  if (!S.certificates) S.certificates = [];
  if (!S.dbDone) S.dbDone = {};
  if (!S.dbSubs) S.dbSubs = {};
  if (S.daily.d != today()) S.daily = {d: today(), solved: 0, levels: 0, brain: 0, rev: 0, claimed: false};
  let syncError = null;
  try { await syncBackendState(); } catch (e) { syncError = e; }
  if (String(account.account_type || '').toLowerCase() === 'guest') setTimeout(showGuestReminder, 3000);
  setTheme(THEMES.some(t => t.id == S.set.theme) ? S.set.theme : 'dark'); save();
  $('#shell').classList.remove('d-none'); hdr(); go('home'); checkBadges();
  if (syncError) popup('⚠️', 'Progress unavailable', 'Your profile loaded, but saved server progress could not be refreshed. Open Modules to retry.');
}
function retryProgress(view, args) {
  app.innerHTML = '<div class="view mx-auto" style="max-width:520px"><div class="cq-card text-center">Loading saved progress…</div></div>';
  syncBackendState().then(() => go(view, args)).catch(() => {
    app.innerHTML = `<div class="view mx-auto" style="max-width:520px"><div class="cq-card text-center"><h5>Saved progress is unavailable</h5><p class="text-mut">Check your connection and try again. Your saved data has not been replaced.</p><button class="btn btn-cq" onclick="retryProgress('${view}','${args || ''}')">Retry</button> <button class="btn btn-soft" onclick="go('home')">Dashboard</button></div></div>`;
  });
}
function enter(user) {
  S = JSON.parse(localStorage.getItem('cq_s_' + user)); localStorage.setItem('cq_session', user);
  if (!S.earned) S.earned = {coins: 0, diamonds: 0};
  if (!S.spent) S.spent = {coins: 0, diamonds: 0};
  if (!S.transactions) S.transactions = [];
  if (!S.powerups) S.powerups = {used5050: {}, usedHint: {}};
  if (!S.certificates) S.certificates = [];
  if (S.daily.d != today()) S.daily = {d: today(), solved: 0, levels: 0, brain: 0, rev: 0, claimed: false};
  if (S.lastDay != today()) { const y = new Date(Date.now() - 864e5).toDateString(); S.streak = S.lastDay == y ? S.streak + 1 : 1; S.lastDay = today(); }
  setTheme(THEMES.some(t => t.id == S.set.theme) ? S.set.theme : 'dark'); save();
  $('#shell').classList.remove('d-none'); hdr(); go('home'); checkBadges();
}
function showGuestReminder() {
  if (!S || String(backendAccount?.account_type || '').toLowerCase() !== 'guest') return;
  if (document.getElementById('guestReminder')) return;
  const div = document.createElement('div');
  div.id = 'guestReminder';
  div.className = 'guest-reminder';
  div.innerHTML = `<div class="guest-reminder-content">
    <h4>👋 Welcome, Guest!</h4>
    <p>Your progress is saved to this guest account in this browser. Use the same browser session to return to it.</p>
    <div class="d-flex gap-2"><button class="btn btn-cq btn-sm" onclick="go('settings')">🔐 Register / Login</button><button class="btn btn-soft btn-sm" onclick="this.closest('.guest-reminder').remove()">Dismiss</button></div>
  </div>`;
  document.body.appendChild(div);
  setTimeout(() => { if (div.parentNode) div.remove(); }, 15000);
}
async function logout() {
  clearInterval(timer);
  const hadBackendSession = !!backendAccount;
  accessToken = null; backendAccount = null;
  localStorage.removeItem('cq_session'); S = null;
  $('#shell').classList.add('d-none'); authTab = 'login'; authView();
  if (hadBackendSession) {
    try { await authRequest('/auth/logout', { method: 'POST' }, false); }
    catch (_) { const err = $('#err'); if (err) err.textContent = 'Signed out here, but the server could not confirm logout. Check your connection and try again.'; }
  }
}

/* ---------- 4. VIEWS ---------- */
const TABS = [['home', '🏠', 'Home'], ['modules', '📚', 'Modules'], ['challenges', '🎯', 'Challenges'], ['board', '🏆', 'Leaderboard'], ['profile', '👤', 'Profile'], ['certificates', '📜', 'Certificates']];
function go(v, a) {
  if (backendAccount && !backendProgressReady && ['modules', 'mod', 'submodule', 'learn', 'learnSub'].includes(v)) return retryProgress(v, a);
  hush(); clearInterval(timer); G = G && G.keep ? G : null;
  const map = {home, modules, mod, submodule, learnSub, learn, challenges, mock, test: testFeature, board, profile, revision, settings, store, certificates}, tab = {mod: 'modules', submodule: 'modules', learnSub: 'modules', learn: 'modules', mock: 'modules', test: 'home', revision: 'profile', settings: 'profile'}[v] || v;
  $('#tabs').innerHTML = TABS.map((t, i) => `<button class="${t[0] == tab ? 'on' : ''}" onclick="go('${t[0]}')"><span>${t[1]}</span>${(LANG[S.set.lang] || [])[i] || t[2]}</button>`).join('');
  app.innerHTML = `<div class="view">${map[v](a)}</div>`; window.scrollTo(0, 0); hdr(); musicFor(v, a); if (v == 'home') { welcome(); welcomeText(); }
}
const levelsDone = m => Object.keys({...S.done, ...S.dbDone}).filter(k => k.startsWith(m + '|')).length;
const completedLevelCount = () => Object.keys({...S.done, ...S.dbDone}).length;

// Submodule progress helpers
const subKey = (modId, subId) => `${modId}|${subId}`;
const getSubProgress = (modId, subId) => {
  const key = subKey(modId, subId);
  const local = S.subs[key] || {unlocked: 1, completed: [], stars: {}};
  const server = S.dbSubs?.[key] || {unlocked: 1, completed: [], stars: {}};
  return {unlocked: Math.max(local.unlocked || 1, server.unlocked || 1), completed: [...new Set([...(local.completed || []), ...(server.completed || [])])], stars: {...(local.stars || {}), ...(server.stars || {})}};
};
const isLevelUnlocked = (modId, subId, level) => {
  const prog = getSubProgress(modId, subId);
  return level <= prog.unlocked;
};
const isLevelCompleted = (modId, subId, level) => {
  const prog = getSubProgress(modId, subId);
  return prog.completed.includes(level);
};
const getLevelStars = (modId, subId, level) => {
  const prog = getSubProgress(modId, subId);
  return prog.stars[level] || 0;
};
const acc = () => S.solved ? Math.round(S.correct / S.solved * 100) : 0;
const dailyTasks = () => [['Answer 20 questions 🧮', S.daily.solved, 20], ['Complete a level 🎯', S.daily.levels, 1], ['Play a brain game 🧩', S.daily.brain, 1], ['Revise formulas 📐', S.daily.rev, 1]];
const dailyDone = () => dailyTasks().every(t => t[1] >= t[2]);

function home() {
  const xpIn = S.xp % 200, last = S.last, lm = last && MODS.find(m => m.id == last.m);
  let continueBtn = "go('modules')";
  let continueText = 'Browse modules';
  if (lm) {
    if (last.sub) {
      // Submodule format: {m: modId, d: diff, l: level, sub: subId}
      const s = (SUBMODULES[last.m] || []).find(x => x.id == last.sub);
      continueBtn = `go('learnSub','${last.m}|${last.sub}|${last.l}|${last.d}')`;
      continueText = s ? `Continue ${s.n} Level ${last.l}` : 'Continue';
    } else {
      // Legacy format: {m: modId, d: diff, l: level}
      continueBtn = `go('learn','${last.m}|${last.d}|${last.l}')`;
      continueText = 'Continue';
    }
  }
  return `<h2 class="mb-1">Hi ${S.name} ${S.av}</h2><p class="text-mut">Ready for today's quest?</p>
  <div class="cq-card mb-3"><div class="d-flex justify-content-between"><b>Level ${lvl()} 🚀</b><span class="text-mut">${xpIn}/200 XP</span></div>${bar(xpIn, 200)}
  <div class="d-flex flex-wrap gap-3 mt-3 text-mut"><span>🪙 ${S.coins} Coins</span><span>💎 ${S.diamonds} Diamonds</span><span>⭐ ${S.stars} Stars</span><span>🔥 ${S.streak}-day streak</span></div></div>
  <div class="row g-3 mb-3">
   <div class="col-md-6"><div class="cq-card"><h5>▶️ Continue Quest</h5><p class="text-mut">${lm ? `${lm.e} ${lm.n} · ${last.d} · Level ${last.l}${last.sub ? ' · ' + (SUBMODULES[last.m]?.find(x => x.id == last.sub)?.n || '') : ''}` : 'Pick your first module and start learning!'}</p><button class="btn btn-cq" onclick="${continueBtn}">${continueText}</button></div></div>
   <div class="col-md-6"><div class="cq-card"><h5>📅 Daily Challenge</h5>${bar(dailyTasks().filter(t => t[1] >= t[2]).length, 4)}<p class="text-mut mt-2">${dailyTasks().filter(t => t[1] >= t[2]).length}/4 tasks done</p><button class="btn btn-cq" onclick="go('challenges')">Open</button></div></div></div>
  <h5>⚡ Quick Actions</h5><div class="row g-2 mb-3">${[['🎲', 'Random practice', "randomPractice()"], ['📝', 'Mock test', "go('mock')"], ['📋', 'Test', "go('test')"], ['🧩', 'Brain game', "brainStart()"], ['📚', 'Revision', "go('revision')"], ['🛒', 'Store', "go('store')"]].map(a => `<div class="col-6 col-md-3"><div class="cq-card hov text-center" onclick="${a[2]}"><div class="big-emoji">${a[0]}</div>${a[1]}</div></div>`).join('')}</div>
  <div class="row g-3"><div class="col-md-6"><div class="cq-card"><h5>🏅 Achievements</h5><div class="d-flex gap-2 flex-wrap">${BADGES.slice(0, 6).map(b => `<span class="badge-tile ${S.badges.includes(b.id) ? 'on' : ''} big-emoji" title="${b.n}">${b.e}</span>`).join('')}</div><a href="#" onclick="go('profile');return false">See all</a></div></div>
  <div class="col-md-6"><div class="cq-card"><h5>🏆 Leaderboard</h5>${rank('global').slice(0, 3).map((r, i) => `<div>${['🥇', '🥈', '🥉'][i]} ${r[0]} — ${r[1]} XP</div>`).join('')}<a href="#" onclick="go('board');return false">View all</a></div></div></div>`;
}
function modules() {
  return `<h3>📚 Modules</h3><div class="row g-3">${MODS.map(m => {
    if (m.go) return `<div class="col-6 col-md-4 col-lg-3"><div class="cq-card hov" onclick="go('${m.go}')"><div class="big-emoji">${m.e}</div><b>${m.n}</b><div class="small text-mut">${m.x}</div></div></div>`;
    const subs = SUBMODULES[m.id] || [];
    let totalCompleted = 0;
    subs.forEach(s => { const prog = getSubProgress(m.id, s.id); totalCompleted += prog.completed.length || 0; });
    return `<div class="col-6 col-md-4 col-lg-3"><div class="cq-card hov" onclick="go('mod','${m.id}')"><div class="big-emoji">${m.e}</div><b>${m.n}</b><div class="small text-mut my-1">${totalCompleted}/150 levels</div>${bar(totalCompleted, 150)}</div></div>`;
  }).join('')}</div>`;
}
function mod(a) {
  let [id, d] = a.split('|'); const m = MODS.find(x => x.id == id); d = d || 'Easy';
  const subs = SUBMODULES[id] || [];
  return `<button class="btn btn-soft mb-2" onclick="go('modules')">← Modules</button><h3>${m.e} ${m.n}</h3>
  <div class="row g-3">${subs.map(s => { const prog = getSubProgress(id, s.id); const completed = prog.completed.length; return `<div class="col-6 col-md-4"><div class="cq-card hov" onclick="go('submodule','${id}|${s.id}')"><div class="big-emoji">${s.e}</div><b>${s.n}</b><div class="small text-mut">${s.desc}</div><div class="mt-2">${bar(completed, 50)}<div class="small text-mut">${completed}/50 levels · ${prog.unlocked > 1 ? `Level ${prog.unlocked} unlocked` : 'Level 1 unlocked'}</div></div></div></div>`; }).join('')}</div>`;
}
function submodule(a) {
  const [modId, subId] = a.split('|');
  const m = MODS.find(x => x.id == modId);
  const s = (SUBMODULES[modId] || []).find(x => x.id == subId);
  const prog = getSubProgress(modId, subId);
  if (!s) return `<div class="text-danger">Submodule not found</div>`;
  const levelsHtml = [...Array(50)].map((_, i) => {
    const level = i + 1;
    const unlocked = isLevelUnlocked(modId, subId, level);
    const completed = isLevelCompleted(modId, subId, level);
    const stars = getLevelStars(modId, subId, level);
    let cls = 'level-card';
    if (completed) cls += ' completed';
    else if (unlocked) cls += ' unlocked';
    else cls += ' locked';
    const starsHtml = stars ? `<div class="level-stars">${'⭐'.repeat(stars)}</div>` : '';
    return `<div class="${cls}" ${unlocked ? `onclick="go('learnSub','${modId}|${subId}|${level}')"` : ''}>
      <div class="level-num">${level}</div>
      ${starsHtml}
      ${completed ? '<div class="level-check">✅</div>' : ''}
      ${!unlocked ? '<div class="level-lock">🔒</div>' : ''}
    </div>`;
  }).join('');
  return `<button class="btn btn-soft mb-2" onclick="go('mod','${modId}')">← ${m.e} ${m.n}</button>
  <h3>${s.e} ${s.n}</h3>
  <p class="text-mut mb-3">${s.desc}</p>
  <div class="level-grid">${levelsHtml}</div>`;
}
function learnSub(a) {
  const parts = a.split('|');
  const modId = parts[0], subId = parts[1], levelStr = parts[2], diff = parts[3] || 'Easy';
  const level = parseInt(levelStr);
  const m = MODS.find(x => x.id == modId);
  const s = (SUBMODULES[modId] || []).find(x => x.id == subId);
  const prog = getSubProgress(modId, subId);
  if (!s || !isLevelUnlocked(modId, subId, level)) return `<div class="text-danger">Level locked</div>`;
  const completed = isLevelCompleted(modId, subId, level);
  const stars = getLevelStars(modId, subId, level);
  S.last = {m: modId, d: diff, l: level, sub: subId}; save();
  const diffBtns = DIFFS.map(d => `<button class="btn ${d === diff ? 'btn-cq' : 'btn-soft'}" onclick="go('learnSub','${modId}|${subId}|${level}|${d}')">${d}</button>`).join('');
  const key = `${modId}|${subId}|${level}|${diff}`;
  return `<button class="btn btn-soft mb-2" onclick="go('submodule','${modId}|${subId}')">← ${s.n}</button>
  <div class="cq-card"><span class="small text-mut">${s.e} ${s.n} · Level ${level}/50</span><h3>${m.e} ${m.n} — ${s.n}</h3>
  <p>${m.x}</p>
  <h6>📌 Important points</h6><ul>${m.p.map(p => `<li>${p}</li>`).join('')}</ul>
  <h6>✏️ Formula</h6><div class="cq-card mb-3" style="background:var(--card2)"><code style="color:var(--gold)">${m.f}</code></div>
  <h6>💡 Example</h6><p class="text-mut">${m.q[0][0]} → <b>${m.q[0][1][m.q[0][2]]}</b> (${m.q[0][3]})</p>
  <div class="d-flex flex-wrap gap-2 mb-3">${diffBtns}</div>
  <div class="d-flex flex-wrap gap-2"><button class="btn btn-soft" onclick="toggleBm('${modId}',this)">${S.bm.includes(modId) ? '🔖 Bookmarked' : '🔖 Bookmark'}</button><button class="btn btn-soft" onclick="saveFormula('${modId}')">📐 Save formula</button><button class="btn btn-cq ms-auto" onclick="startLevelSub('${key}')">Start Practice ▶️</button></div></div>`;
}
function learn(k, auto) {
  const [id, d, l] = k.split('|'), m = MODS.find(x => x.id == id);
  S.last = {m: id, d, l}; save();
  const html = `<button class="btn btn-soft mb-2" onclick="go('mod','${id}')">← Back</button>
  <div class="cq-card"><span class="small text-mut">${d} · Level ${l}</span><h3>${m.e} ${m.t}</h3><p>${m.x}</p>
  <h6>📌 Important points</h6><ul>${m.p.map(p => `<li>${p}</li>`).join('')}</ul>
  <h6>✏️ Formula</h6><div class="cq-card mb-3" style="background:var(--card2)"><code style="color:var(--gold)">${m.f}</code></div>
  <h6>💡 Example</h6><p class="text-mut">${m.q[0][0]} → <b>${m.q[0][1][m.q[0][2]]}</b> (${m.q[0][3]})</p>
  <div class="d-flex flex-wrap gap-2"><button class="btn btn-soft" onclick="toggleBm('${id}',this)">${S.bm.includes(id) ? '🔖 Bookmarked' : '🔖 Bookmark'}</button><button class="btn btn-soft" onclick="saveFormula('${id}')">📐 Save formula</button><button class="btn btn-cq ms-auto" onclick="startLevel('${k}')">Start Practice ▶️</button></div></div>`;
  return html;
}
function toggleBm(id, b) { S.bm = S.bm.includes(id) ? S.bm.filter(x => x != id) : [...S.bm, id]; b.textContent = S.bm.includes(id) ? '🔖 Bookmarked' : '🔖 Bookmark'; save(); }
function saveFormula(id) {
  const m = MODS.find(x => x.id == id);
  if (S.formulas.some(f => f.m == id)) return popup('📐', 'Already saved', 'This formula is in your Formula Locker.');
  S.formulas.push({id: `module_${id}`, m: id, t: m.t, f: m.f, name: m.t, expression: m.f, category: m.n, notes: ''});
  save(); popup('📐✨', 'Formula saved!', 'Find it in Revision → Formula Locker.'); checkBadges();
}
function startLevel(k) {
  const [id, d, l] = k.split('|'), m = MODS.find(x => x.id == id), di = DIFFS.indexOf(d), s = (di * 3 + +l) % m.q.length, len = m.q.length;
  if (backendAccount) return loadDatabasePractice(id, null, d, Number(l), `${m.e} ${m.n} · ${d} L${l}`, k);
  const qs = [0, 1, 2, 3, 4].map(i => m.q[(s + i) % len]).map(q => ({q, m: id, d}));
  runQuiz({title: `${m.e} ${m.n} · ${d} L${l}`, qs, key: k, mock: false});
}
function startLevelSub(k) {
  const [modId, subId, levelStr, d] = k.split('|');
  const level = parseInt(levelStr);
  const m = MODS.find(x => x.id == modId);
  const s = (SUBMODULES[modId] || []).find(x => x.id == subId);
  if (backendAccount) return loadDatabasePractice(modId, subId, d, level, `${m.e} ${m.n} — ${s.n} · ${d} L${level}`, k);
  const di = DIFFS.indexOf(d);
  const qs = [0, 1, 2, 3, 4].map(i => m.q[(di * 3 + level + i) % m.q.length]).map(q => ({q, m: modId, d, sub: subId, level}));
  runQuiz({title: `${m.e} ${m.n} — ${s.n} · ${d} L${level}`, qs, key: k, mock: false});
}
async function loadDatabasePractice(modId, subId, difficulty, level, title, key) {
  const moduleSlug = API_MODULES[modId], submoduleSlug = subId ? API_SUBMODULES[`${modId}|${subId}`] : null;
  if (!moduleSlug || (subId && !submoduleSlug)) return popup('⚠️', 'Practice unavailable', 'This module or submodule is not mapped to the question bank.');
  const backView = subId ? `go('learnSub','${modId}|${subId}|${level}|${difficulty}')` : `go('learn','${key}')`;
  app.innerHTML = '<div class="view mx-auto" style="max-width:520px"><div class="cq-card text-center">Loading practice questions…</div></div>';
  const params = new URLSearchParams({module: moduleSlug, difficulty: difficulty.toLowerCase(), level: String(level), count: '5'});
  if (submoduleSlug) params.set('submodule', submoduleSlug);
  try {
    const data = await authRequest(`/quiz/practice?${params.toString()}`);
    if (!data.questions?.length) {
      app.innerHTML = `<div class="view mx-auto text-center" style="max-width:520px"><div class="cq-card"><h5>No questions available yet</h5><p class="text-mut">There are no database questions for this module, submodule, difficulty, and level.</p><button class="btn btn-cq" onclick="${backView}">Back</button></div></div>`;
      return;
    }
    const qs = data.questions.map(question => {
      const options = [...question.options].sort((a, b) => a.display_order - b.display_order);
      return {q: [question.question_text, options.map(option => option.text), null, ''], m: modId, d: difficulty, sub: subId, level, dbQuestionId: question.id, dbOptionIds: options.map(option => option.id)};
    });
    runQuiz({title, qs, key, mock: false, db: true, dbSessionId: data.session_id, dbModule: moduleSlug, dbSubmodule: submoduleSlug, dbDifficulty: difficulty.toLowerCase(), dbLevel: level, dbTimes: []});
  } catch (e) {
    app.innerHTML = `<div class="view mx-auto text-center" style="max-width:520px"><div class="cq-card"><h5>Could not load practice</h5><p class="text-mut">${escapeHtml(e.message)}. No local questions were substituted.</p><button class="btn btn-cq" onclick="loadDatabasePractice('${modId}','${subId || ''}','${difficulty}',${level},'${escapeHtml(title)}','${key}')">Retry</button> <button class="btn btn-soft" onclick="${backView}">Back</button></div></div>`;
  }
}
function randomPractice() {
  const m = QMODS[Math.floor(Math.random() * QMODS.length)];
  runQuiz({title: `🎲 ${m.n}`, qs: m.q.slice(0, 5).map(q => ({q, m: m.id, d: 'Easy'})), key: null, mock: false});
}

function challenges() {
  const T = dailyTasks(), games = [['🔢', 'Number Sequence', 'brainStart()'], ['🃏', 'Memory Match', 'memStart()'], ['🔷', 'Pattern Recognition', 'patStart()'], ['🧩', 'Logic Puzzle', 'logicStart()'], ['⚡', 'Quick Calculation', 'calcStart()']];
  return `<h3>🎯 Daily Challenges</h3><div class="cq-card mb-3">${T.map(t => `<div class="mb-2"><div class="d-flex justify-content-between"><span>${t[1] >= t[2] ? '✅' : '⬜'} ${t[0]}</span><span class="text-mut">${Math.min(t[1], t[2])}/${t[2]}</span></div>${bar(t[1], t[2])}</div>`).join('')}
  <button class="btn btn-cq mt-2" ${dailyDone() && !S.daily.claimed ? '' : 'disabled'} onclick="claimDaily()">${S.daily.claimed ? 'Claimed ✅' : 'Claim +100 XP +1 💎'}</button></div>
  <h5>🧠 Brain Games</h5><div class="row g-3">${games.map(g => `<div class="col-6 col-md-4"><div class="cq-card hov text-center" onclick="${g[2] || `popup('🚧','Coming soon','${g[1]} is being built — try Number Sequence!')`}"><div class="big-emoji">${g[0]}</div><b>${g[1]}</b><div class="small text-mut">${g[2] ? 'Playable now' : 'Coming soon'}</div></div></div>`).join('')}</div>`;
}
function claimDaily() { S.daily.claimed = true; S.diamonds++; addXP(100, 0); confetti(); go('challenges'); }

function board() {
  return `<h3>🏆 Leaderboard</h3><div class="d-flex gap-2 mb-3">${['global', 'weekly', 'friends'].map(t => `<button class="btn btn-soft" onclick="document.getElementById('lb').innerHTML=lbRows('${t}')">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div><div id="lb" class="cq-card">${lbRows('global')}</div>`;
}
function rank(t) {
  const f = {global: 1, weekly: .3, friends: .6}[t], list = BOTS.slice(t == 'friends' ? 2 : 0, t == 'friends' ? 5 : 6).map(b => [b[2] + ' ' + b[0], Math.round(b[1] * f)]);
  list.push([S.av + ' ' + (S.set.privacy == 'Private' ? 'Anonymous' : S.name) + ' (you)', t == 'weekly' ? S.xp : S.xp]); return list.sort((a, b) => b[1] - a[1]);
}
const lbRows = t => rank(t).map((r, i) => `<div class="d-flex justify-content-between py-2 ${r[0].includes('(you)') ? 'fw-bold' : ''}"><span>${['🥇', '🥈', '🥉'][i] || i + 1 + '.'} ${r[0]}</span><span>${r[1]} XP</span></div>`).join('');

function profile() {
  return `<div class="cq-card text-center mb-3"><div style="font-size:4rem">${S.av}</div><h3>${S.name}</h3><div class="text-mut">Player ID: ${S.id}</div>
  <div class="mt-2">Level ${lvl()} · ${S.xp} XP</div>
  <div class="d-flex justify-content-center flex-wrap gap-3 mt-2">${[['🪙', S.coins], ['💎', S.diamonds], ['⭐', S.stars], ['🔥', S.streak]].map(x => `<b>${x[0]} ${x[1]}</b>`).join('')}</div></div>
  <div class="row g-3 mb-3">${[['Questions solved', S.solved], ['Tests taken', S.tests], ['Accuracy', acc() + '%'], ['Levels done', completedLevelCount()]].map(x => `<div class="col-6 col-md-3"><div class="cq-card text-center"><h4>${x[1]}</h4><span class="text-mut">${x[0]}</span></div></div>`).join('')}</div>
  <h5>🏅 Achievements</h5><div class="row g-3 mb-3">${BADGES.map(b => `<div class="col-6 col-md-3"><div class="cq-card badge-tile ${S.badges.includes(b.id) ? 'on' : ''}"><div class="big-emoji">${b.e}</div><b>${b.n}</b>${bar(b.v(), b.g)}<div class="small">${Math.min(b.v(), b.g)}/${b.g} · ${S.badges.includes(b.id) ? 'Unlocked' : 'Locked 🔒'}</div></div></div>`).join('')}</div>
  <div class="d-flex gap-2"><button class="btn btn-cq" onclick="go('revision')">📚 Revision</button><button class="btn btn-soft" onclick="go('settings')">⚙️ Settings</button></div>`;
}

let fq = '', fm = '', formulaFormOpen = false, editingFormulaId = null;
function formulaEntries() {
  if (!Array.isArray(S.formulas)) S.formulas = [];
  let migrated = false;
  S.formulas.forEach((formula, index) => {
    if (!formula.id) { formula.id = `legacy_${formula.m || 'custom'}_${index}`; migrated = true; }
    if (!formula.name) formula.name = formula.t || 'Saved formula';
    if (!formula.expression) formula.expression = formula.f || '';
    if (!formula.category && formula.m) formula.category = MODS.find(module => module.id === formula.m)?.n || '';
    if (!formula.notes) formula.notes = '';
  });
  if (migrated) save();
  return S.formulas;
}
function visibleFormulas() {
  const search = fq.trim().toLowerCase();
  return formulaEntries().filter(formula => {
    const matchesCategory = !fm || formula.category === fm;
    const searchable = [formula.name, formula.expression, formula.category, formula.notes].join(' ').toLowerCase();
    return matchesCategory && searchable.includes(search);
  });
}
function formulaCards() {
  const formulas = visibleFormulas();
  if (!formulas.length) return '<p class="text-mut">No matching formulas. Add one or change the search/filter.</p>';
  return formulas.map(formula => `<article class="cq-card mb-2" style="background:var(--card2)">
    <div class="d-flex justify-content-between gap-2 align-items-start"><div class="min-w-0">
      <b>${escapeHtml(formula.name)}</b>${formula.category ? `<div class="small text-mut">${escapeHtml(formula.category)}</div>` : ''}
      <code class="d-block mt-1 text-break" style="color:var(--gold)">${escapeHtml(formula.expression)}</code>
      ${formula.notes ? `<p class="small text-mut mb-0 mt-1">${escapeHtml(formula.notes)}</p>` : ''}
    </div><div class="d-flex gap-1 flex-shrink-0">
      <button class="btn btn-soft btn-sm" type="button" onclick="editFormula('${escapeHtml(formula.id)}')">Edit</button>
      <button class="btn btn-soft btn-sm" type="button" onclick="deleteFormula('${escapeHtml(formula.id)}')">Delete</button>
    </div></div></article>`).join('');
}
function setFormulaSearch(value) {
  fq = value;
  const list = $('#formula-list');
  if (list) list.innerHTML = formulaCards();
}
function setFormulaCategory(value) {
  fm = value;
  const list = $('#formula-list');
  if (list) list.innerHTML = formulaCards();
}
function openFormulaForm(formulaId = null) {
  editingFormulaId = formulaId;
  formulaFormOpen = true;
  go('revision');
  if (!formulaId) return;
  const formula = formulaEntries().find(entry => entry.id === formulaId);
  if (!formula) return;
  $('#formula-name').value = formula.name;
  $('#formula-expression').value = formula.expression;
  $('#formula-category').value = formula.category;
  $('#formula-notes').value = formula.notes;
}
function editFormula(formulaId) { openFormulaForm(formulaId); }
function cancelFormulaEdit() {
  formulaFormOpen = false;
  editingFormulaId = null;
  go('revision');
}
function saveFormulaEntry() {
  const name = $('#formula-name').value.trim();
  const expression = $('#formula-expression').value.trim();
  const category = $('#formula-category').value.trim();
  const notes = $('#formula-notes').value.trim();
  if (!name || !expression) return popup('⚠️', 'Formula not saved', 'Enter both a formula name and expression.');
  if (name.length > 100 || expression.length > 500 || category.length > 50 || notes.length > 1000) {
    return popup('⚠️', 'Formula not saved', 'Keep the name under 100 characters, expression under 500, category under 50, and notes under 1,000.');
  }
  const formulas = formulaEntries();
  const existing = formulas.find(formula => formula.id === editingFormulaId);
  const formula = {
    id: editingFormulaId || `formula_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name, expression, category, notes,
    ...(existing?.m ? {m: existing.m} : {})
  };
  S.formulas = existing
    ? formulas.map(entry => entry.id === editingFormulaId ? formula : entry)
    : [...formulas, formula];
  save();
  formulaFormOpen = false;
  editingFormulaId = null;
  go('revision');
  popup('📐✨', 'Formula saved!', 'Your Formula Locker has been updated.');
  checkBadges();
}
function deleteFormula(formulaId) {
  const formula = formulaEntries().find(entry => entry.id === formulaId);
  if (!formula || !confirm(`Delete "${formula.name}" from your Formula Locker?`)) return;
  S.formulas = formulaEntries().filter(entry => entry.id !== formulaId);
  if (editingFormulaId === formulaId) {
    formulaFormOpen = false;
    editingFormulaId = null;
  }
  save();
  go('revision');
  popup('🗑️', 'Formula deleted', 'The formula was removed from your Formula Locker.');
}
function revision() {
  S.daily.rev = 1; save();
  const categories = [...new Set(formulaEntries().map(formula => formula.category).filter(Boolean))].sort();
  const editing = formulaEntries().find(formula => formula.id === editingFormulaId);
  return `<h3>📚 Revision</h3><div class="cq-card mb-3"><div class="d-flex flex-wrap justify-content-between align-items-center gap-2"><h5 class="mb-0">📐 Formula Locker</h5><button class="btn btn-cq btn-sm" type="button" onclick="openFormulaForm()">Add Formula</button></div>
  <div class="d-flex gap-2 my-3"><input class="form-control" placeholder="Search name, expression, category, or notes…" value="${escapeHtml(fq)}" oninput="setFormulaSearch(this.value)" id="formula-search"><select class="form-select" style="max-width:220px" onchange="setFormulaCategory(this.value)" id="formula-filter"><option value="">All categories</option>${categories.map(category => `<option value="${escapeHtml(category)}" ${fm === category ? 'selected' : ''}>${escapeHtml(category)}</option>`).join('')}</select></div>
  ${formulaFormOpen ? `<div class="cq-card mb-3" style="background:var(--card2)"><h6>${editing ? 'Edit Formula' : 'Add Formula'}</h6>
    <label class="form-label" for="formula-name">Formula name</label><input id="formula-name" class="form-control mb-2" maxlength="100" required value="${escapeHtml(editing?.name || '')}">
    <label class="form-label" for="formula-expression">Formula expression</label><textarea id="formula-expression" class="form-control mb-2" rows="2" maxlength="500" required>${escapeHtml(editing?.expression || '')}</textarea>
    <label class="form-label" for="formula-category">Category (optional)</label><input id="formula-category" class="form-control mb-2" maxlength="50" value="${escapeHtml(editing?.category || '')}">
    <label class="form-label" for="formula-notes">Notes (optional)</label><textarea id="formula-notes" class="form-control mb-2" rows="2" maxlength="1000">${escapeHtml(editing?.notes || '')}</textarea>
    <div class="d-flex gap-2"><button class="btn btn-cq" type="button" onclick="saveFormulaEntry()">Save Formula</button><button class="btn btn-soft" type="button" onclick="cancelFormulaEdit()">Cancel</button></div></div>` : ''}
  <div id="formula-list">${formulaCards()}</div></div>
  <div class="cq-card"><h5>🔒 Mistake Vault (${S.mistakes.length})</h5>${S.mistakes.length ? S.mistakes.map((x, i) => `<div class="cq-card mb-2" style="background:var(--card2)"><b>${escapeHtml(x.q[0])}</b><div class="small text-mut">${escapeHtml(x.mn)} · ${escapeHtml(x.d)} · ${escapeHtml(x.date)}</div><div>Your answer: <span class="text-danger">${escapeHtml(x.u)}</span> · Correct: <span style="color:var(--ok)">${escapeHtml(x.q[1][x.q[2]])}</span></div><div class="small">💡 ${escapeHtml(x.q[3])}</div><button class="btn btn-cq btn-sm mt-2" onclick="runQuiz({title:'🔁 Practice again',qs:[S.mistakes[${i}]],key:null,mock:false})">Practice Again</button> <button class="btn btn-soft btn-sm mt-2" onclick="reviewM(${i})">Review</button> <button class="btn btn-soft btn-sm mt-2" onclick="S.mistakes.splice(${i},1);save();go('revision')">Remove</button></div>`).join('') : '<p class="text-mut">No mistakes — or none yet! 🎉</p>'}</div>`;
}
function settings() {
  const s = S.set;
  return `<h3>⚙️ Settings</h3><div class="cq-card">
  ${[['theme', '🎨 Theme', THEMES.map(t => t.id)], ['lang', '🌐 Language', ['English', 'Hindi', 'Kannada']], ['privacy', '🔒 Privacy', ['Public', 'Friends', 'Private']]].map(r => `<div class="d-flex justify-content-between align-items-center mb-3"><span>${r[1]}</span><select class="form-select" style="max-width:180px" onchange="setOpt('${r[0]}',this.value)">${r[2].map(o => `<option value="${o}" ${s[r[0]] == o ? 'selected' : ''}>${r[0] == 'theme' ? THEMES.find(t => t.id == o).name : o}</option>`).join('')}</select></div>`).join('')}
  ${[['sound', '🔊 Sound'], ['notif', '🔔 Notifications']].map(r => `<div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" ${s[r[0]] ? 'checked' : ''} onchange="setOpt('${r[0]}',this.checked)"><label>${r[1]}</label></div>`).join('')}
  <button class="btn btn-cq" onclick="logout()">🚪 Logout</button></div>`;
}
function setTheme(theme) {
  if (!THEMES.some(t => t.id == theme)) return;
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('cq_theme', theme);
  if (S) {
    S.set.theme = theme;
    save();
  }
  $('#themeBtn').title = `Color theme: ${THEMES.find(t => t.id == theme).name}`;
  $('#themeMenu').querySelectorAll('.theme-option').forEach(option => {
    const selected = option.dataset.theme == theme;
    option.classList.toggle('active', selected);
    option.setAttribute('aria-pressed', selected);
  });
}
function setOpt(k, v) {
  if (k == 'theme') return setTheme(v);
  S.set[k] = v;
  if (k === 'sound' && !v) hush();
  save();
  if (k == 'lang') go('settings');
}

/* ---------- 5. QUIZ ENGINE (practice + mock) ---------- */
function mock() {
  return `<button class="btn btn-soft mb-2" onclick="go('modules')">← Modules</button><h3>📝 Mock Tests</h3><div class="row g-3">${[['Quick Test', 5, 120], ['Standard Test', 8, 240], ['Full Test', 16, 480]].map(t => `<div class="col-md-4"><div class="cq-card hov text-center" onclick="startMock(${t[1]},${t[2]},'${t[0]}')"><div class="big-emoji">⏱️</div><b>${t[0]}</b><div class="text-mut">${t[1]} questions · ${t[2] / 60} min</div></div></div>`).join('')}</div>`;
}
function startMock(n, secs, name) {
  const all = QMODS.flatMap(m => m.q.map(q => ({q, m: m.id, d: 'Mixed'}))).sort(() => Math.random() - .5).slice(0, n);
  runQuiz({title: '📝 ' + name, qs: all, key: null, mock: true, secs});
}
function runQuiz(o) {
  clearInterval(timer);
  G = Object.assign({i: 0, ans: [], sub: [], res: [], feedbackMessages: [], feedbackQuotes: [], feedbackShown: [], t0: Date.now(), left: o.secs, keep: true, fbUsed: {cheer: [], oops: []}, used5050: {}, usedHint: {}}, o);
  if (G.db) G.qStartedAt = Date.now();
  if (!o.isTest) initPuzzle();
  $('#tabs').innerHTML = ''; drawQ(); musicFor('quiz');
  timer = setInterval(() => { const el = $('#tm'); if (!el) return; if (G.mock) { G.left--; if (G.left <= 0) return finish(); el.textContent = '⏳ ' + Math.floor(G.left / 60) + ':' + String(G.left % 60).padStart(2, '0'); } else el.textContent = '⏱️ ' + Math.floor((Date.now() - G.t0) / 1000) + 's'; }, 1000);
}
/* ---------- Mountain adventure UI (visual only) ---------- */
const MP = [[30, 128], [110, 108], [170, 88], [230, 58], [285, 28]];
function mtPos(f) { const s = Math.max(0, Math.min(1, f)) * (MP.length - 1), i = Math.min(MP.length - 2, Math.floor(s)), t = s - i; return [MP[i][0] + (MP[i + 1][0] - MP[i][0]) * t, MP[i][1] + (MP[i + 1][1] - MP[i][1]) * t]; }
const ZN = ['🏕️ Base Camp', '🌲 Forest', '🏛️ Ruins', '🏜️ Desert', '❄️ Snow Valley', '🏆 Final Destination'];
let mtPrev = 0;
const pine = (x, y, s, c) => `<path d="M${x} ${y}l${5 * s} ${-20 * s}l${5 * s} ${20 * s}z" fill="${c}"/>`;
const rep = (f, a, b, st) => { let o = ''; for (let x = a; x < b; x += st) o += f(x); return o; };
const col = (x, h) => `<rect x="${x}" y="${140 - h}" width="9" height="${h}" fill="#c9bea8"/><rect x="${x - 2}" y="${138 - h}" width="13" height="4" fill="#a99d86"/>`;
// Each zone: [sky top, sky bottom, scenery]
const ZD = [
 ['#2a2573', '#fda4af', `<path d="M0 118Q100 90 200 114T400 108V160H0Z" fill="#40386f"/>` + rep(x => pine(x, 132, .9, '#1d3a2e'), 0, 400, 26) + `<path d="M0 134H400V160H0Z" fill="#35502f"/><path d="M290 134l24-34 24 34z" fill="#f1e4c3"/><path d="M314 134l-5-14h10z" fill="#3a2a1a"/><ellipse class="fire" cx="250" cy="134" rx="5" ry="8" fill="#fb923c"/>`],
 ['#12304d', '#9be7b0', rep(x => pine(x, 125, 1.2, '#2f6b45'), 0, 400, 18) + rep(x => pine(x + 8, 134, 1.5, '#1b4a30'), 0, 400, 26) + `<path d="M0 136H400V160H0Z" fill="#244a2a"/>`],
 ['#4c1d95', '#fcd34d', `<path d="M0 120Q100 100 200 118T400 112V160H0Z" fill="#5b4a6e"/>` + col(30, 38) + col(90, 52) + col(150, 24) + col(240, 46) + col(320, 34) + `<path d="M60 102a22 22 0 0 1 24 0v8H60z" fill="#b5a98f"/><path d="M0 136H400V160H0Z" fill="#4a4458"/>`],
 ['#f59e0b', '#fde68a', `<circle cx="300" cy="50" r="22" fill="#fff7d6" opacity=".9"/><path d="M0 125Q80 100 170 122T400 112V160H0Z" fill="#d99a4a"/><path d="M0 138Q120 124 260 138T400 134V160H0Z" fill="#c8873a"/><rect x="90" y="108" width="6" height="28" rx="3" fill="#3f7d4a"/><rect x="82" y="116" width="4" height="10" rx="2" fill="#3f7d4a"/><rect x="100" y="112" width="4" height="10" rx="2" fill="#3f7d4a"/>`],
 ['#1e3a8a', '#dbeafe', `<path d="M0 120L70 55L130 118L210 40L290 120L350 70L400 120V160H0Z" fill="#cfe0ff"/><path d="M70 55L52 80L66 76L78 86L90 74Z" fill="#fff"/><path d="M0 138Q150 126 400 138V160H0Z" fill="#eef5ff"/>` + rep(x => pine(x, 138, .8, '#e6f0ff'), 10, 400, 40)],
 ['#312e81', '#fbbf24', `<path d="M200 0L140 160H260Z" fill="#fff3b0" opacity=".25"/><path d="M0 130Q200 100 400 130V160H0Z" fill="#6b4f2a"/>` + col(240, 56) + col(290, 56) + col(340, 56) + `<path d="M232 84H356L294 62Z" fill="#d9c89a"/><rect x="232" y="138" width="124" height="6" fill="#a99468"/><rect x="146" y="70" width="2.5" height="66" fill="#e5e7eb"/><path d="M148.5 70h26l-6 8 6 8h-26z" fill="#ef4444"/><path d="M0 138H400V160H0Z" fill="#7c5a2b"/>`]];
const zoneSVG = i => `<svg viewBox="0 0 400 160" preserveAspectRatio="none"><defs><linearGradient id="zg${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ZD[i][0]}"/><stop offset="1" stop-color="${ZD[i][1]}"/></linearGradient></defs><rect width="400" height="160" fill="url(#zg${i})"/>${ZD[i][2]}</svg>`;
// Human explorer (SVG with shading; limbs are separate groups so CSS can animate walk / success / slip)
const HERO = `<svg class="hero" viewBox="0 0 40 72"><defs><linearGradient id="hj" x1="0" x2="1"><stop offset="0" stop-color="#8aa04c"/><stop offset=".6" stop-color="#5a6d2c"/><stop offset="1" stop-color="#36441b"/></linearGradient><linearGradient id="hs" x1="0" x2="1"><stop offset="0" stop-color="#f5cfab"/><stop offset="1" stop-color="#c98f66"/></linearGradient><linearGradient id="hp" x1="0" x2="1"><stop offset="0" stop-color="#53647f"/><stop offset="1" stop-color="#26303f"/></linearGradient><linearGradient id="hh" x1="0" x2="1"><stop offset="0" stop-color="#6b4527"/><stop offset="1" stop-color="#25150b"/></linearGradient><linearGradient id="hb" x1="0" x2="1"><stop offset="0" stop-color="#8a5a30"/><stop offset="1" stop-color="#4f2f15"/></linearGradient></defs><ellipse cx="20" cy="70.5" rx="14" ry="2" fill="#000" opacity=".3"/><g class="legb"><path d="M17 40l-3 23h6.5l3.5-23z" fill="url(#hp)"/><path d="M12.5 62h9l1 6h-12z" fill="#3a2716"/><path d="M11 67.5h13v2H11z" fill="#1c130b"/></g><g class="bd"><path d="M9 19q-5 2-5 13t5 12h6V19z" fill="url(#hb)"/><ellipse cx="7" cy="17" rx="4" ry="2.4" fill="#b4855a"/><path d="M14 20q2 8 0 20" stroke="#2a1b0e" stroke-width="1.2" fill="none"/><path d="M13 18h14q3 10 1.5 25H14q-3-13-1-25z" fill="url(#hj)"/><path d="M20 21v21" stroke="#2f3a18" stroke-width=".6"/><path d="M27 18q3 10 1.5 25" stroke="#fff" stroke-opacity=".28" fill="none" stroke-width=".8"/><path d="M14 41h15v3.5H14z" fill="#4a3320"/><rect x="25" y="41" width="3" height="3" fill="#c9a24a"/><rect x="19" y="14" width="4.5" height="6" fill="url(#hs)"/><path d="M17 18l4 4 4-4z" fill="#6b7f3a"/><path class="pony" d="M15 8q-9 2-9 13q4-7 9-6z" fill="url(#hh)"/><ellipse cx="22" cy="10.5" rx="5.8" ry="6.5" fill="url(#hs)"/><path d="M16 10q0-8 8-7t6 7q-3-4-7-4t-7 4z" fill="url(#hh)"/><ellipse cx="19.8" cy="11" rx="1" ry="1.5" fill="#d9a67e"/><ellipse cx="25.3" cy="10.5" rx="1.1" ry=".8" fill="#fff"/><circle cx="25.6" cy="10.5" r=".55" fill="#2a1a10"/><path d="M24 8.9q1.6-.8 3 0" stroke="#3a2415" stroke-width=".5" fill="none"/><path d="M27.6 11.2l.9 1.6-1.4.2z" fill="#c98f66"/><path d="M25.4 14.3q1.2.6 2.2 0" stroke="#a0524a" stroke-width=".7" fill="none"/><ellipse cx="22" cy="6" rx="11" ry="2.3" fill="#9a7440"/><path d="M16 5.5q6-9 12 0z" fill="#7b5a30"/><path d="M16 5.2h12" stroke="#3a2a14" stroke-width="1"/></g><g class="legf"><path d="M21 40l1.5 23h6.5l-2-23z" fill="url(#hp)"/><path d="M21 62h10l1.5 6H20z" fill="#4a3322"/><path d="M19.5 67.5h14v2h-14z" fill="#1c130b"/></g><g class="armf"><path d="M18.5 20l6.5 11-3.5 3.5-8-11z" fill="url(#hj)"/><circle cx="24.5" cy="34.5" r="2.4" fill="#5b3a1f"/></g></svg>`;
// Side-scrolling journey: the world pans while the explorer walks forward.
function mountain(f, cls) {
  f = Math.max(0, Math.min(1, f)); const from = f > mtPrev ? mtPrev : f, z = Math.min(5, Math.floor(f * 5 + 1e-6)), pan = v => -(v * 5 * 100 / 6).toFixed(2) + '%', hl = v => (20 + v * 42).toFixed(1) + '%'; mtPrev = f;
  const on = i => f >= i / 5 - 1e-6 ? 'on' : '';
  return `<div class="mt ${cls || ''}" data-z="${z}" style="--wf:${pan(from)};--wt:${pan(f)};--hf:${hl(from)};--ht:${hl(f)}" aria-hidden="true"><div class="world">${ZD.map((_, i) => `<div class="zn">${zoneSVG(i)}<span class="ck ${on(i)}"></span></div>`).join('')}</div><i class="cl"></i><i class="cl c2"></i><i class="cl c3"></i><div class="lt"></div><div class="rays"></div><div class="vg"></div><div class="pts">${[...Array(14)].map((_, i) => `<b class="pt" style="left:${(i * 37) % 100}%;animation-delay:${-i * .55}s"></b>`).join('')}</div><span class="zl">${ZN[z]}</span><div class="rail">${ZN.map((_, i) => `<u class="${on(i)}"></u>`).join('')}</div><span id="climber" class="climber ${from < f ? 'walk' : ''}" style="left:${hl(f)};top:88%">${HERO}</span></div>`;
}
const stars = n => `<div class="stars">${[1, 2, 3].map(i => `<span class="${i <= n ? 'on' : ''}" style="animation-delay:${i * .25}s">⭐</span>`).join('')}</div>`;
function drawQ() {
  const x = G.qs[G.i], q = x.q, sub = G.sub[G.i], n = G.qs.length;
  const inventory = lifelineInventory();
  const canUse5050 = !G.mock && !sub && !G.lifelineBusy && !G.used5050[G.i] && Number(inventory?.['5050'] || 0) > 0;
  const canUseHint = !G.mock && !sub && !G.lifelineBusy && !G.usedHint[G.i] && Number(inventory?.hint || 0) > 0;
  const removed50 = G.used5050[G.i] || [];
  const powerupBtns = !G.mock && !sub ? `<div class="d-flex gap-2 mt-2 flex-wrap">${canUse5050 ? `<button class="btn btn-soft btn-sm" onclick="use5050()">🎯 50/50 (${inventory['5050']} owned)</button>` : `<button class="btn btn-soft btn-sm" disabled title="Buy 50/50 in the Store">🎯 50/50 (${inventory['5050']} owned)</button>`}${canUseHint ? `<button class="btn btn-soft btn-sm" onclick="useHint()">💡 HINT (${inventory.hint} owned)</button>` : `<button class="btn btn-soft btn-sm" disabled title="Buy Hint in the Store">💡 HINT (${inventory.hint} owned)</button>`}</div>` : '';
  const nextAction = G.db
    ? (sub ? (G.i < n - 1 ? 'nextQ()' : 'advanceDatabaseQuestion()') : 'submitQ()')
    : (sub ? (G.i < n - 1 ? 'nextQ()' : 'finish()') : 'submitQ()');
  const nextLabel = G.db
    ? (sub ? (G.i < n - 1 ? 'Next →' : 'Finish quiz ✅') : 'Submit answer')
    : (sub ? (G.i < n - 1 ? 'Next →' : 'Finish 🏁') : 'Submit answer');
  const navBtns = `${G.mock ? `<button class="btn btn-soft" ${G.i == 0 ? 'disabled' : ''} onclick="G.i--;drawQ()">← Prev</button>` : ''}<span class="ms-auto"></span>
  ${G.mock
    ? `<button class="btn btn-cq quiz-answer-action" onclick="submitMockQ()">${sub ? (G.i < n - 1 ? 'Next →' : 'Finish test ✅') : 'Submit answer'}</button>`
    : `<button class="btn btn-cq quiz-answer-action" onclick="${nextAction}">${nextLabel}</button>`}`;
  app.innerHTML = `<div class="view mx-auto" style="max-width:${G.isTest ? '760px' : '1000px'}"><div class="d-flex justify-content-between"><b>${G.title}</b><span id="tm" class="text-mut">${G.mock ? '⏳' : '⏱️'}</span></div>
  ${bar(G.i + (sub ? 1 : 0), n)}<div class="small text-mut mt-1">Question ${G.i + 1} of ${n}</div><div class="small text-mut mt-1">💡 Hint: ${inventory.hint} · 🎯 50/50: ${inventory['5050']}</div>
  <div class="row g-3" id="quiz-layout">
    <div class="col-12 ${G.isTest ? '' : 'col-lg-8'}"><div class="cq-card my-3 h-100 d-flex flex-column"><div class="flex-grow-1"><h5 class="mb-3">${escapeHtml(q[0])}</h5>${q[1].map((o, i) => { let c = G.ans[G.i] === i ? 'sel' : ''; if (sub) c = i == q[2] ? 'right' : (G.ans[G.i] === i ? 'wrong' : ''); if (removed50.includes(i)) return `<button class="opt removed" disabled>${'ABCD'[i]}. ${escapeHtml(o)}</button>`; return `<button class="opt ${c}" ${sub ? 'disabled' : ''} onclick="pick(${i})">${'ABCD'[i]}. ${escapeHtml(o)}</button>`; }).join('')}<div id="fb"></div>${powerupBtns}</div><div class="d-flex gap-2 mt-3 pt-3 border-top">${navBtns}</div></div></div>
    ${G.isTest ? '' : `<div class="col-12 col-lg-4"><div class="cq-card puzzle-panel h-100" id="puzzle-panel"><div class="puzzle-header"><h6 class="mb-1">🧩 Block Puzzle</h6><div class="puzzle-score">Score: <span id="puzzle-score">${P?.score || 0}</span></div></div><div id="puzzle-grid" class="puzzle-grid"></div><div class="puzzle-next-section"><div class="small text-mut mb-1">Next Blocks</div><div id="puzzle-next" class="puzzle-next"></div></div></div></div>`}
  </div></div>`;
  if (sub) showFb();
  if (!G.isTest) renderPuzzle();
}
function pick(i) { if (G.sub[G.i]) return; G.ans[G.i] = i; beep(520); drawQ(); }
function submitQ() {
  if (G.db) return submitDatabaseAnswer();
  if (G.ans[G.i] === undefined) return $('#fb').innerHTML = '<div class="fb bad">Pick an option first 👆</div>';
  const x = G.qs[G.i], ok = G.ans[G.i] === x.q[2]; G.sub[G.i] = 1; G.res[G.i] = ok; S.solved++; S.daily.solved++; trackLocalSolve(ok);
  if (ok) { S.correct++; addXP(20, 5); } else addMistake(x, G.ans[G.i]);
  save();
  drawQ();
  if (!G.isTest) triggerPuzzleBlock(ok);
}
async function submitDatabaseAnswer() {
  if (!G?.db || G.answering || G.sub[G.i]) return;
  if (G.ans[G.i] === undefined) return $('#fb').innerHTML = '<div class="fb bad">Pick an option first</div>';
  const quiz = G, index = quiz.i, question = quiz.qs[index];
  quiz.answering = true;
  const button = app.querySelector('.quiz-answer-action');
  if (button) { button.disabled = true; button.textContent = 'Checking answer…'; }
  quiz.dbTimes[index] = Math.max(0, Math.round((Date.now() - quiz.qStartedAt) / 1000));
  try {
    const feedback = await authRequest('/quiz/answer', {
      method: 'POST',
      body: JSON.stringify({
        session_id: quiz.dbSessionId,
        question_id: question.dbQuestionId,
        selected_option_id: question.dbOptionIds[quiz.ans[index]],
        time_seconds: quiz.dbTimes[index]
      })
    });
    if (G !== quiz) return;
    if (feedback.question_id !== question.dbQuestionId) throw new Error('The server returned feedback for a different question.');
    question.q[2] = question.dbOptionIds.indexOf(feedback.correct_option_id);
    question.q[3] = feedback.explanation || '';
    quiz.res[index] = feedback.correct;
    quiz.sub[index] = 1;
    drawQ();
    triggerPuzzleBlock(feedback.correct);
  } catch (e) {
    if (G !== quiz) return;
    const answerButton = app.querySelector('.quiz-answer-action');
    if (answerButton) { answerButton.disabled = false; answerButton.textContent = 'Retry answer'; }
    $('#fb').innerHTML = `<div class="fb bad">${escapeHtml(e.message)}. Your answer is still here; retry when ready.</div>`;
  } finally {
    if (G === quiz) quiz.answering = false;
  }
}
async function advanceDatabaseQuestion() {
  if (!G?.db || G.submitting) return;
  if (!G.sub[G.i]) return submitDatabaseAnswer();
  if (G.i < G.qs.length - 1) {
    G.i++;
    G.qStartedAt = Date.now();
    drawQ();
    return;
  }
  const quiz = G;
  quiz.submitting = true;
  const submitButton = app.querySelector('.quiz-answer-action');
  if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Submitting…'; }
  const payload = {
    session_type: 'practice', session_id: quiz.dbSessionId, module: quiz.dbModule, difficulty: quiz.dbDifficulty, level: quiz.dbLevel,
    ...(quiz.dbSubmodule ? {submodule: quiz.dbSubmodule} : {}),
    answers: quiz.qs.map((question, index) => ({question_id: question.dbQuestionId, selected_option_id: question.dbOptionIds[quiz.ans[index]], time_seconds: quiz.dbTimes[index] || 0}))
  };
  try {
    const result = await authRequest('/quiz/submit', {method: 'POST', body: JSON.stringify(payload)});
    if (G !== quiz) return;
    quiz.dbResult = result;
    const resultMap = new Map(result.results.map(item => [item.question_id, item]));
    quiz.qs.forEach((question, index) => {
      const item = resultMap.get(question.dbQuestionId);
      if (!item) throw new Error('The server returned an incomplete result.');
      quiz.res[index] = item.correct;
      question.q[2] = question.dbOptionIds.indexOf(item.correct_option_id);
      question.q[3] = item.explanation || '';
      quiz.sub[index] = 1;
    });
    const correct = result.summary.correct_answers;
    S.solved += quiz.qs.length; S.correct += correct; S.daily.solved += quiz.qs.length;
    quiz.qs.forEach((question, index) => { if (!quiz.res[index]) addMistake(question, quiz.ans[index]); });
    try { await syncBackendState(); }
    catch (_) {
      const earned = {xp: result.rewards.xp_earned || 0, coins: result.rewards.coins_earned || 0, stars: result.rewards.stars_earned || 0};
      S.xp += earned.xp; S.coins += earned.coins; S.stars += earned.stars;
      if (!S.serverProfile) S.serverProfile = {xp: 0, coins: 0, diamonds: 0, stars: 0, streak: 0};
      S.serverProfile.xp += earned.xp; S.serverProfile.coins += earned.coins; S.serverProfile.stars += earned.stars;
      backendProgressReady = false;
    }
    checkBadges(); save(); finish();
  } catch (e) {
    if (G !== quiz) return;
    quiz.submitting = false;
    if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Retry submission'; }
    $('#fb').innerHTML = `<div class="fb bad">${escapeHtml(e.message)}. Your answers are still here; retry when ready.</div>`;
  }
  if (G === quiz) quiz.submitting = false;
}
function showFb() {
  const x = G.qs[G.i], ok = G.res[G.i];
  const index = G.i;
  if (!G.feedbackMessages[index]) G.feedbackMessages[index] = pickFb(ok ? CHEER : OOPS, ok ? 'cheer' : 'oops');
  if (!G.feedbackQuotes[index]) G.feedbackQuotes[index] = pickW(QUOTES);
  const w = G.feedbackMessages[index];
  const explanation = escapeHtml(x.q[3] || '');
  const answer = escapeHtml(x.q[1][x.q[2]] || '');
  $('#fb').innerHTML = ok
    ? `<div class="fb good">🎉🥳✨ <b class="say">${escapeHtml(w)}</b> Correct!${G.db ? '' : ' +20 XP +5 🪙'}<br><small>${explanation}</small></div>`
    : `<div class="fb bad">💜 <b class="say">${escapeHtml(w)}</b> ${escapeHtml(G.feedbackQuotes[index])}<br><small>Answer: ${answer} — ${explanation}</small></div>`;
  if (G.feedbackShown[index]) return;
  G.feedbackShown[index] = true;
  speak(w);
  const c = $('#climber'); if (c) { c.classList.add(ok ? 'up' : 'slip'); const mt = c.closest('.mt'); if (mt) { mt.classList.add(ok ? 'cheer' : 'gust'); setTimeout(() => mt.classList.remove('cheer', 'gust'), 1500); } if (!ok) c.insertAdjacentHTML('afterend', '<span class="rock" style="left:' + c.style.left + ';top:' + c.style.top + '">🪨</span>'); }
  $('#fb').classList.add(ok ? 'cheer' : 'oops');
  if (ok) confetti();
}
function addMistake(x, a) { const m = MODS.find(z => z.id == x.m), old = S.mistakes.find(e => e.q[0] == x.q[0]); if (old) { old.u = x.q[1][a]; old.date = new Date().toLocaleDateString(); return; } S.mistakes.push({q: x.q, m: x.m, mn: m ? m.n : '', d: x.d, u: x.q[1][a], date: new Date().toLocaleDateString()}); }

function submitMockQ() {
  if (G.sub[G.i]) {
    hush();
    if (G.i < G.qs.length - 1) { G.i++; drawQ(); }
    else finish();
    return;
  }
  if (G.ans[G.i] === undefined) return $('#fb').innerHTML = '<div class="fb bad">Pick an option first 👆</div>';
  const x = G.qs[G.i], ok = G.ans[G.i] === x.q[2];
  if (!G.sub[G.i]) { G.sub[G.i] = 1; G.res[G.i] = ok; S.solved++; S.daily.solved++; trackLocalSolve(ok); if (ok) S.correct++; else addMistake(x, G.ans[G.i]); save(); }
  drawQ();
  if (!G.isTest) triggerPuzzleBlock(ok);
}

function nextQ() { hush(); if (G.i < G.qs.length - 1) { G.i++; drawQ(); } else finish(); }

/* ---------- 7b. POWER-UPS ---------- */
function use5050() {
  if (!G || !G.qs || G.sub?.[G.i]) return;
  if (G.db) return useDatabase5050();
  const key = G.i, stock = lifelineInventory();
  if (G.used5050[key]) return popup('??', 'Already used', 'You already used 50/50 for this question.');
  if (!stock || stock['5050'] < 1) return popup('?', 'No 50/50 uses left', 'Buy 50/50 in the Store to add an available use.');
  if (!confirm('Use one 50/50 from your inventory?')) return;
  const x = G.qs[G.i], correctIdx = x.q[2];
  const wrongIdx = x.q[1].map((_, i) => i).filter(i => i !== correctIdx);
  const toRemove = wrongIdx.sort(() => Math.random() - .5).slice(0, 2);
  stock['5050']--;
  G.used5050[key] = toRemove;
  save(); hdr(); drawQ();
  popup('??', '50/50 Activated', 'Two wrong options have been removed.');
}

async function useDatabase5050() {
  if (!G || G.lifelineBusy) return;
  const quiz = G, index = quiz.i, question = quiz.qs[index];
  if (quiz.used5050[index]) return popup('??', 'Already used', 'You already used 50/50 for this question.');
  if (Number(lifelineInventory()?.['5050'] || 0) < 1) return popup('?', 'No 50/50 uses left', 'Buy 50/50 in the Store to add an available use.');
  if (!confirm('Use one 50/50 from your inventory?')) return;
  quiz.lifelineBusy = true;
  try {
    const response = await authRequest('/quiz/lifeline/5050', {method: 'POST', body: JSON.stringify({session_id: quiz.dbSessionId, question_id: question.dbQuestionId})});
    quiz.used5050[index] = question.dbOptionIds.map((id, optionIndex) => response.removed_option_ids.includes(id) ? optionIndex : -1).filter(optionIndex => optionIndex >= 0);
    applyServerBalances(response);
    S.inventory['5050'] = response.inventory_5050;
    S.inventory.hint = response.inventory_hint;
    save(); hdr(); popup('??', '50/50 Activated', 'Two incorrect options have been removed.');
  } catch (e) { popup('??', '50/50 unavailable', e.message); }
  finally {
    quiz.lifelineBusy = false;
    if (G === quiz && $('#quiz-layout')) drawQ();
  }
}

function useHint() {
  if (!G || !G.qs || G.sub?.[G.i]) return;
  if (G.db) return useDatabaseHint();
  const key = G.i, stock = lifelineInventory();
  if (G.usedHint[key]) return popup('??', 'Already used', 'You already used a hint for this question.');
  if (!stock || stock.hint < 1) return popup('?', 'No Hint uses left', 'Buy Hint in the Store to add an available use.');
  const x = G.qs[G.i];
  let hint = x.q[3] || '';
  if (!hint && x.m) { const m = MODS.find(z => z.id === x.m); if (m && m.x) hint = m.x; }
  if (!hint) return popup('??', 'No hint available', 'No additional hint exists for this question. Your inventory was not changed.');
  if (!confirm('Use one Hint from your inventory?')) return;
  stock.hint--;
  G.usedHint[key] = true;
  save(); hdr(); drawQ();
  popup('??', 'Hint', hint);
}

async function useDatabaseHint() {
  if (!G || G.lifelineBusy) return;
  const quiz = G, index = quiz.i, question = quiz.qs[index];
  if (quiz.usedHint[index]) return popup('??', 'Already used', 'You already used a hint for this question.');
  if (Number(lifelineInventory()?.hint || 0) < 1) return popup('?', 'No Hint uses left', 'Buy Hint in the Store to add an available use.');
  if (!confirm('Use one Hint from your inventory?')) return;
  quiz.lifelineBusy = true;
  try {
    const response = await authRequest('/quiz/lifeline/hint', {method: 'POST', body: JSON.stringify({session_id: quiz.dbSessionId, question_id: question.dbQuestionId})});
    if (!response.available || !response.hint) return popup('??', 'No hint available', 'No safe hint has been written for this question. You were not charged.');
    quiz.usedHint[index] = true;
    applyServerBalances(response);
    S.inventory.hint = response.inventory_hint;
    S.inventory['5050'] = response.inventory_5050;
    save(); hdr(); popup('??', 'Hint', response.hint);
  } catch (e) { popup('??', 'Hint unavailable', e.message); }
  finally {
    quiz.lifelineBusy = false;
    if (G === quiz && $('#quiz-layout')) drawQ();
  }
}

function finish() {
  if (G.db) return finishDatabaseQuiz();
  clearInterval(timer); const n = G.qs.length;
  if (G.mock) { 
    // Answers already processed by submitMockQ, just count results
    G.qs.forEach((x, i) => { if (G.ans[i] === undefined) return; const ok = G.ans[i] === x.q[2]; G.res[i] = ok; }); 
  }
  const c = G.res.filter(Boolean).length, a = Math.round(c / n * 100), secs = Math.round((Date.now() - G.t0) / 1000);
  let rw = c * 20 + ' XP, ' + c * 5 + ' 🪙';
  let next = null;
  let nextView = 'learn';
  if (G.mock) { S.tests++; trackLocalTest(); rw = c * 10 + ' XP'; addXP(c * 10, 0); if (Number.isInteger(G.paperIdx)) { const progress = getTestProgress(); if (!progress.completed.includes(G.paperIdx)) progress.completed.push(G.paperIdx); progress.attempts[G.paperIdx] = (progress.attempts[G.paperIdx] || 0) + 1; } }
  else if (G.key) {
    // Handle submodule progress: key format is "modId|subId|level|difficulty"
    const keyParts = G.key.split('|');
    if (keyParts.length === 4) {
      const [modId, subId, levelStr, d] = keyParts;
      const level = parseInt(levelStr);
      if (!S.done[G.key]) {
        S.done[G.key] = 1;
        S.daily.levels++;
        S.stars++;
        addXP(100, 25);
        rw += ' + level bonus 100 XP, 25 🪙, 1 ⭐';
        // Update submodule progress
        const prog = getSubProgress(modId, subId);
        if (!prog.completed.includes(level)) prog.completed.push(level);
        if (prog.unlocked <= level && level < 50) prog.unlocked = level + 1;
        // Award stars based on accuracy
        if (a >= 80) prog.stars[level] = 3;
        else if (a >= 60) prog.stars[level] = 2;
        else prog.stars[level] = 1;
        // Play level complete sound
        speak('Level complete!');
      }
      // Next level in same submodule
      if (level < 50) {
        next = `${modId}|${subId}|${level + 1}|${d}`;
        nextView = 'learnSub';
      }
    } else if (!S.done[G.key]) {
      // Legacy module progress (mod|diff|level)
      S.done[G.key] = 1; S.daily.levels++; S.stars++; addXP(100, 25); rw += ' + level bonus 100 XP, 25 🪙, 1 ⭐';
    }
    if (a >= 66) confetti();
  }
  checkBadges(); save();
  if (G.key) awardModuleCertificate(G.key.split('|')[0]);
  const wrong = n - c, wasMock = G.mock; G.keep = false;
  $('#tabs').innerHTML = ''; hdr();
  const nextBtn = next ? `<button class="btn btn-cq" onclick="go('${nextView}','${next}')">Next Level ▶️</button>` : '';
  app.innerHTML = `<div class="view mx-auto text-center" style="max-width:520px"><div class="cq-card">${stars(a >= 80 ? 3 : a >= 50 ? 2 : 1)}<div style="font-size:3rem">${a >= 80 ? '🏆' : a >= 50 ? '🌟' : '💪'}</div><h3>${a >= 80 ? 'Brilliant!' : a >= 50 ? 'Nice work!' : 'Good effort!'}</h3>
  <p class="fw-bold fs-5">${a >= 50 ? 'Amazing! You conquered this level!' : "Don't give up!"}</p><h1>${c}/${n}</h1><div class="row g-2 my-2"><div class="col"><div class="fb good">✅ Right<br><b class="fs-4">${c} / ${n}</b></div></div><div class="col"><div class="fb bad">❌ Wrong<br><b class="fs-4">${wrong} / ${n}</b></div></div></div><p class="text-mut">Accuracy ${a}% · ⏱️ ${secs}s</p>${!wasMock && wrong ? `<p class="small text-mut">🔒 ${wrong} saved to your Mistake Vault</p>` : ''}<div class="fb good">🎁 Rewards: ${rw}</div>
  <div class="d-grid gap-2 mt-3">${wrong ? `<button class="btn btn-soft" onclick="go('revision')">Review Mistakes 🔍</button>` : ''}${nextBtn}<button class="btn ${next ? 'btn-soft' : 'btn-cq'}" onclick="go('home')">Dashboard 🏠</button></div></div></div>`;
  if (a >= 50) confetti();
  musicFor('win');
  G = null;
}
function finishDatabaseQuiz() {
  clearInterval(timer);
  const result = G.dbResult, summary = result.summary, rewards = result.rewards;
  const n = summary.total_questions, c = summary.correct_answers, wrong = summary.incorrect_answers;
  const accuracy = summary.accuracy_percent, secs = summary.total_time_seconds;
  const earnedStars = rewards.stars_earned || 0;
  const visibleStars = accuracy >= 100 ? 3 : accuracy >= 85 ? 2 : accuracy >= 70 ? 1 : 0;
  const completed = accuracy >= 70;
  let next = null, nextView = 'learnSub';
  const firstQuestion = G.qs[0];
  if (completed && G.dbSubmodule && G.dbLevel < 50) next = `${firstQuestion.m}|${firstQuestion.sub}|${G.dbLevel + 1}|${DIFFS.find(d => d.toLowerCase() === G.dbDifficulty)}`;
  else if (completed && !G.dbSubmodule && G.dbLevel < 50 && G.key) { next = `${firstQuestion.m}|${DIFFS.find(d => d.toLowerCase() === G.dbDifficulty)}|${G.dbLevel + 1}`; nextView = 'learn'; }
  if (completed) S.daily.levels++;
  checkBadges(); save();
  const wasMock = false; G.keep = false;
  $('#tabs').innerHTML = ''; hdr();
  const nextBtn = next ? `<button class="btn btn-cq" onclick="go('${nextView}','${next}')">Next Level →</button>` : '';
  const rewardText = `${rewards.xp_earned || 0} XP, ${rewards.coins_earned || 0} \u{1FA99}${rewards.diamonds_earned ? `, ${rewards.diamonds_earned} \u{1F48E}` : ''}${earnedStars ? `, ${earnedStars} \u{2B50}` : ''}`;
  const answerReview = G.qs.map((question, index) => {
    const selected = question.q[1][G.ans[index]];
    const correct = question.q[1][question.q[2]];
    return `<div class="py-2 border-bottom"><b>${escapeHtml(question.q[0])}</b><div class="small ${G.res[index] ? 'text-success' : 'text-danger'}">Your answer: ${escapeHtml(selected)}${G.res[index] ? '' : ` · Correct: ${escapeHtml(correct)}`}</div>${question.q[3] ? `<div class="small text-mut">${escapeHtml(question.q[3])}</div>` : ''}</div>`;
  }).join('');
  app.innerHTML = `<div class="view mx-auto text-center" style="max-width:520px"><div class="cq-card">${stars(visibleStars)}<div style="font-size:3rem">${accuracy >= 80 ? '🏆' : accuracy >= 50 ? '🌟' : '💪'}</div><h3>${accuracy >= 80 ? 'Brilliant!' : accuracy >= 50 ? 'Nice work!' : 'Good effort!'}</h3>
  <p class="fw-bold fs-5">${completed ? 'Amazing! You conquered this level!' : 'Keep practicing to complete this level.'}</p><h1>${c}/${n}</h1><div class="row g-2 my-2"><div class="col"><div class="fb good">✅ Correct<br><b class="fs-4">${c} / ${n}</b></div></div><div class="col"><div class="fb bad">❌ Incorrect<br><b class="fs-4">${wrong} / ${n}</b></div></div></div><p class="text-mut">Accuracy ${accuracy}% · ⏱️ ${secs}s</p>${!wasMock && wrong ? `<p class="small text-mut">🔒 ${wrong} saved to your Mistake Vault</p>` : ''}<div class="fb good">🎁 Rewards: ${rewardText}</div>
  <details class="text-start mt-3" open><summary>Review Answers</summary><div class="mt-2">${answerReview}</div></details>
  <div class="d-grid gap-2 mt-3">${wrong ? `<button class="btn btn-soft" onclick="go('revision')">Review Mistakes 🔍</button>` : ''}${nextBtn}<button class="btn ${next ? 'btn-soft' : 'btn-cq'}" onclick="go('home')">Dashboard 🏠</button></div></div></div>`;
  if (accuracy >= 50) confetti();
  musicFor('win');
  G = null;
}
/* ---------- 7c. CERTIFICATES ---------- */
const escapeHtml = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));

const isModuleCompleted = (modId) => {
  const subs = SUBMODULES[modId] || [];
  if (!subs.length) return false;
  return subs.every(s => {
    const prog = getSubProgress(modId, s.id);
    return prog.completed && prog.completed.length >= 50;
  });
};

function awardModuleCertificate(modId) {
  const m = MODS.find(x => x.id == modId);
  if (!m || !SUBMODULES[modId]) return;
  if (!isModuleCompleted(modId)) return;
  if (S.certificates.some(c => c.module == modId && c.player == S.name)) return;
  const ref = 'cert_' + modId + '_' + Date.now();
  S.certificates.push({ref, player: S.name, module: m.n, modId, date: new Date().toLocaleString(), ts: Date.now()});
  save();
  popup('🎓', 'Module Completed!', 'Certificate earned for ' + escapeHtml(m.n) + '. View it in Certificates.');
}

function certSheet(c) {
  return `<div class="cert-sheet"><div class="cert-bg"></div>
    <div class="cert-name">${escapeHtml(c.player)}</div>
    <div class="cert-module">${escapeHtml(c.module)}</div>
    <div class="cert-date">${escapeHtml(c.date)}</div>
  </div>`;
}

function certificatePage(c) {
  return `<html><head><title>Certificate - ${escapeHtml(c.module)}</title>
  <style>body{margin:0;background:#1a1a1a;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Georgia,serif;color:#1a1a1a;}.sheet{background:url('certificate-template.png') no-repeat center;background-size:contain;width:900px;aspect-ratio:1.414;position:relative;padding:10% 8% 8% 8%;box-sizing:border-box;}.cert-name{position:absolute;top:32%;left:8%;font-size:1.6rem;font-weight:bold;}.cert-module{position:absolute;top:56%;left:8%;font-size:1.25rem;}.cert-date{position:absolute;bottom:12%;left:8%;font-size:1rem;}.np{position:fixed;top:1rem;right:1rem;z-index:1000;background:#1a1a1a;color:#fff;padding:.6rem 1rem;border-radius:12px;}</style>
  </head><body><div class="np"><button onclick="window.print()">🖨️ Print / Save as PDF</button> <button onclick="window.close()">✕ Close</button></div>${certSheet(c)}</body></html>`;
}

function certificates() {
  const mine = S.certificates.filter(c => c.player == S.name);
  const list = mine.length ? mine.map(c => `<div class="col-6 col-md-4"><div class="cq-card hov text-center" onclick="viewCertificate('${c.ref}')"><div class="big-emoji">🎓</div><b>${escapeHtml(c.module)}</b><div class="small text-mut">${escapeHtml(c.date)}</div><div class="small text-mut">#${c.ref.slice(-6)}</div></div></div>`).join('') : '<p class="text-mut">No certificates yet. Complete all levels of a module to earn one.</p>';
  return `<button class="btn btn-soft mb-2" onclick="go('home')">← Home</button><h3>📜 Certificates</h3><div class="row g-3">${list}</div>`;
}

function viewCertificate(ref) {
  const c = S.certificates.find(x => x.ref == ref);
  if (!c) return;
  app.innerHTML = `<button class="btn btn-soft mb-2" onclick="go('certificates')">← Certificates</button><div class="cert-page">${certSheet(c)}</div>
  <div class="d-flex gap-2 justify-content-center mt-3"><button class="btn btn-cq" onclick="downloadCertificate('${c.ref}')">📥 Download PDF</button><button class="btn btn-soft" onclick="printCertificate()">🖨️ Print</button></div>`;
}

function downloadCertificate(ref) {
  const c = S.certificates.find(x => x.ref == ref);
  if (!c) return;
  const win = window.open('', '_blank');
  win.document.write(certificatePage(c));
  win.document.close();
  win.focus();
  setTimeout(() => { try { win.print(); } catch (e) {} }, 400);
}

function printCertificate() { window.print(); }
function nextKey(k) { const [id, d, l] = k.split('|'); if (+l < 3) return `${id}|${d}|${+l + 1}`; const di = DIFFS.indexOf(d); return di < 2 ? `${id}|${DIFFS[di + 1]}|1` : null; }

/* ---------- 6. BRAIN GAME: NUMBER SEQUENCE ---------- */
let B = null;
function brainStart() { B = {r: 0, score: 0}; $('#tabs').innerHTML = ''; musicFor('quiz'); brainRound(); }
function brainRound() {
  const a = 1 + Math.floor(Math.random() * 8), d = 2 + Math.floor(Math.random() * 6), geo = Math.random() < .3;
  const seq = [0, 1, 2, 3, 4].map(i => geo ? a * Math.pow(2, i) : a + d * i); B.ans = seq[4]; B.hint = geo ? 'Each number doubles' : 'Add ' + d + ' each time';
  app.innerHTML = `<div class="view mx-auto text-center" style="max-width:480px"><button class="btn btn-soft mb-2" onclick="go('challenges')">← Challenges</button><div class="cq-card"><h4>🔢 Number Sequence</h4><div class="text-mut">Round ${B.r + 1}/5 · Score ${B.score}</div>${bar(B.r, 5)}
  <h2 class="my-4">${seq.slice(0, 4).join(' , ')} , ❓</h2><input id="bn" type="number" class="form-control text-center mb-2" placeholder="Your answer"><div id="bfb"></div><button class="btn btn-cq" onclick="brainCheck()">Check ✅</button></div></div>`;
}
function brainCheck() {
  const v = +$('#bn').value, ok = v === B.ans; B.r++; if (ok) { B.score++; addXP(10, 2); }
  $('#bfb').innerHTML = ok ? '<div class="fb good">🎉 Correct! +10 XP</div>' : `<div class="fb bad">💜 The answer was ${B.ans} (${B.hint}). Keep going!</div>`;
  setTimeout(() => { if (B.r < 5) return brainRound(); S.daily.brain = 1; save(); confetti(); popup('🧠✨', 'Brain game complete!', `You scored ${B.score}/5.`); go('challenges'); }, 1400);
}

const brainDone = (n, s, t) => { S.daily.brain = 1; addXP(s * 10, s * 2); save(); if (s == t) confetti(); popup('🧠✨', n + ' complete!', `You scored ${s}/${t}.`); go('challenges'); };
const backBtn = '<button class="btn btn-soft mb-2" onclick="go(\'challenges\')">← Challenges</button>';
const shuf = a => [...a].sort(() => Math.random() - .5);
function reviewM(i) { const x = S.mistakes[i]; popup('🔍', escapeHtml(x.q[0]), `Your answer: ${escapeHtml(x.u)}<br>Correct: <b>${escapeHtml(x.q[1][x.q[2]])}</b><br>💡 ${escapeHtml(x.q[3])}<br><small>${escapeHtml(x.mn)} · ${escapeHtml(x.d)} · ${escapeHtml(x.date)}</small>`); }

/* Memory Match */
let M = null;
function memStart() { const e = ['🍎', '🚀', '🐼', '⭐', '🎲', '🌈']; M = {c: shuf([...e, ...e]), open: [], ok: [], mv: 0, lock: false}; $('#tabs').innerHTML = ''; musicFor('quiz'); memDraw(); }
function memDraw() {
  app.innerHTML = `<div class="view mx-auto text-center" style="max-width:420px">${backBtn}<div class="cq-card"><h4>🃏 Memory Match</h4><div class="text-mut mb-2">Moves: ${M.mv}</div><div class="row g-2">${M.c.map((c, i) => { const sh = M.open.includes(i) || M.ok.includes(i); return `<div class="col-3"><button class="opt text-center mb-0 ${M.ok.includes(i) ? 'right' : sh ? 'sel' : ''}" style="font-size:1.8rem;height:70px" onclick="memFlip(${i})">${sh ? c : '❓'}</button></div>`; }).join('')}</div></div></div>`;
}
function memFlip(i) {
  if (M.lock || M.open.includes(i) || M.ok.includes(i)) return;
  M.open.push(i); beep(520);
  if (M.open.length == 2) {
    M.mv++; const [a, b] = M.open;
    if (M.c[a] == M.c[b]) { M.ok.push(a, b); M.open = []; if (M.ok.length == 12) { memDraw(); return setTimeout(() => brainDone('Memory Match', M.mv <= 10 ? 5 : M.mv <= 16 ? 3 : 1, 5), 700); } }
    else { M.lock = true; memDraw(); return setTimeout(() => { M.open = []; M.lock = false; memDraw(); }, 800); }
  }
  memDraw();
}

/* Pattern Recognition */
function patStart() { B = {r: 0, score: 0}; $('#tabs').innerHTML = ''; musicFor('quiz'); patRound(); }
function patRound() {
  const E = shuf(['🔴', '🔵', '🟢', '🟡', '🟣', '🟠']), k = 2 + Math.floor(Math.random() * 2), seq = [0, 1, 2, 3, 4, 5, 6].map(i => E[i % k]); B.ans = seq[6];
  app.innerHTML = `<div class="view mx-auto text-center" style="max-width:420px">${backBtn}<div class="cq-card"><h4>🔷 Pattern Recognition</h4>${bar(B.r, 4)}<p class="text-mut mt-2">What comes next?</p><h2 class="mb-3">${seq.slice(0, 6).join(' ')} ❓</h2>${shuf(E.slice(0, 4)).map(o => `<button class="opt text-center" style="font-size:1.6rem" onclick="patPick('${o}')">${o}</button>`).join('')}<div id="bfb"></div></div></div>`;
}
function patPick(o) {
  document.querySelectorAll('.opt').forEach(b => b.disabled = true); const ok = o == B.ans; B.r++; if (ok) B.score++;
  $('#bfb').innerHTML = ok ? '<div class="fb good">🎉 Correct!</div>' : `<div class="fb bad">💜 It was ${B.ans}. Keep going!</div>`;
  setTimeout(() => B.r < 4 ? patRound() : brainDone('Pattern Recognition', B.score, 4), 1100);
}

/* Logic Puzzle + Quick Calculation share one mini quiz runner */
function logicStart() { miniRun('🧩 Logic Puzzle', shuf(LOGIC).slice(0, 3)); musicFor('quiz'); }
function calcStart() {
  const it = [];
  for (let i = 0; i < 5; i++) {
    const a = 2 + Math.floor(Math.random() * 12), b = 2 + Math.floor(Math.random() * 12), op = ['+', '−', '×'][i % 3], r = op == '+' ? a + b : op == '−' ? a - b : a * b, o = new Set([r]);
    while (o.size < 4) o.add(r + Math.floor(Math.random() * 9) - 4);
    const arr = shuf(o); it.push([`${a} ${op} ${b} = ?`, arr, arr.indexOf(r), `The answer is ${r}`]);
  }
  miniRun('⚡ Quick Calculation', it); musicFor('quiz');
}
function miniRun(n, it) { B = {n, it, r: 0, score: 0}; $('#tabs').innerHTML = ''; miniDraw(); }
function miniDraw() {
  const x = B.it[B.r];
  app.innerHTML = `<div class="view mx-auto" style="max-width:480px">${backBtn}<div class="cq-card"><h4>${B.n}</h4>${bar(B.r, B.it.length)}<h5 class="my-3">${x[0]}</h5>${x[1].map((o, i) => `<button class="opt" onclick="miniPick(${i},this)">${o}</button>`).join('')}<div id="bfb"></div></div></div>`;
}
function miniPick(i, b) {
  const x = B.it[B.r], ok = i == x[2]; document.querySelectorAll('.opt').forEach(o => o.disabled = true); b.classList.add(ok ? 'right' : 'wrong'); if (ok) B.score++;
  $('#bfb').innerHTML = ok ? '<div class="fb good">🎉🥳 Correct!</div>' : `<div class="fb bad">💜 ${x[3]}. ${QUOTES[Math.floor(Math.random() * 4)]}</div>`;
  B.r++; setTimeout(() => B.r < B.it.length ? miniDraw() : brainDone(B.n, B.score, B.it.length), 1300);
}

/* ---------- Voice & background music (audio only) ---------- */
const CHEER = ['Awesome!', 'Well done!', 'Excellent!', 'Great!'], OOPS = ['Oops!', 'Try again!', 'Keep going!', "Don't give up!"];
const pickW = a => a[Math.floor(Math.random() * a.length)];
function pickFb(arr, key) {
  if (!G || !G.fbUsed) return pickW(arr);
  const used = G.fbUsed[key] || [];
  const available = arr.filter((_, i) => !used.includes(i));
  const idx = available.length ? arr.indexOf(available[Math.floor(Math.random() * available.length)]) : Math.floor(Math.random() * arr.length);
  if (!used.includes(idx)) { used.push(idx); if (used.length >= arr.length) used.length = 0; }
  return arr[idx];
}
let currentAudio = null, lastSpoken = '', voiceQueue = [];
let voiceOn = localStorage.getItem('cq_voice') !== 'off';

// Mapping of exact spoken text to recorded audio files
const RECORDED_VOICES = {
  'Welcome to Cortex Quest!': 'audio/welcome.mpeg',
  'Good!': 'audio/good.mpeg',
  'Great!': 'audio/great.mpeg',
  'Awesome!': 'audio/awesome.mpeg',
  'Excellent!': 'audio/excellent.mpeg',
  'Oops!': 'audio/oops.mpeg',
  'Try again!': 'audio/try-again.mpeg',
  'Keep going!': 'audio/keep-going.mpeg',
  'Amazing!': 'audio/amazing.mpeg',
  'Level complete!': 'audio/level-complete.mpeg',
  'Well done!': 'audio/well-done.mpeg',
  "Don't give up!": "audio/don't-giveup.mpeg",
  'Brain game complete!': 'audio/brain-game-completed.mpeg',
  'Number Sequence complete!': 'audio/brain-game-completed.mpeg',
  'Pattern Recognition complete!': 'audio/brain-game-completed.mpeg',
  'Mini Quiz complete!': 'audio/brain-game-completed.mpeg',
  'Word Scramble complete!': 'audio/brain-game-completed.mpeg',
  'Memory Match complete!': 'audio/brain-game-completed.mpeg',
  'Math Solver complete!': 'audio/brain-game-completed.mpeg',
  'Logic Puzzle complete!': 'audio/brain-game-completed.mpeg',
  'Formula saved!': 'audio/formula-saved.mpeg'
};

function speak(t) {
  if (!t || !S || !S.set.sound || !voiceOn || !RECORDED_VOICES[t]) return;
  if (currentAudio) {
    if (t !== lastSpoken && voiceQueue[voiceQueue.length - 1] !== t) voiceQueue.push(t);
    return;
  }
  let audio;
  try { audio = new Audio(RECORDED_VOICES[t]); }
  catch (_) {
    const next = voiceQueue.shift();
    if (next) setTimeout(() => speak(next), 0);
    return;
  }
  audio.volume = 1;
  currentAudio = audio;
  lastSpoken = t;
  duck(true);
  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    audio.removeEventListener('ended', cleanup);
    audio.removeEventListener('error', cleanup);
    if (currentAudio === audio) {
      currentAudio = null;
      lastSpoken = '';
      duck(false);
    }
    const next = voiceQueue.shift();
    if (next && voiceOn && S?.set.sound) setTimeout(() => speak(next), 0);
  };
  audio._cleanup = cleanup;
  audio.addEventListener('ended', cleanup);
  audio.addEventListener('error', cleanup);
  try {
    const playback = audio.play();
    if (playback?.catch) playback.catch(cleanup);
  } catch (_) { cleanup(); }
}
function speakSequence(messages) { messages.forEach(speak); }
function hush() {
  voiceQueue = [];
  if (currentAudio) {
    const audio = currentAudio;
    currentAudio = null;
    audio.pause();
    audio._cleanup?.();
  }
  lastSpoken = '';
  duck(false);
}
const cardText = el => { const c = el.cloneNode(true); c.querySelectorAll('button,.mt,.stars,.d-grid').forEach(n => n.remove()); c.querySelectorAll('*').forEach(e => e.append(/^(H\d|P|DIV)$/.test(e.tagName) ? '. ' : ' ')); return c.textContent; };
// Read each important message once, exactly as shown: popups, feedback, XP rewards, result card.
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
  if (n.nodeType != 1) return;
  if (n.matches('.pop')) { const h = n.querySelector('h4'); if (h) speak(h.textContent); }
  else if (n.querySelector && n.querySelector('.stars')) { const p = n.querySelector('.fw-bold'); if (p) speak(p.textContent); }  // short completion line
}))).observe(document.body, {childList: true, subtree: true});
let welcomeShown = false;
function welcomeText() {
  if (welcomeShown) return; welcomeShown = true;
  const d = document.createElement('div'); d.className = 'wlc';
  d.innerHTML = 'Welcome to Cortex Quest!'.split(' ').map((w, i) => `<span style="animation-delay:${i * .45}s">${w}</span>`).join('');
  d.onclick = () => d.remove(); document.body.appendChild(d);
  setTimeout(() => { d.style.opacity = 0; setTimeout(() => d.remove(), 600); }, 2800);
}
let welcomeDone = false, welcomeAsked = false;
function welcome(retry) {
  if (welcomeDone || (welcomeAsked && !retry) || !S || !S.set.sound || !voiceOn) return; welcomeAsked = true;
  try { speak('Welcome to Cortex Quest!'); welcomeDone = true; } catch (e) {}
}
// Browsers may block speech before the first tap; retry once on the first interaction.
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (welcomeAsked && !welcomeDone) welcome(true); }));
// Background music: exact filenames from BACKGROUND folder
const TRACKS = {
  home: 'BACKGROUND/home-music.mp3 .mp3',
  apt: 'BACKGROUND/aptitude-music.mp3.mpeg',
  di: 'BACKGROUND/data-interpretation-music.mp3.mpeg',
  rea: 'BACKGROUND/reasoning-music.mp3.mpeg',
  gk: 'BACKGROUND/general-knowledge-music.mp3.mpeg',
  prog: 'BACKGROUND/programming-music.mp3.mpeg',
  cs: 'BACKGROUND/computer-science-music.mp3.mpeg',
  eng: 'BACKGROUND/engineering-music.mp3.mpeg',
  med: 'BACKGROUND/medical-music.mp3.mp3',
  gameplay: 'BACKGROUND/gameplay-music.mp3.mp3',
  victory: 'BACKGROUND/victory-music.mp3.mp3'
};
const MVOL = .22, MDUCK = .06;   // moderate volume; lowered while the voice speaks
let cur = null, want = 'home', ducked = false, mon = localStorage.getItem('cq_music') !== 'off';
const level = () => ducked ? MDUCK : MVOL;
const tryPlay = a => { try { const p = a.play(); p && p.catch && p.catch(() => {}); } catch (e) {} };
function fade(a, to, ms, done) { clearInterval(a._f); const from = a.volume, steps = Math.max(1, Math.round(ms / 40)); let i = 0; a._f = setInterval(() => { i++; a.volume = Math.max(0, Math.min(1, from + (to - from) * i / steps)); if (i >= steps) { clearInterval(a._f); if (done) done(); } }, 40); }
function duck(on) { ducked = on; if (cur) fade(cur.a, level(), 250); }  // keep the voice clear over music
function stopTrack() { if (!cur) return; const o = cur; cur = null; fade(o.a, 0, 800, () => { o.a.pause(); o.a.removeAttribute('src'); }); }
function playTrack(n) {
  const src = TRACKS[n];
  if (cur && cur.src == src) { if (cur.a.paused) tryPlay(cur.a); return; }
  stopTrack(); const a = new Audio(src); a.loop = true; a.volume = 0; tryPlay(a); fade(a, level(), 1200); cur = {a, src};
}
function getModuleFromView(v, a) {
  if (!a) return null;
  if (v === 'mod' || v === 'submodule' || v === 'learnSub') {
    return a.split('|')[0];
  }
  if (v === 'learn') {
    return a.split('|')[0];
  }
  return null;
}

function musicFor(v, a) {
  const mod = getModuleFromView(v, a);
  let trackKey;
  if (mod && TRACKS[mod]) {
    trackKey = mod;
  } else {
    trackKey = {home: 'home', challenges: 'gameplay', quiz: 'gameplay', win: 'victory', mock: 'gameplay'}[v] || 'home';
  }
  want = trackKey;
  if (mon && cur) playTrack(want);
}
function toggleMusic() { mon = !mon; localStorage.setItem('cq_music', mon ? 'on' : 'off'); if (mon) playTrack(want); else stopTrack(); $('#musicBtn').textContent = mon ? '🔊' : '🔇'; }
function toggleVoice() {
  voiceOn = !voiceOn;
  localStorage.setItem('cq_voice', voiceOn ? 'on' : 'off');
  const button = $('#voiceBtn');
  button.textContent = voiceOn ? '🗣️' : '🔇';
  button.setAttribute('aria-label', voiceOn ? 'Voice on' : 'Voice off');
  button.title = voiceOn ? 'Voice on' : 'Voice off';
  button.setAttribute('aria-pressed', voiceOn);
  if (!voiceOn) hush();
}
// Browsers block audio until the first tap/key press, so start music then.
const unlock = () => { if (mon && (!cur || cur.a.paused)) playTrack(want); };
['pointerup', 'touchend', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, unlock));
document.addEventListener('visibilitychange', () => { if (cur) document.hidden ? cur.a.pause() : (mon && tryPlay(cur.a)); });
$('#musicBtn').textContent = mon ? '🔊' : '🔇';
$('#voiceBtn').textContent = voiceOn ? '🗣️' : '🔇';
$('#voiceBtn').setAttribute('aria-label', voiceOn ? 'Voice on' : 'Voice off');
$('#voiceBtn').title = voiceOn ? 'Voice on' : 'Voice off';
$('#voiceBtn').setAttribute('aria-pressed', voiceOn);
$('#themeMenu').innerHTML = THEMES.map(t => `<li><button class="dropdown-item theme-option d-flex align-items-center gap-2" type="button" data-theme="${t.id}" aria-pressed="false" onclick="setTheme('${t.id}')"><span class="theme-swatch" style="--swatch:${t.swatch}"></span>${t.name}</button></li>`).join('');
const savedTheme = localStorage.getItem('cq_theme');
setTheme(THEMES.some(t => t.id == savedTheme) ? savedTheme : 'dark');

start();



/* ---------- TEST FEATURE ---------- */
let TEST_PAPERS=null;
function buildTestPapers(){
  if(TEST_PAPERS)return TEST_PAPERS;
  const all=[];
  QMODS.forEach(m=>{if(m.q&&Array.isArray(m.q)){m.q.forEach(qitem=>{if(qitem&&qitem[0]&&qitem[1]&&qitem[1].length===4&&typeof qitem[2]!=='undefined'){all.push({q:qitem.slice(),m:m.id,d:'Mixed'});}});}});
  let pool=all.slice();
  while(pool.length<150&&all.length>0){const idx=pool.length%all.length;pool.push({q:all[idx].q.slice(),m:all[idx].m,d:'Mixed'});}
  pool=pool.sort(()=>Math.random()-0.5).slice(0,150);
  const papers=[[],[],[],[],[]];
  for(let i=0;i<150;i++){papers[Math.floor(i/30)].push(pool[i]);}
  TEST_PAPERS=papers;return TEST_PAPERS;
}
function getTestProgress(){if(!S.testProgress)S.testProgress={completed:[],attempts:{}};return S.testProgress;}
function testFeature(){
  buildTestPapers();const prog=getTestProgress();const next=Array.from({length:5},(_,i)=>i).find(i=>!prog.completed.includes(i));
  let html='<button class="btn btn-soft mb-2" onclick="go(\'home\')">← Back</button><h3>Test</h3>';
  html+='<div class="cq-card"><h5>Examination Configuration</h5><p class="text-mut">30 questions · 30 minutes · Mixed from all modules</p>';
  if(next!==undefined){html+='<button class="btn btn-cq mt-2" onclick="startTestPaper('+next+')">Start Examination Now</button>';}else{html+='<p class="text-success mt-2">All papers completed.</p>';}
  html+='</div>';return html;
}
function startTestPaper(paperIdx){
  const papers=buildTestPapers(); if(!Number.isInteger(paperIdx)||paperIdx<0||paperIdx>=papers.length)return;
  let qs=papers[paperIdx].map(x=>({q:x.q.slice(),m:x.m,d:x.d}));
  qs=qs.sort(()=>Math.random()-0.5);
  qs.forEach(item=>{const opts=item.q[1].slice();const correct=item.q[2];const pairs=opts.map((o,idx)=>({o,idx}));pairs.sort(()=>Math.random()-0.5);item.q[1]=pairs.map(p=>p.o);const nc=pairs.findIndex(p=>p.idx===correct);item.q[2]=nc>=0?nc:correct;});
  runQuiz({title:'Test - Paper '+(paperIdx+1),qs:qs,key:null,mock:true,isTest:true,paperIdx,secs:1800});
}
