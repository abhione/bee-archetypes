/**
 * CounterpartPanel — the Agentic Counterpart's home inside the Org Dashboard.
 *
 * Wave 1 (2026-08-29): ephemeral chat surface. Messages held in React state
 * only, gone on reload. Extended-thinking Haiku on turn 1, non-thinking on
 * follow-ups. No SQLite yet (Wave 2 adds persistence + onboarding).
 *
 * Auth: Clerk JWT via useAuth().getToken() forwarded to the server as
 * `x-clerk-auth-token`. Anthropic key never touches the browser.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Sparkles, Send } from 'lucide-react';
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
    strapline:
      'Reads the noise first, so you can decide what you cannot delegate.',
  },
  Catalyst: {
    key: 'Catalyst',
    name: 'Cadence & Dependency Agent',
    shortName: 'Cadence Agent',
    strapline:
      'Maps how work moves between people and flags collisions before standup.',
  },
  Hygienist: {
    key: 'Hygienist',
    name: 'Operational Hygiene Agent',
    shortName: 'Hygiene Agent',
    strapline:
      'Notices the entropy creeping into your team before it becomes a fire.',
  },
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  archetypeId: string;                // 'queen', 'forager', etc.
  counterpartKey: 'Queen' | 'Catalyst' | 'Hygienist';
  archetypeName: string;              // 'Queen', 'Forager', etc.
}

export function CounterpartPanel({
  archetypeId,
  counterpartKey,
  archetypeName,
}: Props) {
  const { getToken, isSignedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const meta = COUNTERPART_META[counterpartKey];
  const isFirstTurn = messages.filter((m) => m.role === 'assistant').length === 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, status]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || status === 'sending') return;
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
      setMessages([...nextMessages, { role: 'assistant', content: data.text }]);
      setStatus('idle');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setStatus('error');
      // Roll back the optimistically-added user message so retry doesn't dupe it.
      setMessages(messages);
      setInput(text);
    }
  }, [
    archetypeId,
    counterpartKey,
    getToken,
    input,
    isFirstTurn,
    isSignedIn,
    messages,
    status,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggested = suggestionsForCounterpart(counterpartKey, archetypeName);

  return (
    <section className="mt-12 rounded-card border border-hive-honey/30 bg-gradient-to-br from-hive-honey/5 via-hive-charcoal/60 to-hive-charcoal/60 overflow-hidden">
      <header className="p-6 md:p-8 border-b border-hive-slate/30">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-pill bg-hive-honey/10 border border-hive-honey/40 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-hive-honey" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-hive-mist mb-1">
              Your counterpart · Early access
            </p>
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
        {messages.length === 0 && (
          <div className="mb-6 space-y-3">
            <p className="text-hive-cream/85 leading-relaxed">
              I'm your {meta.shortName}. Ask me anything I might see for you as a {archetypeName}.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggested.map((s) => (
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
            {status === 'sending' && (
              <div className="text-xs text-hive-mist italic pl-1">
                {isFirstTurn ? 'Thinking…' : 'Composing…'}
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="mb-3 text-sm text-red-400/90" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask your ${meta.shortName}…`}
            rows={2}
            disabled={status === 'sending'}
            className="flex-1 px-4 py-3 rounded-card bg-hive-charcoal/60 border border-hive-slate/50 text-hive-cream focus:border-hive-honey focus:outline-none placeholder:text-hive-mist/60 resize-none text-sm md:text-base"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || status === 'sending'}
            className={cn(
              'inline-flex items-center justify-center w-11 h-11 rounded-pill bg-hive-honey text-hive-black hover:bg-hive-honey/90 transition-colors flex-shrink-0',
              'disabled:opacity-40 disabled:cursor-not-allowed',
            )}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-3 text-xs text-hive-mist/70 italic">
          Powered by Claude Haiku 4.5. Chats are held in this browser session only for now; refresh will clear them.
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
