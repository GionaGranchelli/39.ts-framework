export function initDevPanel() {
    const panel = document.createElement('div');
    panel.id = 'dev-panel';
    panel.innerHTML = `<h3>🔍 39.ts Dev Panel</h3><div id="logs"></div>`;
    panel.style.position = 'fixed';
    panel.style.bottom = '10px';
    panel.style.right = '10px';
    panel.style.width = '320px';
    panel.style.maxHeight = '300px';
    panel.style.overflowY = 'auto';
    panel.style.background = '#1e1e1e';
    panel.style.color = '#fff';
    panel.style.fontSize = '0.85rem';
    panel.style.fontFamily = 'monospace';
    panel.style.border = '1px solid #555';
    panel.style.padding = '0.5rem';
    panel.style.borderRadius = '8px';
    panel.style.zIndex = '9999';

    document.body.appendChild(panel);

    const logEl = panel.querySelector('#logs')!;
    const appendLog = (type: string, name: string, value: unknown) => {
        const entry = document.createElement('div');
        entry.textContent = `[${type}] ${name}: ${JSON.stringify(value)}`;
        entry.style.marginBottom = '4px';
        logEl.appendChild(entry);
        if (logEl.childNodes.length > 100) logEl.removeChild(logEl.firstChild!);
    };

    return appendLog;
}
