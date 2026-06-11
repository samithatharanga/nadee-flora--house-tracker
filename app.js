/**
 * ============================================================
 * Nadee Flora House - Live Order Tracker Dashboard
 * JavaScript Application v1.0 | Production-Ready | ST Imagix
 * ============================================================
 *
 * This module provides:
 * - Robust state management for order tracking
 * - Dynamic UI updates with smooth animations
 * - LocalStorage persistence for state recovery
 * - Theme toggle functionality (Light/Dark mode)
 * - Sound effect integration
 * - Accessibility support
 * - Mobile-optimized interactions
 * ============================================================
 */

'use strict';

/**
 * TrackerApp - Main Application Class
 * Encapsulated state management and UI control
 */
class TrackerApp {
    /**
     * Configuration Object
     */
    static CONFIG = {
        storageKey: 'nadeeflorahouse_tracker_state',
        soundEnabled: true,
        animationDuration: 300,
        stages: [
            {
                id: 1,
                name: 'Order Placed',
                sinhalese: 'ඇණවුම ලැබුණා',
                icon: 'check'
            },
            {
                id: 2,
                name: 'Design & Arrangement',
                sinhalese: 'මල් කළඹ සකස් කරමින් පවතී',
                icon: 'flower'
            },
            {
                id: 3,
                name: 'Out for Delivery',
                sinhalese: 'ප්‍රවාහනය අරඹා ඇත',
                icon: 'truck'
            },
            {
                id: 4,
                name: 'Delivered',
                sinhalese: 'ලැබුණා',
                icon: 'package'
            }
        ],
        themes: {
            light: 'light',
            dark: 'dark'
        }
    };

    /**
     * Application State
     */
    static state = {
        currentStage: 1,
        theme: 'light',
        initialized: false
    };

    /**
     * Initialize the application
     */
    static init() {
        try {
            // Restore persisted state
            this.restoreState();

            // Initialize DOM
            this.cacheDOM();

            // Setup event listeners
            this.bindEvents();

            // Apply initial theme
            this.applyTheme(this.state.theme);

            // Render initial UI state
            this.updateUI();

            // Mark as initialized
            this.state.initialized = true;

            console.log('✓ TrackerApp initialized successfully');
        } catch (error) {
            console.error('✗ TrackerApp initialization failed:', error);
            this.handleError(error);
        }
    }

    /**
     * Cache DOM references
     * Defensive approach: store references safely
     */
    static cacheDOM() {
        this.dom = {
            body: document.body,
            themeToggle: document.getElementById('themeToggle'),
            currentStageDisplay: document.getElementById('currentStageDisplay'),
            progressLine: document.getElementById('progressLine'),
            statusMessage: document.getElementById('statusMessage'),
            customerName: document.getElementById('customerName'),
            orderId: document.getElementById('orderId'),
            estimatedDelivery: document.getElementById('estimatedDelivery'),
            deliveryAddress: document.getElementById('deliveryAddress'),
            stepElements: {}
        };

        // Cache all step elements
        for (let i = 1; i <= 4; i++) {
            const stepElement = document.getElementById(`step-${i}`);
            if (stepElement) {
                this.dom.stepElements[i] = stepElement;
            }
        }

        // Validate critical DOM elements
        if (!this.dom.body || !this.dom.themeToggle) {
            throw new Error('Critical DOM elements not found');
        }
    }

    /**
     * Bind event listeners
     */
    static bindEvents() {
        // Theme Toggle
        if (this.dom.themeToggle) {
            this.dom.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Keyboard shortcuts for demo (Accessibility)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.advanceStage();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.reverseStage();
                }
            }
        });

        // Prevent context menu on steps (demo purposes)
        document.querySelectorAll('[data-step]').forEach((element) => {
            element.addEventListener('touchstart', () => {
                // Haptic feedback for mobile
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            });
        });
    }

    /**
     * Restore state from localStorage
     */
    static restoreState() {
        try {
            const stored = localStorage.getItem(this.CONFIG.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Validate restored state
                if (parsed.currentStage >= 1 && parsed.currentStage <= 4) {
                    this.state.currentStage = parsed.currentStage;
                }
                if (parsed.theme && Object.values(this.CONFIG.themes).includes(parsed.theme)) {
                    this.state.theme = parsed.theme;
                }
            } else {
                // Load from system preference if no stored state
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    this.state.theme = this.CONFIG.themes.dark;
                }
            }
        } catch (error) {
            console.warn('⚠ Failed to restore state from localStorage:', error);
            // Graceful fallback: use default state
        }
    }

    /**
     * Persist state to localStorage
     */
    static persistState() {
        try {
            localStorage.setItem(
                this.CONFIG.storageKey,
                JSON.stringify({
                    currentStage: this.state.currentStage,
                    theme: this.state.theme,
                    timestamp: new Date().toISOString()
                })
            );
        } catch (error) {
            console.warn('⚠ Failed to persist state to localStorage:', error);
            // Non-blocking error: continue operation
        }
    }

    /**
     * Update UI based on current state
     */
    static updateUI() {
        try {
            // Update all step elements
            for (let i = 1; i <= 4; i++) {
                this.updateStepElement(i);
            }

            // Update progress line
            this.updateProgressLine();

            // Update status message
            this.updateStatusMessage();

            // Update current stage display
            this.updateStageDisplay();
        } catch (error) {
            console.error('✗ UI update failed:', error);
            this.handleError(error);
        }
    }

    /**
     * Update individual step element styling
     */
    static updateStepElement(stageNumber) {
        const element = this.dom.stepElements[stageNumber];
        if (!element) return;

        // Remove all state classes
        element.classList.remove('step-active', 'step-completed', 'step-inactive');

        if (stageNumber < this.state.currentStage) {
            // Completed stage
            element.classList.add('step-completed');
            element.innerHTML = this.getSVGIcon('check');
            element.setAttribute('aria-current', 'false');
        } else if (stageNumber === this.state.currentStage) {
            // Active stage with pulsing glow
            element.classList.add('step-active');
            element.innerHTML = this.getStageIcon(stageNumber);
            element.setAttribute('aria-current', 'step');
        } else {
            // Inactive stage
            element.classList.add('step-inactive');
            element.innerHTML = this.getStageIcon(stageNumber);
            element.setAttribute('aria-current', 'false');
        }
    }

    /**
     * Update progress line SVG
     */
    static updateProgressLine() {
        try {
            const progressLine = this.dom.progressLine;
            if (!progressLine) return;

            // Calculate progress percentage
            const progress = ((this.state.currentStage - 1) / 3) * 100;
            const dashoffset = 750 - (750 * progress / 100);

            // Update SVG line with animation
            const line = progressLine.querySelector('line');
            if (line) {
                line.style.strokeDashoffset = dashoffset;
                line.style.transition = 'stroke-dashoffset 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }
        } catch (error) {
            console.warn('⚠ Progress line update failed:', error);
        }
    }

    /**
     * Update status message based on current stage
     */
    static updateStatusMessage() {
        try {
            if (!this.dom.statusMessage) return;

            const messages = {
                1: {
                    text: '<span class="font-semibold text-emerald-600 dark:text-emerald-400">✓ Order Confirmed</span> — Your beautiful arrangement is being prepared with care. We\'ll notify you when it\'s on the way!',
                    icon: '✓'
                },
                2: {
                    text: '<span class="font-semibold text-blue-600 dark:text-blue-400">🎨 Designing & Arranging</span> — Our skilled florists are creating your custom arrangement. Each stem is placed with precision and love.',
                    icon: '🎨'
                },
                3: {
                    text: '<span class="font-semibold text-amber-600 dark:text-amber-400">🚗 On the Way</span> — Your order is out for delivery! We\'re bringing freshness and beauty right to your doorstep.',
                    icon: '🚗'
                },
                4: {
                    text: '<span class="font-semibold text-pink-600 dark:text-pink-400">💝 Delivered</span> — Congratulations! Your order has been delivered. Thank you for choosing Nadee Flora House!',
                    icon: '💝'
                }
            };

            const message = messages[this.state.currentStage] || messages[1];
            this.dom.statusMessage.innerHTML = message.text;
            this.dom.statusMessage.classList.add('fade-in');
        } catch (error) {
            console.warn('⚠ Status message update failed:', error);
        }
    }

    /**
     * Update current stage display in admin panel
     */
    static updateStageDisplay() {
        try {
            if (this.dom.currentStageDisplay) {
                this.dom.currentStageDisplay.textContent = this.state.currentStage;
                this.dom.currentStageDisplay.classList.add('fade-in');
            }
        } catch (error) {
            console.warn('⚠ Stage display update failed:', error);
        }
    }

    /**
     * Advance to next stage
     */
    static advanceStage() {
        if (this.state.currentStage < 4) {
            this.state.currentStage += 1;
            this.updateUI();
            this.persistState();
            this.playSound('advance');
            this.announceStageChange();
        }
    }

    /**
     * Reverse to previous stage
     */
    static reverseStage() {
        if (this.state.currentStage > 1) {
            this.state.currentStage -= 1;
            this.updateUI();
            this.persistState();
            this.playSound('reverse');
            this.announceStageChange();
        }
    }

    /**
     * Jump to specific stage
     */
    static jumpToStage(stageNumber) {
        const stage = parseInt(stageNumber);
        if (stage >= 1 && stage <= 4 && stage !== this.state.currentStage) {
            this.state.currentStage = stage;
            this.updateUI();
            this.persistState();
            this.playSound('jump');
            this.announceStageChange();
        }
    }

    /**
     * Announce stage change for accessibility
     */
    static announceStageChange() {
        try {
            const stage = this.CONFIG.stages[this.state.currentStage - 1];
            if (stage) {
                const announcement = `Order status updated to: ${stage.name}`;
                // Create a live region for screen readers
                const liveRegion = document.createElement('div');
                liveRegion.setAttribute('role', 'status');
                liveRegion.setAttribute('aria-live', 'polite');
                liveRegion.className = 'sr-only';
                liveRegion.textContent = announcement;
                document.body.appendChild(liveRegion);
                setTimeout(() => liveRegion.remove(), 1000);
            }
        } catch (error) {
            console.warn('⚠ Announcement failed:', error);
        }
    }

    /**
     * Get stage-specific SVG icon
     */
    static getStageIcon(stageNumber) {
        const icons = {
            1: this.getSVGIcon('package'),
            2: this.getSVGIcon('flower'),
            3: this.getSVGIcon('truck'),
            4: this.getSVGIcon('check')
        };
        return icons[stageNumber] || this.getSVGIcon('package');
    }

    /**
     * SVG Icon Library
     */
    static getSVGIcon(iconName) {
        const icons = {
            check: `<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`,
            
            flower: `<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2 0 1.5-.5 3-1.2 4.3.8.4 1.5 1 2 1.8.5-1.2 1.2-2.3 2-3.1-.7-1.3-1.2-2.8-1.2-4.3C16 2.9 17.1 2 18 2s2 .9 2 2c0 2.2-1 4.2-2.5 5.5.5.3.9.8 1.2 1.3 2-1.5 3.3-4 3.3-6.8 0-4.4-3.6-8-8-8-1.5 0-2.9.4-4.1 1.1C7 1.4 5.9 1 4.6 1 2.1 1 0 3.1 0 5.6c0 1.3.4 2.5 1.1 3.5C.4 10.1 0 11.5 0 13c0 3.9 3.1 7 7 7 1.3 0 2.5-.4 3.5-1.1 1 .7 2.2 1.1 3.5 1.1 3.9 0 7-3.1 7-7 0-1.5-.4-2.9-1.1-4.1.7-1 1.1-2.2 1.1-3.5 0-2.5-2.1-4.6-4.6-4.6z"/></svg>`,
            
            truck: `<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 3 23 6 23 13 16 13"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
            
            package: `<svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
        };

        return icons[iconName] || icons.package;
    }

    /**
     * Theme Management
     */
    static toggleTheme() {
        try {
            this.state.theme = this.state.theme === this.CONFIG.themes.light 
                ? this.CONFIG.themes.dark 
                : this.CONFIG.themes.light;
            this.applyTheme(this.state.theme);
            this.persistState();
            this.playSound('toggle');
        } catch (error) {
            console.error('✗ Theme toggle failed:', error);
        }
    }

    /**
     * Apply theme to document
     */
    static applyTheme(theme) {
        try {
            if (this.dom.body) {
                this.dom.body.setAttribute('data-theme', theme);
                
                // Update meta theme-color
                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor) {
                    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ec4899');
                }
                
                // Add/remove dark class for Tailwind
                if (theme === this.CONFIG.themes.dark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        } catch (error) {
            console.error('✗ Theme application failed:', error);
        }
    }

    /**
     * Sound Effect Management
     * Production placeholder - integrate with actual audio library
     */
    static playSound(soundName) {
        if (!this.CONFIG.soundEnabled) return;

        try {
            // Create a simple beep using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Sound configurations
            const sounds = {
                advance: { frequency: 800, duration: 0.1 },
                reverse: { frequency: 600, duration: 0.1 },
                jump: { frequency: 900, duration: 0.15 },
                toggle: { frequency: 700, duration: 0.08 }
            };

            const sound = sounds[soundName] || sounds.advance;
            oscillator.frequency.value = sound.frequency;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + sound.duration);
        } catch (error) {
            // Gracefully handle AudioContext errors (permissions, etc.)
            console.warn('⚠ Sound playback failed:', error);
        }
    }

    /**
     * Error Handler
     */
    static handleError(error) {
        try {
            // Log error with context
            console.error('TrackerApp Error:', {
                message: error.message,
                stack: error.stack,
                state: this.state,
                timestamp: new Date().toISOString()
            });

            // Optionally send to error tracking service
            // this.reportError(error);
        } catch (e) {
            console.error('Error handler failed:', e);
        }
    }

    /**
     * Utility: Get stage info
     */
    static getStageInfo(stageNumber) {
        return this.CONFIG.stages[stageNumber - 1] || null;
    }

    /**
     * Utility: Get all stages
     */
    static getAllStages() {
        return this.CONFIG.stages;
    }

    /**
     * Utility: Current stage info
     */
    static getCurrentStageInfo() {
        return this.getStageInfo(this.state.currentStage);
    }
}

/**
 * ============================================================
 * Application Bootstrap
 * ============================================================
 */

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        TrackerApp.init();
    });
} else {
    // DOM is already loaded
    TrackerApp.init();
}

// Handle visibility change for re-initialization
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && TrackerApp.state.initialized) {
        // Re-sync UI if page becomes visible
        TrackerApp.updateUI();
    }
});

/**
 * ============================================================
 * Global Export for Demo/Testing
 * ============================================================
 */

// Make TrackerApp globally accessible for browser console testing
if (typeof window !== 'undefined') {
    window.TrackerApp = TrackerApp;
}

/**
 * ============================================================
 * End of Application Script
 * ============================================================
 */
