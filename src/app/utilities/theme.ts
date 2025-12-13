// Function to set the theme
export function setTheme(theme: 'dark' | 'light') {
  const body = document.getElementById('root');
    console.log(body)

  if (!body) return;
  if (theme === 'dark') {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    localStorage.setItem('theme', 'dark'); // Save preference
  } else if (theme === 'light') {
    body.classList.add('light-mode');
    body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light'); // Save preference
  } else {
    // Revert to system preference by removing classes and local storage item
    body.classList.remove('dark-mode', 'light-mode');
    localStorage.removeItem('theme');
  }
}

// Function to toggle between light/dark (or back to system default)
export function toggleTheme() {
    console.log('toggle')
  const currentPreference = localStorage.getItem('theme');
  if (currentPreference === 'dark') {
    setTheme('light');
  } else if (currentPreference === 'light') {
    // Optional: add a third state to follow system default again
    // For a simple toggle between forced light/dark, change 'system' to 'dark'
    setTheme('dark');
  } else {
    // If no preference saved, assume system default is active. Toggle to the opposite
    // of the current system setting to start the forced override.
    const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(systemIsDark ? 'light' : 'dark');
  }
}
