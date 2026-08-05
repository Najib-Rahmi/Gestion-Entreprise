"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useList, useListWithTotal } from "./useList";

interface UseDeleteModalReturn {
  open: (item: { _id: string; label: string }) => void;
  close: () => void;
  isOpen: boolean;
  itemToDelete: { _id: string; label: string } | null;
  confirmDelete: (onDelete: () => Promise<void>) => Promise<void>;
  deleting: boolean;
}

export function useDeleteModal(): UseDeleteModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ _id: string; label: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const open = useCallback((item: { _id: string; label: string }) => {
    setItemToDelete(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setItemToDelete(null);
  }, []);

  const confirmDelete = useCallback(async (onDelete: () => Promise<void>) => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await onDelete();
      close();
    } finally {
      setDeleting(false);
    }
  }, [itemToDelete, close]);

  return { open, close, isOpen, itemToDelete, confirmDelete, deleting };
}