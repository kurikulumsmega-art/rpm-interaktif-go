import React, { useRef } from 'react';
import { RpmData } from '../types';

interface SignatureSectionProps {
  data: RpmData;
  onUpdate: (field: keyof RpmData, value: any) => void;
}

export const SignatureSection: React.FC<SignatureSectionProps> = ({ data, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpdate('guruSignatureSrc', ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div id="pengesahan" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8 scroll-mt-28 break-inside-avoid">
      <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-2 border-b border-blue-100">Lembar Pengesahan</h2>
      
      <div className="flex justify-end mb-8">
        <p className="text-gray-800">Purbalingga, {today}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {/* Kepala Sekolah */}
        <div className="flex flex-col items-center">
          <p className="mb-1 text-gray-600">Mengetahui,</p>
          <p className="font-bold text-gray-800">Kepala Sekolah</p>
          <div className="h-24 flex items-center justify-center my-2">
            <img src="https://i.ibb.co/6gS4bC2/ttd-Kepala-Sekolah.png" alt="TTD KS" className="h-full object-contain" />
          </div>
          <p className="font-bold underline text-gray-900">Maryono S.Pd, M.Si</p>
          <p className="text-sm text-gray-600">NIP. 19660701 2000121002</p>
        </div>

        {/* Waka Kurikulum */}
        <div className="flex flex-col items-center">
           <p className="mb-1 text-transparent select-none">Placeholder</p>
          <p className="font-bold text-gray-800">Waka Kurikulum</p>
          <div className="h-24 flex items-center justify-center my-2">
            <img src="https://i.ibb.co/6r09yC6/ttd-Kurikulum.png" alt="TTD Waka" className="h-full object-contain" />
          </div>
          <p className="font-bold underline text-gray-900">Satyo Nugroho, S.Kom</p>
          <p className="text-sm text-gray-600">NIP. 197807142009031006</p>
        </div>

        {/* Guru Mapel */}
        <div className="flex flex-col items-center relative group">
          <p className="mb-1 text-transparent select-none">Placeholder</p>
          <p className="font-bold text-gray-800">Guru Mata Pelajaran</p>
          
          <div className="h-24 flex items-center justify-center my-2 w-full relative">
            {data.guruSignatureSrc ? (
              <img src={data.guruSignatureSrc} alt="TTD Guru" className="h-full object-contain" />
            ) : (
              <div className="h-full w-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-xs no-print">
                Belum ada TTD
              </div>
            )}
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer no-print rounded"
              title="Unggah Tanda Tangan"
            >
              <span className="bg-white px-2 py-1 rounded text-xs font-bold shadow text-blue-600">Unggah</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>

          <p className="font-bold underline text-gray-900">{data.namaGuru || "..................................."}</p>
          <p className="text-sm text-gray-600">{data.nipGuru ? `NIP. ${data.nipGuru}` : "NIP. ........................."}</p>
        </div>
      </div>
    </div>
  );
};
