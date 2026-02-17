import { useState } from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRitualLinkForPoint } from "@/hooks/useRitualLinks";
import { useRitual } from "@/hooks/useRituals";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
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
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {ritual.image_url && (
                <img src={(ritual as any).image_url} alt={ritual.title} className="w-12 h-12 rounded-full object-cover shrink-0" />
              )}
              <div>
                <DialogTitle className="font-display">{ritual.title}</DialogTitle>
                <span className="text-xs text-muted-foreground capitalize">{(ritual as any).category}</span>
              </div>
            </div>
          </DialogHeader>

          {(ritual as any).audio_url && (
            <div className="mb-4">
              <AudioPlayer url={(ritual as any).audio_url} />
            </div>
          )}

          <div className="prose-ritual">
            <ReactMarkdown remarkPlugins={[remarkBreaks]}>{ritual.content_full}</ReactMarkdown>
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
