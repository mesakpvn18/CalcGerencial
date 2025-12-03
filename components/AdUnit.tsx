import React, { useEffect, useRef } from 'react';

interface Props {
  slotId: string; // ID do bloco de anúncio criado no AdSense
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  layoutKey?: string; // Para In-feed ads
  className?: string;
  testMode?: boolean; // Se true, mostra um placeholder visível para design
}

const AdUnit: React.FC<Props> = ({ slotId, format = 'auto', layoutKey, className, testMode = false }) => {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Evita erro em ambiente de desenvolvimento ou se o script não carregou
    if (testMode) return;

    try {
      // @ts-ignore
      const adsbygoogle = window.adsbygoogle || [];
      // @ts-ignore
      if (adRef.current && adRef.current.innerHTML === "") {
         adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, [testMode]);

  // Placeholder para você ver onde o anúncio ficará enquanto não aprova no AdSense
  if (testMode) {
     return (
        <div className={`bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs uppercase font-bold tracking-widest p-4 text-center ${className}`} style={{ minHeight: format === 'vertical' ? '400px' : '100px' }}>
           <span>Publicidade</span>
           <span className="text-[10px] opacity-50 mt-1">Google AdSense Area</span>
           <span className="text-[9px] opacity-30 font-mono mt-2">{format}</span>
        </div>
     );
  }

  return (
    <div className={`overflow-hidden my-4 flex justify-center bg-slate-50 dark:bg-slate-900/50 rounded-lg ${className}`}>
        {/* @ts-ignore */}
        <ins className="adsbygoogle"
            style={{ display: 'block', width: '100%', textAlign: 'center' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // SUBSTITUA PELO SEU ID REAL
            data-ad-slot={slotId} // SUBSTITUA PELO ID DO BLOCO
            data-ad-format={format}
            data-full-width-responsive="true"
            data-ad-layout-key={layoutKey}
            ref={adRef}
        />
    </div>
  );
};

export default AdUnit;