<script>
import router from "../../router";
import { state } from "../../state";

export default {
	name: "CheckoutSuccess",
	data() {
		return {
			state
		}
	},
	methods: {
		calculateTotal() {
			let total = 0;
			for (let item of state.order_resume) {
				const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
				total += item.quantity * price;
			}
			return total.toFixed(2);
		}
	},
	mounted() {
		console.log(state.order_resume);
	}
}
</script>

<template>
	<div class="container py-5">
		<div class="row justify-content-center flex-column">
			<br>
			<h2 class="text-center">Grazie per il tuo ordine!</h2>
			<br>

			<div class="table-responsive">
				<table class="table">
					<thead>
						<tr class="text-center">
							<th scope="col">Prodotto</th>
							<th scope="col">Prezzo unità</th>
							<th scope="col">Quantità</th>
						</tr>
					</thead>
					<tbody>
						<tr class="text-center" v-for="order_item in state.order_resume">
							<td scope="row">{{ order_item.name }}</td>
							<td>€ {{ order_item.price }}</td>
							<td>{{ order_item.quantity }}</td>
						</tr>
						<tr class="text-center">
							<td>
								<strong>Totale:</strong>
							</td>
							<td></td>
							<td>
								€ {{ calculateTotal() }}
							</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div>

			</div>

			<router-link :to="{ name: 'home' }">
				<button class="btn btn-primary">Torna alla Pagina Iniziale</button>
			</router-link>
		</div>
	</div>
</template>