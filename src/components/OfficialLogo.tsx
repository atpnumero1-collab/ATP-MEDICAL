import React from 'react';

interface OfficialAtpLogoProps {
  className?: string;
  transparentBg?: boolean;
}

/**
 * Renderizado vectorial (SVG puro) de alta definición de las siglas oficiales ATP.
 * Garantiza nitidez infinita en cualquier resolución de pantalla (4K, Retina, móvil e impresión PDF)
 * sin pixelación ni artefactos de compresión JPG.
 */
export const OfficialAtpLogo: React.FC<OfficialAtpLogoProps> = ({
  className = 'w-full h-full',
  transparentBg = false
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="310 230 1305 580"
      className={className}
      shapeRendering="geometricPrecision"
      role="img"
      aria-label="Siglas Oficiales ATP"
    >
      {!transparentBg && (
        <rect x="310" y="230" width="1305" height="580" fill="#F4F4F4" />
      )}

      {/* 1. Sigla 'a' (Izquierda) */}
      {/* Lóbulo superior derecho azul marino (#132352) */}
      <path
        d="M 488.5 606.5 L 488.5 546.5 A 87.5 87.5 0 0 1 663.5 546.5 L 663.5 606.5 Z"
        fill="#132352"
      />
      {/* Lóbulo inferior horizontal turquesa (#18DACB) */}
      <path
        d="M 663.5 606 L 429 606 A 87.5 87.5 0 0 0 429 781 L 663.5 781 Z"
        fill="#18DACB"
      />

      {/* 2. Sigla 't' / Cruz Médica (Centro) */}
      {/* Círculo superior turquesa (#18DACB) */}
      <circle cx="961.5" cy="345.5" r="87.5" fill="#18DACB" />
      {/* Brazo izquierdo turquesa (#18DACB) */}
      <path
        d="M 875 459 L 814 459 A 87.5 87.5 0 0 0 814 634 L 875 634 Z"
        fill="#18DACB"
      />
      {/* Cuerpo central y brazo derecho azul marino (#132352) */}
      <path
        d="M 874 459 L 1108.5 459 A 87.5 87.5 0 0 1 1108.5 634 L 1049 634 L 1049 693.5 A 87.5 87.5 0 0 1 874 693.5 Z"
        fill="#132352"
      />

      {/* 3. Sigla 'p' (Derecha) */}
      {/* Cuerpo azul marino (#132352) */}
      <path
        d="M 1346.5 459 L 1493.5 459 A 87.5 87.5 0 0 1 1493.5 634 L 1434 634 L 1434 693.5 A 87.5 87.5 0 0 1 1259 693.5 L 1259 546.5 L 1346.5 546.5 Z"
        fill="#132352"
      />
      {/* Círculo superior izquierdo turquesa (#18DACB) */}
      <circle cx="1346.5" cy="546.5" r="87.5" fill="#18DACB" />
    </svg>
  );
};
