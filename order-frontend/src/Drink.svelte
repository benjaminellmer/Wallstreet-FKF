<script>
    import { onDestroy, onMount } from "svelte";
    import io from "socket.io-client";

    const backendUrl = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;

    let drinks = [];
    let socket;
    let groupedDrinks = {};

    const groupDrinksByGroup = () => {
        groupedDrinks = drinks.reduce((groups, drink) => {
            const group = drink.groupName;
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(drink);
            return groups;
        }, {});
    };

    onMount(() => {
        socket = io(backendUrl);

        socket.on("connect", () => {
            console.log("Connected to socket.io server");
        });

        socket.on("update_values", (data) => {
            console.log("Update received:", data);
            updateDrinks();
        });

        socket.on("start_time", (data) => {
            stopTimer();
            startTimer(data.message);
            console.log(data);
        });

        fetchDrinks(); // Fetch initial drinks data
    });

    onDestroy(() => {
        console.log("onDestroy called");
        socket.close();
    });

    const getTrendSymbol = (price, newPrice) => {
        if (newPrice > price) return "▲";
        if (newPrice < price) return "▼";
        return "-"; // Assuming ⬄ represents a stable trend
    };

    // Function to fetch drinks from the server
    async function fetchDrinks() {
        try {
            const response = await fetch(backendUrl + "/api/drinks");
            if (response.ok) {
                drinks = await response.json();
                groupDrinksByGroup();
            } else {
                throw new Error(`HTTP error: ${response.status}`);
            }
        } catch (error) {
            console.error("Fetching drinks failed:", error);
        }
    }
    // Function to update drinks data
    function updateDrinks() {
        fetchDrinks(); // Re-fetch the drinks data
    }

    let time = 120;
    let intervalId;

    function startTimer(startVal) {
        time = startVal;
        intervalId = setInterval(() => {
            if (time > 0) {
                time -= 1; // Increment time every second
            }
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
</script>

<div class="header-container">
    <h1>Börsen FKF!</h1>
    <div class="timer">{formatTime(time)}</div>
</div>
<div class="group-container">
    {#each Object.keys(groupedDrinks) as group}
        <div class="group-section">
            <h2>{group}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Trend</th>
                    </tr>
                </thead>
                <tbody>
                    {#each groupedDrinks[group] as drink}
                        <tr>
                            <td>{drink.name}</td>
                            <td
                                class:trend-up={drink.newPrice > drink.price}
                                class:trend-down={drink.newPrice < drink.price}
                                class:trend-stable={drink.newPrice === drink.price}
                            >
                                {drink.price.toFixed(2)}€
                            </td>
                            <td
                                class:trend-up={drink.newPrice > drink.price}
                                class:trend-down={drink.newPrice < drink.price}
                                class:trend-stable={drink.newPrice === drink.price}
                            >
                                {getTrendSymbol(drink.price, drink.newPrice)}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/each}
</div>

<style>

.group-container {
    display: flex;
    flex-wrap: wrap;
    padding: 20px;
}

.group-section {
    flex: 1 1 50%; /* Füllt 50% der Breite, aber kann bei Bedarf auf 100% wachsen oder schrumpfen */
    box-sizing: border-box;
    padding: 1rem; /* Fügt etwas Platz zwischen den Spalten hinzu */
}

/* Optional: Fügt einen Trennstrich zwischen den Spalten hinzu */
.group-section:nth-child(odd) {
    border-right: 1px solid #333;
}
    :global(body) {
        margin: 0;
        padding: 0;
        background-color: #121212; /* Dark background for the entire page */
        color: #e0e0e0; /* Light text color for contrast */
        font-family: "Courier New", Courier, monospace;
    }
    .header-container {
        display: flex;
        align-items: center; /* Align items vertically in the center */
        justify-content: space-between; /* Space out the children */
        margin-right: 1cm;
        margin-left: 1cm;
        margin-bottom: 0cm;
    }

    .timer {
        font-family: "Digital-7", "Courier New", monospace;
        font-size: 2em;
        color: #4caf50;
        background-color: #333;
        text-align: center;
        padding: 10px;
        border: 2px solid #4caf50;
        display: inline-block;
        margin-top: 0px;
        margin-bottom: 0cm;
    }

    h1 {
        color: #ff3e00;
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
        margin-top: 0.2cm;
        margin-bottom: 0cm;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 2rem;
        font-family: "Courier New", Courier, monospace;
        background-color: #000;
        color: #fff;
    }
    th,
    td {
        border: 1px solid #fff;
        padding: 0.5rem;
        text-align: center;
    }
    th {
        background-color: #333;
    }
    tr:nth-child(even) {
        background-color: #111;
    }
    .trend-up {
        color: red;
    }
    .trend-down {
        color: lime;
    }
    .trend-stable {
        color: #fff;
    }
</style>
