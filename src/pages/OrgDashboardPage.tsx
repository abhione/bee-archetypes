import { useParams } from 'react-router';

export default function OrgDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <p className="text-sm uppercase tracking-widest text-hive-mist">Wave 4 · Org dashboard</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl text-hive-cream">
        Dashboard for <span className="text-hive-honey">{slug}</span> arriving in Wave 4.
      </h1>
      <p className="mt-6 text-lg text-hive-mist max-w-2xl">
        Five-system coverage map, missing-archetype alerts, team composition, and the
        executive readout tailored to the buyer persona.
      </p>
    </div>
  );
}
