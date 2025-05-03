import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "../../../components/ui/dialog";
import { TagFormData } from '../types/tag.types';

interface TagFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TagFormData) => Promise<void>;
  initialData?: { name: string; weight: string | null };
  title: string;
  description: string;
  submitButtonText: string;
}

const TagForm: React.FC<TagFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
  submitButtonText
}) => {
  const [formData, setFormData] = useState<TagFormData>({
    name: initialData?.name || '',
    weight: initialData?.weight || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      return;
    }

    await onSubmit(formData);

    // Reset form data
    setFormData({
      name: '',
      weight: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <input
            type="text"
            name="name"
            placeholder="Nome da tag"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="text"
            name="weight"
            placeholder="Peso da tag (obrigatório)"
            value={formData.weight}
            onChange={handleInputChange}
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

export default TagForm; 