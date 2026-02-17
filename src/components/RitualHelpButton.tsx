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
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-0">
          {(ritual as any).image_url && (
            <div className="relative w-full h-36 sm:h-44 rounded-t-2xl overflow-hidden">
              <img src={(ritual as any).image_url} alt={ritual.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h2 className="text-white font-display font-bold text-lg leading-tight">{ritual.title}</h2>
                <span className="text-white/70 text-xs capitalize">{(ritual as any).category}</span>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6">
            {!(ritual as any).image_url && (
              <DialogHeader>
                <DialogTitle className="font-display">{ritual.title}</DialogTitle>
                <span className="text-xs text-muted-foreground capitalize">{(ritual as any).category}</span>
              </DialogHeader>
            )}

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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RitualHelpButton;
