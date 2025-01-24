import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { ShareDialog } from './ShareDialog';

interface ShareButtonProps {
  tributeId: string;
  tributeName: string;
  className?: string;
}

export function ShareButton({ tributeId, tributeName, className = '' }: ShareButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className={`flex items-center gap-2 ${className}`}
      >
        <Share2 className="w-5 h-5" />
        Compartir
      </button>

      {dialogOpen && (
        <ShareDialog
          tributeId={tributeId}
          tributeName={tributeName}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  );
}
