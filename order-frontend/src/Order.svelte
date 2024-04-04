<!-- ProductList.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import io from "socket.io-client";

    const backendUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

    let drinks = [];
    let socket;
    let pendingPriceUpdate = false;

    onMount(async () => {
        socket = io(backendUrl);

        socket.on("connect", () => {
            console.log("Connected to socket.io server");
        });
        /*
        socket.on("update_values", (data) => {
            console.log("Update received:", data);

        });*/

        socket.on("start_time", (data) => {
            stopTimer();
            startTimer(data.message);
            console.log(data);
            if (!!cart.length) {
                pendingPriceUpdate = true;
            } else {
                updateDrinks();
            }
        });

        await fetchDrinks();
    });

    $: if (!cart.length && pendingPriceUpdate) {
        updateDrinks();
    }

    // Function to update drinks data
    function updateDrinks() {
        fetchDrinks(); // Re-fetch the drinks data
    }

    onDestroy(() => {
        console.log("onDestroy called");
        socket.close();
    });

    // Function to fetch drinks from the server
    async function fetchDrinks() {
        try {
            const response = await fetch(backendUrl + "/api/drinks");
            if (response.ok) {
                let fetchedDrinks = await response.json();
                drinks = fetchedDrinks.map((drink) => ({
                    ...drink,
                    addedToCart: false,
                }));
            } else {
                throw new Error(`HTTP error: ${response.status}`);
            }
        } catch (error) {
            console.error("Fetching drinks failed:", error);
        }
    }

    // Define the cart object to hold products and their quantities
    let cart = {};

    function cancelOrder() {
        // Clear the cart and reset addedToCart state for drinks
        cart = {};
        drinks = drinks.map((d) => ({ ...d, addedToCart: false }));
    }

    function addToCart(drink) {
        console.log(`Added ${drink.name} to cart`);

        if (cart[drink.name]) {
            cart[drink.name].quantity++;
        } else {
            cart[drink.name] = { ...drink, quantity: 1 };
        }

        // Update drinks array to reflect addedToCart state
        drinks = drinks.map((d) =>
            d.name === drink.name ? { ...d, addedToCart: true } : d
        );
    }

    function updateQuantity(drink, change) {
        if (cart[drink.name]) {
            cart[drink.name].quantity += change;
            if (cart[drink.name].quantity <= 0) {
                delete cart[drink.name];
                drinks = drinks.map((d) =>
                    d.name === drink.name ? { ...d, addedToCart: false } : d
                );
            }
        }
    }

    let time = 120;
    let intervalId;

    function startTimer(startVal) {
        time = startVal;
        intervalId = setInterval(() => {
            time -= 1; // Increment time every second
        }, 1000);
    }

    function stopTimer() {
        clearInterval(intervalId);
    }

    // Format time for display
    function formatTime(seconds) {
        //const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [mins, secs]
            .map((val) => (val < 10 ? `0${val}` : val))
            .join(":");
    }

    let showCart = false;

    $: totalPrice = Object.values(cart).reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    let orderSubmitted = false;
    $: orderSubmitBtn = !orderSubmitted;

    async function submitOrder() {
        const order = {
            drinks: Object.values(cart).map(({ id, quantity }) => ({
                id,
                quantity,
            })),
        };

        try {
            const response = await fetch(backendUrl + "/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(order),
            });

            if (response.ok) {
                // Handle successful order submission
                console.log("Order submitted successfully");
                orderSubmitted = true;
            } else {
                // Handle errors
                console.error("Failed to submit order");
                orderSubmitted = false; // Re-enable the button if submission fails
            }
        } catch (error) {
            console.error("Error submitting order:", error);
        }
    }

    function enableCartView(enable) {
        return () => {
            if (orderSubmitted && !enable) {
                // Only clear the cart if the order was not submitted or if closing the cart
                cart = {};
                drinks = drinks.map((d) => ({ ...d, addedToCart: false }));
                orderSubmitted = false;
            }
            showCart = enable;
        };
    }
</script>

<!-- Cart View -->
{#if showCart}
    <div class="cart-view">
        <button class="close-btn" on:click={enableCartView(false)}>X</button>
        <h2>Drink Cart</h2>
        <ul>
            {#if Object.keys(cart).length > 0}
                {#each Object.values(cart) as item}
                    <li>
                        {item.name}
                        {item.price.toFixed(2)}€ x {item.quantity} | {(
                            item.quantity * item.price
                        ).toFixed(2)}€
                    </li>
                {/each}
                <h2>Total Price: {totalPrice.toFixed(2)}€</h2>
                {#if orderSubmitBtn}
                    <button on:click={submitOrder}>Submit Order</button>
                {/if}
            {:else}
                <div>
                    <h2>Cart is empty</h2>
                </div>
            {/if}
        </ul>
    </div>
{/if}

<div class="header-container">
    <h2>Product List</h2>

    <div class="timer">{formatTime(time)}</div>
</div>

<div class="header-container">
    {#if !!cart.length}
        <button on:click={cancelOrder}> Cancel </button>
    {/if}
</div>

<ul>
    {#each drinks as drink}
        <li key={drink.name}>
            <div>{drink.name}</div>
            <div>{drink.price.toFixed(2)}€</div>
            {#if !drink.addedToCart}
                <button on:click={addToCart(drink)}> + </button>
            {:else}
                <div class="quantity-selector">
                    <button on:click={() => updateQuantity(drink, -1)}>←</button
                    >
                    <span>{cart[drink.name]?.quantity}</span>
                    <button on:click={() => updateQuantity(drink, 1)}>→</button>
                </div>
            {/if}
        </li>
    {/each}
</ul>
<button class="full-width-button" on:click={enableCartView(true)}> Go to Cart 🛒 </button>

<style>
    /* Add your CSS styles here {cart[product.id].quantity} */
    ul {
        list-style: none;
        padding: 0 0 150px;
    }

    .timer {
        font-family: "Digital-7", "Courier New", monospace;
        font-size: 1em;
        color: #4caf50;
        background-color: #333;
        text-align: center;
        padding: 10px;
        border: 2px solid #4caf50;
        display: inline-block;
        margin-top: 0px;
        margin-bottom: 0cm;
    }

    .header-container {
        display: flex;
        align-items: center; /* Align items vertically in the center */
        justify-content: space-between; /* Space out the children */
    }

    li {
        border-top: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    button {
        background-color: #007bff;
        color: #fff;
        border: none;
        padding: 5px 10px;
        cursor: pointer;
        touch-action: manipulation;
    }

    .quantity-selector {
        display: flex;
        align-items: center;
    }

    .cart-view {
        position: fixed;
        right: 0;
        top: 0;
        width: 300px;
        height: 100%;
        background: rgb(32, 32, 32);
        border-left: 1px solid #ccc;
        padding: 20px;
        box-shadow: -2px 0px 5px rgba(0, 0, 0, 0.2);
        z-index: 100;
    }

    .close-btn {
        position: absolute;
        top: 10px;
        left: 10px;
        border: none;
        background: transparent;
        font-size: 20px;
        cursor: pointer;
    }

    .full-width-button {
        width: 100%;
        position: fixed;
        bottom: 0;
        left: 0;
        background-color: #007bff;
        color: white;
        padding: 15px;
        border: none;
        outline: none;
        cursor: pointer;
        font-size: 16px;
    }
</style>
