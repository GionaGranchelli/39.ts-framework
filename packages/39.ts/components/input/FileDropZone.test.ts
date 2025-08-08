/**
 * Tests for the FileDropZone component.
 *
 * These tests verify that drag events update the visual state, that file
 * drops invoke the callback with the correct files, and that file
 * filtering and multiple selection behave as expected. Neutralino support
 * is exercised by mocking the Neutralino context.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {FileDropZoneProps} from "./FileDropZone.types";
import {FileDropZone} from "./FileDropZone";


// Mock Neutralino context when needed
vi.mock('../../../../39.ts-neutralino/context/NeutralinoProvider.js', () => ({
    useNeutralinoContext: () => ({
        isNeutralinoAvailable: () => false,
    }),
}));

describe('FileDropZone Component', () => {
    let container: HTMLElement;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        document.body.removeChild(container);
        vi.clearAllMocks();
    });
    it('applies and removes dragging class on drag events', () => {
        const onDrop = vi.fn();
        const props: FileDropZoneProps = { onFilesDropped: onDrop };
        const dropZone = FileDropZone(props) as unknown as HTMLElement;
        container.appendChild(dropZone);
        // Initially no dragging class
        expect(dropZone.classList.contains('dragging')).toBe(false);
        // Drag enter
        const dragEnter = new DragEvent('dragenter', { bubbles: true, cancelable: true });
        dropZone.dispatchEvent(dragEnter);
        expect(dropZone.classList.contains('dragging')).toBe(true);
        // Drag leave
        const dragLeave = new DragEvent('dragleave', { bubbles: true, cancelable: true });
        dropZone.dispatchEvent(dragLeave);
        expect(dropZone.classList.contains('dragging')).toBe(false);
    });

    it('calls onFilesDropped with dropped files', () => {
        const onDrop = vi.fn();
        const props: FileDropZoneProps = { onFilesDropped: onDrop };
        const dropZone = FileDropZone(props) as unknown as HTMLElement;
        container.appendChild(dropZone);

        // Create a fake file and DataTransfer
        const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
        const dataTransfer = { files: [file] } as unknown as DataTransfer;
        const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
        Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });

        dropZone.dispatchEvent(dropEvent as unknown as DragEvent);
        expect(onDrop).toHaveBeenCalledTimes(1);
        const dropped = onDrop.mock.calls[0][0] as File[];
        expect(dropped).toHaveLength(1);
        expect(dropped[0].name).toBe('test.txt');
    });

    it('filters files based on accept patterns', () => {
        const onDrop = vi.fn();
        const props: FileDropZoneProps = {
            onFilesDropped: onDrop,
            accept: ['.png', 'image/jpeg'],
        };
        const dropZone = FileDropZone(props);
        container.appendChild(dropZone);

        const valid = new File(['x'], 'image.png', { type: 'image/png' });
        const invalid = new File(['x'], 'document.txt', { type: 'text/plain' });
        const dataTransfer = { files: [valid, invalid] } as unknown as DataTransfer;
        const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
        Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
        dropZone.dispatchEvent(dropEvent as unknown as DragEvent);
        expect(onDrop).toHaveBeenCalledTimes(1);
        const dropped = onDrop.mock.calls[0][0] as File[];
        expect(dropped).toHaveLength(1);
        expect(dropped[0].name).toBe('image.png');
    });

    it('respects the multiple flag', () => {
        const onDrop = vi.fn();
        const props: FileDropZoneProps = { onFilesDropped: onDrop, multiple: false };
        const dropZone = FileDropZone(props);
        container.appendChild(dropZone);
        const file1 = new File(['x'], 'a.txt', { type: 'text/plain' });
        const file2 = new File(['x'], 'b.txt', { type: 'text/plain' });
        const dataTransfer = { files: [file1, file2] } as unknown as DataTransfer;
        const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
        Object.defineProperty(dropEvent, 'dataTransfer', { value: dataTransfer });
        dropZone.dispatchEvent(dropEvent as unknown as DragEvent);
        expect(onDrop).toHaveBeenCalledTimes(1);
        const dropped = onDrop.mock.calls[0][0] as File[];
        expect(dropped).toHaveLength(1);
        expect(dropped[0].name).toBe('a.txt');
    });

    it('invokes onDragStateChange during drag operations', () => {
        const onDragStateChange = vi.fn();
        const onDrop = vi.fn();
        const props: FileDropZoneProps = { onFilesDropped: onDrop, onDragStateChange };
        const dropZone = FileDropZone(props);
        container.appendChild(dropZone);

        // Simulate dragenter and dragleave
        const enterEvent = new DragEvent('dragenter', { bubbles: true, cancelable: true });
        dropZone.dispatchEvent(enterEvent);
        const leaveEvent = new DragEvent('dragleave', { bubbles: true, cancelable: true });
        dropZone.dispatchEvent(leaveEvent);
        // Should have been called twice: true then false
        expect(onDragStateChange).toHaveBeenCalledTimes(2);
        expect(onDragStateChange.mock.calls[0][0]).toBe(true);
        expect(onDragStateChange.mock.calls[1][0]).toBe(false);
    });
});
