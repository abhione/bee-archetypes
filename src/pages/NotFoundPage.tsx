import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-32 text-center">
      <p className="text-sm uppercase tracking-widest text-hive-mist">404</p>
      <h1 className="mt-3 font-serif text-6xl text-hive-cream">The bee got lost.</h1>
      <p className="mt-6 text-lg text-hive-mist">
        This route doesn't exist in the hive.
      </p>
      <Link
        to="/"
        className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
      >
        Back to landing
      </Link>
    </div>
  );
}
