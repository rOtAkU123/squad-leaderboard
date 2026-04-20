import { useState, useEffect, useRef } from "react";
import { ref, onValue, set as firebaseSet } from "firebase/database";
import { db } from "./firebase"; 

const ADMIN_PASSWORD = "boss2024";

const DEFAULT_PLAYERS = [
  { id: 1, name: "Aidan", money: 10.00 },
  { id: 2, name: "Maga", money: 8.00 },
  { id: 3, name: "Seyha", money: 5.05 },
];

const DEFAULT_BARS = [
  { id: 1, title: "Target Goal", current: 0, target: 33 }
];

function getRankEmoji(rank) {
  if (rank === 1) return "🥇";
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [adjustAmounts, setAdjustAmounts] = useState({});
  
  const [newBarTitle, setNewBarTitle] = useState("");
  const [newBarTarget, setNewBarTarget] = useState(33);
  const [barAdjustAmounts, setBarAdjustAmounts] = useState({});

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageWidth, setNewImageWidth] = useState(100);

  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  // Load LIVE from Firebase
  useEffect(() => {
    document.title = "john pork123"; // Changes tab name!

    const playersRef = ref(db, 'players');
    const barsRef = ref(db, 'progressBars');
    const imageRef = ref(db, 'imageSettings');

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
      setLoaded(true);
    });

    return () => { unsubPlayers(); unsubBars(); unsubImage(); };
  }, []);

  const sorted = [...players].sort((a, b) => b.money - a.money);
  const total = players.reduce((s, p) => s + p.money, 0);

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
    const newPlayers = [...players, { id: Date.now(), name, money: 0 }];
    firebaseSet(ref(db, 'players'), newPlayers);
    setNewName("");
    showToast(`✅ ${name} added`);
  }

  function removePlayer(id) {
    const newPlayers = players.filter(x => x.id !== id);
    firebaseSet(ref(db, 'players'), newPlayers);
  }

  // --- PROGRESS BAR CONTROLS ---
  function adjustBarMoney(id, delta) {
    const newBars = progressBars.map(b => 
      b.id === id ? { ...b, current: Math.max(0, parseFloat((b.current + delta).toFixed(2))) } : b
    );
    firebaseSet(ref(db, 'progressBars'), newBars);
  }

  function applyCustomBar(id, sign) {
    const val = parseFloat(barAdjustAmounts[id]);
    if (isNaN(val) || val <= 0) return;
    adjustBarMoney(id, sign * val);
    setBarAdjustAmounts(prev => ({ ...prev, [id]: "" }));
  }

  function addBar() {
    const title = newBarTitle.trim();
    const target = parseFloat(newBarTarget);
    if (!title || isNaN(target) || target <= 0) return;
    const newBars = [...progressBars, { id: Date.now(), title, current: 0, target }];
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
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    .theme-dark {
      --bg: #080a0f; --text: #e8eaf0; --text-dim: #5a6070; 
      --card-bg: rgba(255,255,255,0.035); --card-border: rgba(255,255,255,0.07);
      --input-bg: rgba(255,255,255,0.06); --orb-opacity: 0.18; --gold: #c9a84c; --gold-bg: rgba(201,168,76,0.05);
    }
    .theme-light {
      --bg: #f0f2f6; --text: #1a1d24; --text-dim: #6b7280; 
      --card-bg: #ffffff; --card-border: rgba(0,0,0,0.1);
      --input-bg: rgba(0,0,0,0.05); --orb-opacity: 0.08; --gold: #b38b22; --gold-bg: rgba(179,139,34,0.1);
    }

    body { background: var(--bg); transition: background 0.3s ease; }
    
    .app-container { min-height: 100vh; background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; overflow-x: hidden; position: relative; transition: all 0.3s ease; padding-bottom: 80px; }
    
    .bg-orbs { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
    .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: var(--orb-opacity); transition: opacity 0.3s; animation: drift 12s ease-in-out infinite alternate; }
    .orb1 { width: 500px; height: 500px; background: var(--gold); top: -150px; left: -100px; }
    .orb2 { width: 400px; height: 400px; background: #1a4fc4; bottom: -100px; right: -80px; animation-delay: -4s; }
    @keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(30px, 20px) scale(1.08); } }
    
    .wrapper { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; padding: 40px 20px; }
    
    .top-nav { display: flex; justify-content: flex-end; margin-bottom: 20px; }
    .theme-btn { background: var(--card-bg); border: 1px solid var(--card-border); color: var(--text); padding: 8px 12px; border-radius: 20px; cursor: pointer; font-size: 16px; transition: 0.2s; }
    .theme-btn:hover { transform: scale(1.05); }

    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 10vw, 72px); letter-spacing: 3px; background: linear-gradient(135deg, #f5d078 0%, var(--gold) 50%, #f5d078 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
    
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: var(--gold-bg); border: 1px solid var(--card-border); border-radius: 12px; margin-bottom: 24px; }
    .total-label { font-size: 13px; letter-spacing: 1.5px; color: var(--text-dim); text-transform: uppercase; font-weight: bold; }
    .total-val { font-family: 'Bebas Neue', sans-serif; font-size: 24px; color: var(--gold); }

    .progress-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 30px; }
    .prog-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 18px 20px; }
    .prog-header { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 12px; }
    .prog-track { background: var(--input-bg); height: 14px; border-radius: 10px; overflow: hidden; }
    .prog-fill { background: linear-gradient(90deg, var(--gold), #f5d078); height: 100%; transition: width 0.4s ease; }
    
    .board { display: flex; flex-direction: column; gap: 12px; }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; transition: 0.2s; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
    
    .rank-badge { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 26px; }
    .player-info { flex: 1; }
    .player-name { font-weight: 600; font-size: 17px; }
    .rank-label { font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-dim); }
    .money { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 1px; color: var(--gold); }
    
    .admin-controls { display: flex; flex-direction: column; gap: 8px; min-width: 160px; margin-top: 12px; border-top: 1px solid var(--card-border); padding-top: 12px; }
    .btn-row { display: flex; gap: 6px; }
    .btn { border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; padding: 6px 10px; flex: 1; transition: 0.15s; }
    .btn:hover { filter: brightness(1.1); }
    .btn-plus { background: rgba(52,200,100,0.15); color: #34c864; border: 1px solid rgba(52,200,100,0.25); }
    .btn-minus { background: rgba(220,60,60,0.15); color: #e05050; border: 1px solid rgba(220,60,60,0.25); }
    .btn-del { background: rgba(150,50,50,0.15); color: #c04040; flex: 0; padding: 6px 12px; border: 1px solid rgba(150,50,50,0.25); }
    
    .custom-row { display: flex; gap: 5px; }
    .amount-input { flex: 1; background: var(--input-bg); border: 1px solid var(--card-border); border-radius: 6px; padding: 8px; color: var(--text); outline: none; }
    .amount-input:focus { border-color: var(--gold); }
    
    .add-section { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 20px; margin-top: 24px; }
    .add-section h3 { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1px; color: var(--gold); margin-bottom: 12px; }
    .add-row { display: flex; gap: 10px; margin-bottom: 10px; }
    .btn-add { background: var(--gold); color: #000; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; border: none; transition: 0.15s; }
    .btn-add:hover { transform: scale(0.98); opacity: 0.9; }
    
    .footer-bar { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid var(--card-border); }
    .btn-unlock { background: var(--input-bg); color: var(--text-dim); border: 1px solid var(--card-border); padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: 0.2s; }
    .btn-unlock:hover { background: var(--card-border); color: var(--text); }
    
    .modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; }
    .modal { background: #111318; border: 1px solid var(--gold); border-radius: 20px; padding: 32px; width: 90%; max-width: 360px; color: #fff; }
    .modal h2 { font-family: 'Bebas Neue'; font-size: 28px; color: var(--gold); margin-bottom: 6px; }
    .pw-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; color: #fff; margin-bottom: 12px; outline: none; }
    .modal-btns { display: flex; gap: 10px; }
    .btn-confirm { flex: 1; background: var(--gold); color: #000; padding: 12px; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; }
    
    .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: #14161e; border: 1px solid #fff; border-radius: 30px; padding: 10px 22px; color: #fff; font-size: 14px; font-weight: 500; z-index: 200; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
  `;

  if (!loaded) return <div style={{ color: "#888", textAlign: "center", padding: 80, fontFamily: "sans-serif" }}>Loading Live Data...</div>;

  return (
    <div className={`app-container ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
      <style>{styles}</style>
      <div className="bg-orbs"><div className="orb orb1" /><div className="orb orb2" /></div>

      <div className="wrapper">
        <div className="top-nav">
          <button className="theme-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div className="header">
          <h1>john pork123</h1>
        </div>

        {/* TOTAL POT RESTORED */}
        <div className="total-row">
          <span className="total-label">Total Pot</span>
          <span className="total-val">${total.toFixed(2)}</span>
        </div>

        {/* PROGRESS BARS */}
        <div className="progress-list">
          {progressBars.map(bar => {
            const percent = Math.min((bar.current / bar.target) * 100, 100);
            return (
              <div key={bar.id} className="prog-card">
                <div className="prog-header">
                  <span>{bar.title}</span>
                  <span>${bar.current.toFixed(2)} / ${bar.target.toFixed(2)}</span>
                </div>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width: `${percent}%` }}></div>
                </div>

                {isAdmin && (
                  <div className="admin-controls">
                    <div className="btn-row">
                      <button className="btn btn-plus" onClick={() => adjustBarMoney(bar.id, 1)}>+$1</button>
                      <button className="btn btn-minus" onClick={() => adjustBarMoney(bar.id, -1)}>-$1</button>
                      <button className="btn btn-del" onClick={() => removeBar(bar.id)}>✕ Delete Bar</button>
                    </div>
                    <div className="custom-row">
                      <input type="number" className="amount-input" placeholder="Custom $" value={barAdjustAmounts[bar.id] || ""} onChange={e => setBarAdjustAmounts(prev => ({ ...prev, [bar.id]: e.target.value }))} />
                      <button className="btn btn-plus" onClick={() => applyCustomBar(bar.id, 1)}>+</button>
                      <button className="btn btn-minus" onClick={() => applyCustomBar(bar.id, -1)}>−</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* LEADERBOARD */}
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
                      <input type="number" className="amount-input" style={{width: '60px'}} placeholder="$0" value={adjustAmounts[player.id] || ""} onChange={e => setAdjustAmounts(prev => ({ ...prev, [player.id]: e.target.value }))} />
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

        {/* PUBLIC IMAGE DISPLAY (Shows for everyone) */}
        {imageSettings?.url && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <img 
              src={imageSettings.url} 
              alt="Leaderboard Custom" 
              style={{ width: `${imageSettings.width}%`, maxWidth: '100%', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }} 
            />
          </div>
        )}

        {/* ADMIN PANELS */}
        {isAdmin && (
          <>
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
    </div>
  );
}