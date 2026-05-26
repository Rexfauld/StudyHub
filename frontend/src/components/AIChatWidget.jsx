import { useState, useRef, useEffect } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'studyhub_ai_chat';

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Lightweight markdown → HTML for chat bubbles.
// Handles fenced code blocks, inline code, headers, bold, italic, line breaks, and simple lists.
function renderMarkdown(md) {
  if (!md) return '';
  let out = '';
  const lines = md.split('\n');
  let inCode = false;
  let codeBuf = [];

  const inline = (s) => {
    s = escapeHtml(s);
    // inline code first so its contents are not re-processed
    s = s.replace(/`([^`]+)`/g, '<code class="aic-code">$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s;
  };

  for (const raw of lines) {
    if (raw.trim().startsWith('```')) {
      if (inCode) {
        out += `<pre class="aic-pre"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`;
        codeBuf = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeBuf.push(raw); continue; }

    const line = raw;
    if (/^###\s+/.test(line))      out += `<div class="aic-h3">${inline(line.replace(/^###\s+/, ''))}</div>`;
    else if (/^##\s+/.test(line))  out += `<div class="aic-h2">${inline(line.replace(/^##\s+/, ''))}</div>`;
    else if (/^#\s+/.test(line))   out += `<div class="aic-h1">${inline(line.replace(/^#\s+/, ''))}</div>`;
    else if (/^---+\s*$/.test(line)) out += '<hr class="aic-hr" />';
    else if (/^\s*[-*]\s+/.test(line)) out += `<div class="aic-li">• ${inline(line.replace(/^\s*[-*]\s+/, ''))}</div>`;
    else if (/^\s*\d+\.\s+/.test(line)) out += `<div class="aic-li">${inline(line.trim())}</div>`;
    else if (line.trim() === '')   out += '<div class="aic-br"></div>';
    else                           out += `<div>${inline(line)}</div>`;
  }
  if (inCode && codeBuf.length) {
    out += `<pre class="aic-pre"><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`;
  }
  return out;
}

export default function AIChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50))); }
    catch { /* quota — ignore */ }
  }, [messages]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages, sending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  // Hide widget entirely when logged out (endpoint requires auth)
  if (!user) return null;

  const send = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setMessages(m => [...m, { role: 'user', content: text }]);
    setInput('');
    setSending(true);
    try {
      const { data } = await API.post('/ai/chat', { message: text });
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const status = err.response?.status;
      const msg = status === 429
        ? 'Rate limit reached. Try again in an hour.'
        : status === 401
          ? 'Session expired. Please sign in again.'
          : err.response?.data?.error || 'Something went wrong. Try again.';
      setMessages(m => [...m, { role: 'assistant', content: msg, error: true }]);
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    if (!messages.length) return;
    if (confirm('Clear chat history?')) setMessages([]);
  };

  return (
    <>
      <style>{css}</style>

      {/* Floating launcher */}
      {!open && (
        <button className="aic-fab" onClick={() => setOpen(true)} aria-label="Open AI assistant">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span className="aic-fab-label">Ask AI</span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div className="aic-panel" role="dialog" aria-label="AI study assistant">
          <div className="aic-head">
            <div className="aic-head-left">
              <div className="aic-dot" />
              <div>
                <div className="aic-title">Study Assistant</div>
                <div className="aic-sub">Powered by Claude · 10 msgs/hr</div>
              </div>
            </div>
            <div className="aic-head-actions">
              <button className="aic-iconbtn" onClick={clearChat} title="Clear" aria-label="Clear chat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
              <button className="aic-iconbtn" onClick={() => setOpen(false)} title="Close" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div className="aic-body" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="aic-empty">
                <div className="aic-empty-emoji">🎓</div>
                <div className="aic-empty-title">Hi {user.name?.split(' ')[0] || 'there'}!</div>
                <div className="aic-empty-text">
                  Ask me to explain a topic, solve a past question, summarize notes, or generate practice questions.
                </div>
                <div className="aic-suggestions">
                  {[
                    'Explain photosynthesis simply',
                    'Solve: x² - 5x + 6 = 0',
                    'Summarize WAEC English literature themes',
                    'Generate 5 practice questions on cell biology',
                  ].map(s => (
                    <button key={s} className="aic-suggestion" onClick={() => setInput(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`aic-msg aic-msg--${m.role}${m.error ? ' aic-msg--err' : ''}`}>
                {m.role === 'assistant' ? (
                  <div className="aic-md" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                ) : (
                  <div className="aic-userline">{m.content}</div>
                )}
              </div>
            ))}

            {sending && (
              <div className="aic-msg aic-msg--assistant">
                <div className="aic-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          <form className="aic-input-row" onSubmit={send}>
            <textarea
              ref={inputRef}
              className="aic-input"
              placeholder="Ask anything about your studies…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              rows={1}
              disabled={sending}
            />
            <button
              type="submit"
              className="aic-send"
              disabled={!input.trim() || sending}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

const css = `
  .aic-fab {
    position: fixed; bottom: 24px; right: 24px; z-index: 900;
    display: flex; align-items: center; gap: 8px;
    padding: 12px 18px 12px 14px; border-radius: 50px; border: none;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: white; font-family: inherit; font-size: 14px; font-weight: 600;
    cursor: pointer; box-shadow: 0 10px 30px rgba(26,26,46,0.35);
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .aic-fab:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(26,26,46,0.45); }
  .aic-fab-label { letter-spacing: -0.2px; }

  .aic-panel {
    position: fixed; bottom: 24px; right: 24px; z-index: 900;
    width: 380px; max-width: calc(100vw - 32px);
    height: 580px; max-height: calc(100vh - 48px);
    background: var(--sh-card, #ffffff);
    color: var(--sh-text, #1a1a2e);
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.28);
    display: flex; flex-direction: column;
    border: 1px solid var(--sh-border, #eee);
    animation: aicIn 0.22s cubic-bezier(.34,1.56,.64,1) both;
  }

  .aic-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: white;
  }
  .aic-head-left { display: flex; align-items: center; gap: 10px; }
  .aic-dot {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #e8b84b, #f0c96a);
    display: flex; align-items: center; justify-content: center;
    color: #1a1a2e; font-weight: 900; font-size: 16px;
    position: relative;
  }
  .aic-dot::after {
    content: ''; position: absolute; bottom: 1px; right: 1px;
    width: 9px; height: 9px; border-radius: 50%;
    background: #22c55e; border: 2px solid #1a1a2e;
  }
  .aic-dot::before {
    content: 'AI'; position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
  }
  .aic-title { font-size: 14px; font-weight: 700; line-height: 1.2; }
  .aic-sub { font-size: 11px; color: rgba(255,255,255,0.55); margin-top: 2px; }
  .aic-head-actions { display: flex; gap: 4px; }
  .aic-iconbtn {
    background: rgba(255,255,255,0.08); border: none;
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,0.75); cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .aic-iconbtn:hover { background: rgba(255,255,255,0.18); color: white; }

  .aic-body {
    flex: 1; overflow-y: auto;
    padding: 16px;
    background: var(--sh-bg, #f7f7fa);
    display: flex; flex-direction: column; gap: 10px;
  }
  .aic-body::-webkit-scrollbar { width: 8px; }
  .aic-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }

  .aic-empty {
    margin: auto; text-align: center; padding: 20px 8px;
    color: var(--sh-text, #1a1a2e);
  }
  .aic-empty-emoji { font-size: 36px; margin-bottom: 8px; }
  .aic-empty-title { font-size: 17px; font-weight: 700; margin-bottom: 6px; }
  .aic-empty-text { font-size: 13px; color: var(--sh-subtext, #888); line-height: 1.5; margin-bottom: 16px; }
  .aic-suggestions { display: flex; flex-direction: column; gap: 6px; }
  .aic-suggestion {
    text-align: left; padding: 10px 12px;
    background: var(--sh-card, white);
    border: 1px solid var(--sh-border, #eee);
    border-radius: 10px; cursor: pointer; font-size: 13px;
    color: var(--sh-text, #1a1a2e);
    font-family: inherit; transition: all 0.15s;
  }
  .aic-suggestion:hover { border-color: #e8b84b; transform: translateX(2px); }

  .aic-msg {
    max-width: 88%; padding: 10px 14px; border-radius: 14px;
    font-size: 14px; line-height: 1.5; word-wrap: break-word;
  }
  .aic-msg--user {
    align-self: flex-end;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: white;
    border-bottom-right-radius: 4px;
  }
  .aic-msg--assistant {
    align-self: flex-start;
    background: var(--sh-card, white);
    color: var(--sh-text, #1a1a2e);
    border: 1px solid var(--sh-border, #eee);
    border-bottom-left-radius: 4px;
  }
  .aic-msg--err { border-color: #fecaca; background: #fef2f2; color: #b91c1c; }
  .aic-userline { white-space: pre-wrap; }

  .aic-md > div { min-height: 1.2em; }
  .aic-md .aic-h1 { font-size: 16px; font-weight: 700; margin: 8px 0 4px; }
  .aic-md .aic-h2 { font-size: 15px; font-weight: 700; margin: 8px 0 4px; }
  .aic-md .aic-h3 { font-size: 14px; font-weight: 700; margin: 6px 0 2px; }
  .aic-md .aic-li { padding-left: 6px; margin: 2px 0; }
  .aic-md .aic-br { height: 6px; }
  .aic-md .aic-hr { border: none; border-top: 1px solid var(--sh-border, #eee); margin: 8px 0; }
  .aic-md .aic-code { background: rgba(0,0,0,0.06); padding: 1px 5px; border-radius: 4px; font-size: 0.92em; font-family: 'Courier New', monospace; }
  .aic-md .aic-pre { background: #0f172a; color: #e2e8f0; padding: 10px 12px; border-radius: 8px; overflow-x: auto; font-size: 12.5px; margin: 6px 0; }
  .aic-md .aic-pre code { background: none; padding: 0; color: inherit; font-family: 'Courier New', monospace; }

  .aic-typing { display: flex; gap: 4px; padding: 4px 0; }
  .aic-typing span {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--sh-subtext, #888);
    animation: aicBounce 1.2s infinite ease-in-out;
  }
  .aic-typing span:nth-child(2) { animation-delay: 0.15s; }
  .aic-typing span:nth-child(3) { animation-delay: 0.3s; }

  .aic-input-row {
    display: flex; gap: 8px; padding: 12px;
    background: var(--sh-card, white);
    border-top: 1px solid var(--sh-border, #eee);
  }
  .aic-input {
    flex: 1; resize: none;
    padding: 10px 12px; border-radius: 12px;
    border: 1.5px solid var(--sh-input-border, #ddd);
    background: var(--sh-input-bg, #f7f7fa);
    color: var(--sh-text, #1a1a2e);
    font-family: inherit; font-size: 14px; line-height: 1.4;
    outline: none; max-height: 100px;
    transition: border-color 0.15s;
  }
  .aic-input:focus { border-color: #e8b84b; }
  .aic-input::placeholder { color: var(--sh-subtext, #999); }
  .aic-input:disabled { opacity: 0.6; }
  .aic-send {
    flex-shrink: 0; width: 42px; height: 42px;
    border: none; border-radius: 12px;
    background: linear-gradient(135deg, #e8b84b, #f0c96a);
    color: #1a1a2e; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.15s, opacity 0.15s;
  }
  .aic-send:hover:not(:disabled) { transform: translateY(-1px); }
  .aic-send:disabled { opacity: 0.4; cursor: not-allowed; }

  @keyframes aicIn {
    from { opacity: 0; transform: translateY(20px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes aicBounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  @media (max-width: 600px) {
    .aic-fab { bottom: 16px; right: 16px; padding: 11px 16px 11px 12px; }
    .aic-panel {
      bottom: 0; right: 0; left: 0;
      width: 100%; max-width: 100%;
      height: 85vh; max-height: 85vh;
      border-radius: 20px 20px 0 0;
    }
  }
`;
