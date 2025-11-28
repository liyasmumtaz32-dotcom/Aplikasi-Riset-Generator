export enum ResearchMethod {
    Kualitatif = 'Kualitatif',
    Kuantitatif = 'Kuantitatif',
    Campuran = 'Metode Campuran',
}

export interface FormState {
    researchType: string;
    title: string;
    topicDescription: string;
    synopsis: string;
    jurusan: string;
    programStudi: string;
    researchMethod: ResearchMethod;
    variables: string;
    referenceCount: number; // Will act as the default reference count
    pageCount: number; // Will act as the default page count
    startYear: string;
    endYear: string;
    selectedChapters: string[];
    chapterPageCounts: Record<string, number>; // To store page count per chapter
    chapterReferenceCounts: Record<string, number>; // To store reference count per chapter
    citationStyle: string;
    referenceSource: string;
    referenceType: string;
    researchInstruments: string[];
    writingStyle: string;
    outputLanguage: string;
}

export interface GroundingSource {
    web?: {
        uri: string;
        title: string;
    };
    maps?: {
        uri: string;
        title: string;
    };
}

export interface GeneratedContent {
    text: string;
    sources: GroundingSource[];
}

export interface HistoryEntry {
  id: string;
  title: string;
  date: string;
  content: GeneratedContent; // The combined content
  formStateSnapshot: FormState; // The full form state used for this generation
}

export interface CredibilityResult {
  reference: string;
  credibility: 'Tinggi' | 'Sedang' | 'Rendah';
  reasoning: string;
  scholarLink?: string;
}

export interface CredibilityReport {
  results: CredibilityReport[];
}

export interface PlagiarismSource {
  url: string;
  matchingText: string;
  similarity: number;
}

export interface PlagiarismReport {
  similarityPercentage: number;
  sources: PlagiarismSource[];
}
