import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-2 bg-muted rounded">
      <div className="h-2 bg-primary rounded" style={{ width: `${safe}%` }} />
    </div>
  );
};

export default ProgressBar;
