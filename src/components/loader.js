// components/loader.js
async function loadComponents() {
    const components = [
        { id: 'dashboard-container', url: 'components/dashboard.html' },
        { id: 'dialog-container', url: 'components/dialog.html' },
        { id: 'scene-container', url: 'components/scene.html' }
    ];

    try {
        // Load all fragments in parallel
        await Promise.all(components.map(async (comp) => {
            const response = await fetch(comp.url);
            const html = await response.text();
            document.getElementById(comp.id).innerHTML = html;
        }));

        console.log('Modules Injected.');
        
        // Signal to app.js that the stage is set
        window.dispatchEvent(new CustomEvent('componentsReady'));
        
    } catch (error) {
        console.error('Loader Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadComponents);