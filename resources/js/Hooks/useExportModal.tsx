// resources/js/Hooks/useExportModal.tsx
import { useState } from 'react';

interface UseExportModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

export function useExportModal(): UseExportModalReturn {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
}
