const maxDisplayItems = 10; // Number of products per page

// using async await to fetch data
async function fetchProducts(page = 1, search = '') // page 1, search is empty (init)
{
    try {
        const response = await fetch(`/products?page=${page}&limit=${maxDisplayItems}&search=${search}`); // url be like: website.com/products?page=1&limit=10&search=apple
        const result = await response.json(); // convert the response to json
        const productsTable = document.getElementById('products-table');
        const returnNothing = document.getElementById('return-none');


        displayProducts(result.products);
        updateUI(page, result.total);
        document.querySelector('.loading').classList.remove('active');  // remove loading 

        if (result.products.length === 0) {
            // no results
            productsTable.classList.add('hidden');
            returnNothing.classList.remove('hidden');
        } else {
            // there are results
            productsTable.classList.remove('hidden');
            returnNothing.classList.add('hidden');
        }
    }
    // if it does not load, throw this
    catch (error) {
        console.error('Error fetching products:', error);
        document.querySelector('.loading').classList.remove('active');
    }
}

fetchProducts(); // call to retrieve products for display

function displayProducts(products) {
    const productsTableBody = document.getElementById('products');

    productsTableBody.innerHTML = ''; // table init

    products.forEach((product) => {
        const productRow = document.createElement('tr'); // create a new row

        productRow.innerHTML = `
            <td><img src="${product.images[0]}"></td>
            <td>${product.title}</td>
            <td>&#8369;${product.price}</td>
        `;
        productsTableBody.appendChild(productRow); //add that product row

        // when clicked, show the product (modal)
        productRow.addEventListener('click', () => showProduct(product.id));
    });

}

function updateUI(currentPage, totalProducts) {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');

    // disabling the page buttons for first/last page using ternary
    prevButton.disabled = currentPage === 1 ? true : false;
    nextButton.disabled = currentPage === Math.ceil(totalProducts / maxDisplayItems) ? true : false;
}

//  modal functions
async function showProduct(productId) {
    // get the product (getElementbyId)
    try {
        const response = await fetch(`/product/${productId}`); // url be like: website.com/product/121314521
        const result = await response.json();

        document.getElementById('product-title').innerText = result.title;
        document.getElementById('product-description').innerText = result.description;
        document.getElementById('product-price').innerHTML = `&#8369;${result.price}`;

        // Images in modal (I just duplicated the image 4x, custom layout, tiled)
        const mainImage = document.getElementById('main-image');
        const tiledImages = document.getElementById('tiled-images');

        mainImage.src = result.images[0];
        tiledImages.innerHTML = '';

        for (let i = 0; i < 4; i++) {
            const image = result.images[0];
            const imgElement = document.createElement('img');
            imgElement.src = image;

            imgElement.addEventListener('click', () => {
                mainImage.src = image;
            }); // when clicked, change the main image (but the images are just dupes...)

            tiledImages.appendChild(imgElement); // add the image to tiles
        }

        const modal = document.getElementById('product-modal');
        modal.style.display = 'block';

        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('product-modal').style.display = 'none';
        });

    }
    // if not loading for some reason
    catch (error) {
        console.error('Error fetching product:', error);
    }
}

// search
document.getElementById('search-input').addEventListener('input', (event) => {
    const query = document.getElementById('search-input').value.toLowerCase(); //lowercase for case-insensitive search
    fetchProducts(1, query);
});

document.getElementById('clear-button').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    fetchProducts(1);
});


// pagination
let currentPage = 1;
document.getElementById('prev-button').addEventListener('click', () => {
    if (currentPage > 1) {
        fetchProducts(currentPage - 1, document.getElementById('search-input').value.toLowerCase());
        currentPage--;
    }
});

document.getElementById('next-button').addEventListener('click', () => {
    fetchProducts(currentPage + 1, document.getElementById('search-input').value.toLowerCase());
    currentPage++;
});
