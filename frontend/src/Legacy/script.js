/* =========================================================================
   1. GLOBAL VARIABLES & CONFIGURATION
   ========================================================================= */
// Data for Navarasas
const NAVARASAS = [
    { 
      id:'shringara', name:'Shringara', subtitle: 'Love / Beauty',
      glowColor: '#a855f7', textColor: 'text-purple-400',
      plays:['Iddaru','Nenu Naa Rakshasi','Sakuntalam'],
      icon: '<svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' 
    },
    { 
      id:'hasya', name:'Hasya', subtitle: 'Laughter',
      glowColor: '#eab308', textColor: 'text-yellow-400',
      plays:['Aahana Pellanta','Jathi Ratnalu','Pellam Oorelithe'],
      icon: '<svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' 
    },
    { 
      id:'karuna', name:'Karuna', subtitle: 'Sorrow',
      glowColor: '#6b7280', textColor: 'text-gray-400',
      plays:['Matru Devo Bhava','Mithunam','Swathi Muthyam'],
      icon: '<svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" opacity="0.5"/><path d="M12 22s-2-4-2-8a2 2 0 1 1 4 0c0 4-2 8-2 8z"/></svg>' 
    },
    { 
      id:'raudra', name:'Raudra', subtitle: 'Anger',
      glowColor: '#dc2626', textColor: 'text-red-500',
      plays:['Karna Bharam','Raktha Charitra','Sangarshana'],
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-angry-icon lucide-angry"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M7.5 8 10 9"/><path d="m14 9 2.5-1"/><path d="M9 10h.01"/><path d="M15 10h.01"/></svg>'
    },
    { 
      id:'veera', name:'Veera', subtitle: 'Heroism',
      glowColor: '#f97316', textColor: 'text-orange-500',
      plays:['Bahubali','Magadheera','Simha'],
      icon: '<svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3a7 7 0 0 0 5 5.8 2.4 2.4 0 0 0-2.1-2z"/></svg>' 
    },
    { 
      id:'bhayanaka', name:'Bhayanaka', subtitle: 'Terror / Fear',
      glowColor: '#115e59', textColor: 'text-teal-500',
      plays:['Ratirasyam','Cheekati Rajyam','Bhoot'],
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-skull-icon lucide-skull"><path d="m12.5 17-.5-1-.5 1h1z"/><path d="M15 22a1 1 0 0 0 1-1v-1a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20v1a1 1 0 0 0 1 1z"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="12" r="1"/></svg>'
    },
    { 
      id:'bibhatsa', name:'Bibhatsa', subtitle: 'Disgust',
      glowColor: '#2563eb', textColor: 'text-blue-500',
      plays:['Arundhati','Deyyam','Tumbbad (Adaptation)'],
      icon: '<svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M9 10h.01"/><path d="M15 10h.01"/><circle cx="12" cy="12" r="10"/><path d="M12 2a8 8 0 0 0-.5 15.98"/><path d="M16 14c-1.5 1-4.5 1-4.5 1s-1.5 0-3.5-1"/></svg>' 
    },
    { 
      id:'adbhuta', name:'Adbhuta', subtitle: 'Wonder',
      glowColor: '#d97706', textColor: 'text-amber-500',
      plays:['Mayabazar','Aditya 369','Jagadeka Veerudu'],
      icon: '<svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.28 1.28L3 12l5.8 1.9a2 2 0 0 1 1.28 1.28L12 21l1.9-5.8a2 2 0 0 1 1.28-1.28L21 12l-5.8-1.9a2 2 0 0 1-1.28-1.28Z"/></svg>' 
    },
    { 
      id:'shanta', name:'Shanta', subtitle: 'Peace',
      glowColor: '#A5F3FC', textColor: 'text-cyan-200',
      plays:['Annamayya','Gautama Buddha','Ramadasu'],
      icon: '<svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' 
    }
];

// Data for Team
const GOVERNORS = [
    { name:"Poreddy Ashish Reddy", role:"The Showrunner", quote:"Yattitude izz altitude", funFact:"Can sleep with eyes open during lectures.", img:"Me .jpeg" },
    { name:"Vikas Arjun Pragada", role:"The Director", quote:"Cheppu bhai em cheddam bhaiiiii......", funFact:"Practices dialogues in the shower loudly.", img:"Bikash.jpeg" },
    { name:"Nistalavalli Sathvika", role:"The Playwright", quote:"Arey thappuraa...", funFact:"Eats more but not in mess", img:"Volli.jpeg" },
    { name:"Manish Rasamalla", role:"The Stage Master", quote:"Ni bondha ra Ni bondha....", funFact:"Farms aura in free time", img:"Monish .jpeg" }
];

// Data for Timeline
const TIMELINE = [
    { year:'2010', title:'The Genesis', desc:'Prasthanam begins its journey as a small group of Telugu drama enthusiasts.' },
    { year:'2013', title:'Official Recognition', desc:'Recognized by the Technology Students Gymkhana (TSG) as the official Telugu Dramatics Society.' },
    { year:'2016', title:'Aahana Pellanta', desc:'A landmark comedy production that set new standards for laughter on campus.' },
    { year:'2019', title:'Kill Rose', desc:'A thriller that showcased the versatility of the society beyond comedy.' },
    { year:'2025', title:'The Future', desc:'Taking the digital stage and continuing the legacy of Telugu theatre.' }
];

// Data for Captcha
const CAPTCHA_EMOJIS = [
    { char: '😂', name: 'Laughter' }, { char: '😡', name: 'Anger' },
    { char: '😭', name: 'Crying' }, { char: '😍', name: 'Love' },
    { char: '😱', name: 'Fear' }, { char: '🤢', name: 'Disgust' },
    { char: '😮', name: 'Surprise' }, { char: '😌', name: 'Peace' }
];

// Data for Challenge Feedback
const RASA_FEEDBACK = {
    "RAUDRA (Fury)": {
        low: [
            "My grandmother looks scarier when she's knitting.",
            "That's not 'Fury', that's just 'I forgot my wallet'.",
            "Are you angry or just trying to remember a math formula?"
        ],
        medium: ["Good intensity, but the eyes need more fire.", "Almost there! Channel your inner Bahubali."],
        high: ["Terrifying! I actually stepped back.", "Pure Rage. The audience is shaking!"]
    },
    "HASYA (Laughter)": {
        low: [
            "That laugh looks painful. Blink twice if you need help.",
            "My GPU fan mimics laughter better than that.",
            "You look like you just ate a sour lemon, not a joke."
        ],
        medium: ["A decent chuckle, but we need a belly laugh.", "Good smile, now add some sound to it!"],
        high: ["Hahahaha! Contagious energy!", "Perfect comedic timing in a still frame!"]
    },
    "KARUNA (Sorrow)": {
        low: [
            "I've seen happier onions.",
            "Are you sad or just sleepy? Wake up!",
            "Crocodile tears have more emotion than this."
        ],
        medium: ["The sadness is visible, but make it heartbreaking.", "Good, but let the shoulders drop more."],
        high: ["Heartbreaking. I need a tissue.", "The tragedy is palpable. Excellent."]
    },
    "BHAYANAKA (Terror)": {
        low: [
            "You look mildly inconvenienced, not terrified.",
            "Is the ghost boring? Because you look bored.",
            "That face says 'long line at mess', not 'monster'."
        ],
        medium: ["I see the fear, but widen those eyes!", "Good start, now freeze up more."],
        high: ["I got goosebumps! Spectacular fear.", "Pure terror. You sold it perfectly."]
    },
    "VEERA (Heroism)": {
        low: [
            "You look like you're waiting for a bus, not saving the world.",
            "Less 'Zero', more 'Hero' please.",
            "That pose says 'my back hurts', not 'I am a warrior'."
        ],
        medium: ["Strong chin up! You're getting there.", "Good posture, now believe in your power."],
        high: ["A true leader! The crowd follows you.", "Majestic! A true warrior's stance."]
    },
    "ADBHUTA (Wonder)": {
        low: [
            "Close your mouth, you'll catch flies.",
            "You look confused, like you lost your keys.",
            "That's not 'Wonder', that's just 'blank stare'."
        ],
        medium: ["Good expression, but brighten the eyes.", "Nice surprise, hold it longer."],
        high: ["Magical! You truly see the impossible.", "Stunning expression of awe."]
    },
    // Fallback for default
    "DEFAULT": {
        low: ["I've seen more expression on a potato.", "Don't quit your engineering degree yet.", "Refund my ticket money."],
        medium: ["Getting there, push the expression.", "Solid effort, but raise the stakes."],
        high: ["Oscar worthy performance!", "Absolutely stunning. Take a bow!"]
    }
};

/* =========================================================================
   2. INITIALIZATION & MAIN LOGIC
   ========================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Scroll Restoration ---
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // ✅ Skip Curtain if coming from Gallery
const urlParams = new URLSearchParams(window.location.search);
const skipCurtain = urlParams.get("skipCurtain");

if (skipCurtain === "1") {
  // Open curtains automatically
  setTimeout(() => {
    openCurtains();
  }, 100);

  // Remove the skipCurtain from URL (clean look)
  history.replaceState(null, "", window.location.pathname + window.location.hash);
}


    // --- References ---
    const page = document.getElementById('page');
    const curtainWrapper = document.getElementById('curtainWrapper');
    const leftCurtain = document.getElementById('leftCurtain');
    const rightCurtain = document.getElementById('rightCurtain');
    
    // --- Curtain Logic ---
    function openCurtains() {
        if(!leftCurtain || !rightCurtain) return;
        leftCurtain.classList.add('open');
        rightCurtain.classList.add('open');
        
        setTimeout(()=> {
            if (curtainWrapper) curtainWrapper.style.display = 'none';
        }, 1200);

        document.body.classList.remove("no-scroll");
        
        if(page) {
            page.classList.remove('opacity-0');
            page.classList.add('opacity-100');
        }
    }

    // Bind Curtain Triggers
    const leftPull = document.getElementById('leftPull');
    const rightPull = document.getElementById('rightPull');
    if(leftPull) {
        leftPull.addEventListener('click', openCurtains);
        leftPull.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openCurtains(); });
    }
    if(rightPull) {
        rightPull.addEventListener('click', openCurtains);
        rightPull.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openCurtains(); });
    

      }
    
    // Dev: Escape to open
    window.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') openCurtains();
    });

    
    // --- Custom Cursor Logic ---
    const curs = document.getElementById('curs');
    const spot = document.getElementById('spot');
    
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX, y = e.clientY;
        if (curs) { curs.style.left = x + 'px'; curs.style.top = y + 'px'; }
        if (spot) { spot.style.left = x + 'px'; spot.style.top = y + 'px'; }
    });

    window.addEventListener('blur', () => {
        if (spot) { spot.style.width = '0px'; spot.style.height = '0px'; }
    });
    window.addEventListener('focus', () => {
        if (spot) {
            const size = getComputedStyle(document.documentElement).getPropertyValue('--spotlight-size')?.trim() || '200px';
            spot.style.width = size; spot.style.height = size;
        }
    });

    // --- Movie Reel Timeline ---
    initMovieReel();

    // --- Navarasas Filter ---
    initNavarasas();

    // --- Team Grid ---
    initTeamGrid();

    // --- Emoji Captcha & Ticket Form ---
    initCaptchaSystem();

    // --- Navarasa Challenge (AI Camera) ---
    initNavarasaChallenge();

    // Voice thingy ------------------
    initVoiceMicTest();

});

/* =========================================================================
   3. MODULE FUNCTIONS
   ========================================================================= */

/* --- A. MOVIE REEL --- */
function initMovieReel() {
    const track = document.getElementById('track');
    const container = document.getElementById('reelContainer');
    const modal = document.getElementById('modal');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    if(!track || !container) return;

    // Create Frames
    TIMELINE.forEach((item, i) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'frame-wrapper';
        
        // Sine wave math
        const frequency = 0.6;
        const amplitude = 80; 
        const yOffset = Math.sin(i * frequency) * amplitude;
        const rotation = Math.cos(i * frequency) * 15;
        wrapper.style.transform = `translateY(${yOffset}px) rotate(${rotation}deg)`;

        wrapper.innerHTML = `
            <div class="frame-inner">
                <div class="frame-content">
                    <div class="year">${item.year}</div>
                    <div class="title">${item.title}</div>
                </div>
            </div>`;
            
        wrapper.addEventListener('click', () => {
            const mYear = document.getElementById('mYear');
            const mTitle = document.getElementById('mTitle');
            const mDesc = document.getElementById('mDesc');
            const mId = document.getElementById('mId');

            if(mYear) mYear.innerText = item.year;
            if(mTitle) mTitle.innerText = item.title;
            if(mDesc) mDesc.innerText = item.desc;
            if(mId) mId.innerText = (i+1).toString().padStart(3,'0');
            
            if(modal) {
                modal.classList.add('active');
                modal.setAttribute('aria-hidden','false');
            }
        });
        track.appendChild(wrapper);
    });

    // Navigation Logic
    const frameWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--frame-width')) || 260;
    const gap = 60;
    const itemFullWidth = frameWidth + gap;

    if(nextBtn) nextBtn.addEventListener('click', () => container.scrollBy({ left: itemFullWidth, behavior: 'smooth' }));
    if(prevBtn) prevBtn.addEventListener('click', () => container.scrollBy({ left: -itemFullWidth, behavior: 'smooth' }));

    // Drag to scroll
    let isDown = false, startX, scrollLeftPos;
    container.addEventListener('mousedown', (e) => {
        isDown = true; container.classList.add('active'); startX = e.pageX - container.offsetLeft; scrollLeftPos = container.scrollLeft;
    });
    container.addEventListener('mouseleave', () => { isDown = false; container.classList.remove('active'); });
    container.addEventListener('mouseup', () => { isDown = false; container.classList.remove('active'); });
    container.addEventListener('mousemove', (e) => {
        if(!isDown) return; e.preventDefault();
        const x = e.pageX - container.offsetLeft; const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeftPos - walk;
    });

    // Close Modal Logic
    const modalClose = document.getElementById('modalClose');
    if(modalClose) modalClose.addEventListener('click', () => {
        modal.classList.remove('active'); modal.setAttribute('aria-hidden','true');
    });
    if(modal) modal.addEventListener('click', (e) => { 
        if(e.target === modal) { modal.classList.remove('active'); modal.setAttribute('aria-hidden','true'); } 
    });
}

/* --- B. NAVARASAS --- */
function initNavarasas() {
    const navarasaSection = document.getElementById('navarasas');
    const rasaDisplay = document.getElementById('rasaDisplay');
    const playsList = document.getElementById('playsList');
    const filterButtons = document.getElementById('filterButtons');

    if(!navarasaSection || !rasaDisplay) return;

    function setActiveRasa(r) {
        // Spotlight Effect
        navarasaSection.style.background = `radial-gradient(circle at center, ${r.glowColor}50 0%, #000000 80%)`;

        // Content
        rasaDisplay.innerHTML = `
            <div class="transform transition-all duration-700 hover:scale-110">
                <div class="text-9xl ${r.textColor} opacity-100 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    ${r.icon}
                </div>
            </div>
            <div class="border-t-2 border-${r.textColor.split('-')[1]}-500 w-24 my-6 opacity-50"></div>
            <h3 class="text-6xl font-cinzel text-white drop-shadow-lg">${r.name}</h3>
            <p class="text-xl font-sans italic text-gray-300 tracking-widest uppercase opacity-80">
                ${r.subtitle}
            </p>
        `;

        // Plays List
        if(playsList) {
            playsList.innerHTML = '';
            r.plays.forEach(p => {
                const li = document.createElement('li');
                li.className = 'flex items-center text-lg text-gray-200 border-b border-white/5 pb-2 last:border-0';
                li.innerHTML = `<span class="${r.textColor} mr-3 text-sm">●</span> ${p}`;
                playsList.appendChild(li);
            });
        }

        // Update Buttons
        if(filterButtons) {
            filterButtons.innerHTML = '';
            NAVARASAS.forEach(btnRasa => {
                const btn = document.createElement('button');
                const isActive = btnRasa.id === r.id;
                let cls = "px-6 py-2 rounded-full text-sm font-cinzel tracking-wider transition-all duration-300 border backdrop-blur-sm ";
                
                if(isActive) {
                    cls += `text-white border-transparent scale-105 font-bold`;
                    btn.style.backgroundColor = btnRasa.glowColor;
                    btn.style.boxShadow = `0 0 20px ${btnRasa.glowColor}`;
                } else {
                    cls += "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/30";
                }
                btn.className = cls;
                btn.innerText = btnRasa.name.toUpperCase();
                btn.addEventListener('click', () => setActiveRasa(btnRasa));
                filterButtons.appendChild(btn);
            });
        }
    }

    // Init first one
    if(NAVARASAS.length > 0) setActiveRasa(NAVARASAS[0]);
}

/* --- C. TEAM GRID --- */
function initTeamGrid() {
    const teamGrid = document.getElementById('teamGrid');
    if(!teamGrid) return;
    
    GOVERNORS.forEach(g => {
        const card = document.createElement('div');
        card.className = 'group relative card-3d h-[400px] cursor-pointer';
        card.innerHTML = `
          <div class="relative w-full h-full card-inner preserve-3d">
            <div class="card-front absolute inset-0 backface-hidden bg-[#111] border border-[#333] overflow-hidden rounded-lg">
              <div class="h-3/4 overflow-hidden">
                <img src="${g.img}" alt="${g.name}" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              </div>
              <div class="h-1/4 p-4 flex flex-col justify-center items-center bg-[#1a1a1a]">
                <h3 class="text-xl font-cinzel font-bold text-[#FFD700]">${g.name}</h3>
                <p class="text-xs uppercase tracking-widest text-gray-400">${g.role}</p>
              </div>
            </div>
            <div class="card-back absolute inset-0 backface-hidden rotate-y-180 bg-[#4a0404] rounded-lg p-6 flex flex-col justify-center items-center text-center border-2 border-[#FFD700]">
              <div class="text-5xl mb-4">🎭</div>
              <h3 class="text-xl font-bold text-white mb-2">${g.name}</h3>
              <p class="text-[#FFD700] italic mb-6">"${g.quote}"</p>
              <div class="bg-black/30 p-4 rounded text-sm text-gray-200">
                <span class="block text-[#FFD700] font-bold text-xs uppercase mb-1">Fun Fact:</span>
                ${g.funFact}
              </div>
            </div>
          </div>
        `;
        teamGrid.appendChild(card);
    });
}

/* --- D. CAPTCHA & TICKETS --- */
function initCaptchaSystem() {
    let captchaVerified = false;
    let currentTarget = null;
    
    function initCaptcha() {
        const grid = document.getElementById('captchaGrid');
        const instruction = document.getElementById('captchaInstruction');
        const btn = document.getElementById('confirmBtn');

        if(!grid || !instruction) return;
        
        if(btn) btn.disabled = true;
        grid.innerHTML = '';
        captchaVerified = false;
        
        currentTarget = CAPTCHA_EMOJIS[Math.floor(Math.random() * CAPTCHA_EMOJIS.length)];
        instruction.innerHTML = `Verify you are human: Select the <span style="color:#FFD700; text-decoration:underline;">${currentTarget.name}</span> emoji`;
        
        // Randomize Options
        let options = [currentTarget];
        const distractors = CAPTCHA_EMOJIS.filter(e => e.name !== currentTarget.name)
                                        .sort(() => 0.5 - Math.random())
                                        .slice(0, 3);
        options = options.concat(distractors).sort(() => 0.5 - Math.random());
        
        options.forEach(opt => {
            const span = document.createElement('span');
            span.className = 'captcha-item';
            span.textContent = opt.char;
            span.onclick = () => {
                const items = document.querySelectorAll('.captcha-item');
                items.forEach(i => i.classList.remove('selected'));
                
                if (opt.name === currentTarget.name) {
                    span.classList.add('selected');
                    captchaVerified = true;
                    instruction.innerHTML = '✅ Verified! You have feelings.';
                    instruction.style.color = '#15803d';
                    if(btn) btn.disabled = false;
                } else {
                    span.classList.add('wrong');
                    instruction.innerText = '❌ WRONG! Emotion not detected.';
                    instruction.style.color = '#dc2626';
                    setTimeout(() => { span.classList.remove('wrong'); setTimeout(initCaptcha, 500); }, 500);
                }
            };
            grid.appendChild(span);
        });
    }

    initCaptcha();

    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            const name = (document.getElementById('nameInput')||{}).value?.trim();
            const email = (document.getElementById('emailInput')||{}).value?.trim();
            if(!captchaVerified) { alert('Please complete the security check!'); return; }
            if(!name || !email) { alert('Please enter your name and email.'); return; }
            
            alert('Thanks ' + name + '! Your booking request for ' + email + ' is received.');
            const form = document.getElementById('ticketForm');
            if (form) { form.reset(); initCaptcha(); }
        });
    }
}

/* --- E. NAVARASA CHALLENGE (FIXED) --- */
function initNavarasaChallenge() {
    // References
    const startCamBtn = document.getElementById('startCamBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const captureBtn = document.getElementById('captureBtn');
    const retryBtn = document.getElementById('retryBtn');
    
    const challengeStartDiv = document.getElementById('challengeStart');
    const challengeInterface = document.getElementById('challengeInterface');
    const cameraView = document.getElementById('cameraView');
    const resultView = document.getElementById('resultView');
    const videoEl = document.getElementById('webcamVideo');
    const targetEmotionTag = document.getElementById('targetEmotionTag');
    const scannerOverlay = document.getElementById('scannerOverlay');
    const scanText = document.getElementById('scanText');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const commentDisplay = document.getElementById('commentDisplay');

    // Variables
    const EMOTIONS_LIST = ["RAUDRA (Fury)", "HASYA (Laughter)", "KARUNA (Sorrow)", "BHAYANAKA (Terror)", "VEERA (Heroism)", "ADBHUTA (Wonder)"];
    let streamReference = null;
    let currentEmotion = "";
    let scanInterval = null; // [FIX 1: Interval Variable]

    /* 1. Open Camera */
    async function openCamera() {
        try {
            // [FIX 2: Mobile Mirror Support - prefer user facing camera]
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user" } 
            });
            
            videoEl.srcObject = stream;
            streamReference = stream;
            
            currentEmotion = EMOTIONS_LIST[Math.floor(Math.random() * EMOTIONS_LIST.length)];
            if(targetEmotionTag) targetEmotionTag.innerText = `ACT NOW: ${currentEmotion}`;
            
            challengeStartDiv.classList.add('hidden');
            challengeInterface.classList.remove('hidden');
            cameraView.classList.remove('hidden');
            resultView.classList.add('hidden');
        } catch (err) {
            alert("Camera access denied. Please allow permissions.");
            console.error(err);
        }
    }

    /* 2. Stop Camera (Helper) */
    function releaseCamera() {
        if (streamReference) {
            streamReference.getTracks().forEach(track => track.stop());
            videoEl.srcObject = null;
            streamReference = null;
        }
    }

    /* 3. Stop Challenge (Cancel) */
    function stopChallenge() {
        // [FIX 3: Clear Interval on Cancel]
        if(scanInterval) {
            clearInterval(scanInterval);
            scanInterval = null;
        }
        
        releaseCamera();
        challengeInterface.classList.add('hidden');
        challengeStartDiv.classList.remove('hidden');
        
        // Reset Scanner UI
        scannerOverlay.classList.add('hidden');
        captureBtn.disabled = false;
        captureBtn.innerText = "Judge Me";
    }

    /* 4. Analyze (Scan) */
    function analyzePhoto() {
        scannerOverlay.classList.remove('hidden');
        captureBtn.disabled = true;
        captureBtn.innerText = "Scanning...";

        let step = 0;
        const steps = [
            { text: "Analyzing Eyes...", showIds: ['boxEyeL', 'boxEyeR'] },
            { text: "Measuring Lip Curvature...", showIds: ['boxMouth'] },
            { text: "Calculating Drama Index...", showIds: [] }
        ];

        // [FIX 1: Assign to variable]
        scanInterval = setInterval(() => {
            if(step < steps.length) {
                scanText.innerText = steps[step].text;
                ['boxEyeL', 'boxEyeR', 'boxMouth'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) el.classList.add('hidden');
                });
                steps[step].showIds.forEach(id => {
                    const el = document.getElementById(id);
                    if(el) el.classList.remove('hidden');
                });
                step++;
            } else {
                clearInterval(scanInterval);
                finishAnalysis();
            }
        }, 800);
    }

    /* 5. Show Results */
    function finishAnalysis() {
        scannerOverlay.classList.add('hidden');
        captureBtn.disabled = false;
        captureBtn.innerText = "Judge Me";
        
        releaseCamera(); // Stop battery drain
        
        const score = Math.floor(Math.random() * 71) + 30;
        
        let category = score > 85 ? 'high' : (score > 60 ? 'medium' : 'low');
        const db = RASA_FEEDBACK[currentEmotion] || RASA_FEEDBACK["DEFAULT"];
        const comments = db[category] || db['medium'];
        const finalComment = comments[Math.floor(Math.random() * comments.length)];

        cameraView.classList.add('hidden');
        resultView.classList.remove('hidden');
        
        scoreDisplay.innerText = `${score}/100`;
        commentDisplay.innerText = `"${finalComment}"`;
        // [FIX 4: Use color directly, not class if class is empty]
        scoreDisplay.style.color = score > 80 ? '#22c55e' : '#FFD700'; 
        // We also rely on CSS 'currentColor' for the glow now
    }

    // Listeners
    if(startCamBtn) startCamBtn.addEventListener('click', openCamera);
    if(cancelBtn) cancelBtn.addEventListener('click', stopChallenge);
    if(captureBtn) captureBtn.addEventListener('click', analyzePhoto);
    if(retryBtn) retryBtn.addEventListener('click', openCamera);
}
/* =========================
   SHOWTIME FEATURE
========================= */

const showtimeBtn = document.getElementById("showtimeBtn");
const fxLayer = document.getElementById("fxLayer");
const fxCanvas = document.getElementById("fxCanvas");

if (fxCanvas) {
  fxCanvas.width = window.innerWidth;
  fxCanvas.height = window.innerHeight;
}

const ctx = fxCanvas ? fxCanvas.getContext("2d") : null;

let particles = [];
let running = false;

function createParticlesFromImage(imgData) {
  particles = [];
  const step = 6; // smaller = more particles

  for (let y = 0; y < imgData.height; y += step) {
    for (let x = 0; x < imgData.width; x += step) {
      const index = (y * imgData.width + x) * 4;
      const r = imgData.data[index];
      const g = imgData.data[index + 1];
      const b = imgData.data[index + 2];
      const a = imgData.data[index + 3];

      if (a > 50 && (r + g + b) > 80) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          tx: window.innerWidth / 2,
          ty: window.innerHeight / 2,
          r, g, b, a,
          size: 2
        });
      }
    }
  }
}

function renderParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

  for (const p of particles) {
    ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a / 255})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function animateParticlesToCenter(speed = 0.01) {
  for (const p of particles) {
    p.vx += (p.tx - p.x) * speed;
    p.vy += (p.ty - p.y) * speed;

    p.vx *= 0.85;
    p.vy *= 0.85;

    p.x += p.vx;
    p.y += p.vy;
  }
}

function swirlParticles(strength = 0.35) {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;

  for (const p of particles) {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001;

    // Rotation force
    p.vx += (-dy / dist) * strength;
    p.vy += (dx / dist) * strength;

    p.x += p.vx;
    p.y += p.vy;
  }
}

function loop() {
  if (!running) return;

  swirlParticles(0.42);
  animateParticlesToCenter(0.006);
  renderParticles();

  requestAnimationFrame(loop);
}

function kaboomFlash() {
  if (!ctx) return;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);
}

function showStageSequence() {
  const stageOverlay = document.getElementById("stageOverlay");
  const stageImg = document.getElementById("stageImg");
  const logoDrop = document.getElementById("logoDrop");
  const curtainLeft = document.getElementById("curtainLeft");
  const curtainRight = document.getElementById("curtainRight");
  const finalText = document.getElementById("finalText");
  const backBtn = document.getElementById("backToDramaBtn");


  if (!stageOverlay) return;

  stageOverlay.classList.add("active");
  gsap.set(stageImg, { opacity: 0 });
  gsap.set(logoDrop, { opacity: 0, top: "-350px", left: "50%", xPercent: -50 });
  gsap.set(curtainLeft, { left: "-50%" });
  gsap.set(curtainRight, { right: "-50%" });
  gsap.set(finalText, { opacity: 0 });

  const tl = gsap.timeline();

  tl.to(stageImg, { opacity: 1, duration: 0.5 });

  tl.to(logoDrop, { opacity: 1, duration: 0.2 }, "<");
  tl.to(logoDrop, {
    top: "55%",
    duration: 1,
    ease: "bounce.out",
    left: "50%",
  xPercent: -50,
  x: window.innerWidth * 0.05

  });

  tl.to(curtainLeft, { left: "0%", duration: 1, ease: "power2.inOut" }, "+=0.6");
  tl.to(curtainRight, { right: "0%", duration: 1, ease: "power2.inOut" }, "<");

  tl.to(finalText, { opacity: 1, duration: 1 }, "+=0.5");
  tl.to(backBtn, { opacity: 1, duration: 0.8 }, "<");

}

async function startShowtime() {
  const page = document.getElementById("pageContent");
  if (!page || !fxLayer || !ctx) return;

  showtimeBtn.disabled = true;

  // 1) Auto-scroll to target
  gsap.to(window, {
    duration: 2,
    scrollTo: "#contact",

    ease: "power2.inOut",
    onComplete: async () => {

      // 2) Screenshot the page content
      const canvasShot = await html2canvas(page, { backgroundColor: "#000" });

      // 3) Show FX layer and draw image to canvas
      fxLayer.classList.add("active");
      ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      ctx.drawImage(canvasShot, 0, 0, window.innerWidth, window.innerHeight);

      // 4) Convert screenshot into particles
      const shotData = ctx.getImageData(0, 0, window.innerWidth, window.innerHeight);
      createParticlesFromImage(shotData);

      // 5) Hide original page
      page.style.opacity = "0";

      // 6) Start particle motion
      running = true;
      loop();

      // 7) After 3 sec, BOOM + stage
      setTimeout(() => {
        running = false;

        kaboomFlash();

        setTimeout(() => {
          fxLayer.classList.remove("active");
          showStageSequence();
        }, 200);

      }, 3000);
    }
  });
}

if (showtimeBtn) {
  showtimeBtn.addEventListener("click", startShowtime);
}
console.log("✅ script.js loaded");

document.getElementById("showtimeBtn").addEventListener("click", () => {
  console.log("🔥 Showtime clicked");
});
document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backToDramaBtn");

  if (!backBtn) return;

  backBtn.addEventListener("click", () => {
    console.log("✅ Back to Drama clicked");

    const stageOverlay = document.getElementById("stageOverlay");
    const curtainLeft = document.getElementById("curtainLeft");
    const curtainRight = document.getElementById("curtainRight");
    const finalText = document.getElementById("finalText");
    const page = document.getElementById("pageContent");

    // Fade out text + button
    gsap.to(finalText, { opacity: 0, duration: 0.3 });
    gsap.to(backBtn, { opacity: 0, duration: 0.3 });

    // Open curtains again
    gsap.to(curtainLeft, { left: "-50%", duration: 1, ease: "power2.inOut" });
    gsap.to(curtainRight, { right: "-50%", duration: 1, ease: "power2.inOut" });

    setTimeout(() => {
      stageOverlay.classList.remove("active");

      // Bring back original site
      if (page) page.style.opacity = "1";

      // Enable showtime again
      const showtimeBtn = document.getElementById("showtimeBtn");
      if (showtimeBtn) showtimeBtn.disabled = false;

    }, 1000);
  });
});

/* =========================
   🎤 VOICE TESTING MIC
========================= */
function initVoiceMicTest() {
  const startBtn = document.getElementById("voiceStartBtn");
  const stopBtn = document.getElementById("voiceStopBtn");
  const meterBar = document.getElementById("voiceMeterBar");
  const dbValue = document.getElementById("voiceDbValue");
  const resultBox = document.getElementById("voiceResult");
  const micCircle = document.getElementById("micCircle");

  if (!startBtn || !stopBtn || !meterBar || !dbValue || !resultBox) return;

  let audioContext;
  let analyser;
  let microphone;
  let dataArray;
  let streamRef;
  let animationId;

 function setResult(text, type = "neutral") {
  resultBox.style.display = "block";
  resultBox.innerText = text;

  // Reset styles
  resultBox.style.background = "rgba(0,0,0,0.35)";
  resultBox.style.border = "1px solid rgba(255,255,255,0.12)";
  resultBox.style.color = "rgba(255,255,255,0.92)";
  resultBox.style.boxShadow = "none";

  if (type === "good") {
    resultBox.style.background = "rgba(34,197,94,0.12)";
    resultBox.style.border = "1px solid rgba(34,197,94,0.65)";
    resultBox.style.boxShadow = "0 0 18px rgba(34,197,94,0.45)";
    resultBox.style.color = "#bbf7d0";
  }

  if (type === "bad") {
    resultBox.style.background = "rgba(239,68,68,0.12)";
    resultBox.style.border = "1px solid rgba(239,68,68,0.65)";
    resultBox.style.boxShadow = "0 0 18px rgba(239,68,68,0.45)";
    resultBox.style.color = "#fecaca";
  }
}


  function stopMic() {
    if (animationId) cancelAnimationFrame(animationId);

    if (streamRef) {
      streamRef.getTracks().forEach(track => track.stop());
      streamRef = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }

    meterBar.style.width = "0%";
    dbValue.innerText = "0";
    micCircle.style.transform = "scale(1)";

    startBtn.disabled = false;
    stopBtn.disabled = true;

    setResult("Test stopped. Click Start again 🎤");
  }

  async function startMic() {
    try {
      startBtn.disabled = true;
      stopBtn.disabled = false;

      resultBox.innerText = "";
resultBox.style.display = "none";


      streamRef = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;

      microphone = audioContext.createMediaStreamSource(streamRef);
      microphone.connect(analyser);

      dataArray = new Uint8Array(analyser.fftSize);

      let peak = 0;

      function update() {
        analyser.getByteTimeDomainData(dataArray);

        // RMS calculation (volume strength)
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = (dataArray[i] - 128) / 128;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        // ✅ Convert RMS → fake dB scale (more realistic)
let db = 20 * Math.log10(rms);
if (!isFinite(db)) db = -100;

// ✅ Map (-60 dB .. -5 dB) into (0 .. 100)
let loudness = Math.round(((db + 60) / 55) * 100);
loudness = Math.max(0, Math.min(100, loudness));


        dbValue.innerText = loudness.toString();
        meterBar.style.width = `${loudness}%`;

        // mic bounce effect
        micCircle.style.transform = `scale(${1 + loudness / 300})`;

        // Decide message based on peak > 80
       // ✅ LIVE comment while speaking
if (loudness >= 80) {
  setResult("✅ Peace ra!", "good");
} else if (loudness > 5) {
  setResult("❌ Gattiga, vinapadelaaa!!!!!", "bad");
}



        animationId = requestAnimationFrame(update);
      }

      update();
    } catch (err) {
      console.error(err);
      startBtn.disabled = false;
      stopBtn.disabled = true;
      alert("Mic permission denied. Allow microphone access to use this feature.");
    }
  }

  startBtn.addEventListener("click", startMic);
  stopBtn.addEventListener("click", stopMic);
 

}
