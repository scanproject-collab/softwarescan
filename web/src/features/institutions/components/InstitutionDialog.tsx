import React, { useState, useEffect } from 'react';
import { Institution } from '../types/institutions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../../../shared/components/ui/dialog';

interface InstitutionDialogProps {
  institution?: Institution;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string) => void;
  dialogTitle: string;
  dialogDescription: string;
  submitButtonText: string;
}

/**
 * Componente de diálogo para criação e edição de instituições
 */
export const InstitutionDialog: React.FC<InstitutionDialogProps> = ({
  institution,
  isOpen,
  onClose,
  onSubmit,
  dialogTitle,
  dialogDescription,
  submitButtonText,
}) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (institution) {
      setTitle(institution.title);
    } else {
      setTitle('');
    }
  }, [institution, isOpen]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit(title);
    setTitle('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <input
            type="text"
            placeholder="Título da instituição"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div className="flex justify-end gap-2">
          <DialogClose asChild>
            <button className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400">
              Cancelar
            </button>
          </DialogClose>
          <button
            onClick={handleSubmit}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            {submitButtonText}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 