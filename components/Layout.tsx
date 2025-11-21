import React from 'react';
import { Printer, Save, Trash2, Sparkles } from 'lucide-react';
import { Button } from './UI';

interface HeaderProps {
  onSave: () => void;
  onClear: () => void;
  onPrint: () => void;
  onBulkGenerate: () => void;
  activeSection: string;
}

const NAV_LINKS = [
  { id: 'umum', label: 'Informasi Umum' },
  { id: 'identifikasi', label: 'Identifikasi' },
  { id: 'desain', label: 'Desain' },
  { id: 'pengalaman', label: 'Pengalaman' },
  { id: 'asesmen', label: 'Asesmen' },
  { id: 'pengesahan', label: 'Pengesahan' },
  { id: 'lampiran', label: 'Lampiran' },
];

export const Header: React.FC<HeaderProps> = ({ onSave, onClear, onPrint, onBulkGenerate, activeSection }) => {
  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-gray-200 no-print">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex-shrink-0 text-center lg:text-left">
            <h1 className="text-xl font-bold text-blue-800">RPM Interaktif</h1>
            <p className="text-xs font-semibold text-gray-500">SMK N 1 Purbalingga</p>
          </div>
          
          <nav className="flex overflow-x-auto w-full lg:w-auto gap-1 pb-2 lg:pb-0 mask-linear">
            {NAV_LINKS.map(link => (
              <a 
                key={link.id}
                href={`#${link.id}`}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeSection === link.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button onClick={onBulkGenerate} variant="primary" className="!bg-violet-600 hover:!bg-violet-700 text-sm px-3" icon={<Sparkles size={16} />}>
              Isi Otomatis
            </Button>
            <Button onClick={onSave} variant="secondary" className="text-sm px-3" icon={<Save size={16} />}>
              Simpan
            </Button>
            <Button onClick={onClear} variant="danger" className="text-sm px-3" icon={<Trash2 size={16} />}>
              Reset
            </Button>
             <Button onClick={onPrint} variant="ghost" className="text-sm px-3" icon={<Printer size={16} />}>
              Cetak
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

interface SectionCardProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({ id, title, children }) => {
  return (
    <div id={id} className="rpm-section flex flex-col md:flex-row bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8 scroll-mt-28 break-inside-avoid">
      <div className="rpm-category w-full md:w-1/4 bg-blue-900 p-6 flex items-center md:justify-start justify-center border-b md:border-b-0 md:border-r border-blue-800">
        <h3 className="text-lg font-bold text-white text-center md:text-left">{title}</h3>
      </div>
      <div className="rpm-content w-full md:w-3/4 p-6 space-y-6">
        {children}
      </div>
    </div>
  );
};

export const Footer: React.FC = () => (
  <footer className="text-center py-8 text-gray-500 text-sm no-print">
    <p>RPM Interaktif dengan Bantuan AI.</p>
    <p>&copy; {new Date().getFullYear()} SMK N 1 Purbalingga. All Rights Reserved.</p>
  </footer>
);
