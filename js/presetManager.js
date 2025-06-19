/**
 * Preset Manager Module
 * Handles saving, loading, and managing style presets
 */

class PresetManager {
    constructor() {
        this.presets = new Map();
        this.currentPreset = null;
        this.storageKey = 'interior-design-presets';
        this.maxPresets = 50;
        
        // Default presets
        this.defaultPresets = {
            'quick-concept': {
                name: 'Quick Concept',
                description: 'Fast conceptual sketches for initial ideas',
                category: 'concept',
                settings: {
                    stylePreset: 'pencil',
                    edgeThreshold: 25,
                    lineVariation: 60,
                    lineThickness: 1.5,
                    processingMode: 'traditional',
                    aiProvider: 'openai',
                    enableMaterialDetection: false,
                    enableFurnitureDetection: false,
                    enableRoomAnalysis: false,
                    colorPalette: {
                        primary: '#2c3e50',
                        secondary: '#34495e',
                        accent: '#e74c3c',
                        neutral: '#ecf0f1'
                    }
                },
                tags: ['quick', 'concept', 'sketchy'],
                author: 'system',
                createdAt: new Date().toISOString(),
                thumbnail: null
            },
            'detailed-presentation': {
                name: 'Detailed Presentation',
                description: 'High-quality presentation drawings with AI enhancements',
                category: 'presentation',
                settings: {
                    stylePreset: 'pen',
                    edgeThreshold: 35,
                    lineVariation: 30,
                    lineThickness: 2,
                    processingMode: 'cloud',
                    aiProvider: 'openai',
                    enableMaterialDetection: true,
                    enableFurnitureDetection: true,
                    enableRoomAnalysis: true,
                    colorPalette: {
                        primary: '#2c3e50',
                        secondary: '#34495e',
                        accent: '#3498db',
                        neutral: '#ecf0f1'
                    }
                },
                tags: ['presentation', 'detailed', 'ai-enhanced'],
                author: 'system',
                createdAt: new Date().toISOString(),
                thumbnail: null
            },
            'material-focused': {
                name: 'Material Focused',
                description: 'Emphasizes material representation and textures',
                category: 'technical',
                settings: {
                    stylePreset: 'technical',
                    edgeThreshold: 40,
                    lineVariation: 25,
                    lineThickness: 2.5,
                    processingMode: 'hybrid',
                    aiProvider: 'anthropic',
                    enableMaterialDetection: true,
                    enableFurnitureDetection: true,
                    enableRoomAnalysis: false,
                    colorPalette: {
                        primary: '#34495e',
                        secondary: '#2c3e50',
                        accent: '#e67e22',
                        neutral: '#ecf0f1'
                    }
                },
                tags: ['materials', 'textures', 'technical'],
                author: 'system',
                createdAt: new Date().toISOString(),
                thumbnail: null
            },
            'modern-minimalist': {
                name: 'Modern Minimalist',
                description: 'Clean, minimal style for contemporary interiors',
                category: 'style',
                settings: {
                    stylePreset: 'modern',
                    edgeThreshold: 30,
                    lineVariation: 15,
                    lineThickness: 1,
                    processingMode: 'cloud',
                    aiProvider: 'google',
                    enableMaterialDetection: true,
                    enableFurnitureDetection: true,
                    enableRoomAnalysis: true,
                    colorPalette: {
                        primary: '#ffffff',
                        secondary: '#f8f9fa',
                        accent: '#212529',
                        neutral: '#e9ecef'
                    }
                },
                tags: ['modern', 'minimalist', 'clean'],
                author: 'system',
                createdAt: new Date().toISOString(),
                thumbnail: null
            }
        };
        
        this.loadPresets();
        this.setupEventListeners();
    }

    /**
     * Initialize preset manager
     */
    async init() {
        try {
            await this.loadPresets();
            this.populatePresetDropdown();
            this.updatePresetsList();
            console.log('Preset Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Preset Manager:', error);
        }
    }

    /**
     * Setup event listeners for preset controls
     */
    setupEventListeners() {
        // Save preset button
        const saveBtn = document.getElementById('savePresetBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.showSaveDialog());
        }

        // Load preset button
        const loadBtn = document.getElementById('loadPresetBtn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.showLoadDialog());
        }

        // Export preset button
        const exportBtn = document.getElementById('exportPresetBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPreset());
        }

        // Import preset button
        const importBtn = document.getElementById('importPresetBtn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.importPreset());
        }

        // File input for importing
        const fileInput = document.getElementById('presetFileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileImport(e));
        }
    }

    /**
     * Load presets from localStorage
     */
    loadPresets() {
        try {
            // Load user presets from localStorage
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const userPresets = JSON.parse(stored);
                Object.entries(userPresets).forEach(([key, preset]) => {
                    this.presets.set(key, preset);
                });
            }

            // Add default presets if not already present
            Object.entries(this.defaultPresets).forEach(([key, preset]) => {
                if (!this.presets.has(key)) {
                    this.presets.set(key, preset);
                }
            });

            console.log(`Loaded ${this.presets.size} presets`);
        } catch (error) {
            console.error('Failed to load presets:', error);
            // Initialize with default presets only
            this.presets.clear();
            Object.entries(this.defaultPresets).forEach(([key, preset]) => {
                this.presets.set(key, preset);
            });
        }
    }

    /**
     * Save presets to localStorage
     */
    savePresets() {
        try {
            // Only save user-created presets (not system defaults)
            const userPresets = {};
            this.presets.forEach((preset, key) => {
                if (preset.author !== 'system') {
                    userPresets[key] = preset;
                }
            });

            localStorage.setItem(this.storageKey, JSON.stringify(userPresets));
            console.log('Presets saved successfully');
        } catch (error) {
            console.error('Failed to save presets:', error);
            throw new Error('Failed to save presets: ' + error.message);
        }
    }

    /**
     * Create a new preset from current settings
     */
    createPreset(name, description, category = 'custom', tags = []) {
        const settings = this.getCurrentSettings();
        const preset = {
            name,
            description,
            category,
            settings,
            tags: [...tags],
            author: 'user',
            createdAt: new Date().toISOString(),
            thumbnail: null
        };

        const key = this.generatePresetKey(name);
        
        // Check if preset limit is reached
        if (this.presets.size >= this.maxPresets) {
            throw new Error(`Maximum number of presets (${this.maxPresets}) reached`);
        }

        this.presets.set(key, preset);
        this.savePresets();
        
        return key;
    }

    /**
     * Get current settings from UI
     */
    getCurrentSettings() {
        const settings = {};
        
        // Get all form controls
        const controls = [
            'stylePreset', 'edgeThreshold', 'lineVariation', 'lineThickness',
            'processingMode', 'aiProvider', 'enableMaterialDetection',
            'enableFurnitureDetection', 'enableRoomAnalysis',
            'primaryColor', 'secondaryColor', 'accentColor', 'neutralColor'
        ];

        controls.forEach(controlId => {
            const element = document.getElementById(controlId);
            if (element) {
                if (element.type === 'checkbox') {
                    settings[controlId] = element.checked;
                } else if (element.type === 'range') {
                    settings[controlId] = parseInt(element.value);
                } else if (element.type === 'number') {
                    settings[controlId] = parseFloat(element.value);
                } else {
                    settings[controlId] = element.value;
                }
            }
        });

        // Get color palette
        settings.colorPalette = {
            primary: settings.primaryColor || '#2c3e50',
            secondary: settings.secondaryColor || '#34495e',
            accent: settings.accentColor || '#e74c3c',
            neutral: settings.neutralColor || '#ecf0f1'
        };

        // Remove individual color properties
        delete settings.primaryColor;
        delete settings.secondaryColor;
        delete settings.accentColor;
        delete settings.neutralColor;

        return settings;
    }

    /**
     * Apply preset settings to UI
     */
    applyPreset(presetKey) {
        const preset = this.presets.get(presetKey);
        if (!preset) {
            throw new Error(`Preset not found: ${presetKey}`);
        }

        const settings = preset.settings;
        
        // Apply all settings to UI controls
        Object.entries(settings).forEach(([key, value]) => {
            if (key === 'colorPalette') {
                // Handle color palette specially
                this.applyColorPalette(value);
            } else {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = value;
                    } else {
                        element.value = value;
                    }
                    
                    // Trigger change event to update UI
                    element.dispatchEvent(new Event('change'));
                }
            }
        });

        this.currentPreset = presetKey;
        this.updatePresetDisplay();
        
        console.log(`Applied preset: ${preset.name}`);
    }

    /**
     * Apply color palette to UI
     */
    applyColorPalette(colorPalette) {
        const colorMapping = {
            primary: 'primaryColor',
            secondary: 'secondaryColor',
            accent: 'accentColor',
            neutral: 'neutralColor'
        };

        Object.entries(colorMapping).forEach(([paletteKey, elementId]) => {
            const element = document.getElementById(elementId);
            if (element && colorPalette[paletteKey]) {
                element.value = colorPalette[paletteKey];
            }
        });
    }

    /**
     * Delete a preset
     */
    deletePreset(presetKey) {
        const preset = this.presets.get(presetKey);
        if (!preset) {
            throw new Error(`Preset not found: ${presetKey}`);
        }

        if (preset.author === 'system') {
            throw new Error('Cannot delete system presets');
        }

        this.presets.delete(presetKey);
        this.savePresets();
        
        if (this.currentPreset === presetKey) {
            this.currentPreset = null;
        }

        this.updatePresetsList();
        console.log(`Deleted preset: ${preset.name}`);
    }

    /**
     * Show save preset dialog
     */
    showSaveDialog() {
        const name = prompt('Enter preset name:');
        if (!name) return;

        const description = prompt('Enter preset description (optional):') || '';
        const category = prompt('Enter category (custom/concept/presentation/technical/style):', 'custom') || 'custom';
        const tagsInput = prompt('Enter tags (comma-separated):') || '';
        const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);

        try {
            const key = this.createPreset(name, description, category, tags);
            this.updatePresetsList();
            alert(`Preset "${name}" saved successfully!`);
        } catch (error) {
            alert(`Failed to save preset: ${error.message}`);
        }
    }

    /**
     * Show load preset dialog
     */
    showLoadDialog() {
        const presetList = Array.from(this.presets.entries())
            .map(([key, preset]) => `${key}: ${preset.name} (${preset.category})`)
            .join('\n');

        const selection = prompt(`Select preset by key:\n\n${presetList}`);
        if (!selection) return;

        try {
            this.applyPreset(selection);
            alert(`Preset applied successfully!`);
        } catch (error) {
            alert(`Failed to apply preset: ${error.message}`);
        }
    }

    /**
     * Export preset to JSON file
     */
    exportPreset() {
        if (!this.currentPreset) {
            alert('No preset selected for export');
            return;
        }

        const preset = this.presets.get(this.currentPreset);
        if (!preset) {
            alert('Selected preset not found');
            return;
        }

        const exportData = {
            version: '1.0',
            preset: preset,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${preset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        console.log('Preset exported successfully');
    }

    /**
     * Import preset from file
     */
    importPreset() {
        const fileInput = document.getElementById('presetFileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    /**
     * Handle file import
     */
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (!importData.preset) {
                    throw new Error('Invalid preset file format');
                }

                const preset = importData.preset;
                const key = this.generatePresetKey(preset.name);
                
                // Mark as imported
                preset.author = 'imported';
                preset.importedAt = new Date().toISOString();
                
                this.presets.set(key, preset);
                this.savePresets();
                this.updatePresetsList();
                
                alert(`Preset "${preset.name}" imported successfully!`);
            } catch (error) {
                alert(`Failed to import preset: ${error.message}`);
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }

    /**
     * Generate unique preset key
     */
    generatePresetKey(name) {
        const base = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        let key = base;
        let counter = 1;
        
        while (this.presets.has(key)) {
            key = `${base}-${counter}`;
            counter++;
        }
        
        return key;
    }

    /**
     * Populate preset dropdown
     */
    populatePresetDropdown() {
        const dropdown = document.getElementById('stylePreset');
        if (!dropdown) return;

        // Clear existing options (except default ones)
        const defaultOptions = dropdown.querySelectorAll('option[data-default="true"]');
        dropdown.innerHTML = '';
        
        // Re-add default options
        defaultOptions.forEach(option => dropdown.appendChild(option));

        // Add separator
        const separator = document.createElement('optgroup');
        separator.label = 'Saved Presets';
        dropdown.appendChild(separator);

        // Add saved presets
        this.presets.forEach((preset, key) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${preset.name} (${preset.category})`;
            option.dataset.presetKey = key;
            separator.appendChild(option);
        });
    }

    /**
     * Update presets list UI
     */
    updatePresetsList() {
        // This would update a preset management UI if it exists
        const presetsList = document.getElementById('presetsList');
        if (!presetsList) return;

        presetsList.innerHTML = '';
        
        this.presets.forEach((preset, key) => {
            const presetItem = document.createElement('div');
            presetItem.className = 'preset-item';
            presetItem.innerHTML = `
                <div class="preset-info">
                    <h4>${preset.name}</h4>
                    <p>${preset.description}</p>
                    <div class="preset-meta">
                        <span class="category">${preset.category}</span>
                        <span class="author">${preset.author}</span>
                        <span class="date">${new Date(preset.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="preset-tags">
                        ${preset.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="preset-actions">
                    <button onclick="presetManager.applyPreset('${key}')">Apply</button>
                    ${preset.author !== 'system' ? `<button onclick="presetManager.deletePreset('${key}')">Delete</button>` : ''}
                </div>
            `;
            presetsList.appendChild(presetItem);
        });
    }

    /**
     * Update preset display
     */
    updatePresetDisplay() {
        const display = document.getElementById('currentPresetDisplay');
        if (!display) return;

        if (this.currentPreset) {
            const preset = this.presets.get(this.currentPreset);
            display.textContent = `Current: ${preset.name}`;
            display.style.display = 'block';
        } else {
            display.style.display = 'none';
        }
    }

    /**
     * Search presets
     */
    searchPresets(query) {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        this.presets.forEach((preset, key) => {
            const searchableText = `${preset.name} ${preset.description} ${preset.category} ${preset.tags.join(' ')}`.toLowerCase();
            if (searchableText.includes(searchTerm)) {
                results.push({ key, preset });
            }
        });
        
        return results;
    }

    /**
     * Get presets by category
     */
    getPresetsByCategory(category) {
        const results = [];
        
        this.presets.forEach((preset, key) => {
            if (preset.category === category) {
                results.push({ key, preset });
            }
        });
        
        return results;
    }

    /**
     * Get preset statistics
     */
    getPresetStats() {
        const stats = {
            total: this.presets.size,
            byCategory: {},
            byAuthor: {},
            recent: []
        };
        
        this.presets.forEach((preset, key) => {
            // Category stats
            stats.byCategory[preset.category] = (stats.byCategory[preset.category] || 0) + 1;
            
            // Author stats
            stats.byAuthor[preset.author] = (stats.byAuthor[preset.author] || 0) + 1;
            
            // Recent presets
            stats.recent.push({ key, preset, createdAt: new Date(preset.createdAt) });
        });
        
        // Sort recent presets
        stats.recent.sort((a, b) => b.createdAt - a.createdAt);
        stats.recent = stats.recent.slice(0, 5);
        
        return stats;
    }

    /**
     * Duplicate preset
     */
    duplicatePreset(presetKey) {
        const preset = this.presets.get(presetKey);
        if (!preset) {
            throw new Error(`Preset not found: ${presetKey}`);
        }

        const newName = `${preset.name} (Copy)`;
        const newPreset = {
            ...preset,
            name: newName,
            author: 'user',
            createdAt: new Date().toISOString()
        };

        const newKey = this.generatePresetKey(newName);
        this.presets.set(newKey, newPreset);
        this.savePresets();
        
        return newKey;
    }

    /**
     * Reset to default presets
     */
    resetToDefaults() {
        if (confirm('This will remove all custom presets and reset to defaults. Continue?')) {
            localStorage.removeItem(this.storageKey);
            this.presets.clear();
            this.currentPreset = null;
            
            Object.entries(this.defaultPresets).forEach(([key, preset]) => {
                this.presets.set(key, preset);
            });
            
            this.updatePresetsList();
            this.populatePresetDropdown();
            console.log('Reset to default presets');
        }
    }
}

// Initialize preset manager when DOM is ready
let presetManager;
document.addEventListener('DOMContentLoaded', () => {
    presetManager = new PresetManager();
    presetManager.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresetManager;
} else {
    window.PresetManager = PresetManager;
}