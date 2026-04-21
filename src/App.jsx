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
  // Generate a unique ID for this browser/device to track who uploaded what
  const [localUserId] = useState(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem('localUserId') || Math.random().toString(36).substring(2, 9);
      localStorage.setItem('localUserId', id);
      return id;
    }
    return 'default-id';
  });

  const [players, setPlayers] = useState([]);
  const [progressBars, setProgressBars] = useState([]);
  
  // Multiple Images State (Admin)
  const [images, setImages] = useState([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Community Images State
  const [communityImages, setCommunityImages] = useState([]);
  const [isCommunityUploading, setIsCommunityUploading] = useState(false);
  const [newCommImageWidth, setNewCommImageWidth] = useState(100);

  // File Upload State
  const [isUploading, setIsUploading] = useState(false);

  // Separated Titles
  const [h1Title, setH1Title] = useState("john pork123");
  const [tabTitle, setTabTitle] = useState("john pork123");
  
  // Expense States
  const [expenses, setExpenses] = useState([]);
  const [showExpenses, setShowExpenses] = useState(false);
  const [expenseDescInput, setExpenseDescInput] = useState("");
  const [expenseAmountInput, setExpenseAmountInput] = useState("");
  
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

  // Separate inputs for the admin panel
  const [newH1Input, setNewH1Input] = useState("");
  const [newTabInput, setNewTabInput] = useState("");
  
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  // Upgraded Fidget Elements
  const [clickElements, setClickElements] = useState([]);
  const [fidgetCount, setFidgetCount] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Refs for holdable background interaction
  const holdInterval = useRef(null);
  const pointerPos = useRef({ x: 0, y: 0 });

  // Load LIVE from Firebase
  useEffect(() => {
    const playersRef = ref(db, 'players');
    const barsRef = ref(db, 'progressBars');
    const imagesRef = ref(db, 'carouselImages');
    const commImagesRef = ref(db, 'communityImages');
    const h1Ref = ref(db, 'h1Title');
    const tabRef = ref(db, 'tabTitle');
    const expensesRef = ref(db, 'expenses');

    const unsubPlayers = onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) setPlayers(snapshot.val());
      else {
        firebaseSet(playersRef, DEFAULT_PLAYERS);
        setPlayers(DEFAULT_PLAYERS);
      }
    });

    const unsubBars = onValue(barsRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val.empty) setProgressBars([]);
        else setProgressBars(Array.isArray(val) ? val : Object.values(val));
      } else {
        firebaseSet(barsRef, DEFAULT_BARS);
        setProgressBars(DEFAULT_BARS);
      }
    });

    const unsubImages = onValue(imagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val.empty) setImages([]);
        else setImages(Array.isArray(val) ? val : Object.values(val));
      } else {
        setImages([]);
      }
    });

    const unsubCommImages = onValue(commImagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val.empty) setCommunityImages([]);
        else setCommunityImages(Array.isArray(val) ? val : Object.values(val));
      } else {
        setCommunityImages([]);
      }
    });

    const unsubH1 = onValue(h1Ref, (snapshot) => {
      if (snapshot.exists()) {
        setH1Title(snapshot.val());
        setNewH1Input(snapshot.val());
      } else {
        firebaseSet(h1Ref, "john pork123");
      }
    });

    const unsubTab = onValue(tabRef, (snapshot) => {
      if (snapshot.exists()) {
        setTabTitle(snapshot.val());
        setNewTabInput(snapshot.val());
        document.title = snapshot.val(); 
      } else {
        firebaseSet(tabRef, "john pork123");
        document.title = "john pork123";
      }
    });

    const unsubExpenses = onValue(expensesRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val.empty) setExpenses([]);
        else setExpenses(Array.isArray(val) ? val : Object.values(val));
      } else {
        setExpenses([]);
      }
      setLoaded(true);
    });

    return () => { 
      unsubPlayers(); 
      unsubBars(); 
      unsubImages(); 
      unsubCommImages(); 
      unsubH1(); 
      unsubTab(); 
      unsubExpenses(); 
    };
  }, []);

  // Cleanup for hold interval when component unmounts
  useEffect(() => {
    return () => {
      if (holdInterval.current) clearInterval(holdInterval.current);
    };
  }, []);

  // Confetti & Sound Timer Logic for Podium
  useEffect(() => {
    let timer;
    let drumAudio;
    let winAudio;
    let chimeAudio;

    if (showPodium) {
      drumAudio = new Audio("https://www.myinstants.com/media/sounds/drumroll.mp3");
      drumAudio.volume = 0.7;
      drumAudio.play().catch(e => console.log("Audio play blocked by browser:", e));

      timer = setTimeout(() => {
        setShowConfetti(true);
        
        if (drumAudio) {
          drumAudio.pause();
          drumAudio.currentTime = 0;
        }

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

  // Math Calculations (Gross and Net)
  const grossTotal = players.reduce((s, p) => s + p.money, 0); 
  const moneyUsed = expenses.reduce((s, e) => s + e.amount, 0);
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

  // Helper to spawn a single emoji based on coords
  function spawnSingleEmoji(x, y) {
    const emojis = ['🐷', '💰', '💸', '🚀', '✨', '🔥', '🎉'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const newEl = { id: Date.now() + Math.random(), x, y, emoji: randomEmoji };
    setClickElements(prev => [...prev, newEl]);
    
    // Auto remove after 1 second
    setTimeout(() => { setClickElements(prev => prev.filter(p => p.id !== newEl.id)); }, 1000);
  }

  // Background Pointer Event Logic (Allows hold to spam & dragging)
  function handlePointerDown(e) {
    const isInteractive = e.target.closest('.card') || 
                          e.target.closest('.prog-card') || 
                          e.target.closest('.add-section') ||
                          e.target.closest('.modal') || 
                          e.target.closest('.btn') || 
                          e.target.closest('.theme-btn') || 
                          e.target.closest('.total-row') ||
                          e.target.closest('.expenses-list') ||
                          e.target.closest('.carousel-wrapper') ||
                          e.target.closest('.community-section') ||
                          e.target.closest('.fidget-coin') ||
                          e.target.tagName.toLowerCase() === 'button' || 
                          e.target.tagName.toLowerCase() === 'input';

    if (isInteractive) return;

    // Fidget sound effect (Plays once per press)
    const popAudio = new Audio("https://www.myinstants.com/media/sounds/pop-sound-effect.mp3");
    popAudio.volume = 0.2;
    popAudio.play().catch(()=>{});

    // Spawn the first one immediately
    pointerPos.current = { x: e.clientX, y: e.clientY };
    spawnSingleEmoji(e.clientX, e.clientY);

    // Setup interval for holding down
    if (holdInterval.current) clearInterval(holdInterval.current);
    holdInterval.current = setInterval(() => {
      spawnSingleEmoji(pointerPos.current.x, pointerPos.current.y);
    }, 120); // Spawns a new emoji every 120 milliseconds while held down
  }

  function handlePointerMove(e) {
    // Update coordinates if the pointer is moving while held down
    if (holdInterval.current) {
      pointerPos.current = { x: e.clientX, y: e.clientY };
    }
  }

  function handlePointerUpOrLeave() {
    // Stop spawning when let go or cursor leaves
    if (holdInterval.current) {
      clearInterval(holdInterval.current);
      holdInterval.current = null;
    }
  }

  // --- ADMIN SETTINGS CONTROLS ---
  function saveTitles() {
    if (newH1Input.trim()) firebaseSet(ref(db, 'h1Title'), newH1Input.trim());
    if (newTabInput.trim()) firebaseSet(ref(db, 'tabTitle'), newTabInput.trim());
    showToast("📝 Titles Updated!");
  }

  function addExpense() {
    const desc = expenseDescInput.trim() || "Misc Expense";
    const val = parseFloat(expenseAmountInput);
    if (isNaN(val) || val <= 0) return;
    const newExp = [...expenses, { id: Date.now(), desc, amount: val }];
    firebaseSet(ref(db, 'expenses'), newExp);
    setExpenseDescInput("");
    setExpenseAmountInput("");
    showToast(`💸 Added $${val.toFixed(2)} for ${desc}`);
  }

  function removeExpense(id) {
    const newExp = expenses.filter(e => e.id !== id);
    firebaseSet(ref(db, 'expenses'), newExp.length ? newExp : { empty: true });
    showToast("🗑️ Expense removed");
  }

  function downloadBackup() {
    const backupData = {
      players,
      progressBars,
      images,
      communityImages,
      expenses,
      h1Title,
      tabTitle,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Website_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("💾 Backup Downloaded Successfully!");
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
    firebaseSet(ref(db, 'progressBars'), newBars.length ? newBars : { empty: true });
  }

  // --- ADMIN IMAGE CAROUSEL CONTROLS ---
  
  function addImageURL() {
    if (!newImageUrl.trim()) return;
    const newImgs = [...images, { id: Date.now(), url: newImageUrl.trim(), width: parseInt(newImageWidth) }];
    firebaseSet(ref(db, 'carouselImages'), newImgs);
    setNewImageUrl("");
    showToast("🖼️ URL Image Added!");
  }

  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; 
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const base64String = canvas.toDataURL("image/jpeg", 0.7);

        const newImgs = [...images, { id: Date.now(), url: base64String, width: parseInt(newImageWidth) }];
        firebaseSet(ref(db, 'carouselImages'), newImgs);

        showToast("✅ Image Uploaded for Free!");
        setIsUploading(false);
        e.target.value = null; 
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function removeImage(id) {
    const newImgs = images.filter(x => x.id !== id);
    firebaseSet(ref(db, 'carouselImages'), newImgs.length ? newImgs : { empty: true });
    setCurrentImgIndex(0); 
    showToast("🗑️ Image removed");
  }

  function updateImageWidth(id, newWidth) {
    const newImgs = images.map(img => img.id === id ? { ...img, width: parseInt(newWidth) } : img);
    firebaseSet(ref(db, 'carouselImages'), newImgs);
  }

  function moveImage(index, direction) {
    if (index + direction < 0 || index + direction >= images.length) return;
    const newImgs = [...images];
    const temp = newImgs[index];
    newImgs[index] = newImgs[index + direction];
    newImgs[index + direction] = temp;
    firebaseSet(ref(db, 'carouselImages'), newImgs);
  }

  function nextImage() {
    if (images.length > 1) {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }
  }

  // --- COMMUNITY IMAGE CONTROLS ---

  function handleCommunityFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setIsCommunityUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; 
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const base64String = canvas.toDataURL("image/jpeg", 0.7);

        const newImgs = [...communityImages, { 
          id: Date.now(), 
          url: base64String, 
          width: parseInt(newCommImageWidth),
          subtext: "", // NEW FIELD FOR SUBTEXT
          uploaderId: localUserId // Tag this upload with the user's hidden device ID
        }];
        firebaseSet(ref(db, 'communityImages'), newImgs);

        showToast("🌟 Community Image Shared!");
        setIsCommunityUploading(false);
        e.target.value = null; 
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function updateCommunityImageWidth(id, newWidth) {
    const newImgs = communityImages.map(img => img.id === id ? { ...img, width: parseInt(newWidth) } : img);
    firebaseSet(ref(db, 'communityImages'), newImgs);
  }

  // NEW FUNCTION TO UPDATE SUBTEXT
  function updateCommunityImageSubtext(id, newSubtext) {
    const newImgs = communityImages.map(img => img.id === id ? { ...img, subtext: newSubtext } : img);
    firebaseSet(ref(db, 'communityImages'), newImgs);
  }

  function removeCommunityImage(id) {
    const newImgs = communityImages.filter(x => x.id !== id);
    firebaseSet(ref(db, 'communityImages'), newImgs.length ? newImgs : { empty: true });
    showToast("🗑️ Community Image removed");
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;800&display=swap');
    
    /* Disables tap highlight coloring on mobile */
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    
    .theme-dark {
      --bg: #080a0f; --text: #e8eaf0;
      --text-dim: #5a6070; 
      --card-bg: rgba(255,255,255,0.035); --card-border: rgba(255,255,255,0.07);
      --input-bg: rgba(255,255,255,0.06); --orb-opacity: 0.18; --gold: #c9a84c; --gold-bg: rgba(201,168,76,0.05);
      --red-bg: rgba(220,60,60,0.08); --red-text: #e05050;
      --green-bg: rgba(52,200,100,0.08); --green-text: #34c864;
      --podium-grad-inner: #151823;
      --podium-grad-outer: #000000;
    }
    .theme-light {
      --bg: #f4f6fa; --text: #0f172a; --text-dim: #64748b;
      --card-bg: #ffffff; --card-border: #e2e8f0;
      --input-bg: #f1f5f9; --orb-opacity: 0.25; --gold: #d97706; --gold-bg: #fef3c7;
      --red-bg: #fee2e2; --red-text: #dc2626;
      --green-bg: #dcfce7; --green-text: #16a34a;
      --podium-grad-inner: #ffffff; --podium-grad-outer: #aeb9cc;
    }

    body { background: var(--bg); transition: background 0.3s ease; font-family: 'DM Sans', sans-serif; }
    
    /* Disable text selection on the main container so spam clicking/dragging doesn't highlight everything */
    .app-container { 
      min-height: 100vh; background: var(--bg); color: var(--text); overflow-x: hidden; position: relative;
      transition: all 0.3s ease; padding-bottom: 80px; 
      user-select: none; 
      -webkit-user-select: none;
    }

    /* Re-enable text selection ONLY for inputs and forms so the admin panel isn't broken */
    input, textarea {
      user-select: text;
      -webkit-user-select: text;
    }
    
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
    
    .theme-light .card, .theme-light .prog-card, .theme-light .total-row, .theme-light .add-section, .theme-light .community-section {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }

    .stats-container { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;
    }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border: 1px solid var(--card-border);
    border-radius: 12px; transition: transform 0.2s; }
    .total-row:hover { transform: scale(1.01);
    }
    .total-label { font-size: 13px; letter-spacing: 1.5px; color: var(--text-dim); text-transform: uppercase; font-weight: bold; display: flex; align-items: center; gap: 8px;
    }
    .total-val { font-family: 'Bebas Neue', sans-serif; font-size: 28px; transition: color 0.3s;
    }
    
    .row-pot { background: var(--gold-bg); border-color: var(--gold);
    }
    .row-pot .total-val { color: var(--gold); }
    
    .row-net { background: var(--green-bg); border-color: var(--green-text); 
    }
    .row-net .total-val { color: var(--green-text); }
    
    .row-used { background: var(--red-bg); cursor: pointer; border-color: transparent;
    }
    .row-used:hover { border-color: var(--red-text); }
    .row-used .total-val { color: var(--red-text); }

    .expenses-list { padding: 12px 20px; background: var(--card-bg); border: 1px solid var(--card-border); border-top: none; border-radius: 0 0 12px 12px; margin-top: -12px; margin-bottom: 10px; }
    .expense-item { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding-bottom: 8px; border-bottom: 1px dashed var(--card-border); }
    .expense-item:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .expense-desc { color: var(--text); font-weight: 500; font-size: 15px; }
    .expense-amt { color: var(--red-text); font-weight: bold; }

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
    .btn-row { display: flex; gap: 6px; flex-wrap: wrap;
    }
    .btn { border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; padding: 10px 12px;
    flex: 1; transition: 0.15s; }
    .btn:hover { filter: brightness(1.1); transform: scale(1.05);
    }
    .btn-plus { background: rgba(52,200,100,0.15); color: #34c864; border: 1px solid rgba(52,200,100,0.25);
    }
    .btn-minus { background: rgba(220,60,60,0.15); color: #e05050; border: 1px solid rgba(220,60,60,0.25);
    }
    .btn-del { background: rgba(150,50,50,0.15); color: #c04040; flex: 0; padding: 8px 14px; border: 1px solid rgba(150,50,50,0.25);
    }
    
    .custom-row { display: flex; gap: 8px; flex-wrap: wrap; 
    }
    .amount-input, .pw-input { flex: 1; background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 10px; color: var(--text);
    outline: none; transition: border-color 0.2s; font-size: 16px !important; min-width: 0;}
    .amount-input:focus, .pw-input:focus { border-color: var(--gold);
    }
    
    .add-section { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 20px;
    margin-top: 24px; }
    .add-section h3 { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; color: var(--gold);
    margin-bottom: 12px; }
    .add-row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; 
    }
    .btn-add { background: var(--gold); color: #000; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer;
    border: none; transition: 0.15s; white-space: nowrap; }
    .btn-add:hover { transform: scale(0.95); opacity: 0.9;
    }
    
    /* --- CAROUSEL STYLES --- */
    .carousel-wrapper { display: grid; place-items: center; margin-top: 40px; cursor: pointer; position: relative; }
    .carousel-wrapper > * { grid-area: 1 / 1; }
    .carousel-img { opacity: 0; transform: scale(0.9) translateY(10px); transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); border-radius: 12px; box-shadow: 0 12px 40px rgba(0,0,0,0.25); pointer-events: none; z-index: 1;}
    .carousel-img.active { opacity: 1; transform: scale(1) translateY(0); pointer-events: auto; z-index: 2;}
    .carousel-hint { position: absolute; bottom: -30px; font-size: 12px; color: var(--text-dim); opacity: 0; transition: 0.3s; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;}
    .carousel-wrapper:hover .carousel-hint { opacity: 1; bottom: -25px; }
    
    .file-input-wrapper { flex: 1; background: var(--input-bg); border: 1px dashed var(--card-border); padding: 15px; border-radius: 8px; text-align: center; position: relative; overflow: hidden; cursor: pointer; transition: 0.2s; }
    .file-input-wrapper:hover { border-color: var(--gold); background: var(--gold-bg); }
    .file-input-wrapper input[type="file"] { position: absolute; left: 0; top: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
    .file-input-text { color: var(--text); font-size: 15px; font-weight: bold; pointer-events: none; }

    .footer-bar { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px;
    border-top: 1px solid var(--card-border); }
    .btn-unlock { background: var(--input-bg); color: var(--text-dim); border: 1px solid var(--card-border);
    padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 14px; }
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
    .pw-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); margin-bottom: 12px; color: #fff; }
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

    /* --- NEW FIDGET COIN CSS --- */
    .fidget-coin {
      position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px;
      background: var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 32px; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.3); z-index: 50; transition: transform 0.1s;
      user-select: none; border: 2px solid #fff;
    }
    .fidget-coin:active { transform: scale(0.85); }
    .fidget-coin.flip { animation: coinFlip 0.5s ease-in-out; }
    @keyframes coinFlip {
      0% { transform: rotateY(0deg) scale(1); }
      50% { transform: rotateY(180deg) scale(1.3); }
      100% { transform: rotateY(360deg) scale(1); }
    }
    .fidget-counter {
      position: absolute; top: -8px; right: -8px; background: var(--red-text); color: white;
      font-size: 13px; font-weight: bold; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 2px solid var(--bg);
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

    .wrapper-3 .podium-block { animation-delay: 0.2s; }
    .wrapper-3 .podium-player-info { animation-delay: 1.0s; }
    .wrapper-2 .podium-block { animation-delay: 1.4s; }
    .wrapper-2 .podium-player-info { animation-delay: 2.2s; }
    .wrapper-1 .podium-block { animation-delay: 2.6s; }
    .wrapper-1 .podium-player-info { animation-delay: 3.4s; }

    .winner-pulse-wrapper { display: flex; flex-direction: column; align-items: center; animation: winnerPulse 1.5s infinite alternate; animation-delay: 4.2s;
    }
    @keyframes winnerPulse {
      0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(201, 168, 76, 0.5)); }
      100% { transform: scale(1.15); filter: drop-shadow(0 0 30px rgba(201, 168, 76, 1)); }
    }
    
    .block-1::after {
      content: '';
      position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
      background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
      animation: shineSweep 3s infinite;
      animation-delay: 4s;
    }
    @keyframes shineSweep {
      0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; }
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
    .confetti-container { position: absolute; inset: 0; pointer-events: none; z-index: 100; overflow: hidden; }
    .confetti-piece { position: absolute; top: -20px; width: 10px; height: 10px; animation: confettiFall linear forwards; border-radius: 2px; }
    @keyframes confettiFall {
      0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
      100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
    }

    /* --- MOBILE / TABLET OPTIMIZATIONS --- */
    @media (max-width: 600px) {
      .wrapper { padding: 20px 15px; }
      .header h1 { font-size: clamp(32px, 12vw, 50px); margin-bottom: 20px; }
      .card, .prog-card, .add-section, .community-section { padding: 15px; }
      .btn-row, .custom-row, .add-row { flex-direction: column; width: 100%; }
      .amount-input, .pw-input, .btn, .btn-add { width: 100%; flex: 1; min-width: 100%; }
      .money { font-size: 22px; }
      .btn-del { flex: 1; padding: 10px 12px; }
      .carousel-wrapper { margin-top: 25px; }
      .fidget-coin { bottom: 15px; right: 15px; width: 50px; height: 50px; font-size: 26px; }
    }
  `;

  if (!loaded) return <div style={{ color: "#888", textAlign: "center", padding: 80, fontFamily: "sans-serif" }}>Loading Live Data...</div>;

  return (
    <div 
      className={`app-container ${isDarkMode ? 'theme-dark' : 'theme-light'}`} 
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrLeave}
      onPointerCancel={handlePointerUpOrLeave}
    >
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

          {/* HONORABLE MENTIONS */}
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
            <h1>{h1Title}</h1>
          </div>

          <div className="stats-container">
            {/* Total Raised (Gross) */}
            <div className="total-row row-pot">
              <span className="total-label">Total Pot 💰</span>
              <span className="total-val">${grossTotal.toFixed(2)}</span>
            </div>

            {/* Net Total (Gross - Expenses) */}
            <div className="total-row row-net">
              <span className="total-label">Net Left 🏦</span>
              <span className="total-val">${netTotal.toFixed(2)}</span>
            </div>
            
            {/* Clickable Money Spent */}
            {expenses.length > 0 && (
              <>
                <div className="total-row row-used" onClick={() => setShowExpenses(!showExpenses)}>
                  <span className="total-label">
                    Money Used 💸 
                    <span style={{ fontSize: '10px', opacity: 0.7 }}>{showExpenses ? '▲' : '▼'}</span>
                  </span>
                  <span className="total-val">-${moneyUsed.toFixed(2)}</span>
                </div>

                {showExpenses && (
                  <div className="expenses-list">
                    {expenses.map(exp => (
                      <div key={exp.id} className="expense-item">
                        <span className="expense-desc">• {exp.desc}</span>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <span className="expense-amt">${exp.amount.toFixed(2)}</span>
                          {isAdmin && (
                            <button className="btn btn-del" style={{ padding: '6px 10px', flex: 0 }} onClick={(e) => { e.stopPropagation(); removeExpense(exp.id); }}>✕</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
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
                    <div style={{marginLeft: "auto", width: window.innerWidth <= 600 ? '100%' : 'auto', marginTop: window.innerWidth <= 600 ? '10px' : '0'}}>
                      <div className="custom-row">
                        <input type="number" className="amount-input" style={{flex: '1 1 60px'}} placeholder="$0" 
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

          {/* ADMIN CAROUSEL IMAGES */}
          {images.length > 0 && (
            <div className="carousel-wrapper" onClick={nextImage}>
              {images.map((img, idx) => (
                <img 
                  key={img.id}
                  src={img.url} 
                  alt="Custom Display" 
                  className={`carousel-img ${idx === currentImgIndex ? 'active' : ''}`}
                  style={{ width: `${img.width}%` }} 
                />
              ))}
              {images.length > 1 && <div className="carousel-hint">Click to cycle ({currentImgIndex + 1}/{images.length})</div>}
            </div>
          )}

          {/* --- NEW COMMUNITY AREA (VISIBLE TO EVERYONE) --- */}
          <div className="community-section" style={{ marginTop: '40px', padding: '20px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--card-border)' }}>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '24px', color: 'var(--gold)', marginBottom: '16px', textAlign: 'center' }}>🌟 Community Board</h3>
            
            {/* Public Upload Input */}
            <div className="add-row">
              <div className="file-input-wrapper">
                <span className="file-input-text">{isCommunityUploading ? '⚙️ Uploading...' : '📁 Share a Photo!'}</span>
                <input type="file" accept="image/*" onChange={handleCommunityFileUpload} disabled={isCommunityUploading} />
              </div>
            </div>
            
            <div className="add-row" style={{ alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 'bold' }}>Default Size: {newCommImageWidth}%</span>
              <input type="range" min="10" max="100" value={newCommImageWidth} onChange={e => setNewCommImageWidth(e.target.value)} style={{ flex: 1 }} />
            </div>

            {/* Display the Community Images */}
            {communityImages.length > 0 && (
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
                {communityImages.map((img) => (
                  <div key={img.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--input-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                    <img 
                      src={img.url} 
                      alt="Community Shared" 
                      style={{ width: `${img.width}%`, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} 
                    />
                    
                    {/* Controls (Public Resizing, Caption, Admin Deleting) */}
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                      
                      {/* Subtext View/Edit Area */}
                      <div style={{ width: '100%', marginBottom: '8px' }}>
                        {(img.uploaderId === localUserId || isAdmin) ? (
                          <input 
                            type="text" 
                            placeholder="Add a caption..." 
                            value={img.subtext || ""} 
                            onChange={(e) => updateCommunityImageSubtext(img.id, e.target.value)}
                            style={{ width: '100%', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '10px', color: 'var(--text)', outline: 'none' }}
                          />
                        ) : (
                          img.subtext && <div style={{ width: '100%', padding: '10px', textAlign: 'center', fontStyle: 'italic', color: 'var(--text-dim)' }}>"{img.subtext}"</div>
                        )}
                      </div>

                      {(img.uploaderId === localUserId || isAdmin) ? (
                        <>
                          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 'bold' }}>Size:</span>
                          <input type="range" min="10" max="100" value={img.width || 100} onChange={e => updateCommunityImageWidth(img.id, e.target.value)} style={{ flex: 1 }} />
                        </>
                      ) : (
                        <div style={{ flex: 1 }}></div> /* Spacer to push delete button to the right for admins if needed */
                      )}
                      
                      {isAdmin && (
                        <button className="btn btn-del" style={{ padding: '6px 10px', flex: 0 }} onClick={() => removeCommunityImage(img.id)}>✕ Delete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <>
              <div className="add-section">
                <h3>📝 Site Settings</h3>
                <div className="add-row">
                  <input className="amount-input" placeholder="Website Main Title (H1)..." value={newH1Input} onChange={e => setNewH1Input(e.target.value)} />
                </div>
                <div className="add-row" style={{ marginTop: '12px' }}>
                  <input className="amount-input" placeholder="Browser Tab Name..." value={newTabInput} onChange={e => setNewTabInput(e.target.value)} />
                </div>
                <button className="btn-add" style={{ marginTop: '12px', width: '100%' }} onClick={saveTitles}>SAVE TITLES</button>
                
                {/* BACKUP BUTTON */}
                <div className="add-row" style={{ marginTop: '12px' }}>
                  <button className="btn-add" style={{ width: '100%', background: '#1a4fc4', color: '#fff' }} onClick={downloadBackup}>💾 DOWNLOAD DATA BACKUP</button>
                </div>
        
                <div className="add-row" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--card-border)' }}>
                  <input className="amount-input" style={{flex: 1}} placeholder="Expense Info (e.g. Pizza)..." value={expenseDescInput} onChange={e => setExpenseDescInput(e.target.value)} />
                  <input type="number" className="amount-input" style={{flex: 0.5, minWidth: '80px'}} placeholder="$ Amount" value={expenseAmountInput} onChange={e => setExpenseAmountInput(e.target.value)} />
                  <button className="btn-add" style={{ background: 'var(--red-text)', color: '#fff' }} onClick={addExpense}>ADD SPENT</button>
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
                  <input type="number" className="amount-input" style={{flex: 0.5, minWidth: '80px'}} placeholder="Target $" value={newBarTarget} onChange={e => setNewBarTarget(e.target.value)} />
                  <button className="btn-add" onClick={addBar}>ADD</button>
                </div>
              </div>

              <div className="add-section">
                <h3>🖼️ Admin Carousel Images</h3>
                
                {/* Image URL Option */}
                <div className="add-row">
                  <input className="amount-input" placeholder="Paste Image URL here..." value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} />
                  <button className="btn-add" onClick={addImageURL}>ADD URL</button>
                </div>

                <div style={{ textAlign: 'center', margin: '12px 0', fontSize: '13px', color: 'var(--text-dim)', fontWeight: 'bold' }}>— OR —</div>

                {/* Free Device Upload via Base64 */}
                <div className="add-row">
                  <div className="file-input-wrapper">
                    <span className="file-input-text">{isUploading ? '⚙️ Compressing & Saving...' : '📁 Click to Upload Free from Device'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                  </div>
                </div>

                <div className="add-row" style={{ alignItems: 'center', marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed var(--card-border)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text)', width: '70px', fontWeight: 'bold' }}>Size: {newImageWidth}%</span>
                  <input type="range" min="10" max="100" value={newImageWidth} onChange={e => setNewImageWidth(e.target.value)} style={{ flex: 1 }} />
                </div>
                
                {/* IMAGE CONTROLS: Size + Order Options */}
                {images.length > 0 && (
                  <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {images.map((img, i) => (
                      <div key={img.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--input-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '55%' }}>
                            Img {i + 1}: {img.url.startsWith('data:image') ? 'Uploaded Local File' : img.url.substring(0, 20) + '...'}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button className="btn" style={{ padding: '6px 10px', fontSize: '12px', background: 'var(--card-bg)' }} onClick={() => moveImage(i, -1)} disabled={i === 0}>↑</button>
                            <button className="btn" style={{ padding: '6px 10px', fontSize: '12px', background: 'var(--card-bg)' }} onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}>↓</button>
                            <button className="btn btn-del" style={{ padding: '6px 10px' }} onClick={() => removeImage(img.id)}>✕</button>
                          </div>
                        </div>
                        {/* Independent Slider for Existing Images */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 'bold', width: '60px' }}>Size: {img.width}%</span>
                          <input type="range" min="10" max="100" value={img.width || 100} onChange={e => updateImageWidth(img.id, e.target.value)} style={{ flex: 1 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* RENDER THE FIDGET EMOJIS */}
      {clickElements.map(el => (
        <div key={el.id} className="floating-pig" style={{ left: el.x, top: el.y, pointerEvents: 'none' }}>
          {el.emoji}
        </div>
      ))}

      {/* NEW FIDGET COIN */}
      {!showPodium && (
        <div className={`fidget-coin ${isFlipping ? 'flip' : ''}`} onClick={() => {
          setFidgetCount(c => c + 1);
          setIsFlipping(true);
          setTimeout(() => setIsFlipping(false), 500);
          const coinSound = new Audio("https://www.myinstants.com/media/sounds/mario-coin.mp3");
          coinSound.volume = 0.3;
          coinSound.play().catch(()=>{});
        }}>
          🪙
          {fidgetCount > 0 && <span className="fidget-counter">{fidgetCount}</span>}
        </div>
      )}

      <Analytics />
    </div>
  );
}