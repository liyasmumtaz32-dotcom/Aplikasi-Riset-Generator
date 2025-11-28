import React, { useState } from 'react';
import type { FormState } from '../types';
import { ResearchMethod } from '../types';
// Fix: Corrected typo from NOVEL_WRITING_STYYLES to NOVEL_WRITING_STYLES.
import { RESEARCH_TYPES, CITATION_STYLES, REFERENCE_TYPES, ACADEMIC_WRITING_STYLES, NOVEL_WRITING_STYLES, OUTPUT_LANGUAGES, MAJORS, STUDY_PROGRAMS, CHAPTERS, RESEARCH_INSTRUMENTS } from '../constants';
import { GenerateIcon, ChevronDownIcon, PlusIcon, PencilIcon, TrashIcon } from './IconComponents';

interface ResearchFormProps {
  formState: FormState;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, options?: { isChapterCheck?: boolean, value?: string, isChapterPageCount?: boolean, isChapterReferenceCount?: boolean, chapterName?: string, isInstrumentCheck?: boolean }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSearchTitles: () => void;
  isSearchingTitles: boolean;
  isSuggestingVariables: boolean;
  onAddChapter: (name?: string) => void;
  onEditChapter: (name: string) => void;
  onDeleteChapter: (name: string) => void;
  onReorderChapters: (chapters: string[]) => void;
  isLoading: boolean;
  dynamicChapters: string[];
}

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 text-left font-semibold text-gray-800 dark:text-gray-200"
      >
        <span>{title}</span>
        <ChevronDownIcon className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen pb-4' : 'max-h-0'}`}>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};


export const ResearchForm: React.FC<ResearchFormProps> = ({ 
  formState, 
  onFormChange, 
  onSubmit,
  onSearchTitles,
  isSearchingTitles,
  isSuggestingVariables,
  onAddChapter, 
  onEditChapter, 
  onDeleteChapter, 
  onReorderChapters, 
  isLoading,
  dynamicChapters
}) => {
  const [newChapterInput, setNewChapterInput] = useState('');

  const inputBaseClasses = "w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed";
  const currentYear = new Date().getFullYear();
  
  const isCreativeMode = formState.researchType === 'Novel' || formState.researchType === 'Cerita';
  const isBookMode = formState.researchType === 'Buku' || formState.researchType === 'Buku Pelajaran';
  const isSermonMode = formState.researchType === 'Khutbah';
  const isManualChapterMode = isCreativeMode || isBookMode;

  const disableAcademicFields = isCreativeMode || isBookMode || isSermonMode;
  const disableReferenceFields = isCreativeMode; 
  
  const writingStyles = isCreativeMode ? NOVEL_WRITING_STYLES : ACADEMIC_WRITING_STYLES;
  
  const REFERENCE_SOURCES = ['Google Scholar', 'Google Search'];

  // --- Drag and Drop State and Handlers (for creative mode) ---
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); 
  };

  const handleDragEnter = (index: number) => {
    if (index !== dragItem.current) {
        dragOverItem.current = index;
        setDragOverIndex(index);
    }
  };
  
  const handleDrop = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const reordered = [...dynamicChapters];
      const draggedItemContent = reordered.splice(dragItem.current, 1)[0];
      reordered.splice(dragOverItem.current, 0, draggedItemContent);
      onReorderChapters(reordered);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDragOverIndex(null);
  };
  
  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
    setDragOverIndex(null);
  };

  const handleAddClick = () => {
    if (newChapterInput.trim()) {
      onAddChapter(newChapterInput.trim());
      setNewChapterInput('');
    }
  };

  const handleSelectAllChapters = () => {
    onFormChange({} as React.ChangeEvent<HTMLInputElement>, { isChapterCheck: true, value: 'SELECT_ALL' });
  }
  const handleDeselectAllChapters = () => {
    onFormChange({} as React.ChangeEvent<HTMLInputElement>, { isChapterCheck: true, value: 'DESELECT_ALL' });
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Parameter Karya</h2>
      <form onSubmit={onSubmit}>
        <div className="overflow-y-auto max-h-[calc(100vh-24rem)] pr-3 custom-scrollbar">
          <AccordionItem title="Informasi Dasar" defaultOpen={true}>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formState.title}
                onChange={onFormChange}
                placeholder={isManualChapterMode ? "Contoh: Sang Penjelajah Waktu" : "Contoh: Analisis Sentimen..."}
                className={inputBaseClasses}
                required
              />
            </div>
            <div>
              <label htmlFor="researchType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Karya</label>
              <select id="researchType" name="researchType" value={formState.researchType} onChange={onFormChange} className={inputBaseClasses}>
                {RESEARCH_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            {isCreativeMode && (
              <div>
                <label htmlFor="synopsis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sinopsis / Garis Besar Cerita</label>
                <textarea
                  id="synopsis"
                  name="synopsis"
                  value={formState.synopsis}
                  onChange={onFormChange}
                  rows={4}
                  placeholder="Jelaskan alur cerita utama, karakter kunci, dan konflik utama novel Anda. Semakin detail, semakin baik hasilnya."
                  className={inputBaseClasses}
                />
              </div>
            )}
            <div>
                <label htmlFor="outputLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bahasa Output</label>
                <select id="outputLanguage" name="outputLanguage" value={formState.outputLanguage} onChange={onFormChange} className={inputBaseClasses}>
                    {OUTPUT_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
            </div>
          </AccordionItem>

          <AccordionItem title="Pencarian Judul (AI)">
              <div>
                  <label htmlFor="topicDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi Topik</label>
                  <textarea
                      id="topicDescription"
                      name="topicDescription"
                      value={formState.topicDescription}
                      onChange={onFormChange}
                      rows={3}
                      placeholder="Jelaskan secara singkat topik atau ide yang ingin Anda teliti atau tulis..."
                      className={inputBaseClasses}
                  />
              </div>
               <div>
                  <label htmlFor="jurusan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jurusan / Fakultas</label>
                  <select id="jurusan" name="jurusan" value={formState.jurusan} onChange={onFormChange} className={inputBaseClasses}>
                      {MAJORS.map(major => <option key={major} value={major}>{major}</option>)}
                  </select>
              </div>
              <div>
                  <label htmlFor="programStudi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi</label>
                  <select id="programStudi" name="programStudi" value={formState.programStudi} onChange={onFormChange} className={inputBaseClasses}>
                      {(STUDY_PROGRAMS[formState.jurusan] || []).map(program => <option key={program} value={program}>{program}</option>)}
                  </select>
              </div>
               <button
                type="button"
                onClick={onSearchTitles}
                disabled={isSearchingTitles || !formState.topicDescription}
                className="w-full flex items-center justify-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isSearchingTitles ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mencari...
                  </>
                ) : (
                  <>
                    <GenerateIcon />
                    Cari Judul dengan AI
                  </>
                )}
              </button>
          </AccordionItem>
          
          <AccordionItem title="Pemilihan Bab">
             <div className="space-y-3">
                 <div className="grid grid-cols-2 gap-2 text-sm">
                     <button type="button" onClick={handleSelectAllChapters} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition">Pilih Semua</button>
                     <button type="button" onClick={handleDeselectAllChapters} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition">Hapus Pilihan</button>
                 </div>
                 
                 {isManualChapterMode ? (
                     <div className="space-y-3">
                         <div className="flex gap-2">
                             <input
                                 type="text"
                                 value={newChapterInput}
                                 onChange={(e) => setNewChapterInput(e.target.value)}
                                 onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddClick(); } }}
                                 placeholder="Ketik nama bab baru..."
                                 className={inputBaseClasses}
                             />
                             <button type="button" onClick={handleAddClick} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-shrink-0"><PlusIcon/></button>
                         </div>
                         {dynamicChapters.length > 0 ? (
                             <ul className="space-y-1 bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md border border-slate-300 dark:border-slate-600 max-h-60 overflow-y-auto">
                                 {dynamicChapters.map((ch, index) => (
                                     <li key={`${ch}-${index}`} draggable onDragStart={(e) => handleDragStart(e, index)} onDragEnter={() => handleDragEnter(index)} onDragEnd={handleDragEnd} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                                         className={`relative group p-2 rounded-md transition-all duration-200 text-sm hover:bg-slate-200 dark:hover:bg-slate-600 ${formState.selectedChapters.includes(ch) ? 'bg-blue-100 dark:bg-blue-900 ring-1 ring-blue-500' : ''}`}>
                                         <div className={`absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-full transition-transform duration-200 ease-in-out ${dragOverIndex === index ? 'scale-x-100' : 'scale-x-0'}`} style={{ transformOrigin: 'left' }}></div>
                                         <div className="flex items-center justify-between gap-2">
                                             <label className="flex items-center gap-2 cursor-pointer flex-grow min-w-0">
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 cursor-grab flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
                                                 <input
                                                     type="checkbox"
                                                     name="selectedChapters"
                                                     value={ch}
                                                     checked={formState.selectedChapters.includes(ch)}
                                                     onChange={(e) => onFormChange(e, { isChapterCheck: true })}
                                                     className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                 />
                                                 <span className="ml-2 flex-grow truncate" title={ch}>{ch}</span>
                                             </label>
                                             <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                     <label htmlFor={`pageCount-${ch}`} className="sr-only">Halaman untuk {ch}</label>
                                                     <select
                                                        id={`pageCount-${ch}`}
                                                        value={formState.chapterPageCounts[ch] || formState.pageCount}
                                                        onChange={(e) => onFormChange(e, { isChapterPageCount: true, chapterName: ch })}
                                                        disabled={!formState.selectedChapters.includes(ch)}
                                                        className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                     >
                                                        {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                                                            <option key={num} value={num}>{num}</option>
                                                        ))}
                                                     </select>
                                                     <span className="text-xs text-gray-500 dark:text-gray-400">hlm</span>
                                                </div>
                                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <button type="button" onClick={() => onEditChapter(ch)} className="p-1.5 text-gray-500 dark:text-gray-400 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500"><PencilIcon /></button>
                                                  <button type="button" onClick={() => onDeleteChapter(ch)} className="p-1.5 text-red-500 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon /></button>
                                                </div>
                                             </div>
                                         </div>
                                     </li>
                                 ))}
                             </ul>
                         ) : (
                             <div className="text-center p-4 border-2 border-dashed rounded-md text-gray-500 text-sm">
                                 Belum ada bab. Tambahkan bab pertama Anda.
                             </div>
                         )}
                     </div>
                 ) : ( // Academic Mode
                     <div className="space-y-1 max-h-[28rem] overflow-y-auto p-2 border rounded-lg bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600">
                         {CHAPTERS.map((chapter) => (
                             <div key={chapter} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition flex-wrap gap-2">
                                 <label className="flex items-center cursor-pointer flex-grow min-w-[150px]">
                                     <input
                                         type="checkbox"
                                         name="selectedChapters"
                                         value={chapter}
                                         checked={formState.selectedChapters.includes(chapter)}
                                         onChange={(e) => onFormChange(e, { isChapterCheck: true })}
                                         className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                     />
                                     <span className="ml-3 text-sm text-gray-800 dark:text-gray-200">{chapter}</span>
                                 </label>
                                 <div className="flex items-center gap-3">
                                     <div className="flex items-center gap-1">
                                          <label htmlFor={`pageCount-${chapter}`} className="sr-only">Halaman untuk {chapter}</label>
                                          <select
                                             id={`pageCount-${chapter}`}
                                             value={formState.chapterPageCounts[chapter] || formState.pageCount}
                                             onChange={(e) => onFormChange(e, { isChapterPageCount: true, chapterName: chapter })}
                                             disabled={!formState.selectedChapters.includes(chapter)}
                                             className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                             {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                                                 <option key={num} value={num}>{num}</option>
                                             ))}
                                          </select>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">hlm</span>
                                     </div>
                                     <div className="flex items-center gap-1">
                                          <label htmlFor={`referenceCount-${chapter}`} className="sr-only">Referensi untuk {chapter}</label>
                                          <select
                                             id={`referenceCount-${chapter}`}
                                             value={formState.chapterReferenceCounts[chapter] || formState.referenceCount}
                                             onChange={(e) => onFormChange(e, { isChapterReferenceCount: true, chapterName: chapter })}
                                             disabled={!formState.selectedChapters.includes(chapter)}
                                             className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                             {Array.from({ length: 50 }, (_, i) => i + 1).map(num => (
                                                 <option key={num} value={num}>{num}</option>
                                             ))}
                                          </select>
                                          <span className="text-xs text-gray-500 dark:text-gray-400">ref</span>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
          </AccordionItem>

          <AccordionItem title="Parameter Konten">
             <div>
              <label htmlFor="researchMethod" className={`block text-sm font-medium mb-1 ${disableAcademicFields ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>Bentuk Penelitian</label>
              <select id="researchMethod" name="researchMethod" value={formState.researchMethod} onChange={onFormChange} className={inputBaseClasses} disabled={disableAcademicFields}>
                {Object.values(ResearchMethod).map(method => <option key={method} value={method}>{method}</option>)}
              </select>
            </div>
            {formState.researchMethod === ResearchMethod.Kuantitatif && !disableAcademicFields && (
              <div>
                <label htmlFor="variables" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Variabel Kuantitatif
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="variables"
                    name="variables"
                    value={formState.variables}
                    onChange={onFormChange}
                    placeholder="Akan terisi otomatis berdasarkan judul..."
                    className={`${inputBaseClasses} pr-10`}
                  />
                  {isSuggestingVariables && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Variabel akan disarankan secara otomatis setelah Anda selesai mengetik judul dan deskripsi topik.</p>
              </div>
            )}
            <div>
              <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Halaman per Bab ({formState.pageCount})</label>
              <input
                type="range"
                id="pageCount"
                name="pageCount"
                min="1"
                max="50"
                value={formState.pageCount}
                onChange={onFormChange}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label htmlFor="writingStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gaya Bahasa Penulisan</label>
              <select id="writingStyle" name="writingStyle" value={formState.writingStyle} onChange={onFormChange} className={inputBaseClasses}>
                {writingStyles.map(style => <option key={style} value={style}>{style}</option>)}
              </select>
            </div>
          </AccordionItem>

          <AccordionItem title="Instrumen Penelitian">
              {disableAcademicFields ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                      Fitur ini hanya tersedia untuk jenis karya ilmiah seperti Skripsi, Tesis, atau Disertasi.
                  </p>
              ) : (
                  <div className="space-y-3">
                      {RESEARCH_INSTRUMENTS.map((instrument) => (
                          <div key={instrument.name}>
                              <label className="flex items-start cursor-pointer">
                                  <input
                                      type="checkbox"
                                      name="researchInstruments"
                                      value={instrument.name}
                                      checked={formState.researchInstruments.includes(instrument.name)}
                                      onChange={(e) => onFormChange(e, { isInstrumentCheck: true })}
                                      className="h-4 w-4 mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                                  />
                                  <div className="ml-3">
                                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{instrument.name}</span>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">{instrument.description}</p>
                                  </div>
                              </label>
                          </div>
                      ))}
                  </div>
              )}
          </AccordionItem>

          <AccordionItem title="Pengaturan Referensi">
             <div>
              <label htmlFor="referenceCount" className={`block text-sm font-medium mb-1 ${disableReferenceFields ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>Default Referensi per Bab ({formState.referenceCount})</label>
              <input
                type="range"
                id="referenceCount"
                name="referenceCount"
                min="1"
                max="50"
                value={formState.referenceCount}
                onChange={onFormChange}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disableReferenceFields}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startYear" className={`block text-sm font-medium mb-1 ${disableReferenceFields ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>Tahun Awal</label>
                  <input
                    type="number"
                    id="startYear"
                    name="startYear"
                    value={formState.startYear}
                    onChange={onFormChange}
                    placeholder="Contoh: 2015"
                    className={inputBaseClasses}
                    min="1900"
                    max={currentYear}
                    disabled={disableReferenceFields}
                  />
                </div>
                <div>
                  <label htmlFor="endYear" className={`block text-sm font-medium mb-1 ${disableReferenceFields ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>Tahun Akhir</label>
                  <input
                    type="number"
                    id="endYear"
                    name="endYear"
                    value={formState.endYear}
                    onChange={onFormChange}
                    placeholder={`Contoh: ${currentYear}`}
                    className={inputBaseClasses}
                    min="1900"
                    max={currentYear}
                    disabled={disableReferenceFields}
                  />
                </div>
            </div>
            <div>
              <label htmlFor="citationStyle" className={`block text-sm font-medium mb-1 ${disableReferenceFields ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>Gaya Sitasi</label>
              <select id="citationStyle" name="citationStyle" value={formState.citationStyle} onChange={onFormChange} className={inputBaseClasses} disabled={disableReferenceFields}>
                {CITATION_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="referenceSource" className={`block text-sm font-medium mb-1 ${disableReferenceFields ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>Sumber Referensi</label>
              <select id="referenceSource" name="referenceSource" value={formState.referenceSource} onChange={onFormChange} className={inputBaseClasses} disabled={disableReferenceFields}>
                {REFERENCE_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="referenceType" className={`block text-sm font-medium mb-1 ${disableReferenceFields ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>Jenis Kutipan</label>
              <select id="referenceType" name="referenceType" value={formState.referenceType} onChange={onFormChange} className={inputBaseClasses} disabled={disableReferenceFields}>
                {REFERENCE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </AccordionItem>
        </div>

        <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading || formState.selectedChapters.length === 0}
              className="w-full flex items-center justify-center gap-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-3 text-center transition disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <GenerateIcon />
                  Hasilkan Karya
                </>
              )}
            </button>
        </div>
      </form>
    </div>
  );
};
