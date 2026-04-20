import { useState, useEffect, useRef } from "react";
import { ref, onValue, set as firebaseSet } from "firebase/database";
import { Analytics } from "@vercel/analytics/react";
import { db } from "./firebase"; 

const ADMIN_PASSWORD = "boss2024";
const DEFAULT_PLAYERS =[
  { id: 1, name: "Aidan", money: 10.00 },
  { id: 2, name: "Maga", money: 8.00 },
  { id: 3, name: "Seyha", money: 5.05 },
];
const DEFAULT_BARS =[
  { id: 1, title: "Target Goal", current: 0, target: 33 }
];

function getRankEmoji(rank) {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "💩";
}

function getRankLabel(rank) {
  if (rank === 1) return "KING";
  if (rank === 2) return "RUNNER UP";
  if (rank === 3) return "BRONZE";
  return "BROKE";
}

export default function App() {
  const [players, setPlayers] = useState([]);
  const [progressBars, setProgressBars] = useState([]);
  const [imageSettings, setImageSettings] = useState({ url: "", width: 100 });
  const [siteTitle, setSiteTitle] = useState("john pork123");
  const [moneyUsed, setMoneyUsed] = useState(0);
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showPodium, setShowPodium] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [newName, setNewName] = useState("");
  const [adjustAmounts, setAdjustAmounts] = useState({});
  
  const [newBarTitle, setNewBarTitle] = useState("");
  const [newBarTarget, setNewBarTarget] = useState(33);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageWidth, setNewImageWidth] = useState(100);

  const [newTitleInput, setNewTitleInput] = useState("");
  const [usedAmountInput, setUsedAmountInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  const [pigs, setPigs] = useState([]);

  // Load LIVE from Firebase
  useEffect(() => {
    const playersRef = ref(db, 'players');
    const barsRef = ref(db, 'progressBars');
    const imageRef = ref(db, 'imageSettings');
    const titleRef = ref(db, 'siteTitle');
    const usedRef = ref(db, 'moneyUsed');

    const unsubPlayers = onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) setPlayers(snapshot.val());
      else {
        firebaseSet(playersRef, DEFAULT_PLAYERS);
        setPlayers(DEFAULT_PLAYERS);
      }
    });

    const unsubBars = onValue(barsRef, (snapshot) => {
      if (snapshot.exists()) setProgressBars(snapshot.val());
      else {
        firebaseSet(barsRef, DEFAULT_BARS);
        setProgressBars(DEFAULT_BARS);
      }
    });

    const unsubImage = onValue(imageRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setImageSettings(data);
        setNewImageUrl(data.url);
        setNewImageWidth(data.width);
      }
    });

    const unsubTitle = onValue(titleRef, (snapshot) => {
      if (snapshot.exists()) {
        setSiteTitle(snapshot.val());
        setNewTitleInput(snapshot.val());
        document.title = snapshot.val(); // Update browser tab
      } else {
        firebaseSet(titleRef, "john pork123");
      }
    });

    const unsubUsed = onValue(usedRef, (snapshot) => {
      if (snapshot.exists()) setMoneyUsed(snapshot.val());
      else firebaseSet(usedRef, 0);
      setLoaded(true);
    });

    return () => { unsubPlayers(); unsubBars(); unsubImage(); unsubTitle(); unsubUsed(); };
  }, []);

  // Confetti & Sound Timer Logic for Podium
  useEffect(() => {
    let timer;
    let drumAudio;
    let winAudio;
    let chimeAudio;

    if (showPodium) {
      // Play drumroll/buildup sound immediately when podium is shown
      drumAudio = new Audio("https://www.myinstants.com/media/sounds/drumroll.mp3");
      drumAudio.volume = 0.7;
      drumAudio.play().catch(e => console.log("Audio play blocked by browser:", e));

      // Trigger confetti and celebration sound shortly after the 1st place block finishes animating
      timer = setTimeout(() => {
        setShowConfetti(true);
        
        // Stop drum roll when the winner pops up
        if (drumAudio) {
          drumAudio.pause();
          drumAudio.currentTime = 0;
        }

        // Play win celebration sounds (Applause + Chime)
        winAudio = new Audio("https://www.myinstants.com/media/sounds/applause.mp3");
        winAudio.volume = 0.8;
        winAudio.play().catch(e => console.log("Audio play blocked by browser:", e));

        chimeAudio = new Audio("https://www.myinstants.com/media/sounds/magic-chime.mp3");
        chimeAudio.volume = 0.6;
        chimeAudio.play().catch(e => console.log("Audio play blocked by browser:", e));
      }, 3300);
    } else {
      setShowConfetti(false);
    }
    
    // Cleanup audios when closing podium or unmounting
    return () => {
      clearTimeout(timer);
      if (drumAudio) {
        drumAudio.pause();
        drumAudio.currentTime = 0;
      }
      if (winAudio) {
        winAudio.pause();
        winAudio.currentTime = 0;
      }
      if (chimeAudio) {
        chimeAudio.pause();
        chimeAudio.currentTime = 0;
      }
    };
  }, [showPodium]);

  const sorted = [...players].sort((a, b) => b.money - a.money);

  // Podium Logic
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];
  const honorableMentions = sorted.slice(3);

  // Calculations
  const grossTotal = players.reduce((s, p) => s + p.money, 0); 
  const netTotal = grossTotal - moneyUsed;

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2200);
  }

  function handleLogin() {
    if (pwInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setPwInput("");
      setPwError(false);
      showToast("👑 Admin mode unlocked");
    } else {
      setPwError(true);
      setTimeout(() => setPwError(false), 600);
    }
  }

  function handleBackgroundClick(e) {
    const isInteractive = e.target.closest('.card') || 
                          e.target.closest('.prog-card') || 
                          e.target.closest('.add-section') ||
                          e.target.closest('.modal') || 
                          e.target.closest('.btn') || 
                          e.target.closest('.theme-btn') || 
                          e.target.tagName.toLowerCase() === 'button' || 
                          e.target.tagName.toLowerCase() === 'input';

    if (isInteractive) return;
    const newPig = { id: Date.now(), x: e.clientX, y: e.clientY };
    setPigs(prev => [...prev, newPig]);
    setTimeout(() => { setPigs(prev => prev.filter(p => p.id !== newPig.id)); }, 1000);
  }

  // --- ADMIN SETTINGS CONTROLS ---
  function saveTitle() {
    if (!newTitleInput.trim()) return;
    firebaseSet(ref(db, 'siteTitle'), newTitleInput.trim());
    showToast("📝 Title Updated");
  }

  function adjustMoneyUsed(sign) {
    const val = parseFloat(usedAmountInput);
    if (isNaN(val) || val <= 0) return;
    const newTotalUsed = Math.max(0, moneyUsed + (sign * val));
    firebaseSet(ref(db, 'moneyUsed'), parseFloat(newTotalUsed.toFixed(2)));
    setUsedAmountInput("");
    showToast(`${sign > 0 ? "+" : "-"}$${val.toFixed(2)} Money Used`);
  }

  // --- PLAYER CONTROLS ---
  function adjustMoney(id, delta) {
    const newPlayers = players.map(p => 
      p.id === id ? { ...p, money: Math.max(0, parseFloat((p.money + delta).toFixed(2))) } : p
    );
    firebaseSet(ref(db, 'players'), newPlayers);
  }

  function applyCustom(id, sign) {
    const val = parseFloat(adjustAmounts[id]);
    if (isNaN(val) || val <= 0) return;
    adjustMoney(id, sign * val);
    setAdjustAmounts(prev => ({ ...prev, [id]: "" }));
    showToast(`${sign > 0 ? "+" : "-"}$${val.toFixed(2)} applied`);
  }

  function addPlayer() {
    const name = newName.trim();
    if (!name) return;
    const newPlayers =[...players, { id: Date.now(), name, money: 0 }];
    firebaseSet(ref(db, 'players'), newPlayers);
    setNewName("");
    showToast(`✅ ${name} added`);
  }

  function removePlayer(id) {
    const newPlayers = players.filter(x => x.id !== id);
    firebaseSet(ref(db, 'players'), newPlayers);
  }

  // --- PROGRESS BAR CONTROLS ---
  function addBar() {
    const title = newBarTitle.trim();
    const target = parseFloat(newBarTarget);
    if (!title || isNaN(target) || target <= 0) return;
    const newBars =[...progressBars, { id: Date.now(), title, current: 0, target }];
    firebaseSet(ref(db, 'progressBars'), newBars);
    setNewBarTitle("");
    setNewBarTarget(33);
    showToast(`📊 Bar added`);
  }

  function removeBar(id) {
    const newBars = progressBars.filter(x => x.id !== id);
    firebaseSet(ref(db, 'progressBars'), newBars);
  }

  // --- IMAGE CONTROLS ---
  function saveImage() {
    if (!newImageUrl.trim()) return;
    firebaseSet(ref(db, 'imageSettings'), { url: newImageUrl.trim(), width: parseInt(newImageWidth) });
    showToast("🖼️ Image saved!");
  }

  function removeImage() {
    firebaseSet(ref(db, 'imageSettings'), { url: "", width: 100 });
    setNewImageUrl("");
    showToast("🗑️ Image removed");
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    .theme-dark {
      --bg: #080a0f; --text: #e8eaf0;
      --text-dim: #5a6070; 
      --card-bg: rgba(255,255,255,0.035); --card-border: rgba(255,255,255,0.07);
      --input-bg: rgba(255,255,255,0.06); --orb-opacity: 0.18; --gold: #c9a84c; --gold-bg: rgba(201,168,76,0.05);
      --red-bg: rgba(220,60,60,0.08); --red-text: #e05050;
      --podium-grad-inner: #151823;
      --podium-grad-outer: #000000;
    }
    .theme-light {
      --bg: #f4f6fa; --text: #0f172a; --text-dim: #64748b;
      --card-bg: #ffffff; --card-border: #e2e8f0;
      --input-bg: #f1f5f9; --orb-opacity: 0.25; --gold: #d97706; --gold-bg: #fef3c7;
      --red-bg: #fee2e2; --red-text: #dc2626;
      --podium-grad-inner: #ffffff; --podium-grad-outer: #aeb9cc;
    }

    body { background: var(--bg); transition: background 0.3s ease; font-family: 'DM Sans', sans-serif; }
    
    .app-container { min-height: 100vh; background: var(--bg); color: var(--text); overflow-x: hidden; position: relative;
    transition: all 0.3s ease; padding-bottom: 80px; }
    
    .bg-orbs { position: absolute; inset: 0;
    z-index: 0; overflow: hidden; pointer-events: none; }
    .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: var(--orb-opacity);
    transition: opacity 0.3s; animation: drift 12s ease-in-out infinite alternate; }
    .orb1 { width: 500px; height: 500px;
    background: var(--gold); top: -150px; left: -100px; }
    .orb2 { width: 400px; height: 400px; background: #1a4fc4; bottom: -100px;
    right: -80px; animation-delay: -4s; }
    @keyframes drift { from { transform: translate(0, 0) scale(1);
    } to { transform: translate(30px, 20px) scale(1.08); } }
    
    .wrapper { position: relative;
    z-index: 1; max-width: 640px; margin: 0 auto; padding: 40px 20px; animation: fadeIn 0.4s ease;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0);
    } }

    .top-nav { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 20px;
    }
    .theme-btn { background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text); padding: 8px 16px; border-radius: 20px;
    cursor: pointer; font-size: 14px; font-weight: 600; transition: 0.2s; display: flex; align-items: center; gap: 6px;
    }
    .theme-btn:hover { transform: scale(1.05); background: var(--input-bg); }
    .btn-podium { background: linear-gradient(135deg, var(--gold), #f5d078);
    color: #000; border: none; font-weight: 800; animation: pulse-podium 2s infinite; }
    .btn-podium:hover { animation: none; transform: scale(1.08);
    }
    
    @keyframes pulse-podium {
       0% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0.5);
       }
       70% { box-shadow: 0 0 0 12px rgba(201, 168, 76, 0);
       }
       100% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0);
       }
    }

    .header { text-align: center; margin-bottom: 30px; pointer-events: none;
    }
    .header h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 10vw, 72px); letter-spacing: 3px;
    background: linear-gradient(135deg, #f5d078 0%, var(--gold) 50%, #f5d078 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1;
    }
    
    .theme-light .card, .theme-light .prog-card, .theme-light .total-row, .theme-light .add-section {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }

    .stats-container { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;
    }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border: 1px solid var(--card-border);
    border-radius: 12px; transition: transform 0.2s; }
    .total-row:hover { transform: scale(1.02);
    }
    .total-label { font-size: 13px; letter-spacing: 1.5px; color: var(--text-dim); text-transform: uppercase; font-weight: bold;
    }
    .total-val { font-family: 'Bebas Neue', sans-serif; font-size: 28px; transition: color 0.3s;
    }
    
    .row-pot { background: var(--gold-bg); border-color: var(--gold);
    }
    .row-pot .total-val { color: var(--gold); }
    
    .row-used { background: var(--red-bg);
    }
    .row-used .total-val { color: var(--red-text); }

    .progress-list { display: flex; flex-direction: column;
    gap: 16px; margin-bottom: 30px; }
    .prog-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px;
    padding: 18px 20px; }
    .prog-header { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 12px;
    }
    .prog-track { background: var(--input-bg); height: 16px; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .prog-fill { background: linear-gradient(90deg, var(--gold), #f5d078); height: 100%;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;
    }
    .prog-fill::after {
      content: ''; position: absolute; top: 0; left: 0;
      bottom: 0; right: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
      animation: shimmer 2s infinite;
    }
    @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%);
    } }
    
    .board { display: flex; flex-direction: column; gap: 12px;
    }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 18px 20px; display: flex;
    align-items: center; gap: 16px; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
    }
    .card:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 12px 24px rgba(0,0,0,0.15); border-color: var(--gold);
    }
    
    .rank-badge { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
    font-size: 26px; }
    @keyframes wobble {
      0%, 100% { transform: rotate(0deg) scale(1);
      }
      25% { transform: rotate(-15deg) scale(1.2);
      }
      75% { transform: rotate(15deg) scale(1.2);
      }
    }
    .card:hover .rank-badge { animation: wobble 0.6s ease-in-out infinite;
    }
    
    .player-info { flex: 1; }
    .player-name { font-weight: 600;
    font-size: 17px; }
    .rank-label { font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-dim);
    }
    .money { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 1px; color: var(--gold);
    }
    
    .admin-controls { display: flex; flex-direction: column; gap: 8px; min-width: 160px; margin-top: 12px;
    border-top: 1px solid var(--card-border); padding-top: 12px; }
    .btn-row { display: flex; gap: 6px;
    }
    .btn { border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; padding: 6px 10px;
    flex: 1; transition: 0.15s; }
    .btn:hover { filter: brightness(1.1); transform: scale(1.05);
    }
    .btn-plus { background: rgba(52,200,100,0.15); color: #34c864; border: 1px solid rgba(52,200,100,0.25);
    }
    .btn-minus { background: rgba(220,60,60,0.15); color: #e05050; border: 1px solid rgba(220,60,60,0.25);
    }
    .btn-del { background: rgba(150,50,50,0.15); color: #c04040; flex: 0; padding: 6px 12px; border: 1px solid rgba(150,50,50,0.25);
    }
    
    .custom-row { display: flex; gap: 5px;
    }
    .amount-input { flex: 1; background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 6px; padding: 8px; color: var(--text);
    outline: none; transition: border-color 0.2s; }
    .amount-input:focus { border-color: var(--gold);
    }
    
    .add-section { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 20px;
    margin-top: 24px; }
    .add-section h3 { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; color: var(--gold);
    margin-bottom: 12px; }
    .add-row { display: flex; gap: 10px; margin-bottom: 10px;
    }
    .btn-add { background: var(--gold); color: #000; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer;
    border: none; transition: 0.15s; }
    .btn-add:hover { transform: scale(0.95); opacity: 0.9;
    }
    
    .footer-bar { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px;
    border-top: 1px solid var(--card-border); }
    .btn-unlock { background: var(--input-bg); color: var(--text-dim); border: 1px solid var(--card-border);
    padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .btn-unlock:hover { background: var(--card-border); color: var(--text);
    transform: translateY(-2px); }
    
    .modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.75);
    backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; }
    .modal { background: #111318; border: 1px solid var(--gold);
    border-radius: 20px; padding: 32px; width: 90%; max-width: 360px; color: #fff; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1;
    } }
    .modal h2 { font-family: 'Bebas Neue'; font-size: 28px; color: var(--gold); margin-bottom: 6px;
    }
    .pw-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; color: #fff;
    margin-bottom: 12px; outline: none; }
    .modal-btns { display: flex; gap: 10px;
    }
    .btn-confirm { flex: 1; background: var(--gold); color: #000; padding: 12px; border-radius: 10px; font-weight: 700; border: none;
    cursor: pointer; }
    
    .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: #14161e; border: 1px solid #fff; border-radius: 30px; padding: 10px 22px; color: #fff; font-size: 14px; font-weight: 500; z-index: 200;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { transform: translate(-50%, 20px);
    opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

    .floating-pig { position: fixed;
    font-size: 40px; pointer-events: none; z-index: 9999; transform: translate(-50%, -50%); animation: pigPop 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes pigPop {
      0% { transform: translate(-50%, -50%) scale(0) rotate(-20deg);
      opacity: 0; }
      30% { transform: translate(-50%, -100px) scale(1.2) rotate(15deg); opacity: 1;
      }
      50% { transform: translate(-50%, -120px) scale(1) rotate(-10deg); opacity: 1;
      }
      80% { transform: translate(-50%, -140px) scale(1) rotate(5deg); opacity: 0.8;
      }
      100% { transform: translate(-50%, -160px) scale(0.5) rotate(0deg); opacity: 0;
      }
    }

    /* --- PODIUM KAHOOT STYLE CSS --- */
    .podium-screen { position: relative;
    z-index: 10; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;
    background: radial-gradient(circle at center, var(--podium-grad-inner) 0%, var(--podium-grad-outer) 100%); animation: fadeIn 0.5s ease; overflow: hidden; transition: background 0.3s;
    }
    .podium-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(50px, 12vw, 90px); color: var(--gold);
    text-shadow: 0 4px 20px rgba(201, 168, 76, 0.4); margin-bottom: 80px; animation: dropDown 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes dropDown { from { transform: translateY(-50px); opacity: 0; } to { transform: translateY(0); opacity: 1;
    } }

    .podium-stage { display: flex; align-items: flex-end; justify-content: center; gap: 15px; height: 420px; position: relative;
    }
    .podium-block-wrapper { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: clamp(90px, 25vw, 140px);
    }
    
    .podium-player-info { display: flex; flex-direction: column; align-items: center; opacity: 0;
    animation: fadeDrop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; margin-bottom: 15px; text-align: center;
    }
    .podium-emoji { font-size: clamp(35px, 8vw, 55px); filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
    }
    .podium-name { font-weight: 800; font-size: clamp(16px, 4vw, 22px); color: var(--text); margin-top: 5px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .podium-money { font-family: 'Bebas Neue'; font-size: clamp(20px, 5vw, 28px); color: var(--gold);
    }

    .podium-block { width: 100%; border-radius: 12px 12px 0 0; display: flex; justify-content: center; padding-top: 15px;
    font-family: 'Bebas Neue'; font-size: 40px; color: rgba(255,255,255,0.8); box-shadow: inset 0 4px 10px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.5); transform-origin: bottom;
    animation: riseUp 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; transform: scaleY(0); position: relative; overflow: hidden;
    }
    @keyframes riseUp { to { transform: scaleY(1);
    } }
    @keyframes fadeDrop { 
      0% { opacity: 0;
      transform: translateY(-50px) scale(0.8); } 
      100% { opacity: 1; transform: translateY(0) scale(1);
      } 
    }

    .block-1 { height: 320px; background: linear-gradient(to top, #8a6c1c, #d4af37, #fef08a);
    order: 2; z-index: 3; box-shadow: inset 0 4px 15px rgba(255,255,255,0.5), 0 10px 40px rgba(201,168,76,0.6);
    }
    .block-2 { height: 220px; background: linear-gradient(to top, #4b5563, #9ca3af, #e5e7eb); order: 1; z-index: 2;
    }
    .block-3 { height: 150px; background: linear-gradient(to top, #78350f, #b45309, #fbbf24); order: 3; z-index: 1;
    }

    /* Exaggerated Animation Delays (Staggered like Kahoot: 3rd -> 2nd -> 1st) */
    .wrapper-3 .podium-block { animation-delay: 0.2s;
    }
    .wrapper-3 .podium-player-info { animation-delay: 1.0s; }
    
    .wrapper-2 .podium-block { animation-delay: 1.4s;
    }
    .wrapper-2 .podium-player-info { animation-delay: 2.2s; }
    
    .wrapper-1 .podium-block { animation-delay: 2.6s;
    }
    .wrapper-1 .podium-player-info { animation-delay: 3.4s; }

    /* 1st Place extra juice animations inside the wrapper so it doesn't break opacity!
    */
    .winner-pulse-wrapper { display: flex; flex-direction: column; align-items: center; animation: winnerPulse 1.5s infinite alternate; animation-delay: 4.2s;
    }
    @keyframes winnerPulse {
      0% { transform: scale(1);
      filter: drop-shadow(0 0 10px rgba(201, 168, 76, 0.5)); }
      100% { transform: scale(1.15);
      filter: drop-shadow(0 0 30px rgba(201, 168, 76, 1)); }
    }
    
    .block-1::after {
      content: '';
      position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
      animation: shineSweep 3s infinite;
      animation-delay: 4s;
    }
    @keyframes shineSweep {
      0% { left: -100%;
      } 20% { left: 200%; } 100% { left: 200%;
      }
    }

    .honorable-mentions { margin-top: 60px; display: flex; flex-wrap: wrap; justify-content: center; gap: 10px;
    max-width: 600px; opacity: 0; animation: slideUpMentions 0.6s forwards; animation-delay: 4.5s;
    }
    @keyframes slideUpMentions { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0);
    } }
    .mention-chip { background: var(--card-bg); border: 1px solid var(--card-border); padding: 8px 16px; border-radius: 20px; font-weight: 600;
    display: flex; gap: 8px; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: transform 0.2s; color: var(--text);
    }
    .mention-chip:hover { transform: scale(1.1) translateY(-2px); border-color: var(--gold); }
    .mention-money { color: var(--text-dim);
    font-size: 14px; }

    .btn-back { position: absolute; top: 30px; left: 30px; background: transparent; border: 1px solid var(--card-border);
    color: var(--text); padding: 10px 20px; border-radius: 30px; cursor: pointer; font-weight: bold; transition: 0.2s; z-index: 20;
    }
    .btn-back:hover { background: var(--card-bg); transform: translateX(-5px);
    }

    /* --- CONFETTI SYSTEM --- */
    .confetti-container { position: absolute; inset: 0;
    pointer-events: none; z-index: 100; overflow: hidden; }
    .confetti-piece { position: absolute; top: -20px; width: 10px; height: 10px;
    animation: confettiFall linear forwards; border-radius: 2px; }
    @keyframes confettiFall {
      0% { transform: translateY(0) rotate(0deg) scale(1);
      opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0;
      }
    }
  `;

  if (!loaded) return <div style={{ color: "#888", textAlign: "center", padding: 80, fontFamily: "sans-serif" }}>Loading Live Data...</div>;

  return (
    <div className={`app-container ${isDarkMode ? 'theme-dark' : 'theme-light'}`} onClick={handleBackgroundClick}>
      <style>{styles}</style>
      <div className="bg-orbs"><div className="orb orb1" /><div className="orb orb2" /></div>

      {showPodium ? (
        /* --- PODIUM VIEW --- */
        <div className="podium-screen">
          
          {/* Confetti Explosion System */}
          {showConfetti && (
            <div className="confetti-container">
              {[...Array(150)].map((_, i) => (
                <div key={i} className="confetti-piece" style={{
                  left: `${Math.random() * 100}vw`,
                  animationDelay: `${Math.random() * 0.8}s`,
                  animationDuration: `${2.5 + Math.random() * 3}s`,
                  backgroundColor:['#ff4b4b', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#ff9800', '#fff'][Math.floor(Math.random() * 7)]
                }} />
              ))}
            </div>
          )}

          <button className="btn-back" onClick={() => setShowPodium(false)}>← Back to Dashboard</button>
          
          <h1 className="podium-title">FINAL STANDINGS</h1>
          
          <div className="podium-stage">
            {/* 2ND PLACE */}
            {second && (
              <div className="podium-block-wrapper wrapper-2">
                <div className="podium-player-info">
                  <div className="podium-emoji">🥈</div>
                  <div className="podium-name">{second.name}</div>
                  <div className="podium-money">${second.money.toFixed(2)}</div>
                </div>
                <div className="podium-block block-2">2</div>
              </div>
            )}

            {/* 1ST PLACE */}
            {first && (
              <div className="podium-block-wrapper wrapper-1">
                <div className="podium-player-info">
                  <div className="winner-pulse-wrapper">
                    <div className="podium-emoji">👑</div>
                    <div className="podium-name">{first.name}</div>
                    <div className="podium-money">${first.money.toFixed(2)}</div>
                  </div>
                </div>
                <div className="podium-block block-1">1</div>
              </div>
            )}

            {/* 3RD PLACE */}
            {third && (
              <div className="podium-block-wrapper wrapper-3">
                <div className="podium-player-info">
                  <div className="podium-emoji">🥉</div>
                  <div className="podium-name">{third.name}</div>
                  <div className="podium-money">${third.money.toFixed(2)}</div>
                </div>
                <div className="podium-block block-3">3</div>
              </div>
            )}
          </div>

          {/* HONORABLE MENTIONS (4th place and below) */}
          {honorableMentions.length > 0 && (
            <div className="honorable-mentions">
              {honorableMentions.map(p => 
                (
                <div key={p.id} className="mention-chip">
                  <span>💩 {p.name}</span>
                  <span className="mention-money">${p.money.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* --- MAIN DASHBOARD VIEW --- */
        <div className="wrapper">
          <div className="top-nav">
            <button className="theme-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
            <button className="theme-btn btn-podium" onClick={() => setShowPodium(true)}>
              🏆 View Podium
            </button>
          </div>

          <div className="header">
            <h1>{siteTitle}</h1>
          </div>

          <div className="stats-container">
            <div className="total-row row-pot">
              <span className="total-label">Total Pot 💰</span>
              <span className="total-val">${netTotal.toFixed(2)}</span>
            </div>
            
            {moneyUsed > 0 && (
              <div className="total-row row-used">
                <span className="total-label">Money Used 💸</span>
                <span className="total-val">-${moneyUsed.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="progress-list">
            {progressBars.map(bar => {
              const percent = Math.min((grossTotal / bar.target) * 100, 100);
              return (
                <div key={bar.id} className="prog-card">
                  <div className="prog-header">
                    <span>{bar.title} 🎯</span>
                    <span>${grossTotal.toFixed(2)} / ${bar.target.toFixed(2)}</span>
                  </div>
 
                  <div className="prog-track">
                    <div className="prog-fill" style={{ width: `${percent}%` }}></div>
                  </div>

                  {isAdmin && (
                    <div className="admin-controls" style={{ marginTop: '16px' }}>
                      <div className="btn-row">
                        <button className="btn btn-del" style={{flex: 1}} onClick={() => removeBar(bar.id)}>✕ Delete Bar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="board">
            {sorted.map((player, idx) => {
              const rank = idx + 1;
              return (
                <div key={player.id} className="card">
                  <div className="rank-badge">{getRankEmoji(rank)}</div>
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="rank-label">{getRankLabel(rank)}</div>
                  </div>
                  <div className="money">${player.money.toFixed(2)}</div>

                  {isAdmin && (
                    <div style={{marginLeft: "auto"}}>
                      <div className="custom-row">
                        <input type="number" className="amount-input" style={{width: '60px'}} placeholder="$0" 
                          value={adjustAmounts[player.id] || ""} onChange={e => setAdjustAmounts(prev => ({ ...prev, [player.id]: e.target.value }))} />
                        <button className="btn btn-plus" onClick={() => applyCustom(player.id, 1)}>+</button>
                        <button className="btn btn-minus" onClick={() => applyCustom(player.id, -1)}>−</button>
                        <button className="btn btn-del" onClick={() => removePlayer(player.id)}>✕</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {imageSettings?.url && (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <img 
                src={imageSettings.url} 
                alt="Leaderboard Custom" 
                style={{ width: `${imageSettings.width}%`, maxWidth: '100%', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }} 
              />
            </div>
          )}

          {isAdmin && (
            <>
              <div className="add-section">
                <h3>📝 Site Settings</h3>
                <div className="add-row">
                  <input className="amount-input" placeholder="Site Title..." value={newTitleInput} onChange={e => setNewTitleInput(e.target.value)} />
                  <button className="btn-add" onClick={saveTitle}>SAVE TITLE</button>
                </div>
        
                <div className="add-row" style={{ marginTop: '12px' }}>
                  <input type="number" className="amount-input" placeholder="Money Used ($)..." value={usedAmountInput} onChange={e => setUsedAmountInput(e.target.value)} />
                  <button className="btn-add" style={{ background: 'var(--red-text)', color: '#fff' }} onClick={() => adjustMoneyUsed(1)}>ADD SPENT</button>
                  <button className="btn-add" style={{ background: 'var(--input-bg)', color: 'var(--text)' }} onClick={() => adjustMoneyUsed(-1)}>REDUCE</button>
                </div>
              </div>

              <div className="add-section">
                <h3>➕ Add Player</h3>
                <div className="add-row">
                  <input className="amount-input" placeholder="Name..." value={newName} onChange={e => setNewName(e.target.value)} />
                  <button className="btn-add" onClick={addPlayer}>ADD</button>
                </div>
              </div>

              <div className="add-section">
                <h3>📊 Add Progress Bar</h3>
                <div className="add-row">
                  <input className="amount-input" placeholder="Bar Title..." value={newBarTitle} onChange={e => setNewBarTitle(e.target.value)} />
                  <input type="number" className="amount-input" style={{flex: 0.5}} placeholder="Target $" value={newBarTarget} onChange={e => setNewBarTarget(e.target.value)} />
                  <button className="btn-add" onClick={addBar}>ADD</button>
                </div>
              </div>

              <div className="add-section">
                <h3>🖼️ Custom Display Image</h3>
                <div className="add-row">
                  <input className="amount-input" placeholder="Paste Image URL here (e.g., Imgur link)..." value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} />
                </div>
                <div className="add-row" style={{ alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text)', width: '70px', fontWeight: 'bold' }}>Size: {newImageWidth}%</span>
                  <input type="range" min="10" max="100" value={newImageWidth} onChange={e => setNewImageWidth(e.target.value)} style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button className="btn-add" style={{ flex: 1 }} onClick={saveImage}>SAVE IMAGE</button>
                  {imageSettings?.url && (
                    <button className="btn btn-del" style={{ flex: 1, padding: '10px' }} onClick={removeImage}>REMOVE IMG</button>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="footer-bar">
            {isAdmin ? (
              <button className="btn-unlock" style={{color: 'var(--gold)', borderColor: 'var(--gold)'}} onClick={() => setIsAdmin(false)}>🔒 Lock Admin</button>
            ) : (
              <button className="btn-unlock" onClick={() => setShowLogin(true)}>🔑 Admin Access</button>
            )}
          </div>
        </div>
      )}

      {showLogin && (
        <div className="modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>🔐 Admin Access</h2>
            <input type="password" className="pw-input" placeholder="Password..." value={pwInput} onChange={e => setPwInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus />
            <div className="modal-btns">
              <button className="btn-confirm" onClick={handleLogin}>UNLOCK</button>
            </div>
          </div>
        </div>
      )}
      
      {toast && <div className="toast">{toast.msg}</div>}

      {/* RENDER THE PIGS */}
      {pigs.map(pig => (
        <div key={pig.id} className="floating-pig" style={{ left: pig.x, top: pig.y }}>
          🐷
        </div>
      ))}

      <Analytics />
    </div>
  );
}