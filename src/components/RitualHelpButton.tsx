import { useState } from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRitualLinkForPoint } from "@/hooks/useRitualLinks";
import { useRitual } from "@/hooks/useRituals";
import ReactMarkdown from "react-markdown";
import AudioPlayer from "@/components/AudioPlayer";
import { Link } from "react-router-dom";

interface Props {
  point: string;
  className?: string;
}

const RitualHelpButton = ({ point, className = "" }: Props) => {
  const ritualId = useRitualLinkForPoint(point);
  const { data: ritual } = useRitual(ritualId ?? "");
  const [open, setOpen] = useState(false);

  if (!ritualId || !ritual) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors ${className}`}
        title="Abrir ajuda"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>Ajuda</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{ritual.title}</DialogTitle>
          </DialogHeader>

          {(ritual as any).audio_url && (
            <div className="mb-4">
              <AudioPlayer url={(ritual as any).audio_url} />
            </div>
          )}

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{ritual.content_full}</ReactMarkdown>
          </div>

          <Link
            to={`/rituais/${ritual.id}`}
            className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
            onClick={() => setOpen(false)}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Ver ritual completo
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RitualHelpButton;
