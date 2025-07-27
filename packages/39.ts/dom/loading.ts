import { createSignal } from '../core/signal';

export const isLoading = createSignal<boolean>(false);

export function showLoading() {
    isLoading.set(true);
}

export function hideLoading() {
    isLoading.set(false);
}
