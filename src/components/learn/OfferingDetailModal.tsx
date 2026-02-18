import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import AudioPlayer from "@/components/AudioPlayer";
import type { Offering } from "@/hooks/useOfferings";

interface OfferingDetailModalProps {
  offering: Offering | null;
  open: boolean;
  onClose: () => void;
}

const OfferingDetailModal = ({ offering, open, onClose }: OfferingDetailModalProps) => {
  if (!offering) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="font-display text-xl">{offering.title}</DialogTitle>
          {offering.description && (
            <p className="text-sm text-muted-foreground mt-1">{offering.description}</p>
          )}
        </DialogHeader>

        <ScrollArea className="px-6 pb-6 max-h-[60vh]">
          {offering.audio_url && (
            <div className="mb-4">
              <AudioPlayer url={offering.audio_url} />
            </div>
          )}

          {offering.ingredients && (
            <div className="mb-4">
              <h4 className="font-display font-bold text-sm mb-2">Ingredientes</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                  {offering.ingredients}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {offering.instructions && (
            <div>
              <h4 className="font-display font-bold text-sm mb-2">Modo de Preparo</h4>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                  {offering.instructions}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default OfferingDetailModal;
