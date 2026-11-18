import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap pt-16 text-center md:pt-24">
      <p className="display outline-text text-[140px] leading-none md:text-[220px]" aria-hidden>
        404
      </p>
      <h1 className="display mt-2 text-[40px] md:text-[56px]">Энэ алхам буруу зам руу</h1>
      <p className="mt-2 text-[16px] text-mute">Хайсан хуудас олдсонгүй.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-ink">
          Нүүр хуудас
        </Link>
        <Link href="/shop" className="btn btn-line">
          Бүх загвар
        </Link>
      </div>
    </div>
  );
}
