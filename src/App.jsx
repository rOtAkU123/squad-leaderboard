import { useState, useEffect, useRef } from "react";
import { ref, onValue, set as firebaseSet } from "firebase/database";
import { db } from "./firebase"; // Importing our database
import { Analytics } from '@vercel/analytics/react';

const ADMIN_PASSWORD = "boss2024";
const DEFAULT_PLAYERS =[
  { id: 1, name: "Aidan", money: 10.00 },
  { id: 2, name: "Maga", money: 8.00 },
  { id: 3, name: "Seyha", money: 5.05 },
  { id: 4, name: "Ayman", money: 5.04 },
  { id: 5, name: "Veasna", money: 5.00 },
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
  const[players, setPlayers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const[newName, setNewName] = useState("");
  const [adjustAmounts, setAdjustAmounts] = useState({});
  const[loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState(null);
  const[shakeId, setShakeId] = useState(null);
  const toastRef = useRef(null);

  // Load LIVE from Firebase Database
  useEffect(() => {
    const playersRef = ref(db, 'players');
    const unsubscribe = onValue(playersRef, (snapshot) => {
      if (snapshot.exists()) {
        setPlayers(snapshot.val());
      } else {
        // First time ever loading, save defaults to Firebase
        firebaseSet(playersRef, DEFAULT_PLAYERS);
        setPlayers(DEFAULT_PLAYERS);
      }
      setLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const sorted = [...players].sort((a, b) => b.money - a.money);

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

  // Live Firebase Save Functions
  function adjustMoney(id, delta) {
    const newPlayers = players.map(p => 
      p.id === id ? { ...p, money: Math.max(0, parseFloat((p.money + delta).toFixed(2))) } : p
    );
    firebaseSet(ref(db, 'players'), newPlayers); // Saves instantly
  }

  function applyCustom(id, sign) {
    const val = parseFloat(adjustAmounts[id]);
    if (isNaN(val) || val <= 0) {
      setShakeId(id);
      setTimeout(() => setShakeId(null), 400);
      return;
    }
    adjustMoney(id, sign * val);
    setAdjustAmounts(prev => ({ ...prev, [id]: "" }));
    showToast(`${sign > 0 ? "+" : "-"}$${val.toFixed(2)} applied`);
  }

  function addPlayer() {
    const name = newName.trim();
    if (!name) return;
    if (players.find(p => p.name.toLowerCase() === name.toLowerCase())) {
      showToast("Name already exists", "error");
      return;
    }
    const newId = Date.now();
    const newPlayers =[...players, { id: newId, name, money: 0 }];
    firebaseSet(ref(db, 'players'), newPlayers);
    setNewName("");
    showToast(`✅ ${name} added to the board`);
  }

  function removePlayer(id) {
    const p = players.find(x => x.id === id);
    const newPlayers = players.filter(x => x.id !== id);
    firebaseSet(ref(db, 'players'), newPlayers);
    showToast(`🗑️ ${p?.name} removed`, "warn");
  }

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080a0f; font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }
    .bg-orbs { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
    .orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18; animation: drift 12s ease-in-out infinite alternate; }
    .orb1 { width: 500px; height: 500px; background: #c9a84c; top: -150px; left: -100px; animation-delay: 0s; }
    .orb2 { width: 400px; height: 400px; background: #1a4fc4; bottom: -100px; right: -80px; animation-delay: -4s; }
    .orb3 { width: 300px; height: 300px; background: #c9a84c; top: 40%; left: 50%; animation-delay: -8s; }
    @keyframes drift { from { transform: translate(0, 0) scale(1); } to { transform: translate(30px, 20px) scale(1.08); } }
    .wrapper { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; padding: 40px 20px 80px; animation: fadeUp 0.6s ease both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .header { text-align: center; margin-bottom: 36px; }
    .header-crown { font-size: 48px; display: block; margin-bottom: 8px; animation: bounce 2.4s ease-in-out infinite; }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    .header h1 { font-family: 'Bebas Neue', sans-serif; font-size: clamp(36px, 8vw, 60px); letter-spacing: 3px; background: linear-gradient(135deg, #f5d078 0%, #c9a84c 50%, #f5d078 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1; }
    .header p { color: #5a6070; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px; }
    .board { display: flex; flex-direction: column; gap: 12px; }
    .card { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 16px; transition: transform 0.2s ease, box-shadow 0.2s ease; position: relative; overflow: hidden; animation: cardIn 0.4s ease both; }
    @keyframes cardIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }
    .card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    .card.rank-1 { border-color: rgba(201, 168, 76, 0.4); background: rgba(201,168,76,0.06); }
    .card.rank-2 { border-color: rgba(180, 190, 200, 0.3); background: rgba(180,190,200,0.04); }
    .card.rank-3 { border-color: rgba(176, 120, 70, 0.3); background: rgba(176,120,70,0.04); }
    .rank-badge { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
    .rank-num { font-family: 'Bebas Neue', sans-serif; font-size: 13px; color: #3a4050; letter-spacing: 1px; width: 20px; text-align: center; flex-shrink: 0; }
    .player-info { flex: 1; min-width: 0; }
    .player-name { font-weight: 600; font-size: 17px; color: #e8eaf0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .rank-label { font-size: 10px; font-weight: 500; letter-spacing: 1.5px; text-transform: uppercase; color: #4a5060; margin-top: 2px; }
    .rank-1 .rank-label { color: #c9a84c; }
    .rank-2 .rank-label { color: #8090a0; }
    .rank-3 .rank-label { color: #a07850; }
    .money { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 1px; color: #e8eaf0; }
    .rank-1 .money { color: #f0c040; }
    .admin-controls { display: flex; flex-direction: column; gap: 8px; min-width: 160px; }
    .btn-row { display: flex; gap: 6px; }
    .btn { border: none; border-radius: 8px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 13px; transition: all 0.15s ease; display: flex; align-items: center; justify-content: center; }
    .btn-sm { padding: 6px 10px; flex: 1; }
    .btn-plus { background: rgba(52,200,100,0.15); color: #34c864; border: 1px solid rgba(52,200,100,0.25); }
    .btn-plus:hover { background: rgba(52,200,100,0.28); }
    .btn-minus { background: rgba(220,60,60,0.15); color: #e05050; border: 1px solid rgba(220,60,60,0.25); }
    .btn-minus:hover { background: rgba(220,60,60,0.28); }
    .btn-del { background: rgba(150,50,50,0.15); color: #c04040; border: 1px solid rgba(150,50,50,0.2); padding: 5px 8px; border-radius: 6px; font-size: 14px; }
    .btn-del:hover { background: rgba(150,50,50,0.3); }
    .btn-apply-plus { background: rgba(52,200,100,0.12); color: #34c864; border: 1px solid rgba(52,200,100,0.2); padding: 5px 10px; border-radius: 6px; font-size: 12px; }
    .btn-apply-plus:hover { background: rgba(52,200,100,0.25); }
    .btn-apply-minus { background: rgba(220,60,60,0.12); color: #e05050; border: 1px solid rgba(220,60,60,0.2); padding: 5px 10px; border-radius: 6px; font-size: 12px; }
    .btn-apply-minus:hover { background: rgba(220,60,60,0.25); }
    .custom-row { display: flex; gap: 5px; align-items: center; }
    .amount-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 5px 8px; color: #e0e0e0; font-family: 'DM Sans', sans-serif; font-size: 13px; width: 70px; outline: none; }
    .amount-input:focus { border-color: rgba(201,168,76,0.5); }
    .amount-input.shake { animation: shake 0.4s ease; border-color: rgba(220,60,60,0.6) !important; }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
    .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 24px 0; }
    .add-section { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; }
    .add-section h3 { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 2px; color: #c9a84c; margin-bottom: 12px; }
    .add-row { display: flex; gap: 10px; }
    .name-input { flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; color: #e0e0e0; font-size: 15px; font-family: 'DM Sans', sans-serif; outline: none; }
    .name-input:focus { border-color: rgba(201,168,76,0.5); }
    .name-input::placeholder { color: #3a4050; }
    .btn-add { background: linear-gradient(135deg, #c9a84c, #f0c040); color: #0a0c10; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 14px; white-space: nowrap; }
    .btn-add:hover { opacity: 0.88; transform: scale(0.98); }
    .footer-bar { display: flex; align-items: center; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
    .admin-badge { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #c9a84c; letter-spacing: 1px; }
    .admin-dot { width: 8px; height: 8px; border-radius: 50%; background: #c9a84c; animation: pulse 2s ease-in-out infinite; }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
    .btn-lock { background: rgba(201,168,76,0.1); color: #c9a84c; border: 1px solid rgba(201,168,76,0.25); padding: 8px 16px; border-radius: 8px; font-size: 13px; }
    .btn-lock:hover { background: rgba(201,168,76,0.2); }
    .btn-unlock { background: rgba(255,255,255,0.06); color: #5a6070; border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 8px; font-size: 13px; }
    .btn-unlock:hover { background: rgba(255,255,255,0.1); color: #9aa0b0; }
    .view-badge { font-size: 12px; color: #3a4050; letter-spacing: 1px; }
    .modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; }
    .modal { background: #111318; border: 1px solid rgba(201,168,76,0.3); border-radius: 20px; padding: 32px; width: 90%; max-width: 360px; animation: modalIn 0.25s ease; }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.94) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .modal h2 { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 2px; color: #c9a84c; margin-bottom: 6px; }
    .modal p { color: #4a5060; font-size: 13px; margin-bottom: 20px; }
    .pw-input { width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 16px; color: #e0e0e0; font-size: 16px; font-family: 'DM Sans', sans-serif; outline: none; margin-bottom: 12px; }
    .pw-input:focus { border-color: rgba(201,168,76,0.5); }
    .pw-input.error { border-color: rgba(220,60,60,0.6); animation: shake 0.4s ease; }
    .modal-btns { display: flex; gap: 10px; }
    .btn-confirm { flex: 1; background: linear-gradient(135deg, #c9a84c, #f0c040); color: #0a0c10; padding: 12px; border-radius: 10px; font-weight: 700; font-size: 15px; }
    .btn-confirm:hover { opacity: 0.88; }
    .btn-cancel { background: rgba(255,255,255,0.06); color: #5a6070; border: 1px solid rgba(255,255,255,0.1); padding: 12px 18px; border-radius: 10px; font-size: 14px; }
    .btn-cancel:hover { background: rgba(255,255,255,0.1); }
    .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: rgba(20,22,30,0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 30px; padding: 10px 22px; color: #e0e0e0; font-size: 14px; font-weight: 500; z-index: 200; white-space: nowrap; animation: toastIn 0.3s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
    .toast.success { border-color: rgba(52,200,100,0.3); }
    .toast.error { border-color: rgba(220,60,60,0.3); color: #e05050; }
    .toast.warn { border-color: rgba(201,168,76,0.3); color: #c9a84c; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    .total-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; background: rgba(201,168,76,0.05); border: 1px solid rgba(201,168,76,0.15); border-radius: 12px; margin-bottom: 16px; }
    .total-label { font-size: 13px; letter-spacing: 1.5px; color: #7a8090; text-transform: uppercase; }
    .total-val { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #c9a84c; }
  `;

  const total = players.reduce((s, p) => s + p.money, 0);

  if (!loaded) return <div style={{ color: "#5a6070", textAlign: "center", padding: 80, fontFamily: "sans-serif" }}>Loading Live Data...</div>;

  return (
    <>
      <style>{styles}</style>
      <div className="bg-orbs">
        <div className="orb orb1" /><div className="orb orb2" /><div className="orb orb3" />
      </div>

      <div className="wrapper">
        <div className="header">
          <span className="header-crown">👑</span>
          <h1>SQUAD LEADERBOARD</h1>
          <p>Who's got the bag • Who's going broke</p>
        </div>

        <div className="total-row">
          <span className="total-label">Total Pot</span>
          <span className="total-val">${total.toFixed(2)}</span>
        </div>

        <div className="board">
          {sorted.map((player, idx) => {
            const rank = idx + 1;
            const emoji = getRankEmoji(rank);
            const label = getRankLabel(rank);
            return (
              <div key={player.id} className={`card rank-${Math.min(rank, 4)}`} style={{ animationDelay: `${idx * 0.07}s` }}>
                <span className="rank-num">#{rank}</span>
                <div className="rank-badge">{emoji}</div>
                <div className="player-info">
                  <div className="player-name">{player.name}</div>
                  <div className="rank-label">{label}</div>
                </div>
                <div className="money">${player.money.toFixed(2)}</div>

                {isAdmin && (
                  <div className="admin-controls">
                    <div className="btn-row">
                      <button className="btn btn-sm btn-plus" onClick={() => { adjustMoney(player.id, 1); showToast(`+$1 → ${player.name}`); }}>+$1</button>
                      <button className="btn btn-sm btn-minus" onClick={() => { adjustMoney(player.id, -1); showToast(`-$1 → ${player.name}`); }}>-$1</button>
                      <button className="btn btn-del" onClick={() => removePlayer(player.id)}>✕</button>
                    </div>
                    <div className="custom-row">
                      <input type="number" className={`amount-input ${shakeId === player.id ? "shake" : ""}`} placeholder="$0.00" value={adjustAmounts[player.id] || ""} onChange={e => setAdjustAmounts(prev => ({ ...prev, [player.id]: e.target.value }))} onKeyDown={e => { if (e.key === "Enter") applyCustom(player.id, 1); }} min="0" />
                      <button className="btn btn-apply-plus" onClick={() => applyCustom(player.id, 1)}>+</button>
                      <button className="btn btn-apply-minus" onClick={() => applyCustom(player.id, -1)}>−</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isAdmin && (
          <>
            <div className="divider" />
            <div className="add-section">
              <h3>➕ Add New Member</h3>
              <div className="add-row">
                <input className="name-input" placeholder="Enter name..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addPlayer(); }} />
                <button className="btn btn-add" onClick={addPlayer}>ADD</button>
              </div>
            </div>
          </>
        )}

        <div className="footer-bar">
          {isAdmin ? (
            <>
              <div className="admin-badge"><div className="admin-dot" />ADMIN MODE</div>
              <button className="btn btn-lock" onClick={() => { setIsAdmin(false); showToast("🔒 Locked", "warn"); }}>🔒 Lock</button>
            </>
          ) : (
            <>
              <div className="view-badge">👁 VIEW ONLY</div>
              <button className="btn btn-unlock" onClick={() => setShowLogin(true)}>🔑 Admin</button>
            </>
          )}
        </div>
      </div>

      {showLogin && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowLogin(false); setPwInput(""); setPwError(false); } }}>
          <div className="modal">
            <h2>🔐 Admin Access</h2>
            <p>Enter the password to unlock editing</p>
            <input type="password" className={`pw-input ${pwError ? "error" : ""}`} placeholder="Password..." value={pwInput} onChange={e => setPwInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleLogin(); }} autoFocus />
            <div className="modal-btns">
              <button className="btn btn-confirm" onClick={handleLogin}>UNLOCK</button>
              <button className="btn btn-cancel" onClick={() => { setShowLogin(false); setPwInput(""); setPwError(false); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      <Analytics />
    </>
  );
}