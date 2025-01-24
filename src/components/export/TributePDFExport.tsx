import React, { useState } from 'react';
import { FileText, Download, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TributePDFExportProps {
  tributeId: string;
  tributeName: string;
}

export function TributePDFExport({ tributeId, tributeName }: TributePDFExportProps) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    setGenerating(true);
    setProgress(0);

    try {
      // Simular progreso
      const steps = ['datos', 'fotos', 'comentarios', 'timeline'];
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProgress(((i + 1) / steps.length) * 100);
      }

      // TODO: Implementar generación real del PDF
      const pdfBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homenaje-${tributeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al generar PDF:', err);
    } finally {
      setGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Exportar Homenaje
          </h2>
          <p className="text-gray-600">
            Descarga una versión digital del homenaje en formato PDF
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={generating}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </>
          )}
        </button>
      </div>

      {generating && (
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            {progress === 100 ? 'Completado' : 'Generando PDF...'}
          </p>
        </div>
      )}

      <div className="mt-6 border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          El PDF incluirá:
        </h3>
        <ul className="space-y-3">
          {[
            'Información principal y biografía',
            'Galería de fotos seleccionadas',
            'Línea de tiempo de eventos importantes',
            'Mensajes y dedicatorias',
            'Árbol genealógico',
          ].map((item, index) => (
            <li key={index} className="flex items-center text-gray-600">
              <FileText className="w-4 h-4 mr-2 text-indigo-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
