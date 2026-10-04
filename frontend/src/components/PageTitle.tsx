export default function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-text">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}