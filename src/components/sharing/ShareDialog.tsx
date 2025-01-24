import React from 'react';
import { X, Facebook, Twitter, MessageCircle, Link2, Mail } from 'lucide-react';

interface ShareDialogProps {
  tributeId: string;
  tributeName: string;
  onClose: () => void;
}

export function ShareDialog({ tributeId, tributeName, onClose }: ShareDialogProps) {
  const shareUrl = `${window.location.origin}/homenaje/${tributeId}`;
  const shareText = `Honrando la memoria de ${tributeName}`;

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'bg-[#1877F2] hover:bg-[#0C63D4]',
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: 'bg-[#1DA1F2] hover:bg-[#0C85D0]',
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      color: 'bg-[#25D366] hover:bg-[#1FAD53]',
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`Te invito a visitar este homenaje:\n${shareUrl}`)}`,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Enlace copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Compartir Homenaje</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Redes Sociales */}
          <div className="grid grid-cols-2 gap-4">
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                  text-white font-medium text-sm ${link.color}
                `}
              >
                {link.icon}
                {link.name}
              </a>
            ))}
          </div>

          {/* Copiar Enlace */}
          <div className="mt-4">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Copiar enlace"
              >
                <Link2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
