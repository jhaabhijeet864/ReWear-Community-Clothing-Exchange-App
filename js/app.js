// Main App JavaScript
class ReWearApp {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.users = [];
        this.init();
    }

    init() {
        console.log('ReWear App Initializing...');
        this.loadMockData();
        this.setupEventListeners();
        this.renderProducts();
        console.log('ReWear App Ready!');
    }

    loadMockData() {
        // Mock products data
        this.products = [
            {
                id: 1,
                name: 'Vintage Denim Jacket',
                description: 'Classic blue denim jacket in excellent condition',
                category: 'Women',
                price: 25,
                owner: 'sarah_j',
                images: ['jacket1.jpg'],
                status: 'available'
            },
            {
                id: 2,
                name: 'Men\'s Formal Shirt',
                description: 'White cotton formal shirt, size M',
                category: 'Men',
                price: 15,
                owner: 'mike_d',
                images: ['shirt1.jpg'],
                status: 'available'
            },
            {
                id: 3,
                name: 'Kids Winter Coat',
                description: 'Warm winter coat for children, age 5-7',
                category: 'Kids',
                price: 20,
                owner: 'lisa_m',
                images: ['coat1.jpg'],
                status: 'available'
            },
            {
                id: 4,
                name: 'Leather Handbag',
                description: 'Brown leather handbag with gold hardware',
                category: 'Accessories',
                price: 30,
                owner: 'emma_w',
                images: ['bag1.jpg'],
                status: 'available'
            }
        ];

        // Mock users data
        this.users = [
            {
                id: 1,
                username: 'sarah_j',
                name: 'Sarah Johnson',
                email: 'sarah@email.com',
                role: 'user',
                listings: [1],
                purchases: []
            },
            {
                id: 2,
                username: 'mike_d',
                name: 'Mike Davis',
                email: 'mike@email.com',
                role: 'user',
                listings: [2],
                purchases: []
            },
            {
                id: 3,
                username: 'admin',
                name: 'Admin User',
                email: 'admin@rewear.com',
                role: 'admin',
                listings: [],
                purchases: []
            }
        ];
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('href').substring(1);
                this.navigateToPage(pageId);
            });
        });

        // Logo click
        document.querySelector('.logo a').addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateToPage('home');
        });

        // Form submissions
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const itemForm = document.getElementById('item-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (itemForm) {
            itemForm.addEventListener('submit', (e) => this.handleItemSubmit(e));
        }

        // Image upload
        const imageInput = document.getElementById('item-images');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
    }

    navigateToPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update active nav link
        document.querySelectorAll('.nav a').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`[href="#${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Load page-specific content
        this.loadPageContent(pageId);
    }

    loadPageContent(pageId) {
        switch (pageId) {
            case 'home':
                this.renderProducts();
                break;
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'admin':
                this.renderAdminPanel();
                break;
        }
    }

    renderProducts() {
        const productGrid = document.getElementById('product-grid');
        if (!productGrid) return;

        productGrid.innerHTML = this.products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <i class="fas fa-tshirt"></i>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p><strong>Category:</strong> ${product.category}</p>
                    <p><strong>Price:</strong> $${product.price}</p>
                    <button class="btn btn-primary" onclick="app.viewProduct(${product.id})">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderDashboard() {
        if (!this.currentUser) {
            this.navigateToPage('login');
            return;
        }

        const userListings = document.getElementById('user-listings');
        const userPurchases = document.getElementById('user-purchases');

        if (userListings) {
            const userProducts = this.products.filter(p => p.owner === this.currentUser.username);
            userListings.innerHTML = userProducts.map(product => `
                <div class="product-card">
                    <div class="product-image">
                        <i class="fas fa-tshirt"></i>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p>$${product.price}</p>
                        <button class="btn btn-primary" onclick="app.editProduct(${product.id})">
                            Edit
                        </button>
                    </div>
                </div>
            `).join('');
        }

        if (userPurchases) {
            userPurchases.innerHTML = '<p>No purchases yet.</p>';
        }
    }

    renderAdminPanel() {
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.navigateToPage('login');
            return;
        }

        const userList = document.getElementById('admin-user-list');
        if (userList) {
            userList.innerHTML = this.users.map(user => `
                <div class="user-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e5e7eb;">
                    <div>
                        <h4>${user.name}</h4>
                        <p>${user.email} (${user.role})</p>
                    </div>
                    <div>
                        <button class="btn btn-primary" style="width: auto; margin-right: 0.5rem;">Edit</button>
                        <button class="btn btn-success" style="width: auto;">Delete</button>
                    </div>
                </div>
            `).join('');
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        // Simple mock authentication
        const user = this.users.find(u => u.username === username);
        if (user && password === 'password') { // Mock password
            this.currentUser = user;
            alert('Login successful!');
            this.navigateToPage('dashboard');
        } else {
            alert('Invalid credentials. Try: admin/password');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;

        if (password !== confirm) {
            alert('Passwords do not match!');
            return;
        }

        // Mock registration
        const newUser = {
            id: this.users.length + 1,
            username: email.split('@')[0],
            name: name,
            email: email,
            role: 'user',
            listings: [],
            purchases: []
        };

        this.users.push(newUser);
        alert('Registration successful! Please login.');
        this.navigateToPage('login');
    }

    handleItemSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('item-name').value;
        const description = document.getElementById('item-description').value;

        const newProduct = {
            id: this.products.length + 1,
            name: name,
            description: description,
            category: 'General',
            price: 0,
            owner: this.currentUser ? this.currentUser.username : 'anonymous',
            images: [],
            status: 'available'
        };

        this.products.push(newProduct);
        alert('Product added successfully!');
        this.navigateToPage('dashboard');
    }

    handleImageUpload(e) {
        const files = e.target.files;
        const preview = document.getElementById('image-preview');
        
        if (preview) {
            preview.innerHTML = '';
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const previewItem = document.createElement('div');
                    previewItem.className = 'preview-item';
                    previewItem.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 5px;">`;
                    preview.appendChild(previewItem);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    viewProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            alert(`Product: ${product.name}\nDescription: ${product.description}\nPrice: $${product.price}`);
        }
    }

    editProduct(productId) {
        this.navigateToPage('item-edit');
        // Pre-fill form with product data
        const product = this.products.find(p => p.id === productId);
        if (product) {
            document.getElementById('item-name').value = product.name;
            document.getElementById('item-description').value = product.description;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ReWearApp();
}); 