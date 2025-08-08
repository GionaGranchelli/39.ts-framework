/**
 * FileDropZone component for the 39.ts framework.
 *
 * This component provides an area where users can drag and drop files. It
 * supports optional file type filtering, multiple file selection, and
 * visual feedback during drag operations. When files are dropped, the
 * component invokes the provided callback with the accepted files.
 */
import {FileAccept, FileDropZoneProps} from "./FileDropZone.types";
import {createEffect, createSignal} from "../../core/reactiveSystem";
import {Div, Span} from "../../dom/domSystem";


// Helper to normalise and test accepted file types
function normaliseAccept(accept?: FileAccept): string[] | null {
    if (!accept) return null;
    if (Array.isArray(accept)) {
        return accept.map((v) => v.trim().toLowerCase());
    }
    return [accept.trim().toLowerCase()];
}

function fileMatches(file: File, patterns: string[]): boolean {
    const type = (file.type || '').toLowerCase();
    const name = (file.name || '').toLowerCase();
    return patterns.some((pat) => {
        if (pat.startsWith('.')) {
            // File extension match
            return name.endsWith(pat);
        }
        if (pat.endsWith('/*')) {
            // MIME type wildcard, e.g. image/*
            const prefix = pat.slice(0, pat.length - 1); // keep slash
            return type.startsWith(prefix);
        }
        // Exact MIME type match
        return type === pat;
    });
}

export function FileDropZone(props: FileDropZoneProps): HTMLElement {
    const acceptPatterns = normaliseAccept(props.accept);
    const allowMultiple = props.multiple !== false;
    const isDragging = createSignal(false);

    function updateDragState(dragging: boolean) {
        if (isDragging.get() !== dragging) {
            isDragging.set(dragging);
            if (props.onDragStateChange) {
                props.onDragStateChange(dragging);
            }
        }
    }

    // Extract files from the drop event, handling platform-specific cases
    function extractFiles(event: DragEvent): File[] {
        const files: File[] = [];

        // Check for Neutralino-style file data (can be injected via context if needed)
        // @ts-ignore - Neutralino extends DragEvent with files array
        const neutralinoFiles = (event as any).files;
        if (Array.isArray(neutralinoFiles)) {
            // Platform-specific file handling for desktop environments
            for (const nf of neutralinoFiles) {
                // nf: { name: string; path: string; type: string }
                const fakeFile = new File([], nf.name, { type: nf.type || '' });
                (fakeFile as any).path = nf.path; // attach path for downstream use
                files.push(fakeFile);
                if (!allowMultiple) break;
            }
        } else if (event.dataTransfer && event.dataTransfer.files) {
            // Standard web browser file handling
            for (let i = 0; i < event.dataTransfer.files.length; i++) {
                files.push(event.dataTransfer.files[i]);
                if (!allowMultiple) break;
            }
        }

        // Filter by accept patterns if provided
        if (acceptPatterns) {
            return files.filter((f) => fileMatches(f, acceptPatterns));
        }
        return files;
    }

    function handleDragEnter(e: DragEvent): void {
        e.preventDefault();
        updateDragState(true);
    }

    function handleDragOver(e: DragEvent): void {
        e.preventDefault();
        updateDragState(true);
    }

    function handleDragLeave(e: DragEvent): void {
        e.preventDefault();
        // Only clear dragging state if leaving the drop zone itself
        if (
            !e.currentTarget ||
            !(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)
        ) {
            updateDragState(false);
        }
    }

    function handleDrop(e: DragEvent): void {
        e.preventDefault();
        updateDragState(false);
        const files = extractFiles(e);
        if (files.length > 0) {
            props.onFilesDropped(files);
        }
    }

    // Root element. Cast to HTMLElement because direct element builders return
    // a concrete DOM element, even though their type definitions are loose.
    const root = Div(
        {
            className: `file-drop-zone ${isDragging.get() ? 'dragging' : ''} ${
                props.className || ''
            }`.trim(),
            style: {
                ...props.style,
            },
            ondragenter: handleDragEnter,
            ondragover: handleDragOver,
            ondragleave: handleDragLeave,
            ondrop: handleDrop,
        },
        [
            // Default content: show a hint if no children provided
            Span({
                text: 'Drag & drop files here or click to select',
            }),
        ]
    ) as unknown as HTMLElement;

    // Click handler to trigger file input (optional). Only in browser context.
    if (typeof document !== 'undefined') {
        (root as HTMLElement).addEventListener('click', () => {
            // Create an off-screen file input to select files
            const input = document.createElement('input');
            input.type = 'file';
            if (acceptPatterns) input.setAttribute('accept', acceptPatterns.join(','));
            if (allowMultiple) input.multiple = true;
            input.style.position = 'absolute';
            input.style.left = '-9999px';
            input.style.top = '-9999px';
            document.body.appendChild(input);
            input.addEventListener('change', () => {
                const selected: File[] = [];
                if (input.files) {
                    for (let i = 0; i < input.files.length; i++) {
                        selected.push(input.files[i]);
                        if (!allowMultiple) break;
                    }
                }
                document.body.removeChild(input);
                if (selected.length > 0) {
                    // Filter selection via accept patterns if provided
                    const filtered = acceptPatterns
                        ? selected.filter((f) => fileMatches(f, acceptPatterns))
                        : selected;
                    if (filtered.length > 0) {
                        props.onFilesDropped(filtered);
                    }
                }
            });
            input.click();
        });
    }

    // Reactive update to toggle dragging class
    createEffect(() => {
        const dragging = isDragging.get();
        const el = root as HTMLElement;
        if (dragging) {
            el.classList.add('dragging');
        } else {
            el.classList.remove('dragging');
        }
    });

    return root as HTMLElement;
}