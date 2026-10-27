import { useState } from 'react';
import { Building2, User } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackType?: 'workspace' | 'avatar';
  initials?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackType = 'workspace',
  initials = 'HR',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    if (fallbackType === 'avatar') {
      return (
        <div
          className={`flex items-center justify-center bg-slate-200 text-slate-700 font-semibold select-none ${className}`}
          aria-label={alt}
        >
          {initials ? (
            <span className="text-xs tracking-tight">{initials.slice(0, 2).toUpperCase()}</span>
          ) : (
            <User className="w-4 h-4 text-slate-500" />
          )}
        </div>
      );
    }

    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-slate-300 p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="w-8 h-8 text-slate-400 mb-2" />
        <span className="text-sm font-medium text-slate-200">Human Resource Management System</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
