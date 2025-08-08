/**
 * Type definitions for FileDropZone component.
 *
 * The FileDropZone allows users to drag and drop files into your application.
 * It supports multiple file drops, file type filtering and exposes drag state
 * changes via a callback.
 */

/**
 * A file acceptance pattern. It can be a MIME type (e.g. "image/*"), a file
 * extension (e.g. ".png") or an array of such patterns. When provided, only
 * files matching these patterns will be passed to the `onFilesDropped` callback.
 */
export type FileAccept = string | string[];

export interface FileDropZoneProps {
    /**
     * Callback invoked when valid files are dropped. The callback receives an
     * array of File objects. Note: in Neutralino environments the File objects
     * are synthetic and only contain basic metadata; use `useFileSystem` to read
     * contents if needed.
     */
    onFilesDropped: (files: File[]) => void | Promise<void>;

    /**
     * Optional file type filter. Only files whose MIME type or extension matches
     * one of the provided patterns will be considered valid. If omitted, all
     * files are accepted. Examples: "image/*", [".png", ".jpg"].
     */
    accept?: FileAccept;

    /**
     * Whether multiple files can be dropped at once. Defaults to `true`. When
     * `false`, only the first valid file will be passed to `onFilesDropped`.
     */
    multiple?: boolean;

    /**
     * Callback invoked whenever the drag state changes. Receives `true` when a
     * drag enters the drop zone, and `false` when it leaves or a drop occurs.
     */
    onDragStateChange?: (isDragging: boolean) => void;

    /**
     * Custom CSS class for styling the root element. The component also adds
     * `file-drop-zone` and `dragging` classes automatically.
     */
    className?: string;

    /**
     * Inline styles applied to the root element.
     */
    style?: Record<string, string>;
}
