"use client";

import { CircleUserRoundIcon, XIcon, Paperclip } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Button } from "@/components/ui/button";

export default function FileUpload({
  accept = "*/*", // default to any file type
  maxFiles = 1, // default single file
  label = "Upload file",
  onChange, // callback when file changes
}) {
  const [{ files }, { removeFile, openFileDialog, getInputProps }] =
    useFileUpload({
      accept,
      maxFiles,
      onChange: (uploadedFiles) => {
        if (onChange) onChange(uploadedFiles);
      },
    });

  const previewUrl = files[0]?.preview || null;
  const fileName = files[0]?.file.name || null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative inline-flex">
        <Button
          variant="outline"
          className="relative size-16 overflow-hidden p-0 shadow-none"
          onClick={openFileDialog}
          aria-label={previewUrl ? "Change file" : label}
        >
          {previewUrl && accept.startsWith("image/") ? (
            <img
              className="size-full object-cover"
              src={previewUrl}
              alt="Preview"
              width={64}
              height={64}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="flex items-center justify-center w-16 h-16 border border-dashed rounded">
              <Paperclip className="size-4 opacity-60" />
            </div>
          )}
        </Button>

        {files.length > 0 && (
          <Button
            onClick={() => {
              removeFile(files[0]?.id);
              if (onChange) onChange([]);
            }}
            size="icon"
            className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
            aria-label="Remove file"
          >
            <XIcon className="size-3.5" />
          </Button>
        )}

        <input
          {...getInputProps()}
          className="sr-only"
          aria-label={label}
          tabIndex={-1}
        />
      </div>

      {fileName && <p className="text-muted-foreground text-xs">{fileName}</p>}
      <p
        aria-live="polite"
        role="region"
        className="text-muted-foreground mt-2 text-xs"
      >
        {label}
      </p>
    </div>
  );
}
