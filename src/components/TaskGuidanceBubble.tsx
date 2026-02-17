import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";
import { useAppSettings } from "@/hooks/useAppSettings";

interface Props {
  message: string;
  audioUrl?: string | null;
  className?: string;
}

const TaskGuidanceBubble = ({ message, audioUrl, className = "" }: Props) => {
  const { data: settings } = useAppSettings();
  const avatarUrl = settings?.guidance_avatar_url || "";
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!message) return null;

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  return (
    <div className={`relative flex items-start gap-2.5 animate-fade-up ${className}`}>
      <div className="shrink-0 mt-0.5">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Orientador" className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400 shadow-sm" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-amber-400/20 ring-2 ring-amber-400 flex items-center justify-center text-sm">🧙</div>
        )}
      </div>
      <div className="relative flex-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl rounded-tl-sm p-3 shadow-sm">
        <div className="absolute -left-1.5 top-2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-amber-200 dark:border-r-amber-800/40" />
        <div className="absolute -left-[5px] top-2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-amber-50 dark:border-r-amber-950/30" />
        <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-line">{message}</p>
        {audioUrl && (
          <>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} preload="none" />
            <button onClick={toggleAudio} className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors">
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? "Pausar" : "Ouvir"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskGuidanceBubble;
