import React from 'react';
import type { HistoryEntry } from '../types';
import { TrashIcon, PencilIcon } from './IconComponents';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
  onDeleteEntry: (id: string) => void;
  onUpdateEntry: (id: string, newTitle: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear, onDeleteEntry, onUpdateEntry }) => {

  const handleClearClick = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat? Tindakan ini tidak dapat diurungkan.')) {
      onClear();
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent, entryId: string, entryTitle: string) => {
    e.stopPropagation(); // Prevent onSelect from firing
    if (window.confirm(`Apakah Anda yakin ingin menghapus riwayat untuk "${entryTitle}"?`)) {
      onDeleteEntry(entryId);
    }
  };

  const handleEditClick = (e: React.MouseEvent, entry: HistoryEntry) => {
    e.stopPropagation(); // Prevent onSelect from firing
    const newTitle = window.prompt('Masukkan judul baru untuk riwayat ini:', entry.title);
    if (newTitle && newTitle.trim() !== '' && newTitle.trim() !== entry.title) {
      onUpdateEntry(entry.id, newTitle.trim());
    }
  };


  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Riwayat</h2>
        {history.length > 0 && (
          <button 
            onClick={handleClearClick}
            className="p-2 text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition"
            title="Hapus Seluruh Riwayat"
          >
            <TrashIcon />
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada riwayat yang disimpan.</p>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {history.map((entry) => (
            <li key={entry.id} className="group flex items-center gap-1">
              <button 
                onClick={() => onSelect(entry)}
                className="flex-grow text-left p-3 rounded-md bg-slate-50 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={entry.title}>{entry.title}</p>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {entry.formStateSnapshot.researchType} &bull; {new Date(entry.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </button>
              <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => handleEditClick(e, entry)}
                  className="p-2 text-sm text-gray-500 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition"
                  title="Ubah Judul"
                >
                  <PencilIcon />
                </button>
                <button 
                  onClick={(e) => handleDeleteClick(e, entry.id, entry.title)}
                  className="p-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition"
                  title="Hapus Entri Ini"
                >
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};