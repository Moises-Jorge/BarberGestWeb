'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, LoaderCircle, Trash2 } from 'lucide-react';

type ConfirmDeleteDialogProps = {
    open: boolean;
    itemName: string;
    itemType: string;
    isDeleting?: boolean;
    errorMessage?: string | null;
    onConfirm: () => void;
    onClose: () => void;
};

export function ConfirmDeleteDialog({
    open,
    itemName,
    itemType,
    isDeleting = false,
    errorMessage,
    onConfirm,
    onClose,
}: ConfirmDeleteDialogProps) {
    const cancelButtonRef = useRef<HTMLButtonElement>(null);
    const onCloseRef = useRef(onClose);
    const isDeletingRef = useRef(isDeleting);

    onCloseRef.current = onClose;
    isDeletingRef.current = isDeleting;

    useEffect(() => {
        if (!open) return;

        const previouslyFocused = document.activeElement;
        cancelButtonRef.current?.focus();

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape' && !isDeletingRef.current) onCloseRef.current();
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
                previouslyFocused.focus();
            }
        };
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isDeleting) onClose();
            }}
        >
            <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-delete-title"
                aria-describedby="confirm-delete-description"
                className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl"
            >
                <div className="flex gap-4 p-5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
                        <AlertTriangle className="size-5" />
                    </span>
                    <div className="min-w-0">
                        <h2 id="confirm-delete-title" className="text-base font-semibold">Eliminar {itemType}</h2>
                        <p id="confirm-delete-description" className="mt-2 wrap-break-word text-sm text-muted-foreground">
                            Tem a certeza de que pretende eliminar <span className="font-medium text-foreground">{itemName}</span>? Esta ação não pode ser anulada.
                        </p>
                        {errorMessage && <p role="alert" className="mt-3 text-sm text-danger">{errorMessage}</p>}
                    </div>
                </div>
                <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end">
                    <button
                        ref={cancelButtonRef}
                        type="button"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-danger px-3 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isDeleting ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                        {isDeleting ? 'A eliminar...' : 'Eliminar'}
                    </button>
                </div>
            </section>
        </div>
    );
}