import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ResearchForm } from './components/ResearchForm';
import { OutputDisplay } from './components/OutputDisplay';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { HistoryPanel } from './components/HistoryPanel';
import type { FormState, GeneratedContent, HistoryEntry } from './types';
import { ResearchMethod } from './types';
import { generateChapter, searchTitles, suggestVariables } from './services/geminiService';
import { getHistory, saveHistory, clearHistory as clearHistoryStorage } from './utils/historyStorage';
import { CHAPTERS, NOVEL_CHAPTERS, BOOK_CHAPTERS, MAJORS, STUDY_PROGRAMS } from './constants';

const FORM_STATE_KEY = 'researchFormState';
const CHAPTER_STATE_KEY = 'chapterState';


// Modal Component for General Purpose
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="relative w-full max-w-lg m-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-slate-600 dark:hover:text-white" onClick={onClose}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
};


// Modal for AI Title Search results
interface TitleSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  titles: string[];
  onSelect: (title: string) => void;
  isLoading: boolean;
}

const TitleSearchModal: React.FC<TitleSearchModalProps> = ({ isOpen, onClose, titles, onSelect, isLoading }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Saran Judul dari AI">
             {isLoading ? (
                <div className="flex justify-center items-center h-40">
                    <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            ) : (
                <div className="space-y-2">
                    {titles.length > 0 ? titles.map((title, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(title)}
                            className="w-full text-left p-3 rounded-md transition border-2 bg-slate-50 dark:bg-slate-700 border-transparent hover:border-blue-400 dark:hover:border-blue-500"
                        >
                            {title}
                        </button>
                    )) : (
                       <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-8">Tidak ada saran judul yang dihasilkan. Coba ubah deskripsi topik Anda.</p>
                    )}
                </div>
            )}
        </Modal>
    );
};


// Modal Component for Chapter Title Suggestions
interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  titles: string[];
  onSelect: (title: string) => void;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, onClose, titles, onSelect }) => {
    const [selectedTitle, setSelectedTitle] = useState<string>('');
    const [customTitle, setCustomTitle] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setSelectedTitle('');
            setCustomTitle('');
        }
    }, [isOpen]);
    
    const handleSelectSuggestion = (title: string) => {
        setSelectedTitle(title);
        setCustomTitle('');
    };

    const handleCustomTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomTitle(e.target.value);
        setSelectedTitle('');
    };

    const handleSubmit = () => {
        const titleToUse = customTitle.trim() || selectedTitle;
        if (titleToUse) {
            onSelect(titleToUse);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Saran Judul Bab">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Pilih Salah Satu Saran:</h4>
                    <div className="space-y-2">
                        {titles.length > 0 ? titles.map((title, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectSuggestion(title)}
                                className={`w-full text-left p-3 rounded-md transition border-2 ${selectedTitle === title ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : 'bg-slate-50 dark:bg-slate-700 border-transparent hover:border-blue-400'}`}
                            >
                                {title}
                            </button>
                        )) : (
                           <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada saran yang dihasilkan. Coba lagi atau masukkan judul kustom.</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <hr className="flex-grow border-gray-300 dark:border-slate-600"/>
                    <span className="text-sm text-gray-500 dark:text-gray-400">ATAU</span>
                    <hr className="flex-grow border-gray-300 dark:border-slate-600"/>
                </div>

                <div>
                     <label htmlFor="customTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Masukkan Judul Kustom:</label>
                    <input
                        type="text"
                        id="customTitle"
                        value={customTitle}
                        onChange={handleCustomTitleChange}
                        placeholder="Contoh: Bab Baru: Awal Petualangan"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
             <div className="flex justify-end p-4 mt-4 -mx-6 -mb-6 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
                <button
                    onClick={handleSubmit}
                    disabled={!selectedTitle && !customTitle.trim()}
                    className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 disabled:bg-blue-400 dark:disabled:bg-blue-800 disabled:cursor-not-allowed"
                >
                    Gunakan Judul Ini
                </button>
            </div>
        </Modal>
    );
};


// Helper to determine the chapter "mode" based on research type
const getChapterMode = (researchType: string): 'academic' | 'book' | 'creative' | 'sermon' => {
    if (researchType === 'Novel' || researchType === 'Cerita') return 'creative';
    if (researchType === 'Buku' || researchType === 'Buku Pelajaran') return 'book';
    if (researchType === 'Khutbah') return 'sermon';
    return 'academic';
};

const App: React.FC = () => {
  const [formState, setFormState] = useState<FormState>(() => {
    try {
        const savedStateJSON = localStorage.getItem(FORM_STATE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            if (savedState && typeof savedState === 'object' && savedState.researchType) {
                return savedState;
            }
        }
    } catch (err) {
        console.error("Gagal memuat status formulir dari localStorage:", err);
    }
    const defaultMajor = MAJORS[0];
    const defaultProgram = STUDY_PROGRAMS[defaultMajor]?.[0] || '';
    return {
      researchType: 'Skripsi',
      title: '',
      topicDescription: '',
      synopsis: '',
      jurusan: defaultMajor,
      programStudi: defaultProgram,
      researchMethod: ResearchMethod.Kualitatif,
      variables: '',
      referenceCount: 10,
      pageCount: 5,
      startYear: '',
      endYear: '',
      selectedChapters: ['Bab 1: Pendahuluan'],
      chapterPageCounts: { 'Bab 1: Pendahuluan': 5 },
      chapterReferenceCounts: { 'Bab 1: Pendahuluan': 10 },
      citationStyle: 'APA',
      referenceSource: 'Google Scholar',
      referenceType: 'In-text citation',
      researchInstruments: [],
      writingStyle: 'Akademisi',
      outputLanguage: 'Indonesia',
    };
  });

  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // State for chapter suggestions
  const [suggestedChapterTitles, setSuggestedChapterTitles] = useState<string[]>([]);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState<boolean>(false);

  // State for AI Title Search
  const [isSearchingTitles, setIsSearchingTitles] = useState<boolean>(false);
  const [suggestedSearchTitles, setSuggestedSearchTitles] = useState<string[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  
  // State for variable suggestions
  const [isSuggestingVariables, setIsSuggestingVariables] = useState<boolean>(false);

  // State for dynamic chapters in creative/book mode
  const [dynamicChapters, setDynamicChapters] = useState<string[]>(() => {
    try {
        const savedFormStateJSON = localStorage.getItem(FORM_STATE_KEY);
        const savedChaptersJSON = localStorage.getItem(CHAPTER_STATE_KEY);

        const loadedFormState: FormState | null = savedFormStateJSON ? JSON.parse(savedFormStateJSON) : null;
        const chapterState: Record<string, string[]> | null = savedChaptersJSON ? JSON.parse(savedChaptersJSON) : null;
        
        const researchType = loadedFormState?.researchType || 'Skripsi';
        const mode = getChapterMode(researchType);

        if (chapterState && chapterState[mode]) {
            return chapterState[mode];
        }

        if (mode === 'creative') return NOVEL_CHAPTERS;
        if (mode === 'book') return BOOK_CHAPTERS;
        return []; // Academic mode doesn't use this
    } catch (err) {
        console.error("Gagal memuat daftar bab dari localStorage:", err);
        return [];
    }
  });
  
  const formStateRef = useRef(formState);
  formStateRef.current = formState;

  useEffect(() => {
    const intervalId = setInterval(() => {
        localStorage.setItem(FORM_STATE_KEY, JSON.stringify(formStateRef.current));
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Effect to persist DYNAMIC chapter list changes to localStorage
  useEffect(() => {
    try {
        const mode = getChapterMode(formState.researchType);
        if(mode !== 'creative' && mode !== 'book') return;

        const existingStateJSON = localStorage.getItem(CHAPTER_STATE_KEY);
        const chapterState = existingStateJSON ? JSON.parse(existingStateJSON) : {};
        chapterState[mode] = dynamicChapters;
        localStorage.setItem(CHAPTER_STATE_KEY, JSON.stringify(chapterState));
    } catch (err) {
        console.error("Gagal menyimpan daftar bab ke localStorage:", err);
    }
  }, [dynamicChapters, formState.researchType]);
  
  // Effect to switch dynamic chapter list when researchType changes
  useEffect(() => {
    const mode = getChapterMode(formState.researchType);
    let targetChapters: string[] = [];

    try {
        const savedChaptersJSON = localStorage.getItem(CHAPTER_STATE_KEY);
        const chapterState: Record<string, string[]> | null = savedChaptersJSON ? JSON.parse(savedChaptersJSON) : null;
        
        if (chapterState && chapterState[mode]) {
             targetChapters = chapterState[mode];
        } else {
            if (mode === 'creative') targetChapters = NOVEL_CHAPTERS;
            else if (mode === 'book') targetChapters = BOOK_CHAPTERS;
        }
    } catch {
        if (mode === 'creative') targetChapters = NOVEL_CHAPTERS;
        else if (mode === 'book') targetChapters = BOOK_CHAPTERS;
    }
    
    if (JSON.stringify(dynamicChapters) !== JSON.stringify(targetChapters)) {
        setDynamicChapters(targetChapters);
    }

    // When switching modes, clear selection to avoid invalid states
    setFormState(prevState => ({ ...prevState, selectedChapters: [] }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.researchType]);


  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleFormChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, options?: { isChapterCheck?: boolean, value?: string, isChapterPageCount?: boolean, isChapterReferenceCount?: boolean, chapterName?: string, isInstrumentCheck?: boolean }) => {
    const chapterName = options?.chapterName;
    const mode = getChapterMode(formState.researchType);
    const allChaptersForMode = mode === 'creative' || mode === 'book' ? dynamicChapters : CHAPTERS;

    if (options?.isChapterPageCount && chapterName && e?.target) {
        const { value } = e.target;
        const pageCount = parseInt(value, 10);
        setFormState(prevState => ({
            ...prevState,
            chapterPageCounts: { ...prevState.chapterPageCounts, [chapterName]: pageCount }
        }));
    } else if (options?.isChapterReferenceCount && chapterName && e?.target) {
        const { value } = e.target;
        const refCount = parseInt(value, 10);
        setFormState(prevState => ({
            ...prevState,
            chapterReferenceCounts: { ...prevState.chapterReferenceCounts, [chapterName]: refCount }
        }));
    } else if (options?.isInstrumentCheck) {
        const instrumentName = (e.target as HTMLInputElement)?.value;
        if (!instrumentName) return;
        const isChecked = (e.target as HTMLInputElement)?.checked;
        setFormState(prevState => {
            const newInstruments = new Set(prevState.researchInstruments);
            if (isChecked) {
                newInstruments.add(instrumentName);
            } else {
                newInstruments.delete(instrumentName);
            }
            return {
                ...prevState,
                researchInstruments: Array.from(newInstruments)
            };
        });
    } else if (options?.isChapterCheck) {
        const chapterValue = (e.target as HTMLInputElement)?.value || options?.value;
        if (!chapterValue) return;
        const isChecked = (e.target as HTMLInputElement)?.checked;

        if (chapterValue === 'SELECT_ALL') {
            const newPageCounts = { ...formState.chapterPageCounts };
            const newRefCounts = { ...formState.chapterReferenceCounts };
            const chaptersToSelect = allChaptersForMode.filter(ch => ch !== 'Sarankan Judul Bab');

            chaptersToSelect.forEach(ch => {
                if (newPageCounts[ch] === undefined) newPageCounts[ch] = formState.pageCount;
                if (newRefCounts[ch] === undefined) newRefCounts[ch] = formState.referenceCount;
            });
            setFormState(prevState => ({
                ...prevState,
                selectedChapters: chaptersToSelect,
                chapterPageCounts: newPageCounts,
                chapterReferenceCounts: newRefCounts,
            }));
        } else if (chapterValue === 'DESELECT_ALL') {
            setFormState(prevState => ({ ...prevState, selectedChapters: [] }));
        } else {
            setFormState(prevState => {
                const newSelection = new Set(prevState.selectedChapters);
                const newPageCounts = { ...prevState.chapterPageCounts };
                const newRefCounts = { ...prevState.chapterReferenceCounts };

                if (isChecked) {
                    newSelection.add(chapterValue);
                    if (newPageCounts[chapterValue] === undefined) newPageCounts[chapterValue] = prevState.pageCount;
                    if (newRefCounts[chapterValue] === undefined) newRefCounts[chapterValue] = prevState.referenceCount;
                } else {
                    newSelection.delete(chapterValue);
                }
                return {
                    ...prevState,
                    selectedChapters: Array.from(newSelection),
                    chapterPageCounts: newPageCounts,
                    chapterReferenceCounts: newRefCounts,
                };
            });
        }
    } else if (e?.target) { // Handle other standard form changes
        const { name, value, type } = e.target;
        if (name === 'jurusan') {
            const newProgramStudi = STUDY_PROGRAMS[value]?.[0] || '';
            setFormState(prevState => ({
                ...prevState,
                jurusan: value,
                programStudi: newProgramStudi,
            }));
        } else {
            setFormState(prevState => ({
                ...prevState,
                [name]: type === 'range' ? parseInt(value, 10) : value,
            }));
        }
    }
  }, [formState, dynamicChapters]);
  
  // Effect for automatic, debounced variable suggestion
  useEffect(() => {
    if (
        formState.researchMethod === ResearchMethod.Kuantitatif &&
        formState.title.trim().length > 5 && // Require a minimum title length
        formState.topicDescription.trim().length > 10 // Require a minimum topic description length
    ) {
        const handler = setTimeout(async () => {
            setIsSuggestingVariables(true);
            setError(null);
            try {
                const suggested = await suggestVariables(formState.title, formState.topicDescription);
                setFormState(prevState => ({ ...prevState, variables: suggested }));
            } catch (err) {
                console.error("Gagal menyarankan variabel secara otomatis:", err);
                // Optionally show a subtle error to the user
            } finally {
                setIsSuggestingVariables(false);
            }
        }, 1500); // 1.5-second delay after user stops typing

        return () => {
            clearTimeout(handler);
        };
    }
  }, [formState.title, formState.topicDescription, formState.researchMethod]);

  const handleSearchTitles = useCallback(async () => {
    if (!formState.topicDescription) {
        alert("Harap isi deskripsi topik terlebih dahulu.");
        return;
    }
    setIsSearchingTitles(true);
    setError(null);
    setSuggestedSearchTitles([]);
    setIsSearchModalOpen(true);
    
    try {
        const titles = await searchTitles(
            formState.topicDescription,
            formState.jurusan,
            formState.programStudi,
            formState.researchType
        );
        setSuggestedSearchTitles(titles);
    } catch (err) {
        setError(err instanceof Error ? `Gagal mencari judul: ${err.message}` : 'Terjadi kesalahan tidak diketahui saat mencari judul.');
        setIsSearchModalOpen(false); // Close modal on error
    } finally {
        setIsSearchingTitles(false);
    }
  }, [formState.topicDescription, formState.jurusan, formState.programStudi, formState.researchType]);

  const handleSelectSearchedTitle = useCallback((title: string) => {
    setFormState(prevState => ({ ...prevState, title: title }));
    setIsSearchModalOpen(false);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formState.title) {
        setError("Judul tidak boleh kosong.");
        return;
    }
    if (formState.selectedChapters.length === 0) {
        setError("Harap pilih setidaknya satu bab untuk dibuat.");
        return;
    }
    if (formState.selectedChapters.includes('Sarankan Judul Bab') && formState.selectedChapters.length > 1) {
        setError("Opsi 'Sarankan Judul Bab' harus dipilih sendiri dan tidak dapat digabungkan dengan bab lain.");
        return;
    }

    setIsLoading(true);
    setGeneratedContent(null);
    setLoadingMessage("Mempersiapkan proses generasi...");

    const isCreativeMode = getChapterMode(formState.researchType) === 'creative';
    const isBookMode = getChapterMode(formState.researchType) === 'book';

    try {
        // Special handling for single chapter "Sarankan Judul Bab"
        if (formState.selectedChapters.length === 1 && formState.selectedChapters[0] === 'Sarankan Judul Bab') {
            const result = await generateChapter(formState, formState.selectedChapters[0], '');
            const rawTitles = result.text;
            const titlesArray = rawTitles.split('\n').map(t => t.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
            setSuggestedChapterTitles(titlesArray);
            setIsSuggestionModalOpen(true);
            setIsLoading(false);
            return;
        }

        let context = '';
        const combinedResult: GeneratedContent = { text: '', sources: [] };
        
        const allPossibleChapters = isCreativeMode || isBookMode ? dynamicChapters : CHAPTERS;
        const chaptersToGenerate = allPossibleChapters.filter(ch => formState.selectedChapters.includes(ch));
        
        // For creative/book mode, respect the user-defined order from the UI
        const orderedChaptersToGenerate = (isCreativeMode || isBookMode) 
            ? dynamicChapters.filter(ch => formState.selectedChapters.includes(ch))
            : chaptersToGenerate;

        for (const chapter of orderedChaptersToGenerate) {
            setLoadingMessage(`Membuat ${chapter}...`);
            const result = await generateChapter(formState, chapter, context);
            
            combinedResult.text += `\n\n# ${chapter}\n\n${result.text}`;
            if (result.sources.length > 0) {
              combinedResult.sources = [...combinedResult.sources, ...result.sources];
            }
            
            // Build context for the next iteration
            context += `\n\n--- AWAL DARI: ${chapter} ---\n\n${result.text}\n\n--- AKHIR DARI: ${chapter} ---\n\n`;
        }
        
        // Clean up leading newlines
        combinedResult.text = combinedResult.text.trim();

        setGeneratedContent(combinedResult);

        const newHistoryEntry: HistoryEntry = {
            id: Date.now().toString(),
            title: formState.title,
            date: new Date().toISOString(),
            content: combinedResult,
            formStateSnapshot: { ...formState } // Deep copy of form state
        };

        const updatedHistory = [newHistoryEntry, ...history];
        setHistory(updatedHistory);
        saveHistory(updatedHistory);

    } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  }, [formState, history, dynamicChapters]);


  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setFormState(entry.formStateSnapshot);
    setGeneratedContent(entry.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    clearHistoryStorage();
  }, []);

  const handleDeleteHistoryEntry = useCallback((id: string) => {
    setHistory(prevHistory => {
        const updatedHistory = prevHistory.filter(entry => entry.id !== id);
        saveHistory(updatedHistory);
        return updatedHistory;
    });
  }, []);
  
  const handleUpdateHistoryEntry = useCallback((id: string, newTitle: string) => {
    setHistory(prevHistory => {
        const updatedHistory = prevHistory.map(entry => 
            entry.id === id ? { ...entry, title: newTitle } : entry
        );
        saveHistory(updatedHistory);
        return updatedHistory;
    });
  }, []);

  const handleContentUpdate = useCallback((newContent: GeneratedContent) => {
    setGeneratedContent(newContent);
    setHistory(prevHistory => {
        if (!prevHistory.length) return [];
        const updatedHistory = [...prevHistory];
        const latestEntry = { ...updatedHistory[0], content: newContent };
        updatedHistory[0] = latestEntry;
        saveHistory(updatedHistory);
        return updatedHistory;
    });
  }, []);
  
  const handleAddChapter = useCallback((chapterName?: string) => {
    let newChapterName: string | null = chapterName || null;

    if (!newChapterName) {
        const numericChapters = dynamicChapters
          .map(c => {
            const match = c.match(/^(?:Bab|Chapter)\s*(\d+)/i);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(num => num > 0);
        
        const maxChapterNum = numericChapters.length > 0 ? Math.max(...numericChapters) : 0;
        const nextChapterNumber = maxChapterNum + 1;
        
        newChapterName = window.prompt(
            `Masukkan nama bab baru (contoh: Bab ${nextChapterNumber}: Judul Bab)`,
            `Bab ${nextChapterNumber}: `
        );
    }

    if (newChapterName && newChapterName.trim() !== "") {
        const trimmedName = newChapterName.trim();
        if (dynamicChapters.some(c => c.trim().toLowerCase() === trimmedName.toLowerCase())) {
            alert("Bab dengan nama tersebut sudah ada.");
            return;
        }
        const updatedChapters = [...dynamicChapters, trimmedName];
        setDynamicChapters(updatedChapters);
        setFormState(prevState => ({
            ...prevState,
            selectedChapters: [...prevState.selectedChapters, trimmedName],
        }));
    }
  }, [dynamicChapters]);
  
  const handleEditChapter = useCallback((chapterToEdit: string) => {
    if (!chapterToEdit || chapterToEdit === 'Sarankan Judul Bab') return;

    const newChapterName = window.prompt(`Ubah nama untuk bab: "${chapterToEdit}"`, chapterToEdit);

    if (newChapterName && newChapterName.trim() !== "") {
      const trimmedName = newChapterName.trim();
      if (trimmedName.toLowerCase() === chapterToEdit.toLowerCase()) return;

      if (dynamicChapters.some(c => c.trim().toLowerCase() === trimmedName.toLowerCase())) {
        alert("Bab dengan nama tersebut sudah ada.");
        return;
      }

      const updatedChapters = dynamicChapters.map(c => c === chapterToEdit ? trimmedName : c);
      setDynamicChapters(updatedChapters);
      setFormState(prevState => ({
        ...prevState,
        selectedChapters: prevState.selectedChapters.map(c => c === chapterToEdit ? trimmedName : c),
      }));
    }
  }, [dynamicChapters]);

  const handleDeleteChapter = useCallback((chapterToDelete: string) => {
    if (!chapterToDelete || chapterToDelete === 'Sarankan Judul Bab') return;
    
    if (window.confirm(`Apakah Anda yakin ingin menghapus bab "${chapterToDelete}"?`)) {
        const updatedChapters = dynamicChapters.filter(c => c !== chapterToDelete);
        setDynamicChapters(updatedChapters);
        setFormState(prevState => ({
            ...prevState,
            selectedChapters: prevState.selectedChapters.filter(c => c !== chapterToDelete),
        }));
    }
  }, [dynamicChapters]);
  
  const handleSelectSuggestedChapterTitle = useCallback((newTitle: string) => {
    if (newTitle && newTitle.trim() !== "") {
        const trimmedName = newTitle.trim();
        let chapterToSet = trimmedName;
        
        const existingChapter = dynamicChapters.find(c => c.trim().toLowerCase() === trimmedName.toLowerCase());

        if (!existingChapter) {
            const updatedChapters = [...dynamicChapters, trimmedName];
            setDynamicChapters(updatedChapters);
        }

        setFormState(prevState => ({
            ...prevState,
            // Select the new chapter, replacing the "suggest" option
            selectedChapters: [chapterToSet], 
        }));
        
        setIsSuggestionModalOpen(false);
        setSuggestedChapterTitles([]);
    }
  }, [dynamicChapters]);

  const handleReorderChapters = useCallback((reorderedChapters: string[]) => {
    if (JSON.stringify(reorderedChapters) !== JSON.stringify(dynamicChapters)) {
        setDynamicChapters(reorderedChapters);
    }
  }, [dynamicChapters]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header />
      <SuggestionModal
          isOpen={isSuggestionModalOpen}
          onClose={() => setIsSuggestionModalOpen(false)}
          titles={suggestedChapterTitles}
          onSelect={handleSelectSuggestedChapterTitle}
      />
       <TitleSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          titles={suggestedSearchTitles}
          onSelect={handleSelectSearchedTitle}
          isLoading={isSearchingTitles}
      />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 space-y-8">
                <ResearchForm 
                  formState={formState} 
                  dynamicChapters={dynamicChapters}
                  onFormChange={handleFormChange} 
                  onSubmit={handleSubmit}
                  onSearchTitles={handleSearchTitles}
                  isSearchingTitles={isSearchingTitles}
                  isSuggestingVariables={isSuggestingVariables}
                  onAddChapter={handleAddChapter}
                  onEditChapter={handleEditChapter}
                  onDeleteChapter={handleDeleteChapter}
                  onReorderChapters={handleReorderChapters}
                  isLoading={isLoading}
                />
                <HistoryPanel
                  history={history}
                  onSelect={handleSelectHistory}
                  onClear={handleClearHistory}
                  onDeleteEntry={handleDeleteHistoryEntry}
                  onUpdateEntry={handleUpdateHistoryEntry}
                />
            </div>
          </div>
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg h-full min-h-[60vh] p-4 sm:p-6 lg:p-8">
              {isLoading ? (
                <Loader message={loadingMessage} />
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-red-500">
                    <h3 className="text-xl font-semibold">Terjadi Kesalahan</h3>
                    <p>{error}</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <OutputDisplay 
                  content={generatedContent} 
                  title={formState.title} 
                  chapters={formState.selectedChapters}
                  onContentUpdate={handleContentUpdate} 
                  outputLanguage={formState.outputLanguage}
                />
              ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-2xl font-bold mb-2">Selamat Datang!</h2>
                    <p className="max-w-md">Isi formulir di sebelah kiri untuk mulai menghasilkan draf karya Anda. Hasil akan ditampilkan di sini.</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
