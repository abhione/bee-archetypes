import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Question } from '@/data/questions';

interface QuestionCardProps {
  question: Question;
  index: number;
  total: number;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
}

export default function QuestionCard({
  question,
  index,
  total,
  selectedOptionId,
  onSelect,
}: QuestionCardProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-widest text-hive-mist">
        <span className="text-hive-honey font-medium tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="w-px h-3 bg-hive-slate/60" />
        <span>Question {index + 1} of {total}</span>
      </div>

      <h2 className="font-serif text-2xl md:text-3xl text-hive-cream leading-tight mb-10">
        {question.prompt}
      </h2>

      <div className="space-y-3">
        {question.options.map((opt, i) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={cn(
                'w-full text-left p-5 rounded-card border transition-all group',
                'flex items-start gap-4',
                isSelected
                  ? 'border-hive-honey bg-hive-honey/10 text-hive-cream'
                  : 'border-hive-slate/60 bg-hive-charcoal/40 text-hive-cream/85 hover:border-hive-slate hover:bg-hive-charcoal/70',
              )}
            >
              <span
                className={cn(
                  'flex-shrink-0 w-7 h-7 rounded-pill border flex items-center justify-center font-sans text-xs uppercase tracking-widest tabular-nums transition-colors',
                  isSelected
                    ? 'border-hive-honey bg-hive-honey text-hive-black'
                    : 'border-hive-slate/60 text-hive-mist group-hover:border-hive-mist',
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1 pt-0.5 text-base leading-relaxed">
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
