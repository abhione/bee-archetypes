/**
 * CounterpartPanel — the Agentic Counterpart's home inside the Org Dashboard.
 *
 * Wave 2 (2026-08-29): loads persisted messages from /api/agent/profile on
 * mount, runs conversational onboarding for first-time users, saves every
 * turn to the server DB. Extended-thinking Haiku on turn 1 of a session,
 * non-thinking on follow-ups.
 *
 * Auth: Clerk JWT via useAuth().getToken(), forwarded as x-clerk-auth-token.
 * Anthropic key never touches the browser.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CounterpartMeta {
  key: 'Queen' | 'Catalyst' | 'Hygienist';
  name: string;
  shortName: string;
  strapline: string;
}

const COUNTERPART_META: Record<string, CounterpartMeta> = {
  Queen: {
    key: 'Queen',
    name: 'Strategy Synthesis Agent',
    shortName: 'Strategy Agent',
    strapline: 'Reads the noise first, so you can decide what you cannot delegate.',
  },
  Catalyst: {
    key: 'Catalyst',
    name: 'Cadence & Dependency Agent',
    shortName: 'Cadence Agent',
    strapline: 'Maps how work moves between people and flags collisions before standup.',
  },
  Hygienist: {
    key: 'Hygienist',
    name: 'Operational Hygiene Agent',
    shortName: 'Hygiene Agent',
    strapline: 'Notices the entropy creeping into your team before it becomes a fire.',
  },
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ProfileData {
  onboardingComplete: boolean;
  answerCount: number;
  totalQuestions: number;
  messages: Message[];
}

interface Props {
  archetypeId: string;
  counterpartKey: 'Queen' | 'Catalyst' | 'Hygienist';
  archetypeName: string;
  clerkOrgId?: string;
}

export function CounterpartPanel({
  archetypeId,
  counterpartKey,
  archetypeName,
  clerkOrgId,
}: Props) {
  const { getToken, isSignedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'loading' | 'idle' | 'sending' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(3);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const meta = COUNTERPART_META[counterpartKey];

  // A "session" is the current panel open — turn 1 gets extended thinking.
  // We use message count at the START of the session to decide.
  // After loading profile, we know how many messages already exist.
  const sessionStartMessageCount = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  // ── Load profile on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!isSignedIn) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token || cancelled) return;
        const params = new URLSearchParams({
          archetypeId,
          counterpartKey,
          ...(clerkOrgId ? { clerkOrgId } : {}),
        });
        const res = await fetch(`/api/agent/profile?${params}`, {
          headers: { 'X-Clerk-Auth-Token': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`profile HTTP ${res.status}`);
        const data: ProfileData = await res.json();
        if (cancelled) return;
        sessionStartMessageCount.current = data.messages.length;
        setMessages(data.messages);
        setOnboardingComplete(data.onboardingComplete);
        setAnswerCount(data.answerCount);
        setTotalQuestions(data.totalQuestions);
        setStatus('idle');
      } catch (err) {
        if (!cancelled) {
          console.error('profile load failed', err);
          setStatus('idle'); // fail-open; user can still chat
        }
      }
    })();
    return () => { cancelled = true; };
  }, [archetypeId, counterpartKey, clerkOrgId, getToken, isSignedIn]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || status === 'sending' || status === 'loading') return;
    if (!isSignedIn) {
      setError('Sign in to talk to your counterpart.');
      setStatus('error');
      return;
    }

    setError(null);
    setStatus('sending');
    const nextMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');

    // First turn of this session → use extended thinking.
    const isFirstTurn = nextMessages.filter((m) => m.role === 'user').length === 1 &&
      sessionStartMessageCount.current === 0;

    try {
      const token = await getToken();
      if (!token) throw new Error('no_token');

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Clerk-Auth-Token': `Bearer ${token}`,
        },
        body: JSON.stringify({
          archetypeId,
          counterpartKey,
          clerkOrgId: clerkOrgId ?? null,
          messages: nextMessages,
          isFirstTurn,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'network_error' }));
        if (res.status === 429) {
          throw new Error('You have hit the beta chat limit for now. Try again in an hour.');
        }
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const newMessages = [...nextMessages, { role: 'assistant' as const, content: data.text }];
      setMessages(newMessages);
      setOnboardingComplete(data.onboardingComplete ?? false);
      setAnswerCount(data.answerCount ?? answerCount);
      setStatus('idle');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatus('error');
      setMessages(messages);
      setInput(text);
    }
  }, [archetypeId, counterpartKey, clerkOrgId, getToken, input, isSignedIn, messages, status, answerCount]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOnboarding = !onboardingComplete && answerCount < totalQuestions;
  const suggestions = isOnboarding ? [] : suggestionsForCounterpart(counterpartKey, archetypeName);
  const isLoading = status === 'loading';
  const isSending = status === 'sending';

  return (
    <section className="mt-12 rounded-card border border-hive-honey/30 bg-gradient-to-br from-hive-honey/5 via-hive-charcoal/60 to-hive-charcoal/60 overflow-hidden">
      <header className="p-6 md:p-8 border-b border-hive-slate/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-pill bg-hive-honey/10 border border-hive-honey/40 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-hive-honey" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs uppercase tracking-widest text-hive-mist">
                Your counterpart · Early access
              </p>
              {isOnboarding && (
                <span className="text-xs text-hive-honey/80 italic">
                  · onboarding {answerCount}/{totalQuestions}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-hive-cream">
              {meta.name}
            </h2>
            <p className="mt-2 text-hive-mist text-sm md:text-base leading-relaxed">
              {meta.strapline}
            </p>
          </div>
        </div>
      </header>

      <div className="p-6 md:p-8">
        {isLoading && (
          <div className="flex items-center gap-2 text-hive-mist text-sm mb-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading your conversation…
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="mb-6 space-y-3">
            <p className="text-hive-cream/85 leading-relaxed">
              {isOnboarding
                ? `I'm your ${meta.shortName}. Before we get into the work, a few quick questions.`
                : `I'm your ${meta.shortName}. Ask me anything I might see for you as a ${archetypeName}.`}
            </p>
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="px-3 py-1.5 rounded-pill border border-hive-slate/50 bg-hive-charcoal/40 text-xs text-hive-cream/85 hover:border-hive-honey/50 hover:text-hive-cream transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.length > 0 && (
          <div
            ref={scrollRef}
            className="max-h-96 overflow-y-auto space-y-4 mb-4 pr-2"
          >
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} />
            ))}
            {isSending && (
              <div className="flex items-center gap-1.5 text-xs text-hive-mist italic pl-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                {isOnboarding ? 'Thinking…' : 'Composing…'}
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="mb-3 text-sm text-red-400/90" role="alert">{error}</p>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isOnboarding
                ? 'Answer here…'
                : `Ask your ${meta.shortName}…`
            }
            rows={2}
            disabled={isSending || isLoading}
            className="flex-1 px-4 py-3 rounded-card bg-hive-charcoal/60 border border-hive-slate/50 text-hive-cream focus:border-hive-honey focus:outline-none placeholder:text-hive-mist/60 resize-none text-sm md:text-base"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isSending || isLoading}
            className={cn(
              'inline-flex items-center justify-center w-11 h-11 rounded-pill bg-hive-honey text-hive-black hover:bg-hive-honey/90 transition-colors flex-shrink-0',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
            aria-label="Send message"
          >
            {isSending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>

        <p className="mt-3 text-xs text-hive-mist/70 italic">
          {onboardingComplete
            ? 'Powered by Claude Haiku 4.5. Chats are saved across sessions.'
            : 'Powered by Claude Haiku 4.5. Chats save after onboarding.'}
        </p>
      </div>
    </section>
  );
}

function MessageBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] px-4 py-3 rounded-card whitespace-pre-wrap leading-relaxed text-sm md:text-base',
          isUser
            ? 'bg-hive-honey/10 border border-hive-honey/30 text-hive-cream'
            : 'bg-hive-charcoal/70 border border-hive-slate/40 text-hive-cream/95',
        )}
      >
        {content}
      </div>
    </div>
  );
}

function suggestionsForCounterpart(
  key: 'Queen' | 'Catalyst' | 'Hygienist',
  archetypeName: string,
): string[] {
  switch (key) {
    case 'Queen':
      return [
        `What's a decision I should be making faster as a ${archetypeName}?`,
        'Help me draft a one-page brief for a hard call I need to make this quarter.',
        'What signal am I probably missing right now?',
      ];
    case 'Catalyst':
      return [
        'Which recurring meeting on my calendar has probably stopped earning its slot?',
        'Where is a handoff likely to break in my team this week?',
        `Where should I invest cadence discipline first as a ${archetypeName}?`,
      ];
    case 'Hygienist':
      return [
        'What operational hygiene is silently slipping in my team?',
        'Where is unspoken debt accumulating that I should surface?',
        `What is the smallest fix I could ship this week as a ${archetypeName}?`,
      ];
  }
}
