"use client";

import { useEffect } from "react";

export function CourseViewTracker({ courseId }: { courseId: string }) {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/track/course-view", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ courseId }),
          credentials: "same-origin",
        });
        if (!res.ok && !cancelled) {
          console.warn("[course-view-tracker] 上報失敗", res.status);
        }
      } catch (e) {
        if (!cancelled) {
          console.warn("[course-view-tracker] 上報發生錯誤", e);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return null;
}
