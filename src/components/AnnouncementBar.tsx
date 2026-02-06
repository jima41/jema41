import { Sparkles } from 'lucide-react';

const AnnouncementBar = () => {
  return (
    <div className="relative bg-foreground overflow-hidden">
      <div className="shimmer py-2.5 px-4">
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-background">
          <Sparkles className="w-4 h-4" />
          <span>Livraison offerte dès 100€ d'achat</span>
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
