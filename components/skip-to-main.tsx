/** 鍵盤使用者與輔助科技：略過導覽列直達主內容 */
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="absolute left-4 top-4 z-[100] -translate-y-[200%] rounded-lg bg-necva-primary px-4 py-3 text-sm font-semibold text-white shadow-lg outline-none ring-2 ring-white/70 transition-transform focus:translate-y-0 focus:ring-offset-2 focus:ring-offset-white"
    >
      跳至主要內容
    </a>
  );
}
