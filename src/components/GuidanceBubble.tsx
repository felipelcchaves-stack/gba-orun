import { useGuidanceBubble } from "@/hooks/useGuidance";
import { Play, Pause } from "lucide-react";
import { useState, useRef } from "react";

interface Props {
  pointKey: string;
  className?: string;
}

const GuidanceBubble = ({ pointKey, className = "" }: Props) => {
  const { message, audio_url, avatar_url, hasGuidance } = useGuidanceBubble(pointKey);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!hasGuidance) return null;

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className={`relative flex items-start gap-3 animate-fade-up ${className}`}>
      {/* Avatar */}
      <div className="shrink-0 mt-1">
        {avatar_url ? (
          <img
            src={avatar_url}
            alt="Orientador"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shadow-md"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-amber-400/20 ring-2 ring-amber-400 flex items-center justify-center text-lg">
            🧙
          </div>
        )}
      </div>

      {/* Speech bubble */}
      <div className="relative flex-1 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl rounded-tl-sm p-4 shadow-sm">
        {/* Triangle tail */}
        <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-amber-200 dark:border-r-amber-800/40" />
        <div className="absolute -left-[6px] top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-amber-50 dark:border-r-amber-950/30" />

        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-line">
          {message}
        </p>

        {audio_url && (
          <>
            <audio
              ref={audioRef}
              src={audio_url}
              onEnded={() => setPlaying(false)}
              preload="none"
            />
            <button
              onClick={toggleAudio}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "Pausar áudio" : "Ouvir orientação"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GuidanceBubble;
