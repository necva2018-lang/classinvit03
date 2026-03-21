import { Search } from "lucide-react";

type Props = {
  defaultQuery?: string;
  variant: "desktop" | "mobile";
  /** 送出後回呼（例如關閉行動選單） */
  onAfterSubmit?: () => void;
};

export function NavSearchForm({
  defaultQuery = "",
  variant,
  onAfterSubmit,
}: Props) {
  const inputClass =
    variant === "desktop"
      ? "h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-necva-primary/50 focus:bg-white focus:ring-2 focus:ring-necva-primary/20"
      : "h-11 w-full rounded-full border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-sm outline-none focus:border-necva-primary/50 focus:ring-2 focus:ring-necva-primary/20";

  return (
    <form
      action="/search"
      method="get"
      role="search"
      className={variant === "desktop" ? "relative w-full max-w-xl" : "relative block"}
      onSubmit={() => {
        onAfterSubmit?.();
      }}
    >
      <label className={variant === "desktop" ? "contents" : "block"}>
        <span className="sr-only">搜尋課程</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
          aria-hidden
        />
        <input
          key={defaultQuery}
          name="q"
          type="search"
          placeholder={
            variant === "desktop"
              ? "搜尋課程、講師或關鍵字…"
              : "搜尋課程、講師…"
          }
          defaultValue={defaultQuery}
          className={inputClass}
          autoComplete="off"
          enterKeyHint="search"
        />
      </label>
    </form>
  );
}
