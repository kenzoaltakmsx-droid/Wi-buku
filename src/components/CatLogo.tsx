import React from 'react';
import logoKucing from '@/assets/logo-kucing.svg';

interface CatLogoProps {
  className?: string;
  size?: number;
}

export default function CatLogo({ className = '', size = 36 }: CatLogoProps) {
  return (
    <img
      src={logoKucing}
      alt="Wi-Buku Logo"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`object-contain select-none max-w-none ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}


