import { GoogleGenAI } from "@google/genai";
import type { FormState, GeneratedContent, GroundingSource } from '../types';

// Per guidelines, initialize with apiKey from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const handleApiError = (error: any, context: string): Error => {
    console.error(`Error during ${context}:`, error);
    const apiErrorMessage = error?.error?.message || error?.message;
    if (apiErrorMessage) {
        if (apiErrorMessage.includes('overloaded')) {
            return new Error(`AI sedang sibuk (overloaded). Mohon coba lagi beberapa saat.`);
        }
        return new Error(`Gagal saat ${context}: ${apiErrorMessage}`);
    }
    return new Error(`Gagal berkomunikasi dengan AI untuk ${context}. Terjadi kesalahan tidak diketahui.`);
};

/**
 * Wraps a Gemini API call with a retry mechanism for overloaded errors.
 */
const callGeminiWithRetry = async <T>(
    apiCall: () => Promise<T>,
    context: string,
    maxRetries = 2 // Total 3 attempts
): Promise<T> => {
    let retries = 0;
    let delay = 1000;

    while (true) {
        try {
            return await apiCall();
        } catch (error: any) {
            const isOverloaded = (error?.error?.message || error?.message || '').includes('overloaded');
            if (isOverloaded && retries < maxRetries) {
                retries++;
                console.log(`Model overloaded for "${context}". Retrying in ${delay / 1000}s... (Attempt ${retries + 1})`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; // Exponential backoff
            } else {
                throw handleApiError(error, context);
            }
        }
    }
};

/**
 * Searches for relevant research titles using the Gemini API.
 */
export const searchTitles = async (
    topicDescription: string,
    major: string,
    studyProgram: string,
    researchType: string
): Promise<string[]> => {
    const prompt = `Berikan 5 saran judul untuk jenis karya "${researchType}" dengan deskripsi topik berikut: "${topicDescription}". Judul harus relevan untuk jurusan "${major}" dan program studi "${studyProgram}". Judul harus dalam Bahasa Indonesia. Kembalikan hanya daftar judul, dipisahkan oleh baris baru, tanpa penomoran atau embel-embel lainnya.`;

    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = response.text;
        return text.split('\n').map(title => title.replace(/^- /, '').trim()).filter(Boolean);
    }, "mencari judul");
};

/**
 * Suggests quantitative variables (X and Y) based on the title and topic.
 */
export const suggestVariables = async (title: string, topicDescription: string): Promise<string> => {
    const prompt = `Berdasarkan judul penelitian "${title}" dan deskripsi topik "${topicDescription}", identifikasi dan sarankan variabel independen (X) dan variabel dependen (Y). Format hasilnya secara ringkas dalam satu baris, contohnya: "X = Motivasi Belajar, Y = Prestasi Akademik". Hanya kembalikan teks variabelnya saja, tanpa penjelasan tambahan.`;
    
    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    }, "menyarankan variabel");
};


/**
 * Generates content for a specific chapter based on the form state and context.
 */
export const generateChapter = async (
    formState: FormState,
    chapter: string,
    context: string
): Promise<GeneratedContent> => {
    const {
        researchType,
        title,
        topicDescription,
        synopsis,
        jurusan,
        programStudi,
        researchMethod,
        variables,
        citationStyle,
        referenceSource,
        referenceType,
        researchInstruments,
        writingStyle,
        outputLanguage,
        startYear,
        endYear,
    } = formState;

    const pageCount = formState.chapterPageCounts[chapter] || formState.pageCount;
    const referenceCount = formState.chapterReferenceCounts[chapter] || formState.referenceCount;
    const isCreativeMode = researchType === 'Novel' || researchType === 'Cerita';
    const useSearch = (referenceSource === 'Google Search' || referenceSource === 'Google Scholar') && !isCreativeMode;

    // Handle special case for suggesting chapter titles
    if (chapter === 'Sarankan Judul Bab') {
        const prompt = `Berdasarkan konteks karya tulis ini (jenis: ${researchType}, judul: "${title}", topik: "${topicDescription}"), sarankan 5 judul bab yang menarik dan relevan. Format sebagai daftar bernomor.`;
        return callGeminiWithRetry(async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return { text: response.text, sources: [] };
        }, `menyarankan judul bab`);
    }

    let prompt: string;

    if (isCreativeMode) {
        prompt = `Anda adalah seorang novelis ahli dengan gaya penulisan yang mirip dengan "${writingStyle}". Tugas Anda adalah menulis bab "${chapter}" untuk sebuah novel berjudul "${title}".\n\n`;
        prompt += `**Premis & Sinopsis Utama Novel:**\n${synopsis || topicDescription}\n\n`;
        prompt += `**Konteks dari Bab Sebelumnya (Gunakan ini untuk menjaga kesinambungan cerita):**\n${context || "Ini adalah bab pertama, mulailah ceritanya."}\n\n`;
        prompt += `**Instruksi untuk Bab "${chapter}":**\n`;
        prompt += `1.  **Fokus Cerita:** Lanjutkan narasi dari bab sebelumnya. Jika ini bab pertama, perkenalkan dunia, karakter utama, dan konflik awal sesuai sinopsis.\n`;
        prompt += `2.  **Pengembangan Plot:** Majukan alur cerita. Ciptakan ketegangan, perkenalkan rintangan, atau ungkap informasi baru yang penting. Hindari cerita yang monoton.\n`;
        prompt += `3.  **Pengembangan Karakter:** Tunjukkan kepribadian karakter melalui tindakan, dialog, dan pikiran mereka. Kembangkan hubungan antar karakter.\n`;
        prompt += `4.  **Dialog yang Hidup:** Tulis dialog yang terasa alami dan berfungsi untuk memajukan plot atau mengungkapkan karakter.\n`;
        prompt += `5.  **Deskripsi yang Kaya:** Lukiskan latar tempat dan suasana dengan deskripsi yang imersif tanpa memperlambat laju cerita.\n`;
        prompt += `6.  **Konsistensi:** Jaga konsistensi karakter, latar, dan aturan dunia yang telah ditetapkan di bab-bab sebelumnya.\n`;
        prompt += `7.  **Bahasa & Gaya:** Gunakan bahasa ${outputLanguage} dan pertahankan gaya penulisan "${writingStyle}".\n`;
        prompt += `8.  **Target Panjang:** Tulis konten dengan panjang yang kira-kira setara dengan ${pageCount} halaman.\n`
        prompt += `9.  **Output:** Tuliskan HANYA konten bab tersebut. Jangan menyertakan ringkasan, komentar, atau judul bab di dalam output. Mulai langsung dengan paragraf pertama. Gunakan format narasi novel standar.`;
    } else {
        // Construct the main prompt for academic/other chapter generation
        prompt = `Anda adalah asisten penulis AI ahli. Tugas Anda adalah menghasilkan konten untuk bab "${chapter}" dari sebuah karya dengan jenis "${researchType}" berjudul "${title}".\n\n`;
        prompt += `**Konteks Utama:**\n`;
        prompt += `- **Deskripsi Topik:** ${topicDescription}\n`;
        prompt += `- **Jurusan/Fakultas:** ${jurusan}\n`;
        prompt += `- **Program Studi:** ${programStudi}\n`;
        prompt += `- **Bahasa Output:** ${outputLanguage}\n`;
        prompt += `- **Gaya Penulisan:** Tulis dengan gaya seorang "${writingStyle}"\n`;

        if (!isCreativeMode) {
            prompt += `- **Bentuk Penelitian:** ${researchMethod}\n`;
            if (researchMethod === 'Kuantitatif' && variables) {
                prompt += `- **Variabel Penelitian:** ${variables}\n`;
            }
            if (researchInstruments && researchInstruments.length > 0) {
                prompt += `- **Instrumen Penelitian yang Digunakan:** ${researchInstruments.join(', ')}\n`;
            }
            prompt += `- **Jumlah Referensi:** Sekitar ${referenceCount} referensi\n`;
            prompt += `- **Gaya Sitasi:** ${citationStyle}\n`;
            prompt += `- **Jenis Kutipan:** ${referenceType}\n`;
            if (startYear || endYear) {
                prompt += `- **Rentang Tahun Referensi:** ${startYear || 'awal'} - ${endYear || 'sekarang'}\n`;
            }
        }
        
        prompt += `- **Target Panjang Bab:** Sekitar ${pageCount} halaman.\n\n`;

        if (context) {
            prompt += `**Konteks dari Bab Sebelumnya (untuk menjaga konsistensi):**\n${context}\n\n`;
        }

        prompt += `**Instruksi:**\n`;
        prompt += `1. Tuliskan konten untuk bab "${chapter}" secara komprehensif dan terstruktur dengan baik.\n`;
        prompt += `2. Pastikan isinya relevan dengan judul, topik, dan parameter yang diberikan.\n`;
        prompt += `3. Gunakan format Markdown untuk heading (e.g., '# Judul', '## Sub-judul').\n`;
        if (!isCreativeMode) {
            prompt += `4. Jika referensi digunakan, sertakan kutipan dalam teks sesuai gaya sitasi "${citationStyle}".\n`;
        }
        prompt += `5. Hasil akhir harus langsung berupa konten bab, tanpa pengantar atau komentar tambahan dari Anda sebagai AI.\n`;
        prompt += `6. Untuk penulisan karya ilmiah (Skripsi, Tesis, Disertasi), jika ada tabel, format tabel tersebut menggunakan sintaks Markdown yang rapi. Pastikan setiap tabel memiliki judul (contoh: Tabel 4.1: Hasil Uji ...) dan header kolom yang jelas.\n`;
    }


    const config: any = {};
    if (useSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    return callGeminiWithRetry(async () => {
        const response = await ai.models.generateContent({
            // Use Pro for complex content generation, as per guidelines.
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: config,
        });
        
        const sources: GroundingSource[] = [];
        if (useSearch && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            for (const chunk of response.candidates[0].groundingMetadata.groundingChunks) {
                if (chunk.web) {
                    sources.push({ web: { uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri } });
                }
            }
        }

        return { text: response.text, sources };
    }, `membuat bab "${chapter}"`);
};
