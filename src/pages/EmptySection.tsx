type EmptySectionProps = { title: string };

export function EmptySection({ title }: EmptySectionProps) {
  return <h1 className="visually-hidden">{title}</h1>;
}
