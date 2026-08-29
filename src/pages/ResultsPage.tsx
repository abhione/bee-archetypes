import { useParams } from 'react-router';

export default function ResultsPage() {
  const { token } = useParams<{ token: string }>();
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <p className="text-sm uppercase tracking-widest text-hive-mist">Wave 3 · Result</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl text-hive-cream">
        Result reveal arriving in Wave 3.
      </h1>
      <p className="mt-6 text-lg text-hive-mist max-w-2xl">
        This route will host the primary bee reveal, secondary bees, shadow bee, balance
        bees, and the Agentic Counterpart pairing card — all keyed to token{' '}
        <code className="text-hive-honey">{token}</code>.
      </p>
    </div>
  );
}
