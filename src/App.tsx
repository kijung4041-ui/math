import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// 퍼즐 데이터 및 정답 정의
// ---------------------------------------------------------------------------
interface Puzzle {
  id: number;
  title: string;
  description: string;
  question: string;
  hint: string;
  answer: string;
  keyFragment: string;
}

const PUZZLES: Puzzle[] = [
  {
    id: 1,
    title: "Puzzle 1: Basking 31 AI Chamber",
    description: "게임이론 및 모듈로 연산",
    question: "AI와 1~3씩 더하며 31을 만드는 게임입니다. 상대가 무조건 이기는 필승 전략의 핵심 나머지는 4로 나눈 나머지 얼마일까요? (힌트: 31을 4로 나눈 나머지)",
    hint: "31 ÷ 4 = 7... 나머지 ?",
    answer: "3",
    keyFragment: "M"
  },
  {
    id: 2,
    title: "Puzzle 2: Euler's Polyhedron Chamber",
    description: "오일러 다면체 정리",
    question: "구와 위상적으로 같은 모든 입체도형에서 (꼭짓점 수 V) - (모서리 수 E) + (면의 수 F)의 값은 항상 일정합니다. 이 값은 얼마일까요?",
    hint: "정육면체: V=8, E=12, F=6 -> 8 - 12 + 6 = ?",
    answer: "2",
    keyFragment: "A"
  },
  {
    id: 3,
    title: "Puzzle 3: Caesar Cipher Vault",
    description: "시저 암호 해독",
    question: "암호문 'MATH'를 오른쪽으로 3칸 이동(Shift +3)시켜 암호화하려고 합니다. 첫 번째 글자 'M'은 어떤 알파벳으로 변할까요?",
    hint: "M -> N(1) -> O(2) -> ?(3)",
    answer: "P",
    keyFragment: "T"
  },
  {
    id: 4,
    title: "Puzzle 4: Pythagorean Gate",
    description: "피타고라스 정리",
    question: "직각삼각형의 두 변의 길이가 각각 3과 4일 때, 빗변의 길이 x는 얼마일까요? (3² + 4² = x²)",
    hint: "9 + 16 = 25 = x²",
    answer: "5",
    keyFragment: "H"
  },
  {
    id: 5,
    title: "Puzzle 5: Fibonacci Sequence",
    description: "피보나치 수열 패턴",
    question: "수열 1, 1, 2, 3, 5, 8, 13, ? 에서 빈칸에 들어갈 다음 숫자는 무엇일까요?",
    hint: "앞의 두 수를 더하면 다음 수가 됩니다 (8 + 13)",
    answer: "21",
    keyFragment: "!"
  },
  {
    id: 6,
    title: "Puzzle 6: System of Equations",
    description: "연립방정식 풀이",
    question: "x + y = 10, x - y = 4 일 때, x의 값은 얼마일까요?",
    hint: "두 식을 더하면 2x = 14 가 됩니다.",
    answer: "7",
    keyFragment: "7"
  }
];

export default function App() {
  const [solvedPuzzles, setSolvedPuzzles] = useState<number[]>([]);
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isEscaped, setIsEscaped] = useState<boolean>(false);

  // 퍼즐 모달 열기
  const openPuzzle = (puzzle: Puzzle) => {
    setActivePuzzle(puzzle);
    setUserInput('');
    setFeedback(null);
  };

  // 정답 제출 확인
  const handleSubmitAnswer = () => {
    if (!activePuzzle) return;

    const sanitizedInput = userInput.trim().toUpperCase();
    if (sanitizedInput === activePuzzle.answer.toUpperCase()) {
      if (!solvedPuzzles.includes(activePuzzle.id)) {
        setSolvedPuzzles([...solvedPuzzles, activePuzzle.id]);
      }
      setFeedback({ message: `정답입니다! 열쇠 조각 [ ${activePuzzle.keyFragment} ] 을(를) 획득했습니다.`, isError: false });
      setTimeout(() => {
        setActivePuzzle(null);
      }, 1500);
    } else {
      setFeedback({ message: "오답입니다. 다시 시도해 보세요!", isError: true });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem 1rem',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.25rem', color: '#38bdf8', marginBottom: '0.5rem', fontWeight: 'bold' }}>
          🔐 Math Escape: The Cipher Chamber
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.1rem' }}>
          수학적 사고력을 활용하여 6개의 암호를 해독하고 방을 탈출하세요!
        </p>

        {/* 수집한 열쇠 현황 */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
            🔑 수집한 열쇠 조각: <span style={{ color: '#38bdf8' }}>{solvedPuzzles.length}</span> / 6
          </h2>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'center',
            marginTop: '1rem'
          }}>
            {PUZZLES.map((p) => {
              const isSolved = solvedPuzzles.includes(p.id);
              return (
                <div key={p.id} style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  backgroundColor: isSolved ? '#0284c7' : '#334155',
                  color: isSolved ? '#ffffff' : '#64748b',
                  border: isSolved ? '2px solid #38bdf8' : 'none'
                }}>
                  {isSolved ? p.keyFragment : '?'}
                </div>
              );
            })}
          </div>

          {solvedPuzzles.length === 6 && !isEscaped && (
            <button
              onClick={() => setIsEscaped(true)}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 2rem',
                backgroundColor: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🎉 모든 열쇠 수집 완료! 탈출하기
            </button>
          )}
        </div>

        {/* 퍼즐 카드 목록 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          textAlign: 'left'
        }}>
          {PUZZLES.map((puzzle) => {
            const isSolved = solvedPuzzles.includes(puzzle.id);
            return (
              <div key={puzzle.id} style={{
                backgroundColor: '#1e293b',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                border: isSolved ? '1px solid #0284c7' : '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: isSolved ? '#38bdf8' : '#f1f5f9', marginBottom: '0.5rem' }}>
                    {puzzle.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    {puzzle.description}
                  </p>
                </div>
                <button
                  onClick={() => openPuzzle(puzzle)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    backgroundColor: isSolved ? '#334155' : '#0284c7',
                    color: isSolved ? '#94a3b8' : '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {isSolved ? '다시 보기' : '퍼즐 풀기'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 퍼즐 문제 모달 (팝업) */}
      {activePuzzle && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            padding: '2rem',
            borderRadius: '1rem',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #475569'
          }}>
            <h2 style={{ color: '#38bdf8', marginTop: 0 }}>{activePuzzle.title}</h2>
            <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#f8fafc' }}>{activePuzzle.question}</p>
            <p style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>💡 힌트: {activePuzzle.hint}</p>

            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="정답을 입력하세요"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid #475569',
                backgroundColor: '#0f172a',
                color: '#fff',
                fontSize: '1rem',
                marginTop: '1rem',
                boxSizing: 'border-box'
              }}
            />

            {feedback && (
              <p style={{
                marginTop: '1rem',
                fontWeight: 'bold',
                color: feedback.isError ? '#f87171' : '#4ade80'
              }}>
                {feedback.message}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                onClick={handleSubmitAnswer}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                정답 제출
              </button>
              <button
                onClick={() => setActivePuzzle(null)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#475569',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 최종 탈출 성공 모달 */}
      {isEscaped && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            padding: '2.5rem',
            borderRadius: '1rem',
            maxWidth: '450px',
            width: '100%',
            textAlign: 'center',
            border: '2px solid #22c55e'
          }}>
            <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>🏆</h1>
            <h2 style={{ color: '#22c55e', marginTop: 0 }}>방탈출 성공!</h2>
            <p style={{ color: '#e2e8f0', fontSize: '1.1rem', lineHeight: '1.6' }}>
              축하합니다! 6개의 수학 퍼즐을 모두 해결하고 최종 암호문 <strong style={{ color: '#38bdf8' }}>MATH!7</strong>을 완벽히 해독하여 탈출에 성공하셨습니다!
            </p>
            <button
              onClick={() => {
                setSolvedPuzzles([]);
                setIsEscaped(false);
              }}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 2rem',
                backgroundColor: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              처음부터 다시 하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}