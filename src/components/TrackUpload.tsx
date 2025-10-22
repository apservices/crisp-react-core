import React, { useEffect, useState } from 'react';
import { useTracks } from '../hooks/useTracks';

interface UploadFile {
  file: File;
  id: string;
  status: 'uploading' | 'analyzing' | 'ready' | 'error';
  errorMsg?: string;
}

export const TrackUpload: React.FC = () => {
  const { addTrack } = useTracks();
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const onChange = () => setOnline(navigator.onLine);
    window.addEventListener('online', onChange);
    window.addEventListener('offline', onChange);
    return () => {
      window.removeEventListener('online', onChange);
      window.removeEventListener('offline', onChange);
    };
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const list: UploadFile[] = Array.from(files).map((file) => ({
      file,
      id: (window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`),
      status: 'uploading',
    }));
    setUploads((u) => [...u, ...list]);

    list.forEach(async (uItem) => {
      try {
        if (!navigator.onLine) throw new Error('Análise requer conexão ativa');
        // Immediately show server processing indicator
        setUploads((prev) => prev.map((f) => (f.id === uItem.id ? { ...f, status: 'analyzing' } : f)));
        await addTrack(uItem.file);
        // Final status will be reflected elsewhere (TrackLibrary); keep analyzing indicator here
      } catch (err: any) {
        setUploads((prev) =>
          prev.map((f) => (f.id === uItem.id ? { ...f, status: 'error', errorMsg: err?.message || 'Falha no upload/análise' } : f))
        );
      }
    });
  };

  return (
    <div className="border-2 border-dashed rounded-lg p-6 relative group hover:border-primary transition-smooth">
      {!online && (
        <div className="mb-3 text-sm text-destructive">Análise requer conexão ativa</div>
      )}
      <input
        type="file"
        multiple
        accept=".mp3,.wav,.m4a,.aac,.flac,.aiff,.aif,.ogg,.webm,.wma,audio/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="text-center text-muted-foreground group-hover:text-foreground">
        <div className="mb-2">Arraste arquivos aqui ou clique para selecionar</div>
        <div className="text-xs opacity-75">
          Formatos suportados: MP3, WAV, M4A, AAC, FLAC, AIFF, OGG (até 200MB)
        </div>
      </div>

      {uploads.length > 0 && (
        <ul className="mt-4 space-y-2">
          {uploads.map((u) => (
            <li key={u.id} className="flex justify-between items-center">
              <span className="truncate">{u.file.name}</span>
              <span>
                {u.status === 'uploading' && <em>Enviando…</em>}
                {u.status === 'analyzing' && <em>Processando no servidor…</em>}
                {u.status === 'ready' && (
                  <em className="text-green-600">Pronto</em>
                )}
                {u.status === 'error' && (
                  <em className="text-destructive">Erro: {u.errorMsg}</em>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrackUpload;
