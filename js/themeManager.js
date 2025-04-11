/**
 * Theme Manager for handling theme switching
 */
const ThemeManager = {
    THEMES: {
        LIGHT: 'light',
        DARK: 'dark'
    },
    
    /**
     * Initialize theme manager
     */
    init() {
        this.themeSwitch = document.getElementById('theme-switch');
        this.themeLabel = document.getElementById('theme-label');
        
        // Set initial theme from localStorage or system preference
        const savedTheme = StorageManager.getThemePreference();
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setThemeFromSystemPreference();
        }
        
        // Update checkbox state based on current theme
        this.updateSwitchState();
        
        // Add event listener for theme toggle
        this.themeSwitch.addEventListener('change', () => this.toggleTheme());
    },
    
    /**
     * Set theme based on system preference
     */
    setThemeFromSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme(this.THEMES.DARK);
        } else {
            this.setTheme(this.THEMES.LIGHT);
        }
    },
    
    /**
     * Update the switch state based on current theme
     */
    updateSwitchState() {
        const isDarkTheme = document.documentElement.getAttribute('data-theme') === this.THEMES.DARK;
        this.themeSwitch.checked = isDarkTheme;
        this.themeLabel.textContent = isDarkTheme ? 'Light Mode' : 'Dark Mode';
    },
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === this.THEMES.DARK ? this.THEMES.LIGHT : this.THEMES.DARK;
        this.setTheme(newTheme);
    },
    
    /**
     * Set a specific theme
     * @param {string} theme - Theme to set ('light' or 'dark')
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        StorageManager.saveThemePreference(theme);
        
        // Update switch label text to show what mode will be activated when clicked
        if (this.themeLabel) {
            this.themeLabel.textContent = theme === this.THEMES.DARK ? 'Light Mode' : 'Dark Mode';
        }
        
        if (this.themeSwitch) {
            this.themeSwitch.checked = theme === this.THEMES.DARK;
        }
    }
};