import { useEffect, useState } from 'react';
import { certificateApi } from '../services/api';
import type { Certificate } from '../types';

export default function ZertifikatePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateApi.list()
      .then(({ data }) => setCertificates(data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-ink font-headline mb-1">Zertifikate</h1>
        <p className="text-sm text-ink-variant">Zertifikate und Nachweise der Alpha Collection zum Download</p>
      </div>

      <div className="bg-white p-8">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-surface-low animate-pulse" />)}
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-5xl text-ink-faint/20 mb-3 block">verified</span>
            <p className="text-ink-variant text-sm">Derzeit keine Zertifikate verfügbar.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-low">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 bg-brand-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-brand-500 text-[22px]">picture_as_pdf</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{cert.name}</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">
                    {new Date(cert.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <a
                  href={cert.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-brand-500 border border-brand-200 hover:bg-brand-50 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
