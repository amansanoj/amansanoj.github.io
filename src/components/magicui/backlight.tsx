import { useId, type ReactElement } from 'react';

// Magic UI Backlight, with a low-alpha glow so the original image stays crisp.
type BacklightProps = {
  children: ReactElement;
  className?: string;
  blur?: number;
  intensity?: number;
};

export function Backlight({ blur = 12, intensity = 0.08, children, className = '' }: BacklightProps) {
  const id = useId();
  return <span className={`image-backlight ${className}`}>
    <svg className="backlight-filter" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id={id} y="-50%" x="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blurred" />
        <feColorMatrix type="saturate" in="blurred" values="1.4" result="tinted" />
        <feComponentTransfer in="tinted" result="glow"><feFuncA type="linear" slope={intensity} /></feComponentTransfer>
        <feComposite in="SourceGraphic" in2="glow" operator="over" />
      </filter>
    </svg>
    <span className="backlight-content" style={{filter:`url(#${id})`}}>{children}</span>
  </span>;
}
