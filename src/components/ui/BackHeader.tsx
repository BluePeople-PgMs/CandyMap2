import Link from "next/link";

export function BackHeader({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full text-sm font-medium text-candy-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}
