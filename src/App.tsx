import React, { useState, useEffect, useRef } from 'react';

// ===========================================================================
// TYPE DEFINITIONS & MAP CONFIG
// ===========================================================================
interface Player {
  id: string;
  nickname: string;
  x: number;
  y: number;
  color: string;
  solvedPuzzles: number[];
}

interface PuzzleNode {
  id: number;
  title: string;
  x: number;
  y: number;
}

// 맵 전체 크기 (뷰포트보다 큼)
const MAP_WIDTH = 900;
const MAP_HEIGHT = 700;

// 퀴즈 노드 배치 (카메라가 이동해야 전체 노드가 보이도록 광범위 배치)
const PUZZLE_NODES: PuzzleNode[] = [
  { id: 1, title: '1. AI 31 게임', x: 150, y: 150 },
  { id: 2, title: '2. 자릿수 곱 규칙', x: 450, y: 150 },
  { id: 3, title: '3. 숫자야구 4자리', x: 750, y: 150 },
  { id: 4, title: '4. 연산 규칙 찾기', x: 150, y: 550 },
  { id: 5, title: '5. 3x3 마방진', x: 450, y: 550 },
  { id: 6, title: '6. 주관식 센스 퀴즈', x: 750, y: 550 },
];

export default function App() {
  // ---------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ---------------------------------------------------------------------------
  const [gameState, setGameState] = useState<'LOGIN' | 'WAITING' | 'PLAYING' | 'ENDED'>('LOGIN');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>('');
  
  // Player State
  const [player, setPlayer] = useState<Player>({
    id: Math.random().toString(36).substring(2, 9),
    nickname: '',
    x: 450,
    y: 350,
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
    solvedPuzzles: []
  });

  const [activePuzzleId, setActivePuzzleId] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Virtual Joystick States
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isJoystickActive, setIsJoystickActive] = useState<boolean>(false);
  const [joystickVector, setJoystickVector] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // ---------------------------------------------------------------------------
  // PUZZLE STATES
  // ---------------------------------------------------------------------------
  // P1: 31 Game
  const [game31Sum, setGame31Sum] = useState<number>(0);
  const [game31Turn, setGame31Turn] = useState<'USER' | 'AI'>('USER');
  const [game31Log, setGame31Log] = useState<string>('게임을 시작합니다. 1~3 중 선택하세요.');

  // P2, P4, P6 Inputs
  const [inputP2, setInputP2] = useState('');
  const [inputP4, setInputP4] = useState('');
  const [inputP6, setInputP6] = useState('');

  // P3: Baseball Game
  const [baseballTarget] = useState<string>(() => {
    const nums = ['0','1','2','3','4','5','6','7','8','9'];
    nums.sort(() => Math.random() - 0.5);
    return nums.slice(0, 4).join('');
  });
  const [baseballInput, setBaseballInput] = useState('');
  const [baseballHistory, setBaseballHistory] = useState<{ tryStr: string; result: string }[]>([]);

  // P5: Magic Square
  const [magicSquare, setMagicSquare] = useState<string[]>([
    '', '', '',
    '', '', '',
    '8', '1', '6'
  ]);

  // ---------------------------------------------------------------------------
  // TIMER ENGINE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  useEffect(() => {
    if (player.solvedPuzzles.length === 6 && gameState === 'PLAYING') {
      setGameState('ENDED');
    }
  }, [player.solvedPuzzles, gameState]);

  // ---------------------------------------------------------------------------
  // GAME LOOP & JOYSTICK MOVEMENT ENGINE
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const gameLoop = setInterval(() => {
      if (joystickVector.x !== 0 || joystickVector.y !== 0) {
        setPlayer((prev) => {
          const speed = 4;
          const newX = Math.max(25, Math.min(MAP_WIDTH - 25, prev.x + joystickVector.x * speed));
          const newY = Math.max(25, Math.min(MAP_HEIGHT - 25, prev.y + joystickVector.y * speed));

          // Check collision with puzzle nodes
          PUZZLE_NODES.forEach((node) => {
            const dist = Math.hypot(node.x - newX, node.y - newY);
            if (dist < 35 && !prev.solvedPuzzles.includes(node.id)) {
              setActivePuzzleId(node.id);
            }
          });

          return { ...prev, x: newX, y: newY };
        });
      }
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [joystickVector, gameState]);

  // Virtual Joystick Event Handlers
  const handleJoystickStart = () => setIsJoystickActive(true);
  
  const handleJoystickMove = (clientX: number, clientY: number) => {
    if (!isJoystickActive || !joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);
    const maxRadius = rect.width / 2;

    if (distance === 0) {
      setJoystickVector({ x: 0, y: 0 });
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      const intensity = Math.min(distance / maxRadius, 1);
      setJoystickVector({
        x: Math.cos(angle) * intensity,
        y: Math.sin(angle) * intensity
      });
    }
  };

  const handleJoystickEnd = () => {
    setIsJoystickActive(false);
    setJoystickVector({ x: 0, y: 0 });
  };

  // ---------------------------------------------------------------------------
  // PUZZLE LOGIC HANDLERS
  // ---------------------------------------------------------------------------
  const markPuzzleSolved = (id: number) => {
    if (!player.solvedPuzzles.includes(id)) {
      setPlayer((prev) => ({
        ...prev,
        solvedPuzzles: [...prev.solvedPuzzles, id]
      }));
    }
    setActivePuzzleId(null);
  };

  // P1: AI 31 Game
  const handle31UserMove = (num: number) => {
    const nextSum = game31Sum + num;
    if (nextSum >= 31) {
      setGame31Log(`31을 도달했습니다! 패배했습니다. 다시 시도하세요.`);
      setGame31Sum(0);
      return;
    }

    setGame31Sum(nextSum);
    setGame31Log(`당신: +${num} (현재 ${nextSum})`);
    setGame31Turn('AI');

    setTimeout(() => {
      const remainder = nextSum % 4;
      let aiMove = (3 - remainder + 4) % 4;
      if (aiMove === 0) aiMove = 1;
      const aiNextSum = nextSum + aiMove;

      if (aiNextSum >= 31) {
        setGame31Log(`AI가 31을 넘었습니다! 승리했습니다!`);
        markPuzzleSolved(1);
      } else {
        setGame31Sum(aiNextSum);
        setGame31Log(`AI: +${aiMove} (현재 ${aiNextSum})`);
        setGame31Turn('USER');
      }
    }, 700);
  };

  // P3: Baseball Game
  const handleBaseballSubmit = () => {
    if (baseballInput.length !== 4) return;
    let strike = 0;
    let ball = 0;

    for (let i = 0; i < 4; i++) {
      if (baseballInput[i] === baseballTarget[i]) {
        strike++;
      } else if (baseballTarget.includes(baseballInput[i])) {
        ball++;
      }
    }

    const resultStr = strike === 4 ? '4 Strike! 승리!' : `${strike}S ${ball}B`;
    const newHistory = [...baseballHistory, { tryStr: baseballInput, result: resultStr }];
    setBaseballHistory(newHistory);
    setBaseballInput('');

    if (strike === 4) {
      markPuzzleSolved(3);
    } else if (newHistory.length >= 10) {
      alert('10회 시도 실패! 정답판이 초기화됩니다.');
      setBaseballHistory([]);
    }
  };

  // P5: Magic Square
  const handleMagicSquareSubmit = () => {
    const grid = magicSquare.map(Number);
    const targetAnswer = [4, 9, 2, 3, 5, 7, 8, 1, 6];
    const isCorrect = grid.every((val, idx) => val === targetAnswer[idx]);

    if (isCorrect) {
      alert('마방진 완성을 축하합니다!');
      markPuzzleSolved(5);
    } else {
      alert('마방진 규칙이 맞지 않습니다. (모든 가로/세로/대각선 합 = 15)');
    }
  };

  // ---------------------------------------------------------------------------
  // ADMIN AUTH HANDLER
  // ---------------------------------------------------------------------------
  const handleAdminAuth = () => {
    if (adminPinInput === '2580') {
      setIsAdmin(true);
      setShowAdminPinModal(false);
      setGameState('WAITING');
    } else {
      alert('비밀번호가 올바르지 않습니다! (힌트: 2580)');
      setAdminPinInput('');
    }
  };

  // ---------------------------------------------------------------------------
  // RENDER: LOGIN & WAITING
  // ---------------------------------------------------------------------------
  if (gameState === 'LOGIN') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={{ color: '#38bdf8', margin: '0 0 10px 0' }}>🎮 Math Escape</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>대기방 입장을 위한 닉네임을 입력하세요.</p>
          <input
            type="text"
            placeholder="닉네임 입력"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button
              onClick={() => {
                if (!nickname) return alert('닉네임을 입력하세요!');
                setPlayer({ ...player, nickname });
                setGameState('WAITING');
              }}
              style={{ ...btnStyle, backgroundColor: '#0284c7', flex: 1 }}
            >
              참가자로 입장
            </button>
            <button
              onClick={() => setShowAdminPinModal(true)}
              style={{ ...btnStyle, backgroundColor: '#475569', flex: 1 }}
            >
              관리자로 입장
            </button>
          </div>
        </div>

        {/* Admin PIN Verification Modal */}
        {showAdminPinModal && (
          <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
              <h3>🔒 관리자 인증</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>관리자 암호를 입력하세요.</p>
              <input
                type="password"
                placeholder="비밀번호 입력"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={handleAdminAuth} style={{ ...btnStyle, backgroundColor: '#22c55e', flex: 1 }}>
                  확인
                </button>
                <button onClick={() => setShowAdminPinModal(false)} style={{ ...btnStyle, backgroundColor: '#64748b', flex: 1 }}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'WAITING') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{ color: '#38bdf8' }}>⏳ 게임 대기실</h2>
          <p>접속자: <strong>{player.nickname || '관리자'}</strong></p>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>모든 참가자가 준비되면 관리자가 시작합니다.</p>
          
          {isAdmin ? (
            <button
              onClick={() => setGameState('PLAYING')}
              style={{ ...btnStyle, backgroundColor: '#22c55e', width: '100%', marginTop: '20px' }}
            >
              🚀 전체 게임 동시 시작 (관리자)
            </button>
          ) : (
            <p style={{ color: '#f59e0b', marginTop: '20px' }}>관리자의 시작 명령을 기다리는 중...</p>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: METAVERSE FIELD WITH CAMERA FOLLOWING & JOYSTICK
  // ---------------------------------------------------------------------------
  // Viewport Size Fixed for Mobile HUD
  const VIEWPORT_WIDTH = 360;
  const VIEWPORT_HEIGHT = 380;

  // Camera Translation Offsets (Keep player centered)
  const cameraX = Math.min(0, Math.max(VIEWPORT_WIDTH - MAP_WIDTH, VIEWPORT_WIDTH / 2 - player.x));
  const cameraY = Math.min(0, Math.max(VIEWPORT_HEIGHT - MAP_HEIGHT, VIEWPORT_HEIGHT / 2 - player.y));

  return (
    <div style={containerStyle}>
      <div style={{ width: '100%', maxWidth: `${VIEWPORT_WIDTH}px` }}>
        {/* Header HUD */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#fff', fontSize: '0.85rem' }}>
          <div>👤 {player.nickname}</div>
          <div>⏱️ {timer}초</div>
          <div>🔑 {player.solvedPuzzles.length} / 6</div>
        </div>

        {/* Viewport Frame with Camera Transform Layer */}
        <div style={{
          width: `${VIEWPORT_WIDTH}px`, height: `${VIEWPORT_HEIGHT}px`,
          backgroundColor: '#0f172a', borderRadius: '12px', border: '2px solid #334155',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* Map Layer (Translates with Camera Movement) */}
          <div style={{
            width: `${MAP_WIDTH}px`, height: `${MAP_HEIGHT}px`,
            backgroundColor: '#1e293b', position: 'absolute',
            transform: `translate3d(${cameraX}px, ${cameraY}px, 0)`,
            transition: 'transform 0.05s linear',
            backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
            {/* Puzzle Nodes */}
            {PUZZLE_NODES.map((node) => {
              const isSolved = player.solvedPuzzles.includes(node.id);
              return (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute', left: `${node.x - 25}px`, top: `${node.y - 25}px`,
                    width: '50px', height: '50px', borderRadius: '50%',
                    backgroundColor: isSolved ? '#22c55e' : '#0284c7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 'bold', color: '#fff',
                    border: '2px solid #fff', boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                  }}
                >
                  {node.id}번
                </div>
              );
            })}

            {/* User Avatar */}
            <div style={{
              position: 'absolute', left: `${player.x - 15}px`, top: `${player.y - 15}px`,
              width: '30px', height: '30px', borderRadius: '50%',
              backgroundColor: player.color, border: '3px solid #fff',
              boxShadow: '0 0 12px #38bdf8', zIndex: 10
            }} />
          </div>
        </div>

        {/* Touch Virtual Analog Joystick */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
          <div
            ref={joystickRef}
            onMouseDown={handleJoystickStart}
            onMouseMove={(e) => handleJoystickMove(e.clientX, e.clientY)}
            onMouseUp={handleJoystickEnd}
            onMouseLeave={handleJoystickEnd}
            onTouchStart={handleJoystickStart}
            onTouchMove={(e) => handleJoystickMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleJoystickEnd}
            style={{
              width: '100px', height: '100px', borderRadius: '50%',
              backgroundColor: 'rgba(51, 65, 85, 0.8)', border: '2px solid #64748b',
              position: 'relative', touchAction: 'none', cursor: 'pointer'
            }}
          >
            {/* Knob */}
            <div
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                backgroundColor: '#38bdf8', position: 'absolute',
                top: `${30 + joystickVector.y * 30}px`,
                left: `${30 + joystickVector.x * 30}px`,
                boxShadow: '0 0 8px #38bdf8', transition: isJoystickActive ? 'none' : 'all 0.15s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* PUZZLE MODALS */}
      {/* ----------------------------------------------------------------------- */}
      {activePuzzleId && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            {/* Puzzle 1 */}
            {activePuzzleId === 1 && (
              <div>
                <h3>🎮 1. AI 31 게임</h3>
                <p>현재 합계: <strong style={{ fontSize: '1.5rem', color: '#38bdf8' }}>{game31Sum}</strong></p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{game31Log}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      disabled={game31Turn !== 'USER'}
                      onClick={() => handle31UserMove(num)}
                      style={{ ...btnStyle, backgroundColor: '#0284c7', flex: 1 }}
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Puzzle 2 */}
            {activePuzzleId === 2 && (
              <div>
                <h3>🧩 2. 규칙 찾기</h3>
                <p>973, 189, ??, 14, 4</p>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>??에 들어갈 숫자는?</p>
                <input type="number" value={inputP2} onChange={(e) => setInputP2(e.target.value)} style={inputStyle} />
                <button
                  onClick={() => {
                    if (inputP2.trim() === '72') markPuzzleSolved(2);
                    else alert('오답입니다!');
                  }}
                  style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%', marginTop: '10px' }}
                >
                  제출
                </button>
              </div>
            )}

            {/* Puzzle 3 */}
            {activePuzzleId === 3 && (
              <div>
                <h3>⚾ 3. 숫자야구 (4자리)</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>0~9 중 서로 다른 4자리 숫자를 맞히세요.</p>
                <input
                  type="text"
                  maxLength={4}
                  value={baseballInput}
                  onChange={(e) => setBaseballInput(e.target.value)}
                  placeholder="예: 0123"
                  style={inputStyle}
                />
                <button onClick={handleBaseballSubmit} style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%', marginTop: '10px' }}>
                  제출
                </button>
                <div style={{ maxHeight: '90px', overflowY: 'auto', marginTop: '10px', fontSize: '0.85rem' }}>
                  {baseballHistory.map((h, i) => (
                    <div key={i}>{i + 1}회: {h.tryStr} ➔ {h.result}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Puzzle 4 */}
            {activePuzzleId === 4 && (
              <div>
                <h3>📐 4. 연산 규칙 찾기</h3>
                <p>11×11 = 4<br />22×22 = 16<br />33×33 = 36<br />44×44 = ??</p>
                <input type="number" value={inputP4} onChange={(e) => setInputP4(e.target.value)} style={inputStyle} />
                <button
                  onClick={() => {
                    if (inputP4.trim() === '64') markPuzzleSolved(4);
                    else alert('오답입니다!');
                  }}
                  style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%', marginTop: '10px' }}
                >
                  제출
                </button>
              </div>
            )}

            {/* Puzzle 5 */}
            {activePuzzleId === 5 && (
              <div>
                <h3>🔳 5. 3x3 마방진 완성</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>가로/세로/대각선 합이 15가 되도록 입력하세요.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', margin: '10px 0' }}>
                  {magicSquare.map((val, idx) => (
                    <input
                      key={idx}
                      type="number"
                      disabled={idx >= 6}
                      value={val}
                      onChange={(e) => {
                        const newGrid = [...magicSquare];
                        newGrid[idx] = e.target.value;
                        setMagicSquare(newGrid);
                      }}
                      style={{ ...inputStyle, textAlign: 'center', fontWeight: 'bold' }}
                    />
                  ))}
                </div>
                <button onClick={handleMagicSquareSubmit} style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%' }}>
                  검증 및 제출
                </button>
              </div>
            )}

            {/* Puzzle 6 */}
            {activePuzzleId === 6 && (
              <div>
                <h3>❓ 6. 주관식 센스 퀴즈</h3>
                <p>5는 0을 이기고,<br />0은 2를 이기고,<br />2는 5를 이기는 것은?</p>
                <input type="text" value={inputP6} onChange={(e) => setInputP6(e.target.value)} placeholder="정답 입력" style={inputStyle} />
                <button
                  onClick={() => {
                    if (inputP6.trim().replace(/\s+/g, '') === '가위바위보') markPuzzleSolved(6);
                    else alert('오답입니다!');
                  }}
                  style={{ ...btnStyle, backgroundColor: '#0284c7', width: '100%', marginTop: '10px' }}
                >
                  제출
                </button>
              </div>
            )}

            <button onClick={() => setActivePuzzleId(null)} style={{ ...btnStyle, backgroundColor: '#475569', width: '100%', marginTop: '10px' }}>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------- */}
      {/* FINAL ENDED SCREEN */}
      {/* ----------------------------------------------------------------------- */}
      {gameState === 'ENDED' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h1 style={{ color: '#22c55e', margin: '0 0 10px 0' }}>🎉 탈출 성공!</h1>
            <p>참가자: <strong>{player.nickname}</strong></p>
            <p>최종 기록: <strong style={{ color: '#38bdf8' }}>{timer}초</strong></p>
            <button
              onClick={() => {
                setGameState('LOGIN');
                setPlayer({ ...player, solvedPuzzles: [] });
              }}
              style={{ ...btnStyle, backgroundColor: '#22c55e', width: '100%', marginTop: '15px' }}
            >
              다시 도전하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const containerStyle: React.CSSProperties = {
  minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff',
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', fontFamily: 'sans-serif'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center', maxWidth: '360px', width: '100%'
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff', marginTop: '8px', boxSizing: 'border-box'
};

const btnStyle: React.CSSProperties = {
  padding: '10px 15px', borderRadius: '6px', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer'
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #475569', maxWidth: '340px', width: '100%'
};