import React, { useState, useEffect, useCallback } from 'react';
import type { GeneratedContent } from '../types';
import { WordIcon, PdfIcon, MarkdownIcon, CopyIcon, ClipboardCheckIcon, PencilIcon } from './IconComponents';

interface OutputDisplayProps {
  content: GeneratedContent;
  title: string;
  chapters: string[];
  onContentUpdate: (newContent: GeneratedContent) => void;
  outputLanguage: string;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ content, title, chapters, onContentUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(content.text);
  const [copyStatus, setCopyStatus] = useState(false);

  useEffect(() => {
    setEditedText(content.text);
  }, [content.text]);

  const handleSave = () => {
    onContentUpdate({ ...content, text: editedText });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedText(content.text);
    setIsEditing(false);
  };

  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(content.text).then(() => {
        setCopyStatus(true);
        setTimeout(() => setCopyStatus(false), 2000);
    });
  }, [content.text]);

  const handleExport = (format: 'txt' | 'md') => {
    const blob = new Blob([content.text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_'); // Sanitize filename
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${safeTitle}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 mb-4 pb-4 border-b border-slate-300 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-grow min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate" title={title}>{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
              Bab yang Dihasilkan: {chapters.join(', ')}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
             <button onClick={handleCopyToClipboard} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition" title={copyStatus ? "Disalin!" : "Salin ke Papan Klip"}>
                {copyStatus ? <ClipboardCheckIcon /> : <CopyIcon />}
            </button>
            <button onClick={() => handleExport('md')} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition" title="Ekspor sebagai Markdown (.md)">
                <MarkdownIcon />
            </button>
            <button className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-50 cursor-not-allowed" title="Ekspor sebagai Word (.docx) - Segera Hadir" disabled>
                <WordIcon />
            </button>
             <button className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-50 cursor-not-allowed" title="Ekspor sebagai PDF - Segera Hadir" disabled>
                <PdfIcon />
            </button>
          </div>
        </div>
         {isEditing ? (
            <div className="mt-4 flex items-center gap-2">
              <button onClick={handleSave} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Simpan Perubahan</button>
              <button onClick={handleCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500">Batal</button>
            </div>
          ) : (
            <div className="mt-4">
              <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <PencilIcon />
                Ubah Konten
              </button>
            </div>
          )}
      </div>

      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-full min-h-[50vh] p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Editor Konten"
          />
        ) : (
          <article className="prose prose-slate dark:prose-invert max-w-none text-justify whitespace-pre-wrap">
            {content.text}
          </article>
        )}
      </div>

       {content.sources && content.sources.length > 0 && !isEditing && (
         <div className="flex-shrink-0 mt-4 pt-4 border-t border-slate-300 dark:border-slate-700">
           <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Sumber Referensi</h3>
           <ul className="space-y-1 text-sm list-disc list-inside">
             {content.sources.map((source, index) => (
               <li key={index}>
                 {source.web ? (
                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {source.web.title || source.web.uri}
                    </a>
                 ) : source.maps ? (
                    <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {source.maps.title || source.maps.uri}
                    </a>
                 ) : 'Sumber tidak valid'}
               </li>
             ))}
           </ul>
         </div>
       )}
    </div>
  );
};
