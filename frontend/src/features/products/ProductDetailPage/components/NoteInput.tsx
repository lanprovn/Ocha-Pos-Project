import React from 'react';

interface NoteInputProps {
  note: string;
  onNoteChange: (note: string) => void;
}

export const NoteInput: React.FC<NoteInputProps> = ({ note, onNoteChange }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Ghi chú đặc biệt</h3>
      <textarea
        value={note}
        onChange={(e) => onNoteChange(e.target.value)}
        placeholder="Ví dụ: Không cay, ít đường..."
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 resize-none hover:border-gray-400"
        rows={3}
      />
    </div>
  );
};

