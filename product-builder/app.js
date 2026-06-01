// State
let products = [];
let filteredProducts = [];
let currentEditId = null;

// Image Handling State
let tempMainImage = null; // Object { file, name, preview, lastModified }
let currentGalleryImages = []; // Array of objects
let tempPdf = null;

// On Load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    loadProducts();
    renderProductList();
    updateDatalists();
    setupDragAndDrop();
});

// --- Utility: Toast Notifications ---
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'info';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'alert-circle';

    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- search ---
function handleSearch(query) {
    const term = query.toLowerCase();
    filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.series && p.series.toLowerCase().includes(term))
    );
    renderProductList(filteredProducts);
}

// --- State Management ---

function loadProducts() {
    const saved = localStorage.getItem('nuexis_products');
    if (saved) {
        try {
            products = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load products', e);
            products = [];
        }
    }
    filteredProducts = [...products];
}

function saveToStorage() {
    try {
        localStorage.setItem('nuexis_products', JSON.stringify(products));
        updateDatalists();
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            showToast('Storage full! Images are too large.', 'error');
        }
    }
}

function updateDatalists() {
    const seriesSet = new Set(products.map(p => p.series).filter(Boolean));
    const categorySet = new Set(products.map(p => p.category).filter(Boolean));

    const seriesDataList = document.getElementById('series-list');
    const categoryDataList = document.getElementById('category-list');

    if (seriesDataList) {
        seriesDataList.innerHTML = Array.from(seriesSet).map(s => `<option value="${s}">`).join('');
    }
    if (categoryDataList) {
        categoryDataList.innerHTML = Array.from(categorySet).map(c => `<option value="${c}">`).join('');
    }
}

// --- Navigation ---

function switchView(viewName) {
    document.querySelectorAll('.sidebar nav button').forEach(btn => btn.classList.remove('active'));

    if (viewName === 'list') {
        document.getElementById('nav-list').classList.add('active');
        document.getElementById('view-list').classList.add('active');
        document.getElementById('view-form').classList.remove('active');
        filteredProducts = [...products]; // Reset filter
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        renderProductList();
    } else if (viewName === 'form') {
        document.getElementById('nav-add').classList.add('active');
        document.getElementById('view-list').classList.remove('active');
        document.getElementById('view-form').classList.add('active');

        if (currentEditId === null) {
            resetForm();
        }
    }
}

// --- List View Logic ---

function renderProductList(list = products) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (list.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i data-lucide="package-open" size="48"></i>
                <p>No products found.</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }

    list.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const imgSrc = product.mainImage ? product.mainImage.preview : null;
        const imgHtml = imgSrc
            ? `<img src="${imgSrc}" alt="${product.name}">`
            : `<div class="placeholder"><i data-lucide="image"></i></div>`;

        card.innerHTML = `
            <div class="card-image">
                ${imgHtml}
            </div>
            <div class="card-body">
                <div class="card-header">
                    <span class="card-badge">${product.category}</span>
                </div>
                <h3 class="card-title">${product.name}</h3>
                <p class="card-desc">${product.shortDescription || 'No description'}</p>
                <div class="card-actions">
                    <button class="btn-edit" onclick="editProduct('${product.id}')">
                        Edit
                    </button>
                    <button class="btn-delete" onclick="deleteProduct('${product.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== id);
        filteredProducts = products;
        saveToStorage();
        renderProductList();
        showToast('Product deleted', 'success');
    }
}

// --- Form Logic & Gallery ---

function renderGalleryPreviews() {
    const grid = document.getElementById('gallery-preview');
    if (!grid) return;

    grid.innerHTML = '';

    currentGalleryImages.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const isFirst = index === 0;
        const isLast = index === currentGalleryImages.length - 1;

        item.innerHTML = `
            <img src="${img.preview}">
            <div class="gallery-controls">
                ${!isFirst ? `<button class="gallery-btn move" onclick="moveGalleryImage(${index}, -1)" title="Move Left"><i data-lucide="arrow-left"></i></button>` : ''}
                ${!isLast ? `<button class="gallery-btn move" onclick="moveGalleryImage(${index}, 1)" title="Move Right"><i data-lucide="arrow-right"></i></button>` : ''}
                <button class="gallery-btn remove" onclick="removeGalleryImage(${index})" title="Remove"><i data-lucide="x"></i></button>
            </div>
        `;
        grid.appendChild(item);
    });

    const addDiv = document.createElement('div');
    addDiv.className = 'add-more';
    addDiv.id = 'gallery-drop-zone';
    addDiv.onclick = () => document.getElementById('gallery-input').click();
    addDiv.innerHTML = `
        <i data-lucide="plus"></i>
        <span class="drop-text">Drop</span>
    `;
    grid.appendChild(addDiv);

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'file';
    hiddenInput.id = 'gallery-input';
    hiddenInput.hidden = true;
    hiddenInput.multiple = true;
    hiddenInput.accept = 'image/*';
    hiddenInput.onchange = function () { handleGalleryUpload(this) };
    grid.appendChild(hiddenInput);

    setupDragAndDrop();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function removeGalleryImage(index) {
    currentGalleryImages.splice(index, 1);
    renderGalleryPreviews();
}

function moveGalleryImage(index, direction) {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < currentGalleryImages.length) {
        const item = currentGalleryImages.splice(index, 1)[0];
        currentGalleryImages.splice(newIndex, 0, item);
        renderGalleryPreviews();
    }
}

// Drag and Drop Logic
function setupDragAndDrop() {
    const mainDropOption = document.getElementById('main-drop-zone');
    const galleryDropOption = document.getElementById('gallery-drop-zone');

    [mainDropOption, galleryDropOption].forEach(zone => {
        if (!zone) return;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            zone.addEventListener(eventName, () => zone.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            zone.addEventListener(eventName, () => zone.classList.remove('drag-over'), false);
        });
    });

    if (mainDropOption) mainDropOption.addEventListener('drop', handleMainDrop, false);
    if (galleryDropOption) galleryDropOption.addEventListener('drop', handleGalleryDrop, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleMainDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        handleImageUpload({ files: files }, 'main');
    }
}

function handleGalleryDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
        handleGalleryUpload({ files: files });
    }
}


function handleImageUpload(input, type) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            if (type === 'main') {
                tempMainImage = {
                    name: file.name,
                    preview: e.target.result,
                    lastModified: file.lastModified
                };
                showMainImagePreview(e.target.result);
            }
        }
        reader.readAsDataURL(file);
    }
}

function showMainImagePreview(src) {
    const container = document.getElementById('main-image-preview');
    if (container) container.innerHTML = `<img src="${src}" class="preview-image">`;
}

function resetMainImagePreview() {
    const container = document.getElementById('main-image-preview');
    if (container) {
        container.innerHTML = `
            <i data-lucide="image"></i>
            <span>Click to upload</span>
        `;
    }
    tempMainImage = null;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function handleGalleryUpload(input) {
    if (input.files) {
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imgObj = {
                    name: file.name,
                    preview: e.target.result,
                    lastModified: file.lastModified
                };
                currentGalleryImages.push(imgObj);
                renderGalleryPreviews();
            }
            reader.readAsDataURL(file);
        });
    }
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    currentEditId = id;
    document.getElementById('form-title').innerText = 'Edit Product';

    document.getElementById('edit-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-slug').value = product.id;
    document.getElementById('product-series').value = product.series || '';
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-short-desc').value = product.shortDescription;
    document.getElementById('product-desc').value = product.description;

    // Main Image
    if (product.mainImage) {
        tempMainImage = product.mainImage;
        showMainImagePreview(product.mainImage.preview);
    } else {
        resetMainImagePreview();
    }

    // Gallery
    currentGalleryImages = product.galleryImages ? [...product.galleryImages] : [];
    renderGalleryPreviews();

    // PDF
    const pdfStatus = document.getElementById('pdf-status');
    if (product.catalogPdf) {
        tempPdf = product.catalogPdf;
        if (pdfStatus) {
            pdfStatus.innerText = product.catalogPdf.name || 'Current PDF';
            pdfStatus.classList.add('text-success');
        }
    } else {
        tempPdf = null;
        if (pdfStatus) {
            pdfStatus.innerText = 'No file selected';
            pdfStatus.classList.remove('text-success');
        }
    }

    // Features
    const featuresList = document.getElementById('features-list');
    if (featuresList) {
        featuresList.innerHTML = '';
        if (product.features && product.features.length) {
            product.features.forEach(feat => addFeatureField(feat));
        } else {
            addFeatureField();
        }
    }

    // Specs
    const specsList = document.getElementById('specs-list');
    if (specsList) {
        specsList.innerHTML = '';
        if (product.specs) {
            Object.entries(product.specs).forEach(([key, val]) => addSpecField(key, val));
        } else {
            addSpecField();
        }
    }

    switchView('form');
}

function resetForm() {
    currentEditId = null;
    const formTitle = document.getElementById('form-title');
    if (formTitle) formTitle.innerText = 'Add New Product';

    document.getElementById('product-form').reset();
    document.getElementById('edit-id').value = '';
    resetMainImagePreview();

    currentGalleryImages = [];
    renderGalleryPreviews();

    const featuresList = document.getElementById('features-list');
    if (featuresList) {
        featuresList.innerHTML = '';
        addFeatureField();
    }

    const specsList = document.getElementById('specs-list');
    if (specsList) {
        specsList.innerHTML = '';
        addSpecField();
    }

    const pdfStatus = document.getElementById('pdf-status');
    if (pdfStatus) {
        pdfStatus.innerText = 'No file selected';
        pdfStatus.classList.remove('text-success');
    }
    tempPdf = null;

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function generateSlug() {
    const name = document.getElementById('product-name').value;
    const slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');

    if (!currentEditId) {
        document.getElementById('product-slug').value = slug;
    }
}

function addFeatureField(value = '') {
    const div = document.createElement('div');
    div.className = 'dynamic-row';
    div.innerHTML = `
        <input type="text" class="feature-input" placeholder="Feature description" value="${value}">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">
            <i data-lucide="trash-2"></i>
        </button>
    `;
    const list = document.getElementById('features-list');
    if (list) list.appendChild(div);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addSpecField(key = '', value = '') {
    const div = document.createElement('div');
    div.className = 'dynamic-row';
    div.innerHTML = `
        <input type="text" class="spec-label" placeholder="Label (e.g. Dimensions)" value="${key}">
        <input type="text" class="spec-value" placeholder="Value (e.g. 50x50 cm)" value="${value}">
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">
            <i data-lucide="trash-2"></i>
        </button>
    `;
    const list = document.getElementById('specs-list');
    if (list) list.appendChild(div);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// PDF Listener
const pdfInput = document.getElementById('pdf-input');
if (pdfInput) {
    pdfInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function (evt) {
                tempPdf = {
                    name: file.name,
                    data: evt.target.result,
                    lastModified: file.lastModified
                };
                const status = document.getElementById('pdf-status');
                if (status) {
                    status.innerText = file.name;
                    status.classList.add('text-success');
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// Import
function importProducts(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    let addedCount = 0;
                    imported.forEach(p => {
                        if (!products.some(ex => ex.id === p.id)) {
                            products.push(p);
                            addedCount++;
                        }
                    });
                    saveToStorage();
                    renderProductList();
                    showToast(`Imported ${addedCount} products.`, 'success');
                }
            } catch (err) {
                showToast("Invalid JSON file", 'error');
                console.error(err);
            }
        };
        reader.readAsText(file);
    }
    input.value = '';
}

function saveProduct() {
    const form = document.getElementById('product-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const id = document.getElementById('product-slug').value;
    const name = document.getElementById('product-name').value;
    const series = document.getElementById('product-series').value;
    const category = document.getElementById('product-category').value;
    const shortDesc = document.getElementById('product-short-desc').value;
    const desc = document.getElementById('product-desc').value;

    const features = [];
    document.querySelectorAll('.feature-input').forEach(input => {
        if (input.value.trim()) features.push(input.value.trim());
    });

    const specs = {};
    document.querySelectorAll('#specs-list .dynamic-row').forEach(row => {
        const label = row.querySelector('.spec-label').value.trim();
        const value = row.querySelector('.spec-value').value.trim();
        if (label && value) {
            specs[label] = value;
        }
    });

    let finalMainImage = null;
    let finalGalleryImages = [];
    let finalPdf = null;

    if (currentEditId) {
        const existing = products.find(p => p.id === currentEditId);
        if (existing) {
            finalMainImage = existing.mainImage;
            finalGalleryImages = existing.galleryImages || [];
            finalPdf = existing.catalogPdf;
        }
    }

    if (tempMainImage) finalMainImage = tempMainImage;
    if (tempGalleryImages.length > 0) finalGalleryImages = [...finalGalleryImages, ...tempGalleryImages];
    // Wait - tempGalleryImages usage. In editProduct we set currentGalleryImages.
    // In handleGalleryUpload we push to currentGalleryImages.
    // So currentGalleryImages IS the final state.
    // Let's correct this logc below.

    // Correction:
    finalGalleryImages = currentGalleryImages;

    if (tempPdf) finalPdf = tempPdf;

    const product = {
        id,
        name,
        series,
        category,
        shortDescription: shortDesc,
        description: desc,
        features,
        specs,
        dateCreated: new Date().toISOString(),
        mainImage: finalMainImage,
        galleryImages: finalGalleryImages,
        catalogPdf: finalPdf
    };

    if (currentEditId) {
        const index = products.findIndex(p => p.id === currentEditId);
        if (index !== -1) {
            products[index] = product;
        }
        showToast('Product updated!', 'success');
    } else {
        if (products.some(p => p.id === id)) {
            showToast('ID/Slug already exists.', 'error');
            return;
        }
        products.push(product);
        showToast('Product created!', 'success');
    }

    saveToStorage();
    switchView('list');
}

function dataURLtoBlob(dataurl) {
    if (!dataurl) return null;
    try {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    } catch (e) {
        console.error("Error converting data URL", e);
        return null;
    }
}

async function exportData() {
    if (products.length === 0) {
        showToast('No products to export.', 'error');
        return;
    }

    const zip = new JSZip();
    const rootFolder = zip.folder("products");
    const rootAssets = rootFolder.folder("assets");

    const cleanProducts = products.map(p => {
        const cleanProduct = {
            id: p.id,
            name: p.name,
            series: p.series,
            category: p.category,
            shortDescription: p.shortDescription || '',
            description: p.description || '',
            features: p.features || [],
            specs: p.specs || {},
            dateCreated: p.dateCreated
        };

        const productAssetFolder = rootAssets.folder(p.id).folder("images");

        if (p.mainImage && p.mainImage.preview) {
            const ext = p.mainImage.name ? p.mainImage.name.split('.').pop() : 'png';
            const safeName = p.mainImage.name || `main.${ext}`;
            cleanProduct.mainImage = `assets/${p.id}/images/${safeName}`;

            const blob = dataURLtoBlob(p.mainImage.preview);
            if (blob) {
                productAssetFolder.file(safeName, blob);
            }
        }

        if (p.galleryImages && p.galleryImages.length > 0) {
            cleanProduct.galleryImages = [];
            p.galleryImages.forEach((img, idx) => {
                if (img.preview) {
                    const ext = img.name ? img.name.split('.').pop() : 'png';
                    const safeName = img.name || `gallery-${idx}.${ext}`;
                    cleanProduct.galleryImages.push(`assets/${p.id}/images/${safeName}`);

                    const blob = dataURLtoBlob(img.preview);
                    if (blob) {
                        productAssetFolder.file(safeName, blob);
                    }
                }
            });
        }

        if (p.catalogPdf && p.catalogPdf.data) {
            const ext = p.catalogPdf.name ? p.catalogPdf.name.split('.').pop() : 'pdf';
            const safeName = p.catalogPdf.name || `catalog.${ext}`;

            cleanProduct.catalogPdf = `assets/${p.id}/${safeName}`;

            const blob = dataURLtoBlob(p.catalogPdf.data);
            if (blob) {
                rootAssets.folder(p.id).file(safeName, blob);
            }
        }

        return cleanProduct;
    });

    rootFolder.file("products.json", JSON.stringify(cleanProducts, null, 2));

    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            saveAs(content, "nuexis_products_export.zip");
        });
}

// --- AI Generation ---
const GEMINI_API_KEY = 'AIzaSyBJyOPW0yBaGEh-Zoetzv9Bcp6z2aw3ikw';

function openAIModal() {
    document.getElementById('ai-modal').classList.add('active');
    setTimeout(() => {
        const input = document.getElementById('ai-product-name');
        if (input) input.focus();
    }, 100);
}

function closeAIModal() {
    document.getElementById('ai-modal').classList.remove('active');
}

async function generateProductWithAI() {
    const nameInput = document.getElementById('ai-product-name');
    const infoInput = document.getElementById('ai-product-info');
    const btn = document.getElementById('btn-ai-generate');

    const name = nameInput.value.trim();
    const info = infoInput.value.trim();

    if (!name) {
        showToast('Please enter a product name', 'error');
        nameInput.focus();
        return;
    }

    const originalBtnText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Generating...`;
    btn.disabled = true;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        const prompt = `
        You are an assistant for a CMS. Generate a JSON object for a product.
        Product Name: "${name}"
        Additional Info: "${info}"
        
        The JSON must strictly follow this structure:
        {
            "series": "string (Choose best fit from: Digital Signage Series, Touch Display, Digital Podium, Digital Conference Series, Pro Audio System, Active LED, Switching and Controls, Accessories, Conferencing System)",
            "category": "string (Short category name)",
            "shortDescription": "string (1-2 sentences)",
            "description": "string (Detailed description, professional tone)",
            "features": ["string", "string", "string", "string"],
            "specs": { "Key": "Value", "Key": "Value" }
        }
        Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.
        `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        let text = data.candidates[0].content.parts[0].text;
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const productData = JSON.parse(text);

        closeAIModal();
        switchView('form');
        resetForm();

        document.getElementById('product-name').value = name;
        generateSlug();

        if (productData.series) {
            const seriesSelect = document.getElementById('product-series');
            if (seriesSelect) seriesSelect.value = productData.series;
        }
        if (productData.category) document.getElementById('product-category').value = productData.category;
        if (productData.shortDescription) document.getElementById('product-short-desc').value = productData.shortDescription;
        if (productData.description) document.getElementById('product-desc').value = productData.description;

        const featuresList = document.getElementById('features-list');
        if (featuresList) {
            featuresList.innerHTML = '';
            if (productData.features && Array.isArray(productData.features)) {
                productData.features.forEach(f => addFeatureField(f));
            }
        }

        const specsList = document.getElementById('specs-list');
        if (specsList) {
            specsList.innerHTML = '';
            if (productData.specs) {
                Object.entries(productData.specs).forEach(([k, v]) => addSpecField(k, v));
            }
        }

        showToast('Product generated magicially! ✨', 'success');

    } catch (error) {
        console.error('AI Error:', error);
        showToast('Failed to generate product. ' + error.message, 'error');
    } finally {
        btn.innerHTML = originalBtnText;
        btn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}
