import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { Header, Footer, SectionCard } from './components/Layout';
import { Input, TextArea, Modal, Button, LoadingOverlay, Toast } from './components/UI';
import { SignatureSection } from './components/SignatureSection';
import { RpmData, GenerationContext } from './types';
import { INITIAL_RPM_DATA, TEACHER_DATA, SECTIONS_TO_GENERATE } from './constants';
import { generateAiContent } from './services/geminiService';

// --- Helper Components ---

const AiButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button 
    onClick={onClick}
    className="bg-violet-50 hover:bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-colors border border-violet-200 no-print"
  >
    <Sparkles size={12} />
    {label}
  </button>
);

const Row: React.FC<{ label: string; children: React.ReactNode; aiAction?: () => void }> = ({ label, children, aiAction }) => (
  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 py-2 border-b border-gray-100 last:border-0">
    <div className="md:col-span-3 lg:col-span-3 flex flex-col justify-start pt-2">
      <label className="font-semibold text-gray-700 text-sm">{label}</label>
      {aiAction && (
        <div className="mt-2">
          <AiButton onClick={aiAction} label="Buat dengan AI" />
        </div>
      )}
    </div>
    <div className="md:col-span-9 lg:col-span-9">
      {children}
    </div>
  </div>
);

function App() {
  // --- State ---
  const [data, setData] = useState<RpmData>(INITIAL_RPM_DATA);
  const [activeSection, setActiveSection] = useState('umum');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiContext, setAiContext] = useState<{ promptKey: string; targetField: keyof RpmData; title: string } | null>(null);
  const [aiUserPrompt, setAiUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [showConfirmBulk, setShowConfirmBulk] = useState(false);

  // --- Derived State ---
  const teacherNames = Object.keys(TEACHER_DATA);
  const [filteredTeachers, setFilteredTeachers] = useState<string[]>([]);
  const [showTeacherSuggestions, setShowTeacherSuggestions] = useState(false);

  // --- Effects ---
  
  // Load data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('rpmInteractiveData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Merge with initial to ensure all keys exist
        setData(prev => ({ ...prev, ...parsed }));
        setToast({ message: 'Data tersimpan berhasil dimuat', type: 'success' });
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Intersection Observer for Scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -60% 0px' }
    );

    document.querySelectorAll('.rpm-section, #pengesahan').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // --- Handlers ---

  const updateField = (field: keyof RpmData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeacherInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateField('namaGuru', val);
    
    if (val.length > 0) {
      const matches = teacherNames.filter(name => name.toLowerCase().includes(val.toLowerCase()));
      setFilteredTeachers(matches);
      setShowTeacherSuggestions(true);
    } else {
      setShowTeacherSuggestions(false);
    }
  };

  const selectTeacher = (name: string) => {
    updateField('namaGuru', name);
    updateField('nipGuru', TEACHER_DATA[name]);
    setShowTeacherSuggestions(false);
  };

  const handleSave = () => {
    localStorage.setItem('rpmInteractiveData', JSON.stringify(data));
    setToast({ message: 'Progres berhasil disimpan!', type: 'success' });
  };

  const handleClear = () => {
    setData(INITIAL_RPM_DATA);
    localStorage.removeItem('rpmInteractiveData');
    setShowConfirmClear(false);
    setToast({ message: 'Formulir dikosongkan.', type: 'success' });
  };

  const getGenerationContext = (): GenerationContext => ({
    MATA_PELAJARAN: data.mataPelajaran || '[Mapel]',
    TOPIK: data.materiAjar || '[Topik]',
    KELAS: data.kelas || '[Kelas]',
    FASE: data.fase || '[Fase]',
    TUJUAN_PEMBELAJARAN: data.desainTujuan || '[Tujuan Pembelajaran]',
    CAPAIAN_PEMBELAJARAN: data.desainCapaian || '[Capaian]',
    PRAKTIK_PEDAGOGIS: data.desainPedagogis || '[Pedagogi]'
  });

  const openAiModal = (promptKey: string, targetField: keyof RpmData, title: string) => {
    setAiContext({ promptKey, targetField, title });
    setAiUserPrompt('');
    setIsAiModalOpen(true);
  };

  const handleAiGenerate = async () => {
    if (!aiContext) return;
    
    setIsLoading(true);
    setLoadingMessage(`Membuat ${aiContext.title}...`);
    setIsAiModalOpen(false);

    try {
      const result = await generateAiContent(aiContext.promptKey, getGenerationContext(), aiUserPrompt);
      updateField(aiContext.targetField, result);
      setToast({ message: 'Konten berhasil dibuat!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Gagal membuat konten. Coba lagi.', type: 'error' });
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
      setAiContext(null);
    }
  };

  const handleBulkGenerate = async () => {
    setShowConfirmBulk(false);
    if (!data.desainTujuan) {
      setToast({ message: 'Isi "Tujuan Pembelajaran" terlebih dahulu!', type: 'error' });
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Sedang memproses semua bagian (Parallel)...');
    
    const context = getGenerationContext();

    // Run all requests in parallel
    const promises = SECTIONS_TO_GENERATE.map(async (section) => {
      try {
        const result = await generateAiContent(section.promptKey, context);
        return { field: section.target, value: result, success: true };
      } catch (error) {
        return { field: section.target, value: '', success: false };
      }
    });

    const results = await Promise.allSettled(promises);
    
    const newData = { ...data };
    let successCount = 0;
    let failCount = 0;

    results.forEach((res) => {
      if (res.status === 'fulfilled' && res.value.success) {
        // Type casting is now safer because SECTIONS_TO_GENERATE target is typed as StringKeys<RpmData>
        // which excludes non-string fields like dimensiProfil
        const fieldName = res.value.field as keyof RpmData;
        // We can safely assign because we know these fields are strings in the data object based on our new type definition
        (newData as any)[fieldName] = res.value.value;
        successCount++;
      } else {
        failCount++;
      }
    });

    setData(newData);
    setIsLoading(false);
    setLoadingMessage('');
    
    if (failCount === 0) {
      setToast({ message: `Berhasil membuat ${successCount} bagian!`, type: 'success' });
    } else {
      setToast({ message: `${successCount} berhasil, ${failCount} gagal.`, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      {isLoading && <LoadingOverlay message={loadingMessage} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Header 
        onSave={handleSave} 
        onClear={() => setShowConfirmClear(true)} 
        onPrint={() => window.print()} 
        onBulkGenerate={() => setShowConfirmBulk(true)}
        activeSection={activeSection}
      />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Informasi Umum */}
        <SectionCard id="umum" title="Informasi Umum">
          <Row label="Satuan Pendidikan">
            <Input value={data.satuanPendidikan} readOnly className="bg-gray-100 text-gray-600 cursor-not-allowed" />
          </Row>
          <Row label="Guru & NIP">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              <div className="relative">
                <Input 
                  placeholder="Nama Guru" 
                  value={data.namaGuru} 
                  onChange={handleTeacherInput}
                  onFocus={() => data.namaGuru && setShowTeacherSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTeacherSuggestions(false), 200)} // Delay to allow click
                />
                {showTeacherSuggestions && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredTeachers.map(name => (
                      <div 
                        key={name} 
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                        onClick={() => selectTeacher(name)}
                      >
                        {name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Input placeholder="NIP" value={data.nipGuru} onChange={(e) => updateField('nipGuru', e.target.value)} />
            </div>
          </Row>
          <Row label="Detail Kelas">
            <div className="grid grid-cols-3 gap-4">
              <Input placeholder="Kelas (X)" value={data.kelas} onChange={(e) => updateField('kelas', e.target.value)} />
              <Input placeholder="Semester (Ganjil)" value={data.semester} onChange={(e) => updateField('semester', e.target.value)} />
              <Input placeholder="Fase (E)" value={data.fase} onChange={(e) => updateField('fase', e.target.value)} />
            </div>
          </Row>
          <Row label="Mata Pelajaran">
            <Input placeholder="Nama Mata Pelajaran" value={data.mataPelajaran} onChange={(e) => updateField('mataPelajaran', e.target.value)} />
          </Row>
          <Row label="Elemen">
             <Input placeholder="Elemen CP" value={data.elemen} onChange={(e) => updateField('elemen', e.target.value)} />
          </Row>
           <Row label="Materi Ajar">
             <Input placeholder="Topik Materi" value={data.materiAjar} onChange={(e) => updateField('materiAjar', e.target.value)} />
          </Row>
           <Row label="Alokasi Waktu">
             <Input placeholder="Contoh: 6 JP (2x Pertemuan)" value={data.alokasiWaktu} onChange={(e) => updateField('alokasiWaktu', e.target.value)} />
          </Row>
        </SectionCard>

        {/* Identifikasi */}
        <SectionCard id="identifikasi" title="Identifikasi">
          <Row label="Peserta Didik" aiAction={() => openAiModal('identifikasi_murid', 'identifikasiPeserta', 'Identifikasi Murid')}>
            <TextArea value={data.identifikasiPeserta} onChange={(e) => updateField('identifikasiPeserta', e.target.value)} />
          </Row>
          <Row label="Materi Pelajaran" aiAction={() => openAiModal('identifikasi_materi', 'identifikasiMateri', 'Identifikasi Materi')}>
            <TextArea value={data.identifikasiMateri} onChange={(e) => updateField('identifikasiMateri', e.target.value)} />
          </Row>
          <Row label="Dimensi Profil">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {['Keimanan', 'Kebhinekaan', 'Gotong Royong', 'Mandiri', 'Bernalar Kritis', 'Kreatif'].map(dim => (
                <label key={dim} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={!!data.dimensiProfil[dim]}
                    onChange={(e) => {
                      const newDims = { ...data.dimensiProfil, [dim]: e.target.checked };
                      updateField('dimensiProfil', newDims);
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  {dim}
                </label>
              ))}
            </div>
          </Row>
        </SectionCard>

        {/* Desain */}
        <SectionCard id="desain" title="Desain Pembelajaran">
           <Row label="Capaian Pembelajaran">
            <TextArea 
              value={data.desainCapaian} 
              onChange={(e) => updateField('desainCapaian', e.target.value)} 
              placeholder="Salin CP dari kurikulum..."
            />
          </Row>
           <Row label="Tujuan Pembelajaran" aiAction={() => openAiModal('tujuan_pembelajaran', 'desainTujuan', 'Tujuan Pembelajaran')}>
            <TextArea value={data.desainTujuan} onChange={(e) => updateField('desainTujuan', e.target.value)} />
          </Row>
          <Row label="Lintas Disiplin" aiAction={() => openAiModal('lintas_disiplin', 'desainLintasDisiplin', 'Lintas Disiplin')}>
            <TextArea value={data.desainLintasDisiplin} onChange={(e) => updateField('desainLintasDisiplin', e.target.value)} />
          </Row>
          <Row label="Topik Pembelajaran" aiAction={() => openAiModal('topik_pembelajaran', 'desainTopik', 'Topik Pembelajaran')}>
            <TextArea value={data.desainTopik} onChange={(e) => updateField('desainTopik', e.target.value)} />
          </Row>
          <Row label="Praktik Pedagogis" aiAction={() => openAiModal('praktik_pedagogis', 'desainPedagogis', 'Praktik Pedagogis')}>
            <TextArea value={data.desainPedagogis} onChange={(e) => updateField('desainPedagogis', e.target.value)} />
          </Row>
           <Row label="Kemitraan" aiAction={() => openAiModal('kemitraan_pembelajaran', 'desainKemitraan', 'Kemitraan')}>
            <TextArea value={data.desainKemitraan} onChange={(e) => updateField('desainKemitraan', e.target.value)} />
          </Row>
           <Row label="Lingkungan Belajar" aiAction={() => openAiModal('lingkungan_pembelajaran', 'desainLingkungan', 'Lingkungan Belajar')}>
            <TextArea value={data.desainLingkungan} onChange={(e) => updateField('desainLingkungan', e.target.value)} />
          </Row>
           <Row label="Pemanfaatan Digital" aiAction={() => openAiModal('pemanfaatan_digital', 'desainDigital', 'Pemanfaatan Digital')}>
            <TextArea value={data.desainDigital} onChange={(e) => updateField('desainDigital', e.target.value)} />
          </Row>
        </SectionCard>

         {/* Pengalaman */}
        <SectionCard id="pengalaman" title="Pengalaman Belajar">
          <Row label="Kegiatan Awal" aiAction={() => openAiModal('pengalaman_awal', 'pengalamanAwal', 'Kegiatan Awal')}>
            <TextArea value={data.pengalamanAwal} onChange={(e) => updateField('pengalamanAwal', e.target.value)} />
          </Row>
          <Row label="Kegiatan Inti" aiAction={() => openAiModal('pengalaman_inti', 'pengalamanInti', 'Kegiatan Inti')}>
            <TextArea value={data.pengalamanInti} onChange={(e) => updateField('pengalamanInti', e.target.value)} />
          </Row>
          <Row label="Kegiatan Penutup" aiAction={() => openAiModal('pengalaman_penutup', 'pengalamanPenutup', 'Kegiatan Penutup')}>
            <TextArea value={data.pengalamanPenutup} onChange={(e) => updateField('pengalamanPenutup', e.target.value)} />
          </Row>
        </SectionCard>

        {/* Asesmen */}
        <SectionCard id="asesmen" title="Asesmen">
          <Row label="Asesmen Awal" aiAction={() => openAiModal('asesmen_awal', 'asesmenAwal', 'Asesmen Awal')}>
            <TextArea value={data.asesmenAwal} onChange={(e) => updateField('asesmenAwal', e.target.value)} />
          </Row>
          <Row label="Asesmen Proses" aiAction={() => openAiModal('asesmen_proses', 'asesmenProses', 'Asesmen Proses')}>
            <TextArea value={data.asesmenProses} onChange={(e) => updateField('asesmenProses', e.target.value)} />
          </Row>
          <Row label="Asesmen Akhir" aiAction={() => openAiModal('asesmen_akhir', 'asesmenAkhir', 'Asesmen Akhir')}>
            <TextArea value={data.asesmenAkhir} onChange={(e) => updateField('asesmenAkhir', e.target.value)} />
          </Row>
        </SectionCard>

         {/* Pengesahan */}
        <SignatureSection data={data} onUpdate={updateField} />

         {/* Lampiran */}
        <SectionCard id="lampiran" title="Lampiran">
          <Row label="Diagnostik Non-Kognitif" aiAction={() => openAiModal('lampiran_diagnostik', 'lampiranDiagnostik', 'Lampiran Diagnostik')}>
            <TextArea value={data.lampiranDiagnostik} onChange={(e) => updateField('lampiranDiagnostik', e.target.value)} />
          </Row>
          <Row label="Rubrik Diskusi" aiAction={() => openAiModal('lampiran_rubrik_diskusi', 'lampiranRubrikDiskusi', 'Rubrik Diskusi')}>
            <TextArea value={data.lampiranRubrikDiskusi} onChange={(e) => updateField('lampiranRubrikDiskusi', e.target.value)} />
          </Row>
          <Row label="Rubrik Presentasi" aiAction={() => openAiModal('lampiran_rubrik_presentasi', 'lampiranRubrikPresentasi', 'Rubrik Presentasi')}>
            <TextArea value={data.lampiranRubrikPresentasi} onChange={(e) => updateField('lampiranRubrikPresentasi', e.target.value)} />
          </Row>
          <Row label="LKPD" aiAction={() => openAiModal('lampiran_lkpd', 'lampiranLkpd', 'LKPD')}>
            <TextArea value={data.lampiranLkpd} onChange={(e) => updateField('lampiranLkpd', e.target.value)} />
          </Row>
          <Row label="Materi Ajar" aiAction={() => openAiModal('lampiran_materi', 'lampiranMateri', 'Materi Ajar')}>
            <TextArea value={data.lampiranMateri} onChange={(e) => updateField('lampiranMateri', e.target.value)} />
          </Row>
        </SectionCard>

      </main>
      <Footer />

      {/* --- Modals --- */}
      
      <Modal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        title={`AI Generator: ${aiContext?.title}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAiModalOpen(false)}>Batal</Button>
            <Button onClick={handleAiGenerate} icon={<Sparkles size={16}/>}>Buat Konten</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-3">Tambahkan instruksi khusus agar hasil lebih sesuai (opsional):</p>
        <TextArea 
          placeholder="Contoh: Fokuskan pada kegiatan berkelompok..." 
          value={aiUserPrompt} 
          onChange={(e) => setAiUserPrompt(e.target.value)} 
          className="!min-h-[80px]"
        />
      </Modal>

      <Modal 
        isOpen={showConfirmClear} 
        onClose={() => setShowConfirmClear(false)} 
        title="Konfirmasi Reset"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConfirmClear(false)}>Batal</Button>
            <Button variant="danger" onClick={handleClear}>Ya, Hapus Semua</Button>
          </>
        }
      >
        <p>Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan.</p>
      </Modal>

      <Modal 
        isOpen={showConfirmBulk} 
        onClose={() => setShowConfirmBulk(false)} 
        title="Isi Otomatis Semua Bagian"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowConfirmBulk(false)}>Batal</Button>
            <Button variant="primary" onClick={handleBulkGenerate}>Mulai Proses AI</Button>
          </>
        }
      >
        <p>Proses ini akan menggunakan AI untuk mengisi semua field yang kosong berdasarkan <strong>Tujuan Pembelajaran</strong>. Proses ini memakan waktu sekitar 30-60 detik.</p>
        <p className="mt-2 text-sm text-gray-500 bg-gray-100 p-2 rounded">Pastikan field Tujuan Pembelajaran sudah terisi dengan lengkap dan jelas.</p>
      </Modal>

    </div>
  );
}

export default App;