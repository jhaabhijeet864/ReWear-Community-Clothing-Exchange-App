// Navigation and Routing
class Navigation {
    constructor() {
        this.currentPage = 'home';
        this.setupNavigation();
    }

    setupNavigation() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateToPage(e.state.page, false);
            }
        });

        // Handle initial page load
        const hash = window.location.hash.substring(1) || 'home';
        this.navigateToPage(hash, false);
    }

    navigateToPage(pageId, updateHistory = true) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
        }

        // Update navigation active state
        this.updateActiveNav(pageId);

        // Update browser history
        if (updateHistory) {
            const url = pageId === 'home' ? '/' : `#${pageId}`;
            window.history.pushState({ page: pageId }, '', url);
        }

        // Trigger page-specific events
        this.triggerPageEvent(pageId);
    }

    updateActiveNav(pageId) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav a').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page link
        const activeLink = document.querySelector(`[href="#${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    triggerPageEvent(pageId) {
        // Dispatch custom event for page changes
        const event = new CustomEvent('pageChange', {
            detail: { pageId: pageId }
        });
        document.dispatchEvent(event);
    }

    // Utility method to check if user is on a specific page
    isOnPage(pageId) {
        return this.currentPage === pageId;
    }

    // Method to get current page
    getCurrentPage() {
        return this.currentPage;
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
}); 