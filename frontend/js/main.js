document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Menu Toggle
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const iconMenu = document.getElementById('icon-menu');
    const iconX = document.getElementById('icon-x');

    if (menuButton && mobileMenu && iconMenu && iconX) {
        menuButton.addEventListener('click', () => {
            // Toggle the 'hidden' class on the menu panel
            mobileMenu.classList.toggle('hidden');
            
            // Toggle the visibility of the Menu and X icons
            iconMenu.classList.toggle('hidden');
            iconX.classList.toggle('hidden');
        });
    }

    // 2. Initialize Lucide Icons
    // We check if 'lucide' is defined (loaded from the CDN)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 3. Cookie Banner Logic
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesButton = document.getElementById('accept-cookies');

    if (cookieBanner && acceptCookiesButton) {
        // Check if cookies have already been accepted
        if (!localStorage.getItem('cookies_accepted')) {
            // If not, show the banner
            cookieBanner.classList.remove('hidden');
        }

        // Add event listener to the accept button
        acceptCookiesButton.addEventListener('click', () => {
            // Set a value in localStorage
            localStorage.setItem('cookies_accepted', 'true');
            // Hide the banner
            cookieBanner.classList.add('hidden');
            
            // You can also add a function here to load analytics scripts
            // loadAnalytics();
        });
    }

    // Example function to load analytics (if cookies are accepted)
    // function loadAnalytics() {
    //     if (localStorage.getItem('cookies_accepted')) {
    //         console.log('Cookies accepted. Loading analytics...');
    //         // Add your Google Analytics or other tracking script creation here
    //     }
    // }
    // loadAnalytics(); // Call it on page load as well

});
