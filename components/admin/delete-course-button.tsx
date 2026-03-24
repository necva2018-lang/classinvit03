"use client";

import { Button } from "@/components/ui/button";

type DeleteCourseButtonProps = {
  disabled: boolean;
  action: (formData: FormData) => Promise<void>;
};

export function DeleteCourseButton({
  disabled,
  action,
}: DeleteCourseButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (disabled) return;
        const ok = window.confirm("確定要刪除此課程嗎？此操作無法復原。");
        if (!ok) e.preventDefault();
      }}
    >
      <Button
        type="submit"
        variant="destructive"
        className="w-full"
        disabled={disabled}
      >
        刪除課程
      </Button>
    </form>
  );
}
