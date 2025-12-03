// Theme Toggle Functionality
(function () {
    // Get theme from localStorage or default to 'dark'
    const getTheme = () => localStorage.getItem('theme') || 'dark';

    // Set theme
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        updateThemeIcon();
    };

    // Update the theme icon
    const updateThemeIcon = () => {
        const currentTheme = getTheme();
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
            themeToggle.setAttribute('aria-label', currentTheme === 'dark' ? 'Light Mode\'a Geç' : 'Dark Mode\'a Geç');
        }
    };

    // Toggle theme
    const toggleTheme = () => {
        const currentTheme = getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    // Initialize theme on page load
    document.addEventListener('DOMContentLoaded', () => {
        setTheme(getTheme());

        // Add click handler to toggle button
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    });

    // Set initial theme immediately (before DOMContentLoaded to prevent flash)
    setTheme(getTheme());
})();
