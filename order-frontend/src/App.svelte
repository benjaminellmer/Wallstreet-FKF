<script>
	import { Router, Link, Route } from "svelte-routing";
  import { onMount } from 'svelte';
	
  import drink from './Drink.svelte'; // Import your Drink component
  import Home from './Home.svelte'; // Import a Home component if you have one
  import Order from './Order.svelte';

  export let url = "";
</script>

<Router {url}>
  <nav>
    <Link to="/">Home</Link>
    <Link to="/drinks">Drinks</Link>
	<Link to="/order">Order</Link>
  </nav>
  <div>
    <Route path="/drinks" component={drink} />
    <Route path="/"><Home /></Route>
	<Route path="/order" component={Order}/>
  </div>
</Router>
