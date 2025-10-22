import React, { useRef } from 'react';

interface UploaderProps {
  onFiles: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
}

export const Uploader: React.FC<UploaderProps> = ({ onFiles, accept = 'audio/*', multiple = true }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="border-2 border-dashed rounded p-4 text-center">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />
    </div>
  );
};

export default Uploader;
