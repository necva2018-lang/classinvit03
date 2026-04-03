import {
  embedUrlFromVideoPage,
  isProbablyDirectVideoFile,
} from "@/lib/course-intro-embed";
import type { IntroBlock } from "@/lib/validation/intro-blocks";

function blockHasPublicContent(block: IntroBlock): boolean {
  if (block.type === "text") return block.body.trim().length > 0;
  return block.url.trim().length > 0;
}

/** 說明區段是否有可顯示的區塊 */
export function introBlocksHaveVisibleContent(blocks: IntroBlock[]): boolean {
  return blocks.some(blockHasPublicContent);
}

export function CourseIntroBlocks({
  blocks,
  showTitle = true,
}: {
  blocks: IntroBlock[];
  /** 獨立分頁時可隱藏，避免與頁簽標題重複 */
  showTitle?: boolean;
}) {
  const visible = blocks.filter(blockHasPublicContent);
  if (!visible.length) return null;

  return (
    <div className="space-y-8">
      {showTitle ? (
        <h2 className="text-lg font-bold text-zinc-900">說明區段</h2>
      ) : null}
      <div className="space-y-10">
        {visible.map((block) => (
          <IntroBlockItem key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}

function IntroBlockItem({ block }: { block: IntroBlock }) {
  if (block.type === "text") {
    if (!block.body.trim()) return null;
    return (
      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-600">
        {block.body}
      </p>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="space-y-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- 後台可貼任意 HTTPS 圖床 */}
        <img
          src={block.url}
          alt={block.caption?.trim() || ""}
          className="max-h-[360px] w-full rounded-lg border border-zinc-200 object-contain bg-zinc-50 sm:max-h-[460px] lg:max-h-[520px]"
          loading="lazy"
        />
        {block.caption?.trim() ? (
          <figcaption className="text-center text-xs text-zinc-500">
            {block.caption.trim()}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  const embed = embedUrlFromVideoPage(block.url);
  return (
    <div className="space-y-2">
      {embed ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-200 bg-black">
          <iframe
            title={block.caption?.trim() || "課程影片"}
            src={embed}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : isProbablyDirectVideoFile(block.url) ? (
        <video
          controls
          className="max-h-[360px] w-full rounded-lg border border-zinc-200 bg-black sm:max-h-[460px] lg:max-h-[520px]"
          src={block.url}
        >
          您的瀏覽器不支援內嵌影片播放。
        </video>
      ) : (
        <p className="text-sm text-zinc-600">
          <a
            href={block.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-necva-primary underline-offset-4 hover:underline"
          >
            開啟影片連結
          </a>
        </p>
      )}
      {block.caption?.trim() ? (
        <p className="text-center text-xs text-zinc-500">{block.caption.trim()}</p>
      ) : null}
    </div>
  );
}
