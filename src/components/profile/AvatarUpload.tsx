import { useRef, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";

const AvatarUpload = () => {
  const { data: profile } = useProfile();
  const upload = useAvatarUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    upload.mutate(file, { onSettled: () => setPreview(null) });
  };

  const displayUrl = preview || profile?.avatar_url;
  const initial = (profile?.display_name || "U")[0].toUpperCase();

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        className="relative group"
        onClick={() => inputRef.current?.click()}
        disabled={upload.isPending}
      >
        <Avatar className="h-20 w-20 ring-2 ring-primary/20">
          {displayUrl ? (
            <AvatarImage src={displayUrl} alt="Avatar" />
          ) : null}
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {initial}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md group-hover:scale-110 transition-transform">
          {upload.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Camera className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

export default AvatarUpload;
