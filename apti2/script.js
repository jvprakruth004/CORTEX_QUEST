/* ================= CORTEX QUEST — beginner-friendly vanilla JS =================
   Sections: 1 Config & API | 2 Data | 3 State & helpers | 4 Auth | 5 Views | 6 Quiz engine | 7 Brain game | 8 Rewards */

/* ---------- 1. CONFIG & API ---------- */
const API_BASE = 'http://127.0.0.1:8001/api';

function getAccessToken() {
  return localStorage.getItem('cq_access_token');
}

let isRefreshing = false;
let refreshPromise = null;

async function apiRefreshToken() {
  if (isRefreshing) {
    return refreshPromise;
  }
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(API_BASE + '/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Refresh failed');
      }
      const data = await res.json();
      localStorage.setItem('cq_access_token', data.access_token);
      localStorage.setItem('cq_refresh_token', data.refresh_token);
      return data.access_token;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function apiFetch(path, options = {}, retry = true) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(API_BASE + path, {
    ...options,
    credentials: 'include',
    headers,
  });
  
  console.log('[DIAG] apiFetch(' + path + ') status:', res.status);
  
  // If 401 and we haven't retried yet, try to refresh token
  if (res.status === 401 && retry) {
    console.log('[DIAG] apiFetch(' + path + ') got 401, attempting token refresh');
    const err = await res.json().catch(() => ({detail: ''}));
    const msg = err.detail || '';
    // Check if it's a token expiry error (not invalid credentials)
    if (msg.includes('expired') || msg.includes('Invalid or expired token') || msg.includes('Not authenticated')) {
      try {
        await apiRefreshToken();
        // Retry the original request once
        return apiFetch(path, options, false);
      } catch (e) {
        // Refresh failed - clear auth and redirect to login
        logout();
        throw new Error('Session expired. Please log in again.');
      }
    }
  }
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({detail: 'Request failed'}));
    let msg = err.detail;
    if (Array.isArray(msg)) {
      // Validation error array - extract first message
      msg = msg.map(e => e.msg || e.message || JSON.stringify(e)).join('; ');
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}

async function apiGuestLogin(avatar = '🦊') {
  return apiFetch('/auth/guest', {method: 'POST', body: JSON.stringify({avatar})});
}

async function apiGetMe() {
  return apiFetch('/auth/me');
}

async function apiConvert(password) {
  return apiFetch('/auth/convert', {
    method: 'POST',
    body: JSON.stringify({password})
  });
}

async function apiUpdateProfile(data) {
  return apiFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function secureAccount() {
  const pwd = prompt('Create a password to secure your account (min 8 characters):');
  if (!pwd) return;
  if (pwd.length < 8) {
    alert('Password must be at least 8 characters.');
    return;
  }
  try {
    const btn = event?.target;
    if (btn) { btn.disabled = true; btn.textContent = 'Securing…'; }
    const data = await apiConvert(pwd);
    localStorage.setItem('cq_access_token', data.access_token);
    localStorage.setItem('cq_refresh_token', data.refresh_token);
    const user = data.profile.player_id;
    localStorage.setItem('cq_s_' + user, JSON.stringify({
      user,
      name: data.profile.display_name,
      av: data.profile.avatar,
      id: data.profile.player_id,
      xp: data.profile.xp,
      coins: data.profile.coins,
      diamonds: data.profile.diamonds,
      stars: data.profile.stars,
      streak: data.profile.streak,
      lastDay: today(),
      solved: 0, correct: 0, tests: 0, done: {}, bm: [], formulas: [], mistakes: [], badges: [], last: null,
      daily: {d: today(), solved: 0, levels: 0, brain: 0, rev: 0, claimed: false},
      set: {theme: 'dark', sound: true, notif: true, lang: 'English', privacy: 'Public'},
      account_type: data.account.account_type
    }));
    // Update current state
    S.account_type = 'PERMANENT';
    save();
    alert('Account secured! Your Player ID is: ' + data.profile.player_id);
    go('profile');
  } catch (e) {
    alert('Failed to secure account: ' + e.message);
    if (btn) { btn.disabled = false; btn.textContent = '🔐 Secure Account'; }
  }
}

async function apiRegister(username, password, displayName, avatar = '🦊') {
  return apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({username, password, display_name: displayName, avatar})
  });
}

async function apiLogin(username, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({username, password})
  });
}

async function apiGetModules() {
  return apiFetch('/modules');
}

async function apiGetSubmodules(moduleSlug) {
  return apiFetch(`/modules/${moduleSlug}/submodules`);
}

async function apiGetPracticeQuestions(module, difficulty, level, submodule = null, count = 5) {
  const params = new URLSearchParams({module, difficulty, level: String(level), count: String(count)});
  if (submodule) params.set('submodule', submodule);
  return apiFetch(`/quiz/practice?${params.toString()}`);
}

async function apiSubmitQuiz(request) {
  return apiFetch('/quiz/submit', {method: 'POST', body: JSON.stringify(request)});
}

async function apiGetProgressV2() {
  return apiFetch('/quiz/progress/v2');
}

async function apiGetAttempts(page = 1, size = 20, filters = {}) {
  const params = new URLSearchParams({page: String(page), size: String(size)});
  if (filters.module) params.set('module', filters.module);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.submodule) params.set('submodule', filters.submodule);
  if (filters.session_type) params.set('session_type', filters.session_type);
  return apiFetch(`/quiz/attempts?${params.toString()}`);
}

async function apiGetAttemptsSummary() {
  return apiFetch('/quiz/attempts/summary');
}

async function apiGetAttempt(attemptId) {
  return apiFetch(`/quiz/attempts/${attemptId}`);
}

/* ---------- 2. DATA ---------- */
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
  {id:'first',n:'First Steps',e:'👣',g:1,v:()=>S.solved},{id:'s10',n:'Solver',e:'🧠',g:10,v:()=>S.solved},
  {id:'s30',n:'Big Brain',e:'🏆',g:30,v:()=>S.solved},{id:'lv3',n:'Level 3',e:'🚀',g:3,v:()=>lvl()},
  {id:'mock',n:'Test Taker',e:'📝',g:1,v:()=>S.tests},{id:'form',n:'Formula Fan',e:'📐',g:3,v:()=>S.formulas.length},
  {id:'str',n:'On Fire',e:'🔥',g:3,v:()=>S.streak},{id:'star',n:'Star Collector',e:'⭐',g:3,v:()=>S.stars}];

/* ---------- 3. STATE & HELPERS ---------- */
const $ = s => document.querySelector(s);
const app = $('#app');
let S = null, G = null, timer = null;
const today = () => new Date().toDateString();
const lvl = () => Math.floor(S.xp / 200) + 1;
const save = () => { if (S) localStorage.setItem('cq_s_' + S.user, JSON.stringify(S)); };
const newState = (user, name, av) => ({user, name, av, id: 'CQ' + Math.floor(1000 + Math.random() * 9000), xp: 0, coins: 0, diamonds: 0, stars: 0, streak: 1, lastDay: today(),
  solved: 0, correct: 0, tests: 0, done: {}, bm: [], formulas: [], mistakes: [], badges: [], last: null,
  daily: {d: today(), solved: 0, levels: 0, brain: 0, rev: 0, claimed: false}, set: {theme: 'dark', sound: true, notif: true, lang: 'English', privacy: 'Public'}});

function beep(f = 660) { if (!S || !S.set.sound) return; try { const c = new (window.AudioContext || window.webkitAudioContext)(), o = c.createOscillator(), g = c.createGain(); o.frequency.value = f; g.gain.value = .06; o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + .12); } catch (e) {} }
function confetti() { const em = ['🎉', '✨', '🎊', '⭐', '💜']; for (let i = 0; i < 36; i++) { const s = document.createElement('span'); s.className = 'conf'; s.textContent = em[i % 5]; s.style.left = Math.random() * 100 + 'vw'; s.style.animationDelay = Math.random() * .6 + 's'; document.body.appendChild(s); setTimeout(() => s.remove(), 3200); } }
function floatXP(t) { const d = document.createElement('div'); d.className = 'float-xp'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 1200); }
function popup(em, title, text, big) { const p = document.createElement('div'); p.className = 'pop'; p.innerHTML = `<div><div class="big">${em}</div><h4>${title}</h4><p class="text-mut">${text}</p><button class="btn btn-cq">Awesome!</button></div>`; p.onclick = e => { if (e.target === p || e.target.tagName === 'BUTTON') p.remove(); }; $('#pops').appendChild(p); if (big) confetti(); beep(880); }
const bar = (v, max) => `<div class="progress"><div class="progress-bar" style="width:${Math.min(100, v / max * 100)}%"></div></div>`;

/* ---------- 7. REWARDS ---------- */
function addXP(xp, coins) {
  const before = lvl(); S.xp += xp; S.coins += coins; floatXP(`+${xp} XP${coins ? ' +' + coins + '🪙' : ''}`);
  if (lvl() > before) { S.diamonds++; popup('🎊🏆🚀', 'Level Up!', `You reached Level ${lvl()}! +1 💎`, true); }
  checkBadges(); save(); hdr();
}
function checkBadges() {
  BADGES.forEach(b => { if (!S.badges.includes(b.id) && b.v() >= b.g) { S.badges.push(b.id); S.coins += 10; popup('🏅✨', 'Badge Unlocked!', `${b.e} ${b.n} (+10 🪙)`, true); } });
}
function hdr() { $('#hdrStats').innerHTML = `<span>Lv ${lvl()}</span><span>🪙 ${S.coins}</span><span>💎 ${S.diamonds}</span><span>⭐ ${S.stars}</span><span>🔥 ${S.streak}</span>`; }

/* ---------- 4. AUTH ---------- */
let apiModulesCache = null;

async function loadModulesFromAPI() {
  if (apiModulesCache) return apiModulesCache;
  try {
    const data = await apiGetModules();
    apiModulesCache = data.modules;
    return apiModulesCache;
  } catch (e) {
    console.error('Failed to load modules:', e);
    return MODS.filter(m => m.q || m.go); // fallback to local data
  }
}

function start() {
  document.documentElement.dataset.theme = 'dark';
  const sess = localStorage.getItem('cq_session');
  console.log('[DIAG] start() called. cq_session:', sess ? 'present' : 'missing');
  if (sess) {
    const stored = localStorage.getItem('cq_s_' + sess);
    console.log('[DIAG] cq_s_' + sess + ':', stored ? 'present' : 'missing');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('[DIAG] parsed session:', { user: parsed.user, xp: parsed.xp, coins: parsed.coins, stars: parsed.stars, streak: parsed.streak });
      } catch (e) {
        console.log('[DIAG] parse error:', e.message);
      }
    }
  }
  if (sess && localStorage.getItem('cq_s_' + sess)) {
    console.log('[DIAG] Calling enter(' + sess + ')');
    // Valid session exists - restore it
    enter(sess);
    return;
  }
  console.log('[DIAG] No valid session - showing splash');
  app.innerHTML = `<div class="splash"><svg width="110" height="110" viewBox="0 0 40 40"><defs><linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#6366f1"/></linearGradient></defs><circle cx="20" cy="20" r="18" fill="url(#lg2)"/><path d="M14 24c-3-1-3-6 0-7 0-4 5-5 6-2 1-3 6-2 6 2 3 1 3 6 0 7M20 15v14" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg><h1 class="mt-3 fw-bold">Cortex Quest</h1><p class="text-mut">Learn. Play. Level up. 🧠</p></div>`;
  setTimeout(authView, 2000);
}
let authTab = 'login', pickedAv = AVATARS[0];
function authView() {
  console.log('[DIAG] authView() called - showing login page');
  const t = authTab;
  app.innerHTML = `<div class="view mx-auto pt-5" style="max-width:420px"><div class="cq-card"><h3 class="text-center">Who is playing? ${pickedAv}</h3>
  <div class="d-flex gap-2 mb-3"><button class="btn ${t == 'login' ? 'btn-cq' : 'btn-soft'} flex-fill" onclick="authTab='login';authView()">Login</button><button class="btn ${t == 'reg' ? 'btn-cq' : 'btn-soft'} flex-fill" onclick="authTab='reg';authView()">Register</button><button class="btn ${t == 'guest' ? 'btn-cq' : 'btn-soft'} flex-fill" onclick="authTab='guest';authView()">Guest</button></div>
  ${t != 'login' ? `<div class="text-center mb-2">${AVATARS.map(a => `<button class="btn btn-soft m-1 ${a == pickedAv ? 'border border-2' : ''}" onclick="pickedAv='${a}';authView()">${a}</button>`).join('')}</div>` : ''}
  ${t == 'guest' ? '' : '<input id="u" class="form-control mb-2" placeholder="Player ID"><input id="pw" type="password" class="form-control mb-2" placeholder="Password">'}
  ${t == 'reg' ? '<input id="nm" class="form-control mb-2" placeholder="Display name">' : ''}
  <div id="err" class="text-danger small mb-2"></div><button class="btn btn-cq w-100" onclick="doAuth()">${t == 'login' ? 'Login 🚀' : t == 'reg' ? 'Create player ✨' : 'Play as guest 🎮'}</button></div></div>`;
}
async function doAuth() {
  const err = m => $('#err').textContent = m;
  if (authTab == 'guest') {
    try {
      const btn = document.querySelector('.btn-cq.w-100');
      btn.disabled = true;
      btn.textContent = 'Connecting…';
      const data = await apiGuestLogin(pickedAv);
      // Backend returns access_token, refresh_token, account, profile
      // Store tokens for API calls
      localStorage.setItem('cq_access_token', data.access_token);
      localStorage.setItem('cq_refresh_token', data.refresh_token);
      // Create local state from backend profile
      const user = data.profile.player_id;
      localStorage.setItem('cq_s_' + user, JSON.stringify({
        user,
        name: data.profile.display_name,
        av: data.profile.avatar,
        id: data.profile.player_id,
        xp: data.profile.xp,
        coins: data.profile.coins,
        diamonds: data.profile.diamonds,
        stars: data.profile.stars,
        streak: data.profile.streak,
        lastDay: today(),
        solved: 0, correct: 0, tests: 0, done: {}, bm: [], formulas: [], mistakes: [], badges: [], last: null,
        daily: {d: today(), solved: 0, levels: 0, brain: 0, rev: 0, claimed: false},
        set: {theme: 'dark', sound: true, notif: true, lang: 'English', privacy: 'Public'},
        account_type: data.account.account_type
      }));
      return enter(user);
    } catch (e) {
      err('Guest login failed: ' + e.message);
      const btn = document.querySelector('.btn-cq.w-100');
      btn.disabled = false;
      btn.textContent = 'Play as guest 🎮';
    }
    return;
  }
  const u = $('#u').value.trim().toLowerCase(), p = $('#pw').value;
  if (!u || !p) return err('Enter a username and password.');
  if (authTab == 'login') {
    try {
      const btn = document.querySelector('.btn-cq.w-100');
      btn.disabled = true;
      btn.textContent = 'Logging in…';
      const data = await apiLogin(u, p);
      localStorage.setItem('cq_access_token', data.access_token);
      localStorage.setItem('cq_refresh_token', data.refresh_token);
      const user = data.profile.player_id;
      localStorage.setItem('cq_s_' + user, JSON.stringify({
        user,
        name: data.profile.display_name,
        av: data.profile.avatar,
        id: data.profile.player_id,
        xp: data.profile.xp,
        coins: data.profile.coins,
        diamonds: data.profile.diamonds,
        stars: data.profile.stars,
        streak: data.profile.streak,
        lastDay: today(),
        solved: 0, correct: 0, tests: 0, done: {}, bm: [], formulas: [], mistakes: [], badges: [], last: null,
        daily: {d: today(), solved: 0, levels: 0, brain: 0, rev: 0, claimed: false},
        set: {theme: 'dark', sound: true, notif: true, lang: 'English', privacy: 'Public'},
        account_type: data.account.account_type
      }));
      return enter(user);
    } catch (e) {
      err('Login failed: ' + e.message);
      const btn = document.querySelector('.btn-cq.w-100');
      btn.disabled = false;
      btn.textContent = 'Login 🚀';
    }
    return;
  }
  if (authTab == 'reg') {
    const nm = $('#nm').value.trim();
    if (!nm) return err('Enter a display name.');
    try {
      const btn = document.querySelector('.btn-cq.w-100');
      btn.disabled = true;
      btn.textContent = 'Creating account…';
      const data = await apiRegister(u, p, nm, pickedAv);
      localStorage.setItem('cq_access_token', data.access_token);
      localStorage.setItem('cq_refresh_token', data.refresh_token);
      const user = data.profile.player_id;
      localStorage.setItem('cq_s_' + user, JSON.stringify({
        user,
        name: data.profile.display_name,
        av: data.profile.avatar,
        id: data.profile.player_id,
        xp: data.profile.xp,
        coins: data.profile.coins,
        diamonds: data.profile.diamonds,
        stars: data.profile.stars,
        streak: data.profile.streak,
        lastDay: today(),
        solved: 0, correct: 0, tests: 0, done: {}, bm: [], formulas: [], mistakes: [], badges: [], last: null,
        daily: {d: today(), solved: 0, levels: 0, brain: 0, rev: 0, claimed: false},
        set: {theme: 'dark', sound: true, notif: true, lang: 'English', privacy: 'Public'},
        account_type: data.account.account_type
      }));
      return enter(user);
    } catch (e) {
      err('Registration failed: ' + e.message);
      const btn = document.querySelector('.btn-cq.w-100');
      btn.disabled = false;
      btn.textContent = 'Create player ✨';
    }
    return;
  }
}
function enter(user) {
  console.log('[DIAG] enter(' + user + ') called');
  const stored = localStorage.getItem('cq_s_' + user);
  if (!stored) {
    console.log('[DIAG] enter() - no stored data for user:', user);
    return;
  }
  S = JSON.parse(stored); localStorage.setItem('cq_session', user);
  console.log('[DIAG] enter() loaded state:', { xp: S.xp, coins: S.coins, stars: S.stars, streak: S.streak });
  if (S.daily.d != today()) S.daily = {d: today(), solved: 0, levels: 0, brain: 0, rev: 0, claimed: false};
  if (S.lastDay != today()) { const y = new Date(Date.now() - 864e5).toDateString(); S.streak = S.lastDay == y ? S.streak + 1 : 1; S.lastDay = today(); }
  document.documentElement.dataset.theme = S.set.theme; save();
  $('#shell').classList.remove('d-none'); $('#voiceBtn').textContent = voiceOn ? '🗣️' : '🔇'; 

  // Fetch fresh profile from backend
  console.log('[DIAG] enter() - calling refreshProfileFromBackend()');
  refreshProfileFromBackend().then(() => {
    console.log('[DIAG] refreshProfileFromBackend() succeeded. Final state:', { xp: S.xp, coins: S.coins, stars: S.stars, streak: S.streak });
    hdr(); go('home'); checkBadges();
  }).catch(e => {
    console.log('[DIAG] refreshProfileFromBackend() failed:', e.message);
    console.warn('Failed to refresh profile:', e);
    hdr(); go('home'); checkBadges();
  });
}

async function refreshProfileFromBackend() {
  console.log('[DIAG] refreshProfileFromBackend() - calling apiGetMe()');
  try {
    const data = await apiGetMe();
    console.log('[DIAG] apiGetMe() returned:', { xp: data.profile.xp, coins: data.profile.coins, stars: data.profile.stars, streak: data.profile.streak, player_id: data.profile.player_id });
    const p = data.profile;
    S.xp = p.xp;
    S.coins = p.coins;
    S.diamonds = p.diamonds;
    S.stars = p.stars;
    S.streak = p.streak;
    S.name = p.display_name;
    S.av = p.avatar;
    S.id = p.player_id;
    // Store account type for guest/permanent distinction
    S.account_type = data.account.account_type;
    save();
    console.log('[DIAG] refreshProfileFromBackend() - state saved:', { xp: S.xp, coins: S.coins, stars: S.stars, streak: S.streak });
  } catch (e) {
    console.log('[DIAG] refreshProfileFromBackend() error:', e.message);
    // If token expired or invalid, clear auth and redirect to login
    if (e.message.includes('401') || e.message.includes('Not authenticated') || e.message.includes('Invalid or expired token')) {
      console.log('[DIAG] Token invalid - calling logout()');
      logout();
      throw new Error('Session expired. Please log in again.');
    }
    throw e;
  }
}
function logout() { 
  clearInterval(timer); 
  localStorage.removeItem('cq_session'); 
  localStorage.removeItem('cq_access_token'); 
  localStorage.removeItem('cq_refresh_token'); 
  progressCache = null; 
  historyPage = 1; 
  historyFilters = {}; 
  S = null; 
  $('#shell').classList.add('d-none'); 
  authTab = 'login'; 
  authView(); 
  // Call backend logout to revoke session (fire and forget)
  fetch(API_BASE + '/auth/logout', {method: 'POST', credentials: 'include'}).catch(() => {});
}

/* ---------- 5. VIEWS ---------- */
const TABS = [['home', '🏠', 'Home'], ['modules', '📚', 'Modules'], ['challenges', '🎯', 'Challenges'], ['board', '🏆', 'Leaderboard'], ['profile', '👤', 'Profile']];
async function go(v, a) {
  hush(); clearInterval(timer); G = G && G.keep ? G : null;
  const map = {home, modules, mod, learn, challenges, mock, board, profile, revision, settings, progress, history}, tab = {mod: 'modules', learn: 'modules', mock: 'modules', revision: 'profile', settings: 'profile', progress: 'profile', history: 'profile'}[v] || v;
  $('#tabs').innerHTML = TABS.map((t, i) => `<button class="${t[0] == tab ? 'on' : ''}" onclick="go('${t[0]}')"><span>${t[1]}</span>${(LANG[S.set.lang] || [])[i] || t[2]}</button>`).join('');
  app.innerHTML = `<div class="view">${await map[v](a)}</div>`; window.scrollTo(0, 0); hdr(); musicFor(v); if (v == 'home') { welcome(); welcomeText(); }
}
const levelsDone = m => Object.keys(S.done).filter(k => k.startsWith(m + '|')).length;
const acc = () => S.solved ? Math.round(S.correct / S.solved * 100) : 0;
const dailyTasks = () => [['Answer 20 questions 🧮', S.daily.solved, 20], ['Complete a level 🎯', S.daily.levels, 1], ['Play a brain game 🧩', S.daily.brain, 1], ['Revise formulas 📐', S.daily.rev, 1]];
const dailyDone = () => dailyTasks().every(t => t[1] >= t[2]);

function home() {
  const xpIn = S.xp % 200, last = S.last, lm = last && (MODS.find(m => m.id == last.m) || MODS.find(m => m.slug == last.m));
  const lastKey = last ? (last.submodule ? `${last.m}|${last.d}|${last.submodule}|${last.l}` : `${last.m}|${last.d}|${last.l}`) : null;
  return `<h2 class="mb-1">Hi ${S.name} ${S.av}</h2><p class="text-mut">Ready for today's quest?</p>
  <div class="cq-card mb-3"><div class="d-flex justify-content-between"><b>Level ${lvl()} 🚀</b><span class="text-mut">${xpIn}/200 XP</span></div>${bar(xpIn, 200)}${mountain(xpIn / 200)}
  <div class="d-flex flex-wrap gap-3 mt-3 text-mut"><span>🪙 ${S.coins} Coins</span><span>💎 ${S.diamonds} Diamonds</span><span>⭐ ${S.stars} Stars</span><span>🔥 ${S.streak}-day streak</span></div></div>
  <div class="row g-3 mb-3">
   <div class="col-md-6"><div class="cq-card"><h5>▶️ Continue Quest</h5><p class="text-mut">${lm ? `${lm.e} ${lm.n} · ${last.d} · Level ${last.l}${last.submodule ? ` · ${last.submodule}` : ''}` : 'Pick your first module and start learning!'}</p><button class="btn btn-cq" onclick="${lm ? `go('learn','${lastKey}')` : "go('modules')"}">${lm ? 'Continue' : 'Browse modules'}</button></div></div>
   <div class="col-md-6"><div class="cq-card"><h5>📅 Daily Challenge</h5>${bar(dailyTasks().filter(t => t[1] >= t[2]).length, 4)}<p class="text-mut mt-2">${dailyTasks().filter(t => t[1] >= t[2]).length}/4 tasks done</p><button class="btn btn-cq" onclick="go('challenges')">Open</button></div></div></div>
  <h5>⚡ Quick Actions</h5><div class="row g-2 mb-3">${[['🎲', 'Random practice', "randomPractice()"], ['📝', 'Mock test', "go('mock')"], ['🧩', 'Brain game', "brainStart()"], ['📚', 'Revision', "go('revision')"]].map(a => `<div class="col-6 col-md-3"><div class="cq-card hov text-center" onclick="${a[2]}"><div class="big-emoji">${a[0]}</div>${a[1]}</div></div>`).join('')}</div>
  <div class="row g-3"><div class="col-md-6"><div class="cq-card"><h5>🏅 Achievements</h5><div class="d-flex gap-2 flex-wrap">${BADGES.slice(0, 6).map(b => `<span class="badge-tile ${S.badges.includes(b.id) ? 'on' : ''} big-emoji" title="${b.n}">${b.e}</span>`).join('')}</div><a href="#" onclick="go('profile');return false">See all</a></div></div>
  <div class="col-md-6"><div class="cq-card"><h5>🏆 Leaderboard</h5>${rank('global').slice(0, 3).map((r, i) => `<div>${['🥇', '🥈', '🥉'][i]} ${r[0]} — ${r[1]} XP</div>`).join('')}<a href="#" onclick="go('board');return false">View all</a></div></div></div>`;
}
async function modules() {
  const mods = await loadModulesFromAPI();
  return `<h3>📚 Modules</h3><div class="row g-3">${mods.map(m => `<div class="col-6 col-md-4 col-lg-3"><div class="cq-card hov" onclick="go('mod','${m.slug}')"><div class="big-emoji">${m.emoji}</div><b>${m.name}</b><div class="small text-mut">${m.description || ''}</div></div></div>`).join('')}</div>`;
}
async function mod(a) {
  const parts = a.split('|');
  let slug = parts[0], d = parts[1] || 'Easy', submodule = parts[2] || null;
  const mods = await loadModulesFromAPI();
  const m = mods.find(x => x.slug == slug); 
  
  // Load submodules for this module
  let submodulesHtml = '';
  try {
    const subData = await apiGetSubmodules(slug);
    const activeSubs = subData.submodules.filter(s => s.is_active);
    if (activeSubs.length > 0) {
      submodulesHtml = `<div class="mb-3"><h6>Submodules</h6><div class="d-flex flex-wrap gap-2">${activeSubs.map(sm => `<button class="btn ${sm.slug === submodule ? 'btn-cq' : 'btn-soft'}" onclick="go('mod','${slug}|${d}|${sm.slug}')">${sm.name}</button>`).join('')}</div></div>`;
    }
  } catch (e) {
    console.warn('Failed to load submodules:', e);
  }
  
  // Level buttons - include submodule if selected
  const levelKeys = [1, 2, 3].map(l => submodule ? `${slug}|${d}|${submodule}|${l}` : `${slug}|${d}|${l}`);
  const levelHtml = levelKeys.map((k, idx) => { 
    const l = idx + 1;
    return `<div class="col-4"><div class="cq-card hov text-center" onclick="go('learn','${k}')"><div class="big-emoji">${S.done[k] ? '✅' : '🎯'}</div>Level ${l}</div></div>`; 
  }).join('');
  
  return `<button class="btn btn-soft mb-2" onclick="go('modules')">← Modules</button><h3>${m.emoji} ${m.name}</h3>
  <div class="d-flex gap-2 mb-3">${DIFFS.map(x => `<button class="btn ${x == d ? 'btn-cq' : 'btn-soft'}" onclick="go('mod','${slug}|${x}${submodule ? '|' + submodule : ''}')">${x}</button>`).join('')}</div>
  ${submodulesHtml}
  <div class="row g-3">${levelHtml}</div>`;
}
function learn(k, auto) {
  const parts = k.split('|');
  const slug = parts[0], d = parts[1], submodule = parts[2] || null, l = submodule ? parts[3] : parts[2];
  // Find module in local data for questions (API doesn't serve questions yet)
  const m = MODS.find(x => x.id == slug) || MODS.find(x => x.slug == slug);
  S.last = {m: slug, d, l, submodule}; save();
  const backUrl = submodule ? `'${slug}|${d}|${submodule}'` : `'${slug}|${d}'`;
  const html = `<button class="btn btn-soft mb-2" onclick="go('mod',${backUrl})">← Back</button>
  <div class="cq-card"><span class="small text-mut">${d} · Level ${l}${submodule ? ` · ${submodule}` : ''}</span><h3>${m.e} ${m.t}</h3><p>${m.x}</p>
  <h6>📌 Important points</h6><ul>${m.p.map(p => `<li>${p}</li>`).join('')}</ul>
  <h6>✏️ Formula</h6><div class="cq-card mb-3" style="background:var(--card2)"><code style="color:var(--gold)">${m.f}</code></div>
  <h6>💡 Example</h6><p class="text-mut">${m.q[0][0]} → <b>${m.q[0][1][m.q[0][2]]}</b> (${m.q[0][3]})</p>
  <div class="d-flex flex-wrap gap-2"><button class="btn btn-soft" onclick="toggleBm('${slug}',this)">${S.bm.includes(slug) ? '🔖 Bookmarked' : '🔖 Bookmark'}</button><button class="btn btn-soft" onclick="saveFormula('${slug}')">📐 Save formula</button><button class="btn btn-cq ms-auto" onclick="startLevel('${k}')">Start Practice ▶️</button></div></div>`;
  return html;
}
function toggleBm(slug, b) { S.bm = S.bm.includes(slug) ? S.bm.filter(x => x != slug) : [...S.bm, slug]; b.textContent = S.bm.includes(slug) ? '🔖 Bookmarked' : '🔖 Bookmark'; save(); }
function saveFormula(slug) {
  const m = MODS.find(x => x.id == slug) || MODS.find(x => x.slug == slug);
  if (S.formulas.some(f => f.m == slug)) return popup('📐', 'Already saved', 'This formula is in your Formula Locker.');
  S.formulas.push({m: slug, t: m.t, f: m.f}); save(); popup('📐✨', 'Formula saved!', 'Find it in Revision → Formula Locker.'); checkBadges();
}
async function startLevel(k) {
  const parts = k.split('|');
  const slug = parts[0];
  const d = parts[1];
  const submodule = parts[2] && parts.length === 4 ? parts[2] : null;
  const l = submodule ? parts[3] : parts[2];
  const diffMap = {Easy: 'easy', Medium: 'medium', Hard: 'hard'};
  const difficulty = diffMap[d] || 'easy';
  const level = parseInt(l, 10);
  
  try {
    const btn = document.querySelector('button[onclick*="startLevel"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Loading…'; }
    
    const data = await apiGetPracticeQuestions(slug, difficulty, level, submodule, 5);
    
    if (!data.questions || data.questions.length === 0) {
      throw new Error('No questions available for this level');
    }
    
    // Convert backend questions to frontend format
    const qs = data.questions.map(q => ({
      id: q.id,
      question_text: q.question_text,
      options: q.options.map(o => ({id: o.id, text: o.text, display_order: o.display_order})),
      explanation: '', // Will be filled after submission
      module: data.module,
      difficulty: data.difficulty,
      level: data.level,
      submodule: data.submodule
    }));
    
    runQuiz({
      title: `${data.module.toUpperCase()} · ${d} L${level}`,
      qs,
      key: k,
      mock: false,
      backend: true,
      meta: {module: data.module, difficulty: data.difficulty, level: data.level, submodule: data.submodule}
    });
  } catch (e) {
    popup('🚫', 'Quiz unavailable', e.message || 'Failed to load questions. Try again later.');
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
  const isGuest = S.account_type === 'GUEST';
  const avatars = ['🦊', '🐼', '🦉', '🐙', '🦄', '🐯'];
  const avatarOptions = avatars.map(a => `<button type="button" class="btn btn-outline-secondary avatar-btn${S.av === a ? ' active' : ''}" onclick="selectAvatar(this, '${a}')" style="font-size:1.5rem">${a}</button>`).join(' ');
  
  return `<div class="cq-card text-center mb-3"><div style="font-size:4rem">${S.av}</div><h3>${S.name}</h3>
  <div class="d-flex justify-content-center align-items-center gap-2 mt-2 flex-wrap">
    <span class="text-mut">Player ID:</span>
    <code id="playerId" class="user-select-all">${S.id}</code>
    <button class="btn btn-soft btn-sm" onclick="copyPlayerId()" title="Copy Player ID">📋</button>
  </div>
  <div class="mt-2"><span class="badge ${isGuest ? 'bg-warning text-dark' : 'bg-success'}">${isGuest ? '🔓 Guest' : '🔐 Permanent'}</span></div>
  <div class="mt-2">Level ${lvl()} · ${S.xp} XP</div>
  <div class="d-flex justify-content-center flex-wrap gap-3 mt-2">${[['🪙', S.coins], ['💎', S.diamonds], ['⭐', S.stars], ['🔥', S.streak]].map(x => `<b>${x[0]} ${x[1]}</b>`).join('')}</div>
  ${isGuest ? '<div class="mt-3 text-warning small">🔓 Guest account — progress saved to this device only</div>' : ''}</div>
  <div class="row g-3 mb-3">${[['Questions solved', S.solved], ['Tests taken', S.tests], ['Accuracy', acc() + '%'], ['Levels done', Object.keys(S.done).length]].map(x => `<div class="col-6 col-md-3"><div class="cq-card text-center"><h4>${x[1]}</h4><span class="text-mut">${x[0]}</span></div></div>`).join('')}</div>
  <h5>🏅 Achievements</h5><div class="row g-3 mb-3">${BADGES.map(b => `<div class="col-6 col-md-3"><div class="cq-card badge-tile ${S.badges.includes(b.id) ? 'on' : ''}"><div class="big-emoji">${b.e}</div><b>${b.n}</b>${bar(b.v(), b.g)}<div class="small">${Math.min(b.v(), b.g)}/${b.g} · ${S.badges.includes(b.id) ? 'Unlocked' : 'Locked 🔒'}</div></div></div>`).join('')}</div>
  <div class="d-flex gap-2 flex-wrap">${isGuest ? `<button class="btn btn-cq" onclick="secureAccount()">🔐 Secure Account</button>` : ''}<button class="btn btn-cq" onclick="go('revision')">📚 Revision</button><button class="btn btn-soft" onclick="go('settings')">⚙️ Settings</button><button class="btn btn-soft" onclick="go('progress')">📊 Progress</button><button class="btn btn-soft" onclick="go('history')">📜 History</button></div>
  <hr class="my-4">
  <div class="cq-card">
    <h5>✏️ Edit Profile</h5>
    <div class="mb-3">
      <label class="form-label">Display Name</label>
      <input type="text" class="form-control" id="editDisplayName" value="${S.name}" maxlength="50" placeholder="Enter display name">
      <div class="form-text">1-50 characters</div>
    </div>
    <div class="mb-3">
      <label class="form-label">Avatar</label>
      <div class="d-flex flex-wrap gap-2" id="avatarPicker">${avatarOptions}</div>
      <input type="hidden" id="editAvatar" value="${S.av}">
      <div class="form-text">Choose your avatar</div>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-cq" onclick="saveProfile()" id="saveProfileBtn">💾 Save Changes</button>
      <button class="btn btn-soft" onclick="go('profile')">✖ Cancel</button>
    </div>
    <div id="profileError" class="text-danger mt-2 small"></div>
    <div id="profileSuccess" class="text-success mt-2 small"></div>
  </div>`;
}

function selectAvatar(btn, avatar) {
  document.querySelectorAll('#avatarPicker .avatar-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  $('#editAvatar').value = avatar;
}

function copyPlayerId() {
  const playerId = S.id;
  navigator.clipboard.writeText(playerId).then(() => {
    const btn = event.target.closest('button');
    const original = btn.innerHTML;
    btn.innerHTML = '✅';
    btn.classList.add('btn-success');
    btn.classList.remove('btn-soft');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('btn-success');
      btn.classList.add('btn-soft');
    }, 1500);
  }).catch(() => {
    // Fallback for older browsers
    const input = document.createElement('input');
    input.value = playerId;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert('Player ID copied: ' + playerId);
  });
}

async function saveProfile() {
  const btn = $('#saveProfileBtn');
  const errorEl = $('#profileError');
  const successEl = $('#profileSuccess');
  
  errorEl.textContent = '';
  successEl.textContent = '';
  btn.disabled = true;
  btn.innerHTML = '⏳ Saving...';
  
  const displayName = $('#editDisplayName').value.trim();
  const avatar = $('#editAvatar').value;
  
  if (!displayName) {
    errorEl.textContent = 'Display name cannot be empty';
    btn.disabled = false;
    btn.innerHTML = '💾 Save Changes';
    return;
  }
  
  try {
    const data = await apiUpdateProfile({display_name: displayName, avatar: avatar});
    S.name = data.profile.display_name;
    S.av = data.profile.avatar;
    S.id = data.profile.player_id;
    save();
    successEl.textContent = 'Profile updated successfully!';
    // Refresh the profile view to show updated info
    setTimeout(() => go('profile'), 1000);
  } catch (e) {
    if (e.message.includes('401') || e.message.includes('Not authenticated') || e.message.includes('Invalid or expired token')) {
      logout();
      return;
    }
    errorEl.textContent = e.message || 'Failed to update profile';
  } finally {
    btn.disabled = false;
    btn.innerHTML = '💾 Save Changes';
  }
}

let progressCache = null;
async function progress() {
  if (!progressCache) {
    try {
      progressCache = await apiGetProgressV2();
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('Not authenticated') || e.message.includes('Invalid or expired token')) {
        logout();
        return '<div class="text-center"><p class="text-danger">Session expired. Please log in again.</p></div>';
      }
      console.error('Failed to load progress:', e);
      return `<div class="cq-card"><h3>📊 Progress</h3><p class="text-danger">Failed to load progress: ${e.message}</p><button class="btn btn-cq mt-2" onclick="progressCache=null;go('progress')">Retry</button></div>`;
    }
  }
  
  const profile = progressCache.profile;
  const modules = progressCache.modules;
  
  let html = `<button class="btn btn-soft mb-2" onclick="go('profile')">← Profile</button><h3>📊 Progress</h3>
  <div class="cq-card mb-3"><div class="d-flex justify-content-center flex-wrap gap-3"><b>Level ${Math.floor(profile.xp / 200) + 1}</b><span>🪙 ${profile.coins}</span><span>💎 ${profile.diamonds}</span><span>⭐ ${profile.stars}</span><span>🔥 ${profile.streak}</span></div></div>
  <div class="d-flex gap-2 mb-3"><button class="btn btn-soft" onclick="progressCache=null;go('progress')">🔄 Refresh</button></div>`;
  
  for (const mod of modules) {
    let moduleHtml = `<div class="cq-card mb-3"><h4>${mod.module_name} (${mod.module_slug})</h4>`;
    let hasProgress = false;
    
    for (const diff of mod.difficulties) {
      let diffHtml = `<div class="mb-3"><h6 class="text-mut">${diff.difficulty}</h6>`;
      let diffHasProgress = false;
      
      for (const sub of diff.submodules) {
        const subName = sub.submodule ? `${sub.submodule} (${sub.submodule_name})` : 'Legacy (no submodule)';
        const completedLevels = sub.levels.filter(l => l.completed);
        if (completedLevels.length === 0) continue;
        
        diffHasProgress = true;
        hasProgress = true;
        diffHtml += `<div class="mb-2"><strong>${subName}</strong><div class="d-flex flex-wrap gap-1 mt-1">`;
        
        for (const level of completedLevels) {
          diffHtml += `<span class="badge bg-success text-dark" style="font-size:0.8rem">L${level.level} ⭐${level.stars_earned} (${level.best_accuracy}%) ${level.attempts_count > 0 ? `· ${level.attempts_count} attempts` : ''}</span>`;
        }
        diffHtml += `</div></div>`;
      }
      
      if (diffHasProgress) {
        diffHtml += `</div>`;
        moduleHtml += diffHtml;
      }
    }
    
    moduleHtml += `</div>`;
    if (hasProgress) {
      html += moduleHtml;
    }
  }
  
  if (!modules.some(m => m.difficulties.some(d => d.submodules.some(s => s.levels.some(l => l.completed))))) {
    html += `<div class="cq-card text-center"><p class="text-mut">No progress yet. Complete a practice quiz to see your progress here!</p></div>`;
  }
  
  return html;
}

let historyPage = 1;
let historyFilters = {};
async function history(filters = null) {
  if (filters !== null) {
    historyFilters = filters;
    historyPage = 1;
  }
  
  try {
    const [attemptsData, summaryData] = await Promise.all([
      apiGetAttempts(historyPage, 20, historyFilters),
      apiGetAttemptsSummary()
    ]);
    
    const summary = summaryData;
    const attempts = attemptsData.attempts;
    const total = attemptsData.total;
    const totalPages = Math.ceil(total / 20);
    
    let html = `<button class="btn btn-soft mb-2" onclick="go('profile')">← Profile</button><h3>📜 Quiz History</h3>`;
    
    // Summary stats
    html += `<div class="cq-card mb-3"><h5>Summary</h5><div class="row g-2 text-center">
      <div class="col-6 col-md-3"><div class="cq-card"><h4>${summary.total_attempts}</h4><small>Total Attempts</small></div></div>
      <div class="col-6 col-md-3"><div class="cq-card"><h4>${summary.total_questions}</h4><small>Questions</small></div></div>
      <div class="col-6 col-md-3"><div class="cq-card"><h4>${summary.total_correct}</h4><small>Correct</small></div></div>
      <div class="col-6 col-md-3"><div class="cq-card"><h4>${summary.avg_accuracy_percent}%</h4><small>Avg Accuracy</small></div></div>
      <div class="col-6 col-md-3"><div class="cq-card"><h4>${Math.floor(summary.total_time_seconds / 60)}m</h4><small>Total Time</small></div></div>
      <div class="col-6 col-md-3"><div class="cq-card"><h4>${summary.total_xp_earned}</h4><small>Total XP</small></div></div>
      <div class="col-6 col-md-3"><div class="cq-card"><h4>${summary.total_coins_earned}</h4><small>Total Coins</small></div></div>
    </div></div>`;
    
    // Filters
    html += `<div class="cq-card mb-3"><h6>Filters</h6><div class="row g-2">
      <div class="col-md-3"><select class="form-select" id="histModule" onchange="applyHistoryFilters()"><option value="">All Modules</option>${[...new Set(attempts.map(a => a.module).filter(Boolean))].map(m => `<option value="${m}" ${historyFilters.module === m ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
      <div class="col-md-3"><select class="form-select" id="histDifficulty" onchange="applyHistoryFilters()"><option value="">All Difficulties</option>${[...new Set(attempts.map(a => a.difficulty).filter(Boolean))].map(d => `<option value="${d}" ${historyFilters.difficulty === d ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
      <div class="col-md-3"><select class="form-select" id="histSubmodule" onchange="applyHistoryFilters()"><option value="">All Submodules</option>${[...new Set(attempts.map(a => a.submodule).filter(Boolean))].map(s => `<option value="${s}" ${historyFilters.submodule === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
      <div class="col-md-3"><select class="form-select" id="histSessionType" onchange="applyHistoryFilters()"><option value="">All Types</option><option value="practice" ${historyFilters.session_type === 'practice' ? 'selected' : ''}>Practice</option><option value="mock" ${historyFilters.session_type === 'mock' ? 'selected' : ''}>Mock</option></select></div>
    </div></div>`;
    
    // Attempts list
    if (attempts.length === 0) {
      html += `<div class="cq-card text-center"><p class="text-mut">No quiz attempts yet.</p></div>`;
    } else {
      html += `<div class="cq-card"><div class="table-responsive"><table class="table table-dark table-hover mb-0"><thead><tr><th>Date</th><th>Type</th><th>Module</th><th>Difficulty</th><th>Submodule</th><th>Level</th><th>Score</th><th>Accuracy</th><th>Time</th><th>Rewards</th><th></th></tr></thead><tbody>`;
      
      for (const a of attempts) {
        const dateStr = new Date(a.completed_at).toLocaleDateString();
        const timeStr = `${Math.floor(a.total_time_seconds / 60)}m ${a.total_time_seconds % 60}s`;
        html += `<tr><td>${dateStr}</td><td>${a.session_type}</td><td>${a.module || '—'}</td><td>${a.difficulty || '—'}</td><td>${a.submodule || '—'}</td><td>${a.level || '—'}</td><td>${a.correct_answers}/${a.total_questions}</td><td>${a.accuracy_percent}%</td><td>${timeStr}</td><td>+${a.xp_earned} XP, +${a.coins_earned} 🪙</td><td><button class="btn btn-soft btn-sm" onclick="viewAttempt(${a.id})">View</button></td></tr>`;
      }
      
      html += `</tbody></table></div>`;
      
      // Pagination
      if (totalPages > 1) {
        html += `<div class="d-flex justify-content-center gap-2 mt-3">`;
        if (historyPage > 1) {
          html += `<button class="btn btn-soft" onclick="historyPage=${historyPage - 1};go('history')">← Prev</button>`;
        }
        html += `<span class="align-self-center">Page ${historyPage} of ${totalPages} (${total} total)</span>`;
        if (historyPage < totalPages) {
          html += `<button class="btn btn-soft" onclick="historyPage=${historyPage + 1};go('history')">Next →</button>`;
        }
        html += `</div>`;
      }
      html += `</div>`;
    }
    
    return html;
  } catch (e) {
    if (e.message.includes('401') || e.message.includes('Not authenticated') || e.message.includes('Invalid or expired token')) {
      logout();
      return '<div class="text-center"><p class="text-danger">Session expired. Please log in again.</p></div>';
    }
    console.error('Failed to load history:', e);
    return `<div class="cq-card"><h3>📜 Quiz History</h3><p class="text-danger">Failed to load history: ${e.message}</p><button class="btn btn-cq mt-2" onclick="go('history')">Retry</button></div>`;
  }
}

function applyHistoryFilters() {
  historyFilters = {
    module: $('#histModule').value || null,
    difficulty: $('#histDifficulty').value || null,
    submodule: $('#histSubmodule').value || null,
    session_type: $('#histSessionType').value || null
  };
  historyPage = 1;
  go('history');
}

async function viewAttempt(attemptId) {
  try {
    const attempt = await apiGetAttempt(attemptId);
    
    const dateStr = new Date(attempt.completed_at).toLocaleString();
    const timeStr = `${Math.floor(attempt.total_time_seconds / 60)}m ${attempt.total_time_seconds % 60}s`;
    
    let html = `<button class="btn btn-soft mb-2" onclick="go('history')">← History</button>
    <div class="cq-card mb-3"><h4>Attempt #${attempt.id}</h4>
    <div class="row g-2 text-center mb-3">
      <div class="col-6 col-md-3"><div class="cq-card"><h5>${attempt.correct_answers}/${attempt.total_questions}</h5><small>Correct</small></div></div>
      <div class="col-6 col-md-3"><div class="cq-card"><h5>${attempt.accuracy_percent}%</h5><small>Accuracy</small></div></div>
      <div class="col-6 col-md-3"><div class="cq-card"><h5>${timeStr}</h5><small>Time</small></div></div>
      <div class="col-6 col-md-3"><div class="cq-card"><h5>+${attempt.xp_earned} XP, +${attempt.coins_earned} 🪙</h5><small>Rewards</small></div></div>
    </div>
    <div class="d-flex flex-wrap gap-2 text-mut small">
      <span>${dateStr}</span><span>${attempt.session_type}</span><span>${attempt.module || '—'}</span><span>${attempt.difficulty || '—'}</span><span>${attempt.submodule || '—'}</span><span>Level ${attempt.level || '—'}</span>
    </div></div>`;
    
    // Questions detail
    html += `<h5>Questions</h5>`;
    for (const q of attempt.questions) {
      html += `<div class="cq-card mb-2 ${q.is_correct ? 'border-success' : 'border-danger'}" style="background:var(--card2)">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <span class="fw-bold">Q: ${q.question_text}</span>
          <span class="${q.is_correct ? 'text-success' : 'text-danger'}">${q.is_correct ? '✅ Correct' : '❌ Wrong'}</span>
        </div>
        <div class="small text-mut mb-1">
          Your answer: ${q.selected_option_text} ${q.is_correct ? '' : `→ Correct: ${q.correct_option_text}`}
        </div>
        <div class="small">${q.explanation || ''}</div>
      </div>`;
    }
    
    // Show in modal/popup
    popup('📜', `Attempt #${attemptId}`, html, false);
  } catch (e) {
    if (e.message.includes('401') || e.message.includes('Not authenticated') || e.message.includes('Invalid or expired token')) {
      logout();
      return;
    }
    popup('🚫', 'Error', `Failed to load attempt: ${e.message}`);
  }
}

let fq = '', fm = '';
function revision() {
  S.daily.rev = 1; save();
  const fs = S.formulas.filter(f => (!fm || f.m == fm) && (f.t + f.f).toLowerCase().includes(fq.toLowerCase()));
  return `<h3>📚 Revision</h3><div class="cq-card mb-3"><h5>📐 Formula Locker</h5><div class="d-flex gap-2 mb-2"><input class="form-control" placeholder="Search…" value="${fq}" oninput="fq=this.value;go('revision')" id="fs"><select class="form-select" style="max-width:180px" onchange="fm=this.value;go('revision')"><option value="">All</option>${QMODS.map(m => `<option value="${m.id}" ${fm == m.id ? 'selected' : ''}>${m.n}</option>`).join('')}</select></div>
  ${fs.length ? fs.map(f => `<div class="d-flex justify-content-between align-items-center py-2"><div><b>${f.t}</b><br><code style="color:var(--gold)">${f.f}</code></div><button class="btn btn-soft btn-sm" onclick="S.formulas=S.formulas.filter(x=>x.m!='${f.m}');save();go('revision')">🗑️</button></div>`).join('') : '<p class="text-mut">No formulas yet. Save one from any learning page 📐</p>'}</div>
  <div class="cq-card"><h5>🔒 Mistake Vault</h5>${S.mistakes.length ? S.mistakes.map((x, i) => `<div class="cq-card mb-2" style="background:var(--card2)"><b>${x.q[0]}</b><div class="small text-mut">${x.mn} · ${x.d} · ${x.date}</div><div>Your answer: <span class="text-danger">${x.u}</span> · Correct: <span style="color:var(--ok)">${x.q[1][x.q[2]]}</span></div><div class="small">💡 ${x.q[3]}</div><button class="btn btn-cq btn-sm mt-2" onclick="runQuiz({title:'🔁 Practice again',qs:[S.mistakes[${i}]],key:null,mock:false})">Practice Again</button> <button class="btn btn-soft btn-sm mt-2" onclick="reviewM(${i})">Review</button> <button class="btn btn-soft btn-sm mt-2" onclick="S.mistakes.splice(${i},1);save();go('revision')">Remove</button></div>`).join('') : '<p class="text-mut">No mistakes — or none yet! 🎉</p>'}</div>`;
}
function settings() {
  const s = S.set;
  return `<h3>⚙️ Settings</h3><div class="cq-card">
  ${[['theme', '🎨 Theme', ['dark', 'light']], ['lang', '🌐 Language', ['English', 'Hindi', 'Kannada']], ['privacy', '🔒 Privacy', ['Public', 'Friends', 'Private']]].map(r => `<div class="d-flex justify-content-between align-items-center mb-3"><span>${r[1]}</span><select class="form-select" style="max-width:160px" onchange="setOpt('${r[0]}',this.value)">${r[2].map(o => `<option ${s[r[0]] == o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`).join('')}
  ${[['sound', '🔊 Sound'], ['notif', '🔔 Notifications']].map(r => `<div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" ${s[r[0]] ? 'checked' : ''} onchange="setOpt('${r[0]}',this.checked)"><label>${r[1]}</label></div>`).join('')}
  <div class="form-check form-switch mb-3"><input class="form-check-input" type="checkbox" id="voiceChk" ${voiceOn ? 'checked' : ''} onchange="toggleVoice()"><label for="voiceChk">🗣️ My Voice</label></div>
  <button class="btn btn-cq" onclick="logout()">🚪 Logout</button></div>`;
}
function setOpt(k, v) { S.set[k] = v; if (k == 'theme') document.documentElement.dataset.theme = v; save(); if (k == 'lang') go('settings'); }

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
  G = Object.assign({i: 0, ans: {}, sub: [], res: [], t0: Date.now(), left: o.secs, keep: true}, o);
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
  const isBackend = G.backend === true;
  const questionText = isBackend ? q.question_text : q[0];
  const options = isBackend ? q.options : q[1];
  const correctIndex = isBackend ? null : q[2];
  const explanation = isBackend ? q.explanation : q[3];
  
  app.innerHTML = `<div class="view mx-auto" style="max-width:640px"><div class="d-flex justify-content-between"><b>${G.title}</b><span id="tm" class="text-mut">${G.mock ? '⏳' : '⏱️'}</span></div>
  ${bar(G.i + (sub ? 1 : 0), n)}${mountain((G.mock ? G.ans.filter(a => a !== undefined).length : G.res.filter(Boolean).length) / n)}<div class="small text-mut mt-1">Question ${G.i + 1} of ${n}</div>
  <div class="cq-card my-3"><h5 class="mb-3">${questionText}</h5>${options.map((o, i) => { 
    const optId = isBackend ? o.id : i;
    let c = G.ans[G.i] === optId ? 'sel' : ''; 
    if (sub) { 
      const correctOptId = isBackend ? q.correct_option_id : correctIndex;
      c = optId === correctOptId ? 'right' : (G.ans[G.i] === optId ? 'wrong' : ''); 
    } 
    return `<button class="opt ${c}" ${sub ? 'disabled' : ''} onclick="pick(${optId})">${'ABCD'[i]}. ${isBackend ? o.text : o}</button>`; 
  }).join('')}<div id="fb"></div></div>
  <div class="d-flex gap-2">${G.mock ? `<button class="btn btn-soft" ${G.i == 0 ? 'disabled' : ''} onclick="G.i--;drawQ()">← Prev</button>` : ''}<span class="ms-auto"></span>
  ${G.mock ? (G.i < n - 1 ? `<button class="btn btn-cq" onclick="G.i++;drawQ()">Next →</button>` : `<button class="btn btn-cq" onclick="finish()">Submit test ✅</button>`) : (sub ? `<button class="btn btn-cq" onclick="nextQ()">${G.i < n - 1 ? 'Next →' : 'Finish 🏁'}</button>` : `<button class="btn btn-cq" onclick="${isBackend ? 'nextQBackend()' : 'submitQ()'}">${G.i < n - 1 ? 'Next →' : 'Finish 🏁'}</button>`)}</div></div>`;
  if (sub && !G.backend) showFb();
}
function pick(optId) { if (G.sub[G.i]) return; G.ans[G.i] = optId; beep(520); drawQ(); }
function submitQ() {
  if (G.ans[G.i] === undefined) return $('#fb').innerHTML = '<div class="fb bad">Pick an option first 👆</div>';
  const x = G.qs[G.i], q = x.q, isBackend = G.backend === true;
  const correctIndex = isBackend ? null : q[2];
  const correctOptId = isBackend ? q.correct_option_id : correctIndex;
  const ok = G.ans[G.i] === correctOptId;
  G.sub[G.i] = 1; G.res[G.i] = ok; S.solved++; S.daily.solved++;
  if (ok) { S.correct++; addXP(20, 5); } else addMistake(x, G.ans[G.i]);
  save(); drawQ();
}
async function nextQBackend() {
  if (G.ans[G.i] === undefined) return $('#fb').innerHTML = '<div class="fb bad">Pick an option first 👆</div>';
  G.sub[G.i] = 1;
  if (G.i < G.qs.length - 1) { G.i++; drawQ(); } else finishBackend();
}
function showFb() {
  const x = G.qs[G.i], q = x.q, isBackend = G.backend === true;
  const ok = G.res[G.i];
  const w = pickW(ok ? CHEER : OOPS);
  const explanation = isBackend ? q.explanation : q[3];
  $('#fb').innerHTML = ok ? `<div class="fb good">🎉🥳✨ <b class="say">${w}</b> Correct! +20 XP +5 🪙<br><small>${explanation}</small></div>` : `<div class="fb bad">💜 <b class="say">${w}</b> ${QUOTES[Math.floor(Math.random() * 4)]}<br><small>Answer: ${isBackend ? q.correct_option_text : q[1][q[2]]} — ${explanation}</small></div>`;
  const c = $('#climber'); if (c) { c.classList.add(ok ? 'up' : 'slip'); const mt = c.closest('.mt'); if (mt) { mt.classList.add(ok ? 'cheer' : 'gust'); setTimeout(() => mt.classList.remove('cheer', 'gust'), 1500); } if (!ok) c.insertAdjacentHTML('afterend', '<span class="rock" style="left:' + c.style.left + ';top:' + c.style.top + '">🪨</span>'); }
  $('#fb').classList.add(ok ? 'cheer' : 'oops');
  if (ok) { confetti(); beep(900); }
}
function addMistake(x, a) { const m = MODS.find(z => z.id == x.m), old = S.mistakes.find(e => e.q[0] == x.q[0]); if (old) { old.u = x.q[1][a]; old.date = new Date().toLocaleDateString(); return; } S.mistakes.push({q: x.q, m: x.m, mn: m ? m.n : '', d: x.d, u: x.q[1][a], date: new Date().toLocaleDateString()}); }
function nextQ() { hush(); if (G.i < G.qs.length - 1) { G.i++; drawQ(); } else finish(); }
async function finishBackend() {
  clearInterval(timer);
  const n = G.qs.length;
  const answers = [];
  for (let i = 0; i < n; i++) {
    const q = G.qs[i].q;
    const selectedOptId = G.ans[i];
    if (selectedOptId === undefined) continue;
    const timeSec = Math.round((Date.now() - G.t0) / 1000 / n);
    answers.push({question_id: q.id, selected_option_id: selectedOptId, time_seconds: timeSec});
  }
  
  const meta = G.meta || {};
  const request = {
    session_type: 'practice',
    module: meta.module,
    difficulty: meta.difficulty,
    level: meta.level,
    submodule: meta.submodule,
    answers
  };
  
  try {
    const btn = document.querySelector('button[onclick*="finishBackend"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Submitting…'; }
    
    const resp = await apiSubmitQuiz(request);
    
    const summary = resp.summary;
    const rewards = resp.rewards;
    const results = resp.results;
    
    S.solved += summary.total_questions;
    S.correct += summary.correct_answers;
    S.daily.solved += summary.total_questions;
    
    for (let i = 0; i < n; i++) {
      const r = results[i];
      if (!r.correct) {
        const q = G.qs[i].q;
        const selectedOpt = q.options.find(o => o.id === r.selected_option_id);
        addMistake({
          q: [q.question_text, q.options.map(o => o.text), q.options.findIndex(o => o.id === r.correct_option_id), r.explanation],
          m: meta.module,
          d: meta.difficulty
        }, selectedOpt ? q.options.indexOf(selectedOpt) : 0);
      }
    }
    
    if (rewards.xp_earned > 0 || rewards.coins_earned > 0) {
      addXP(rewards.xp_earned, rewards.coins_earned);
    }
    if (rewards.stars_earned > 0) {
      S.stars += rewards.stars_earned;
      S.daily.levels++;
    }
    
    checkBadges(); save();
    
    const c = summary.correct_answers;
    const a = summary.accuracy_percent;
    const secs = summary.total_time_seconds;
    const wrong = summary.incorrect_answers;
    
    let rw = `${rewards.xp_earned} XP, ${rewards.coins_earned} 🪙`;
    if (rewards.stars_earned > 0) rw += `, ${rewards.stars_earned} ⭐`;
    
    G.keep = false;
    $('#tabs').innerHTML = ''; hdr();
    
    const resultsHtml = results.map((r, i) => {
      const q = G.qs[i].q;
      const selectedOpt = q.options.find(o => o.id === r.selected_option_id);
      const correctOpt = q.options.find(o => o.id === r.correct_option_id);
      const isCorrect = r.correct;
      return `<div class="cq-card mb-2 ${isCorrect ? 'border-success' : 'border-danger'}" style="background:var(--card2)">
        <div class="d-flex justify-content-between align-items-start mb-1">
          <span class="fw-bold">Q${i+1}: ${q.question_text}</span>
          <span class="${isCorrect ? 'text-success' : 'text-danger'}">${isCorrect ? '✅ Correct' : '❌ Wrong'}</span>
        </div>
        <div class="small text-mut mb-1">
          Your answer: ${selectedOpt ? selectedOpt.text : 'Not answered'} ${isCorrect ? '' : `→ Correct: ${correctOpt ? correctOpt.text : 'N/A'}`}
        </div>
        <div class="small">${r.explanation || ''}</div>
      </div>`;
    }).join('');
    
    app.innerHTML = `<div class="view mx-auto text-center" style="max-width:520px"><div class="cq-card">${mountain(a >= 50 ? 1 : Math.max(.2, a / 100), a >= 50 ? 'win' : '', a >= 50 ? '🏆' : '🧗')}${stars(a >= 80 ? 3 : a >= 50 ? 2 : 1)}<div style="font-size:3rem">${a >= 80 ? '🏆' : a >= 50 ? '🌟' : '💪'}</div><h3>${a >= 80 ? 'Brilliant!' : a >= 50 ? 'Nice work!' : 'Good effort!'}</h3>
    <p class="fw-bold fs-5">${a >= 50 ? 'Amazing! You conquered this level!' : "Don't give up!"}</p><h1>${c}/${n}</h1><p class="text-mut">Accuracy ${a}% · ✅ ${c} correct · ❌ ${wrong} wrong · ⏱️ ${secs}s</p><div class="fb good">🎁 Rewards: ${rw}</div>
    <details class="mt-3 text-start"><summary class="fw-bold cursor-pointer">View Question Details</summary><div class="mt-2">${resultsHtml}</div></details>
    <div class="d-grid gap-2 mt-3">${wrong ? `<button class="btn btn-soft" onclick="go('revision')">Review Mistakes 🔍</button>` : ''}<button class="btn btn-cq" onclick="go('home')">Dashboard 🏠</button></div></div></div>`;
    if (a >= 50) confetti();
    musicFor('win');
    G = null;
  } catch (e) {
    popup('🚫', 'Submission failed', e.message || 'Failed to submit quiz. Please try again.');
    const btn = document.querySelector('button[onclick*="finishBackend"]');
    if (btn) { btn.disabled = false; btn.textContent = 'Finish 🏁'; }
  }
}
function finish() {
  clearInterval(timer); const n = G.qs.length;
  if (G.mock) { G.qs.forEach((x, i) => { if (G.ans[i] === undefined) return; const ok = G.ans[i] === x.q[2]; G.res[i] = ok; S.solved++; if (ok) S.correct++; else addMistake(x, G.ans[i]); }); }
  const c = G.res.filter(Boolean).length, a = Math.round(c / n * 100), secs = Math.round((Date.now() - G.t0) / 1000);
  let rw = c * 20 + ' XP, ' + c * 5 + ' 🪙';
  if (G.mock) { S.tests++; rw = c * 10 + ' XP'; addXP(c * 10, 0); }
  else if (G.key) { if (!S.done[G.key]) { S.done[G.key] = 1; S.daily.levels++; S.stars++; addXP(100, 25); rw += ' + level bonus 100 XP, 25 🪙, 1 ⭐'; } if (a >= 66) confetti(); }
  checkBadges(); save();
  const next = G.key ? nextKey(G.key) : null, wrong = n - c, wasMock = G.mock; G.keep = false;
  $('#tabs').innerHTML = ''; hdr();
  app.innerHTML = `<div class="view mx-auto text-center" style="max-width:520px"><div class="cq-card">${mountain(a >= 50 ? 1 : Math.max(.2, a / 100), a >= 50 ? 'win' : '', a >= 50 ? '🏆' : '🧗')}${stars(a >= 80 ? 3 : a >= 50 ? 2 : 1)}<div style="font-size:3rem">${a >= 80 ? '🏆' : a >= 50 ? '🌟' : '💪'}</div><h3>${a >= 80 ? 'Brilliant!' : a >= 50 ? 'Nice work!' : 'Good effort!'}</h3>
  <p class="fw-bold fs-5">${a >= 50 ? 'Amazing! You conquered this level!' : "Don't give up!"}</p><h1>${c}/${n}</h1><p class="text-mut">Accuracy ${a}% · ✅ ${c} correct · ❌ ${wrong} wrong · ⏱️ ${secs}s</p><div class="fb good">🎁 Rewards: ${rw}</div>
  <div class="d-grid gap-2 mt-3">${wrong ? `<button class="btn btn-soft" onclick="go('revision')">Review Mistakes 🔍</button>` : ''}${next ? `<button class="btn btn-cq" onclick="go('learn','${next}')">Next Level ▶️</button>` : ''}<button class="btn ${next ? 'btn-soft' : 'btn-cq'}" onclick="go('home')">Dashboard 🏠</button></div></div></div>`;
  if (a >= 50) confetti();
  musicFor('win');
  G = null;
}
function nextKey(k) { const [id, d, l] = k.split('|'); if (+l < 3) return `${id}|${d}|${+l + 1}`; const di = DIFFS.indexOf(d); return di < 2 ? `${id}|${DIFFS[di + 1]}|1` : null; }

/* ---------- 6. BRAIN GAME: NUMBER SEQUENCE ---------- */
let B = null;
function brainStart() { B = {r: 0, score: 0}; $('#tabs').innerHTML = ''; brainRound(); }
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
function reviewM(i) { const x = S.mistakes[i]; popup('🔍', x.q[0], `Your answer: ${x.u}<br>Correct: <b>${x.q[1][x.q[2]]}</b><br>💡 ${x.q[3]}<br><small>${x.mn} · ${x.d} · ${x.date}</small>`); }

/* Memory Match */
let M = null;
function memStart() { const e = ['🍎', '🚀', '🐼', '⭐', '🎲', '🌈']; M = {c: shuf([...e, ...e]), open: [], ok: [], mv: 0, lock: false}; $('#tabs').innerHTML = ''; memDraw(); }
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
function patStart() { B = {r: 0, score: 0}; $('#tabs').innerHTML = ''; patRound(); }
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
function logicStart() { miniRun('🧩 Logic Puzzle', shuf(LOGIC).slice(0, 3)); }
function calcStart() {
  const it = [];
  for (let i = 0; i < 5; i++) {
    const a = 2 + Math.floor(Math.random() * 12), b = 2 + Math.floor(Math.random() * 12), op = ['+', '−', '×'][i % 3], r = op == '+' ? a + b : op == '−' ? a - b : a * b, o = new Set([r]);
    while (o.size < 4) o.add(r + Math.floor(Math.random() * 9) - 4);
    const arr = shuf(o); it.push([`${a} ${op} ${b} = ?`, arr, arr.indexOf(r), `The answer is ${r}`]);
  }
  miniRun('⚡ Quick Calculation', it);
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
const CHEER = ['Good!', 'Awesome!', 'Great!', 'Excellent!', 'Amazing!', 'Well done!'], OOPS = ['Oops!', 'Try again!', 'Not quite!', 'Keep going!', "Don't give up!"];
const pickW = a => a[Math.floor(Math.random() * a.length)];
const VOICE_FILE = 'Mp3.mpeg';
let voiceOn = localStorage.getItem('cq_voice') !== 'off', voiceAudio = null, pend = 0;
function pickVoice() { try { const v = speechSynthesis.getVoices().filter(x => /^en/i.test(x.lang)); VOICE = v.find(x => /female|zira|aria|jenny|samantha|karen|moira|tessa|victoria|heera|veena|susan|hazel|libby|sonia|natasha|catherine|allison|ava|serena|fiona/i.test(x.name)) || v.find(x => !/male|david|mark|james|george|daniel|alex|fred|rishi|guy|ryan/i.test(x.name)) || v[0] || null; } catch (e) {} }
if (window.speechSynthesis) { pickVoice(); try { speechSynthesis.onvoiceschanged = pickVoice; } catch (e) {} }
function prepVoice() { if (!voiceAudio) { voiceAudio = new Audio(VOICE_FILE); voiceAudio.volume = .85; voiceAudio.preload = 'auto'; } }
const clean = t => t.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/([!?.])\s*\./g, '$1').replace(/\s+/g, ' ').replace(/^[.\s]+|(\s\.)+$/g, '').trim();
function duck(on) { if (AC && MG) MG.gain.setTargetAtTime(on ? .05 : .16, AC.currentTime, .2); }  // keep the voice clear over music
function speak(t) { try { t = clean(t); if (!t || !S || !S.set.sound || !voiceOn) return; hush(); prepVoice(); pend++; duck(true); voiceAudio.currentTime = 0; const p = voiceAudio.play(); p.catch(() => { if (--pend <= 0) { pend = 0; duck(false); } }); voiceAudio.onended = () => { if (--pend <= 0) { pend = 0; duck(false); } }; } catch (e) {} }
function hush() { try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {} if (voiceAudio) { voiceAudio.pause(); voiceAudio.currentTime = 0; } pend = 0; duck(false); }
function toggleVoice() { voiceOn = !voiceOn; localStorage.setItem('cq_voice', voiceOn ? 'on' : 'off'); $('#voiceBtn').textContent = voiceOn ? '🗣️' : '🔇'; if (!voiceOn) hush(); }
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
  try { hush(); prepVoice(); pend++; duck(true); voiceAudio.currentTime = 0; const p = voiceAudio.play(); p.catch(() => { if (--pend <= 0) { pend = 0; duck(false); } }); p.then(() => { welcomeDone = true; voiceAudio.onended = () => { if (--pend <= 0) { pend = 0; duck(false); } }; }); } catch (e) {}
}
// Browsers may block speech before the first tap; retry once on the first interaction.
['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, () => { if (welcomeAsked && !welcomeDone) welcome(true); }));
const cardText = el => { const c = el.cloneNode(true); c.querySelectorAll('button,.mt,.stars,.d-grid').forEach(n => n.remove()); c.querySelectorAll('*').forEach(e => e.append(/^(H\d|P|DIV)$/.test(e.tagName) ? '. ' : ' ')); return c.textContent; };
// Read each important message once, exactly as shown: popups, feedback, XP rewards, result card.
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
  if (n.nodeType != 1) return;
  if (n.matches('.pop')) { const h = n.querySelector('h4'); if (h) speak(h.textContent); }                    // popup title only
  else if (n.matches('.fb')) { const k = n.querySelector('.say'); if (k) speak(k.textContent); else if (n.parentNode && n.parentNode.id == 'bfb') speak(n.classList.contains('good') ? 'Great!' : 'Keep going!'); }
  else if (n.querySelector && n.querySelector('.stars')) { const p = n.querySelector('.fw-bold'); if (p) speak(p.textContent); }  // short completion line
}))).observe(document.body, {childList: true, subtree: true});
const TRK = {
 home: {bpm: 72, w: 'sine', root: 55, sc: [0, 7, 12, 14, 19, 14, 12, 7], pad: [0, 7, 14], v: .5},
 learn: {bpm: 88, w: 'triangle', root: 65.4, sc: [0, 2, 4, 7, 4, 2, 7, 9], pad: [0, 4, 7], v: .45},
 prac: {bpm: 132, w: 'square', root: 73.4, sc: [0, 3, 7, 10, 12, 10, 7, 3], pad: [0, 7], v: .25, bass: 1},
 chal: {bpm: 96, w: 'sawtooth', root: 55, sc: [0, 1, 0, 6, 0, 3, 1, 0], pad: [0, 6], v: .2},
 win: {bpm: 128, w: 'triangle', root: 98, sc: [0, 4, 7, 12, 16, 12, 7, 4], pad: [0, 4, 7], v: .5}};
let AC = null, MG = null, cur = null, want = 'home', mon = localStorage.getItem('cq_music') !== 'off';
function ctx() { if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); MG = AC.createGain(); MG.gain.value = .16; MG.connect(AC.destination); } if (AC.state == 'suspended') AC.resume(); return AC; }
function note(f, t0, d, w, v, g) { const o = AC.createOscillator(), e = AC.createGain(); o.type = w; o.frequency.value = f; e.gain.setValueAtTime(0, t0); e.gain.linearRampToValueAtTime(v, t0 + .02); e.gain.exponentialRampToValueAtTime(.001, t0 + d); o.connect(e); e.connect(g); o.start(t0); o.stop(t0 + d + .05); }
function stopTrack() { if (!cur) return; const o = cur; cur = null; clearInterval(o.id); try { o.g.gain.setValueAtTime(o.g.gain.value, AC.currentTime); o.g.gain.linearRampToValueAtTime(0, AC.currentTime + .8); } catch (e) {} setTimeout(() => o.g.disconnect(), 1000); }
function playTrack(n) {
  if (!ctx() || (cur && cur.n == n)) return; stopTrack();
  const T = TRK[n], g = AC.createGain(), beat = 60 / T.bpm / 2; let i = 0; g.gain.value = 0; g.connect(MG); g.gain.linearRampToValueAtTime(1, AC.currentTime + 1.2);
  const id = setInterval(() => { const t = AC.currentTime + .05; note(T.root * Math.pow(2, T.sc[i % 8] / 12) * 2, t, beat * 1.8, T.w, T.v * .5, g); if (i % 4 == 0) T.pad.forEach(p => note(T.root * Math.pow(2, p / 12), t, beat * 3.6, 'sine', T.v * .35, g)); if (T.bass && i % 2 == 0) note(T.root / 2, t, beat, 'sine', .5, g); i++; }, beat * 1000);
  cur = {n, g, id};
}
function musicFor(v) { want = {home: 'home', challenges: 'chal', quiz: 'prac', win: 'win'}[v] || 'learn'; if (mon && AC) playTrack(want); }
function toggleMusic() { mon = !mon; localStorage.setItem('cq_music', mon ? 'on' : 'off'); if (mon) playTrack(want); else stopTrack(); $('#musicBtn').textContent = mon ? '🔊' : '🔇'; }
// Browsers block audio until the first tap/key press, so start music then.
const unlock = () => { if (mon) playTrack(want); };
document.addEventListener('pointerdown', unlock, {once: true}); document.addEventListener('keydown', unlock, {once: true});
document.addEventListener('visibilitychange', () => { if (AC) document.hidden ? AC.suspend() : (mon && AC.resume()); });
$('#musicBtn').textContent = mon ? '🔊' : '🔇';

start();