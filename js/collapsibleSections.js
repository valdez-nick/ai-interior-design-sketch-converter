/**
 * Collapsible Sections Module
 * Handles expandable/collapsible UI sections with smooth animations
 */

class CollapsibleSections {
    constructor() {
        this.sections = new Map();
        this.animationDuration = 300; // milliseconds
        this.storageKey = 'collapsible-sections-state';
        this.savedStates = this.loadStates();
        
        this.init();
    }

    /**
     * Initialize collapsible sections
     */
    init() {
        try {
            this.setupSections();
            this.setupEventListeners();
            this.restoreStates();
            console.log('Collapsible Sections initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Collapsible Sections:', error);
        }
    }

    /**
     * Setup all collapsible sections
     */
    setupSections() {
        const collapsibleSections = document.querySelectorAll('.collapsible-section');
        
        collapsibleSections.forEach(section => {
            const header = section.querySelector('.section-header[data-toggle]');
            const content = section.querySelector('.section-content');
            
            if (header && content) {
                const sectionId = header.dataset.toggle;
                
                const sectionData = {
                    id: sectionId,
                    header: header,
                    content: content,
                    section: section,
                    isExpanded: !content.style.display || content.style.display !== 'none',
                    toggleIcon: header.querySelector('.toggle-icon'),
                    originalHeight: null,
                    isAnimating: false
                };
                
                this.sections.set(sectionId, sectionData);
                this.setupSection(sectionData);
            }
        });
    }

    /**
     * Setup individual section
     */
    setupSection(sectionData) {
        const { header, content, toggleIcon } = sectionData;
        
        // Add classes for styling
        header.classList.add('collapsible-header');
        content.classList.add('collapsible-content');
        
        // Set initial ARIA attributes
        header.setAttribute('role', 'button');
        header.setAttribute('aria-expanded', sectionData.isExpanded);
        header.setAttribute('tabindex', '0');
        content.setAttribute('aria-hidden', !sectionData.isExpanded);
        
        // Set initial icon state
        if (toggleIcon) {
            toggleIcon.textContent = sectionData.isExpanded ? '▼' : '▶';
            toggleIcon.classList.add('toggle-icon');
        }
        
        // Store original height for animations
        if (sectionData.isExpanded) {
            sectionData.originalHeight = content.scrollHeight;
            content.style.maxHeight = sectionData.originalHeight + 'px';
        } else {
            content.style.maxHeight = '0px';
            content.style.overflow = 'hidden';
        }
        
        // Add transition for smooth animation
        content.style.transition = `max-height ${this.animationDuration}ms ease-in-out, opacity ${this.animationDuration}ms ease-in-out`;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.sections.forEach(sectionData => {
            const { header } = sectionData;
            
            // Click event
            header.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSection(sectionData.id);
            });
            
            // Keyboard event (Space and Enter)
            header.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.toggleSection(sectionData.id);
                }
            });
            
            // Focus styles
            header.addEventListener('focus', () => {
                header.classList.add('focused');
            });
            
            header.addEventListener('blur', () => {
                header.classList.remove('focused');
            });
        });
        
        // Save states on page unload
        window.addEventListener('beforeunload', () => {
            this.saveStates();
        });
    }

    /**
     * Toggle section expanded/collapsed state
     */
    async toggleSection(sectionId) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData || sectionData.isAnimating) return;

        sectionData.isAnimating = true;
        
        try {
            if (sectionData.isExpanded) {
                await this.collapseSection(sectionData);
            } else {
                await this.expandSection(sectionData);
            }
        } catch (error) {
            console.error(`Failed to toggle section ${sectionId}:`, error);
        } finally {
            sectionData.isAnimating = false;
        }
    }

    /**
     * Expand a section
     */
    async expandSection(sectionData) {
        const { content, header, toggleIcon } = sectionData;
        
        // Update state
        sectionData.isExpanded = true;
        
        // Update ARIA attributes
        header.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');
        
        // Update icon
        if (toggleIcon) {
            toggleIcon.textContent = '▼';
        }
        
        // Add expanding class for additional styling
        content.classList.add('expanding');
        
        // Calculate height
        content.style.maxHeight = 'none';
        const targetHeight = content.scrollHeight;
        content.style.maxHeight = '0px';
        
        // Store original height
        sectionData.originalHeight = targetHeight;
        
        // Trigger animation
        requestAnimationFrame(() => {
            content.style.maxHeight = targetHeight + 'px';
            content.style.opacity = '1';
        });
        
        // Wait for animation to complete
        await this.sleep(this.animationDuration);
        
        // Clean up
        content.classList.remove('expanding');
        content.style.maxHeight = 'none';
        content.style.overflow = 'visible';
        
        // Trigger custom event
        this.dispatchSectionEvent('sectionExpanded', sectionData);
    }

    /**
     * Collapse a section
     */
    async collapseSection(sectionData) {
        const { content, header, toggleIcon } = sectionData;
        
        // Store current height
        const currentHeight = content.scrollHeight;
        content.style.maxHeight = currentHeight + 'px';
        content.style.overflow = 'hidden';
        
        // Update state
        sectionData.isExpanded = false;
        
        // Update ARIA attributes
        header.setAttribute('aria-expanded', 'false');
        content.setAttribute('aria-hidden', 'true');
        
        // Update icon
        if (toggleIcon) {
            toggleIcon.textContent = '▶';
        }
        
        // Add collapsing class for additional styling
        content.classList.add('collapsing');
        
        // Trigger animation
        requestAnimationFrame(() => {
            content.style.maxHeight = '0px';
            content.style.opacity = '0.3';
        });
        
        // Wait for animation to complete
        await this.sleep(this.animationDuration);
        
        // Clean up
        content.classList.remove('collapsing');
        content.style.opacity = '';
        
        // Trigger custom event
        this.dispatchSectionEvent('sectionCollapsed', sectionData);
    }

    /**
     * Expand all sections
     */
    async expandAll() {
        const promises = [];
        
        this.sections.forEach(sectionData => {
            if (!sectionData.isExpanded && !sectionData.isAnimating) {
                promises.push(this.expandSection(sectionData));
            }
        });
        
        await Promise.all(promises);
        this.saveStates();
    }

    /**
     * Collapse all sections
     */
    async collapseAll() {
        const promises = [];
        
        this.sections.forEach(sectionData => {
            if (sectionData.isExpanded && !sectionData.isAnimating) {
                promises.push(this.collapseSection(sectionData));
            }
        });
        
        await Promise.all(promises);
        this.saveStates();
    }

    /**
     * Set section state
     */
    async setSectionState(sectionId, expanded) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData || sectionData.isAnimating) return;

        if (expanded && !sectionData.isExpanded) {
            await this.expandSection(sectionData);
        } else if (!expanded && sectionData.isExpanded) {
            await this.collapseSection(sectionData);
        }
    }

    /**
     * Get section state
     */
    getSectionState(sectionId) {
        const sectionData = this.sections.get(sectionId);
        return sectionData ? sectionData.isExpanded : null;
    }

    /**
     * Get all section states
     */
    getAllStates() {
        const states = {};
        this.sections.forEach((sectionData, sectionId) => {
            states[sectionId] = sectionData.isExpanded;
        });
        return states;
    }

    /**
     * Save states to localStorage
     */
    saveStates() {
        try {
            const states = this.getAllStates();
            localStorage.setItem(this.storageKey, JSON.stringify(states));
        } catch (error) {
            console.warn('Failed to save collapsible section states:', error);
        }
    }

    /**
     * Load states from localStorage
     */
    loadStates() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Failed to load collapsible section states:', error);
            return {};
        }
    }

    /**
     * Restore saved states
     */
    async restoreStates() {
        for (const [sectionId, expanded] of Object.entries(this.savedStates)) {
            await this.setSectionState(sectionId, expanded);
        }
    }

    /**
     * Add new section dynamically
     */
    addSection(sectionElement) {
        const header = sectionElement.querySelector('.section-header[data-toggle]');
        const content = sectionElement.querySelector('.section-content');
        
        if (header && content) {
            const sectionId = header.dataset.toggle;
            
            if (this.sections.has(sectionId)) {
                console.warn(`Section ${sectionId} already exists`);
                return;
            }
            
            const sectionData = {
                id: sectionId,
                header: header,
                content: content,
                section: sectionElement,
                isExpanded: !content.style.display || content.style.display !== 'none',
                toggleIcon: header.querySelector('.toggle-icon'),
                originalHeight: null,
                isAnimating: false
            };
            
            this.sections.set(sectionId, sectionData);
            this.setupSection(sectionData);
            
            // Setup event listeners for new section
            header.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSection(sectionId);
            });
            
            header.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this.toggleSection(sectionId);
                }
            });
            
            console.log(`Added section: ${sectionId}`);
        }
    }

    /**
     * Remove section
     */
    removeSection(sectionId) {
        if (this.sections.has(sectionId)) {
            this.sections.delete(sectionId);
            console.log(`Removed section: ${sectionId}`);
        }
    }

    /**
     * Dispatch custom section event
     */
    dispatchSectionEvent(eventType, sectionData) {
        const event = new CustomEvent(eventType, {
            detail: {
                sectionId: sectionData.id,
                isExpanded: sectionData.isExpanded,
                section: sectionData.section
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Update section content height
     */
    updateSectionHeight(sectionId) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData || !sectionData.isExpanded) return;

        const { content } = sectionData;
        const newHeight = content.scrollHeight;
        
        if (newHeight !== sectionData.originalHeight) {
            sectionData.originalHeight = newHeight;
            content.style.maxHeight = newHeight + 'px';
        }
    }

    /**
     * Refresh all section heights
     */
    refreshAllHeights() {
        this.sections.forEach((sectionData, sectionId) => {
            this.updateSectionHeight(sectionId);
        });
    }

    /**
     * Enable/disable section
     */
    setSectionEnabled(sectionId, enabled) {
        const sectionData = this.sections.get(sectionId);
        if (!sectionData) return;

        const { header, section } = sectionData;
        
        if (enabled) {
            header.style.pointerEvents = 'auto';
            header.style.opacity = '1';
            section.classList.remove('disabled');
        } else {
            header.style.pointerEvents = 'none';
            header.style.opacity = '0.6';
            section.classList.add('disabled');
        }
    }

    /**
     * Set animation duration
     */
    setAnimationDuration(duration) {
        this.animationDuration = duration;
        
        this.sections.forEach(sectionData => {
            const { content } = sectionData;
            content.style.transition = `max-height ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
        });
    }

    /**
     * Add section group functionality
     */
    createAccordion(sectionIds) {
        const accordionSections = sectionIds.map(id => this.sections.get(id)).filter(Boolean);
        
        if (accordionSections.length < 2) {
            console.warn('Accordion needs at least 2 sections');
            return;
        }
        
        // Add accordion behavior
        accordionSections.forEach(sectionData => {
            const originalToggle = () => this.toggleSection(sectionData.id);
            
            // Override toggle behavior for accordion
            sectionData.header.removeEventListener('click', originalToggle);
            sectionData.header.addEventListener('click', async (e) => {
                e.preventDefault();
                
                if (sectionData.isExpanded) {
                    await this.collapseSection(sectionData);
                } else {
                    // Collapse all other sections in accordion
                    const collapsePromises = accordionSections
                        .filter(otherSection => otherSection !== sectionData && otherSection.isExpanded)
                        .map(otherSection => this.collapseSection(otherSection));
                    
                    await Promise.all(collapsePromises);
                    
                    // Then expand this section
                    await this.expandSection(sectionData);
                }
                
                this.saveStates();
            });
        });
        
        console.log(`Created accordion with sections: ${sectionIds.join(', ')}`);
    }

    /**
     * Sleep utility function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Destroy and cleanup
     */
    destroy() {
        // Remove event listeners
        this.sections.forEach(sectionData => {
            const { header } = sectionData;
            header.removeEventListener('click', () => {});
            header.removeEventListener('keydown', () => {});
        });
        
        // Clear sections
        this.sections.clear();
        
        // Remove storage event listener
        window.removeEventListener('beforeunload', () => {});
        
        console.log('Collapsible Sections destroyed');
    }
}

// Initialize when DOM is ready
let collapsibleSections;
document.addEventListener('DOMContentLoaded', () => {
    collapsibleSections = new CollapsibleSections();
});

// Add utility functions to window for easy access
window.expandAllSections = () => collapsibleSections?.expandAll();
window.collapseAllSections = () => collapsibleSections?.collapseAll();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CollapsibleSections;
} else {
    window.CollapsibleSections = CollapsibleSections;
}