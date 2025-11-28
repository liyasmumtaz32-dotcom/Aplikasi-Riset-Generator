import React from 'react';

interface LoaderProps {
    message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message: progressMessage }) => {
  const defaultMessages = [
      "Mencari referensi kredibel...",
      "Menyusun argumen ilmiah...",
      "Menerapkan gaya sitasi...",
      "Memformat hasil akhir...",
      "Hampir selesai..."
  ];
  
  const [message, setMessage] = React.useState(defaultMessages[0]);

  React.useEffect(() => {
    // Fix: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
    let interval: ReturnType<typeof setInterval>;
    if (!progressMessage) {
        interval = setInterval(() => {
        setMessage(prev => {
            const currentIndex = defaultMessages.indexOf(prev);
            const nextIndex = (currentIndex + 1) % defaultMessages.length;
            return defaultMessages[nextIndex];
        });
        }, 3000);
    }

    return () => {
        if(interval) clearInterval(interval);
    }
  }, [progressMessage, defaultMessages]);
  
  const displayMessage = progressMessage || message;

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 dark:text-gray-300">
       <svg className="animate-spin h-12 w-12 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
       </svg>
      <p className="text-lg font-semibold">{displayMessage}</p>
    </div>
  );
};