import { useState, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPlayerProps {
  url: string;
  title?: string;
}

const AudioPlayer = ({ url, title }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  };

  return (
    <div className="bg-secondary/10 rounded-2xl p-4 flex items-center gap-4">
      <audio ref={audioRef} src={url} onTimeUpdate={onTimeUpdate} onEnded={() => setPlaying(false)} />
      <button
        onClick={toggle}
        className="shrink-0 w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95"
      >
        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold truncate mb-1">{title}</p>}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
};

export default AudioPlayer;
