from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# data URL (json)
DUMMYJSON_URL = "https://dummyjson.com/products"


# read and fetch from dummyjson
def fetch_products():
    try:
        # Get json
        response = requests.get(DUMMYJSON_URL)
        # Check if the request was successful
        response.raise_for_status()
        # Parse the JSON response
        data = response.json()
        return data["products"]
    except requests.RequestException as e:
        print(f"Error fetching products: {e}")
        return []  # return nothing


@app.route("/")  # main route
def index():
    # open index.html
    return render_template("index.html")


@app.route("/products")
def products():
    # Get pagination and search query parameters from the request
    page = request.args.get("page", 1, type=int)
    limit = request.args.get("limit", 10, type=int)
    search = request.args.get("search", "", type=str).lower()

    # get products
    products = fetch_products()

    # Filter products based on the search query
    if search:
        filtered_products = []
        for product in products:
            if search in product["title"].lower():
                filtered_products.append(product)
        products = filtered_products

    # Implement pagination
    total_products = len(products)
    start = (page - 1) * limit
    end = start + limit
    paginated_products = products[start:end]

    # Return the paginated products as JSON
    return jsonify(
        {
            "products": paginated_products,
            "total": total_products,
            "page": page,
            "limit": limit,
        }
    )


@app.route("/product/<int:id>")
def product(id):
    # Fetch a specific product by ID
    response = requests.get(f"{DUMMYJSON_URL}/{id}")
    if response.status_code == 200:
        product = response.json()
        return jsonify(product)
    else:
        return jsonify({"error": "Product not found"}), 404


if __name__ == "__main__":
    # Run the Flask app in debug mode
    app.run(debug=True)
