// Data Management and Mock Data
class DataManager {
    constructor() {
        this.products = [];
        this.users = [];
        this.categories = [];
        this.initializeData();
    }

    initializeData() {
        this.loadCategories();
        this.loadMockProducts();
        this.loadMockUsers();
    }

    loadCategories() {
        this.categories = [
            { id: 1, name: 'Men', icon: 'fas fa-male', color: '#3b82f6' },
            { id: 2, name: 'Women', icon: 'fas fa-female', color: '#ec4899' },
            { id: 3, name: 'Kids', icon: 'fas fa-child', color: '#10b981' },
            { id: 4, name: 'Accessories', icon: 'fas fa-gem', color: '#f59e0b' }
        ];
    }

    loadMockProducts() {
        this.products = [
            {
                id: 1,
                name: 'Vintage Denim Jacket',
                description: 'Classic blue denim jacket in excellent condition. Perfect for casual outings.',
                category: 'Women',
                categoryId: 2,
                price: 25,
                owner: 'sarah_j',
                ownerName: 'Sarah Johnson',
                images: ['jacket1.jpg'],
                status: 'available',
                condition: 'Good',
                size: 'M',
                createdAt: '2024-01-15',
                tags: ['denim', 'jacket', 'vintage', 'casual']
            },
            {
                id: 2,
                name: 'Men\'s Formal Shirt',
                description: 'White cotton formal shirt, size M. Perfect for business meetings.',
                category: 'Men',
                categoryId: 1,
                price: 15,
                owner: 'mike_d',
                ownerName: 'Mike Davis',
                images: ['shirt1.jpg'],
                status: 'available',
                condition: 'Excellent',
                size: 'M',
                createdAt: '2024-01-10',
                tags: ['formal', 'shirt', 'business', 'white']
            },
            {
                id: 3,
                name: 'Kids Winter Coat',
                description: 'Warm winter coat for children, age 5-7. Keeps kids cozy in cold weather.',
                category: 'Kids',
                categoryId: 3,
                price: 20,
                owner: 'lisa_m',
                ownerName: 'Lisa Martinez',
                images: ['coat1.jpg'],
                status: 'available',
                condition: 'Good',
                size: '5-7',
                createdAt: '2024-01-08',
                tags: ['winter', 'coat', 'kids', 'warm']
            },
            {
                id: 4,
                name: 'Leather Handbag',
                description: 'Brown leather handbag with gold hardware. Elegant and durable.',
                category: 'Accessories',
                categoryId: 4,
                price: 30,
                owner: 'emma_w',
                ownerName: 'Emma Wilson',
                images: ['bag1.jpg'],
                status: 'available',
                condition: 'Excellent',
                size: 'One Size',
                createdAt: '2024-01-12',
                tags: ['leather', 'handbag', 'elegant', 'brown']
            },
            {
                id: 5,
                name: 'Men\'s Running Shoes',
                description: 'Comfortable running shoes, size 10. Great for jogging and workouts.',
                category: 'Men',
                categoryId: 1,
                price: 35,
                owner: 'john_s',
                ownerName: 'John Smith',
                images: ['shoes1.jpg'],
                status: 'available',
                condition: 'Good',
                size: '10',
                createdAt: '2024-01-05',
                tags: ['running', 'shoes', 'sports', 'comfortable']
            },
            {
                id: 6,
                name: 'Women\'s Summer Dress',
                description: 'Light floral summer dress, perfect for warm weather occasions.',
                category: 'Women',
                categoryId: 2,
                price: 18,
                owner: 'anna_b',
                ownerName: 'Anna Brown',
                images: ['dress1.jpg'],
                status: 'available',
                condition: 'Excellent',
                size: 'S',
                createdAt: '2024-01-20',
                tags: ['summer', 'dress', 'floral', 'casual']
            }
        ];
    }

    loadMockUsers() {
        this.users = [
            {
                id: 1,
                username: 'sarah_j',
                name: 'Sarah Johnson',
                email: 'sarah@email.com',
                role: 'user',
                avatar: null,
                listings: [1],
                purchases: [],
                joinDate: '2024-01-01',
                rating: 4.8,
                totalSwaps: 12
            },
            {
                id: 2,
                username: 'mike_d',
                name: 'Mike Davis',
                email: 'mike@email.com',
                role: 'user',
                avatar: null,
                listings: [2],
                purchases: [1],
                joinDate: '2024-01-02',
                rating: 4.5,
                totalSwaps: 8
            },
            {
                id: 3,
                username: 'admin',
                name: 'Admin User',
                email: 'admin@rewear.com',
                role: 'admin',
                avatar: null,
                listings: [],
                purchases: [],
                joinDate: '2024-01-01',
                rating: 5.0,
                totalSwaps: 0
            },
            {
                id: 4,
                username: 'lisa_m',
                name: 'Lisa Martinez',
                email: 'lisa@email.com',
                role: 'user',
                avatar: null,
                listings: [3],
                purchases: [2],
                joinDate: '2024-01-03',
                rating: 4.7,
                totalSwaps: 15
            },
            {
                id: 5,
                username: 'emma_w',
                name: 'Emma Wilson',
                email: 'emma@email.com',
                role: 'user',
                avatar: null,
                listings: [4],
                purchases: [],
                joinDate: '2024-01-04',
                rating: 4.9,
                totalSwaps: 6
            }
        ];
    }

    // Product operations
    getProducts(filters = {}) {
        let filteredProducts = [...this.products];

        if (filters.category) {
            filteredProducts = filteredProducts.filter(p => p.category === filters.category);
        }

        if (filters.status) {
            filteredProducts = filteredProducts.filter(p => p.status === filters.status);
        }

        if (filters.owner) {
            filteredProducts = filteredProducts.filter(p => p.owner === filters.owner);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        return filteredProducts;
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    addProduct(productData) {
        const newProduct = {
            id: this.products.length + 1,
            ...productData,
            createdAt: new Date().toISOString().split('T')[0],
            status: 'available'
        };
        this.products.push(newProduct);
        return newProduct;
    }

    updateProduct(id, updates) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updates };
            return this.products[index];
        }
        return null;
    }

    deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products.splice(index, 1);
            return true;
        }
        return false;
    }

    // User operations
    getUsers() {
        return [...this.users];
    }

    getUserById(id) {
        return this.users.find(u => u.id === id);
    }

    getUserByUsername(username) {
        return this.users.find(u => u.username === username);
    }

    addUser(userData) {
        const newUser = {
            id: this.users.length + 1,
            ...userData,
            joinDate: new Date().toISOString().split('T')[0],
            listings: [],
            purchases: [],
            rating: 0,
            totalSwaps: 0
        };
        this.users.push(newUser);
        return newUser;
    }

    updateUser(id, updates) {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updates };
            return this.users[index];
        }
        return null;
    }

    // Category operations
    getCategories() {
        return [...this.categories];
    }

    getCategoryById(id) {
        return this.categories.find(c => c.id === id);
    }

    // Search functionality
    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }

    // Statistics
    getStats() {
        return {
            totalProducts: this.products.length,
            totalUsers: this.users.length,
            availableProducts: this.products.filter(p => p.status === 'available').length,
            categories: this.categories.length,
            totalSwaps: this.users.reduce((sum, user) => sum + user.totalSwaps, 0)
        };
    }

    // Export data (for debugging)
    exportData() {
        return {
            products: this.products,
            users: this.users,
            categories: this.categories
        };
    }
}

// Initialize data manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dataManager = new DataManager();
}); 