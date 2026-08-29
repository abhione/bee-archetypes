import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { QUESTIONS } from '@/data/questions';
import { scoreAssessment, type AnswerMap } from '@/data/scoring';
import { generateToken } from '@/lib/utils';
import QuestionCard from '@/components/QuestionCard';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'bee-archetypes:assessment-draft';

interface AssessmentDraft {
  answers: AnswerMap;
  cursorIndex: number;
  startedAt: number;
}

function loadDraft(): AssessmentDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AssessmentDraft;
    if (!parsed.answers || typeof parsed.cursorIndex !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(draft: AssessmentDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota / private-mode ignore */
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export default function AssessmentPage() {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft();
    if (draft && Object.keys(draft.answers).length > 0) {
      setShowDraftPrompt(true);
      setAnswers(draft.answers);
      setCursor(draft.cursorIndex);
      setStartedAt(draft.startedAt);
    }
  }, []);

  // Persist draft on every change
  useEffect(() => {
    if (Object.keys(answers).length === 0) return;
    saveDraft({ answers, cursorIndex: cursor, startedAt });
  }, [answers, cursor, startedAt]);

  const question = QUESTIONS[cursor];
  const totalQuestions = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progressPct = useMemo(
    () => Math.round((answeredCount / totalQuestions) * 100),
    [answeredCount, totalQuestions],
  );
  const canGoBack = cursor > 0;
  const canGoForward = cursor < totalQuestions - 1 && !!answers[question.id];
  const canSubmit = cursor === totalQuestions - 1 && !!answers[question.id];

  const handleSelect = useCallback(
    (optionId: string) => {
      setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
      // Auto-advance after a short beat if not on last question
      if (cursor < totalQuestions - 1) {
        setTimeout(() => {
          setCursor((c) => Math.min(c + 1, totalQuestions - 1));
        }, 320);
      }
    },
    [question.id, cursor, totalQuestions],
  );

  const handleBack = useCallback(() => {
    setCursor((c) => Math.max(c - 1, 0));
  }, []);

  const handleNext = useCallback(() => {
    setCursor((c) => Math.min(c + 1, totalQuestions - 1));
  }, [totalQuestions]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    const result = scoreAssessment(answers);
    const token = generateToken();
    try {
      sessionStorage.setItem(
        `bee-archetypes:result:${token}`,
        JSON.stringify({ result, answers, completedAt: Date.now(), startedAt }),
      );
    } catch {
      /* fall back to token-only URL */
    }
    clearDraft();
    navigate(`/results/${token}`);
  }, [answers, canSubmit, navigate, startedAt]);

  const handleRestart = useCallback(() => {
    clearDraft();
    setAnswers({});
    setCursor(0);
    setStartedAt(Date.now());
    setShowDraftPrompt(false);
  }, []);

  const handleContinueDraft = useCallback(() => {
    setShowDraftPrompt(false);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 pt-10 pb-24">
      {/* Progress bar */}
      <div className="mb-12 sticky top-16 z-30 bg-hive-black/85 backdrop-blur-md py-3 -mx-6 px-6">
        <div className="flex items-center justify-between mb-2 text-xs uppercase tracking-widest text-hive-mist">
          <span>Bee Archetypes assessment</span>
          <span className="tabular-nums">
            {answeredCount}/{totalQuestions} · {progressPct}%
          </span>
        </div>
        <div className="h-1 bg-hive-slate/40 rounded-pill overflow-hidden">
          <motion.div
            className="h-full bg-hive-honey rounded-pill"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Draft prompt */}
      <AnimatePresence>
        {showDraftPrompt && (
          <motion.div
            initial={{ opacity: 1, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-8 p-5 rounded-card border border-hive-honey/40 bg-hive-honey/10"
          >
            <p className="text-sm text-hive-cream mb-3">
              You have an in-progress assessment ({answeredCount} of {totalQuestions}{' '}
              answered). Continue where you left off, or start over?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleContinueDraft}
                className="px-4 py-2 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors text-sm"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="px-4 py-2 rounded-pill border border-hive-slate/60 text-hive-cream hover:border-hive-slate transition-colors text-sm inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start over
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question */}
      <AnimatePresence mode="wait">
        <QuestionCard
          key={question.id}
          question={question}
          index={cursor}
          total={totalQuestions}
          selectedOptionId={answers[question.id] ?? null}
          onSelect={handleSelect}
        />
      </AnimatePresence>

      {/* Nav */}
      <div className="mt-12 flex items-center justify-between max-w-2xl mx-auto">
        <button
          type="button"
          onClick={handleBack}
          disabled={!canGoBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-hive-mist hover:text-hive-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {canSubmit ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors group"
          >
            Reveal my archetype
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoForward}
            className="inline-flex items-center gap-2 px-4 py-2 text-hive-cream hover:text-hive-honey disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
