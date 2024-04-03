<script>
    export let name = "john doe";
    let userInput = ""; // Variable to hold the user's input

    function greetUser() {
        name = userInput; // Update name with the user's input
    }

</script>


<main>
	<h1>Hello {name}!</h1>
    <input type="text" bind:value={userInput} placeholder="Enter your name"/>
    <button on:click={greetUser}>Greet Me</button>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
    input, button {
        margin-top: 1em;
        padding: 0.5em;
    }

    input {
        width: 70%;
        margin-right: 5px;
    }

    button {
        width: 20%;
    }
</style>