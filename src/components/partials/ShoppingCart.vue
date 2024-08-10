<script>
import axios from 'axios';
import { state } from '../../state';

export default {
	name: "ShoppingCart",
	data() {
		return {
			state,
		};
	},
	computed: {
		cart() {
			return state.items;
		},
		localStorageCartRestaurantName() {
			return localStorage.getItem("cartRestaurantName");
		}
	},
	methods: {
		clearCart() {
			state.items = [];
		},
		removeFromCart(itemId) {
			state.items = state.items.filter(item => item.id !== itemId);
			this.saveToLocalStorage();
		},
		increaseQuantity(item) {
			item.quantity++;
			this.saveToLocalStorage();
			state.loadName();
		},
		decreaseQuantity(item) {
			if (item.quantity > 1) {
				item.quantity--;
				this.saveToLocalStorage();
			} else {
				this.removeFromCart(item.id);
			}
		},
		saveToLocalStorage() {
			localStorage.setItem("items", JSON.stringify(state.items));
			console.log("carrello attuale: ", state.items);
		},
		toggleModal() {
			state.toggle_cart = !state.toggle_cart;
			console.log("stato modale: ", state.toggle_cart);
		}
	},
	mounted() {

	}
};
</script>

<template>

	<div id="my_offcanvas">
		<div class="row p-4">
			<div class="col-12 d-flex justify-content-between">
				<h4>Il tuo ordine</h4>
				<i class="fa-solid fa-x text-secondary fs-4" @click="toggleModal()"></i>
			</div>
		</div>

		<div class="container h-100 py-4" v-if="cart.length > 0">
			<div class="row h-100">

				<div class="col-12">
					<strong v-if="localStorageCartRestaurantName">
						Stai ordinando da: {{ localStorageCartRestaurantName }}
					</strong>

					<table class="table">
						<tbody>
							<tr v-for="item in cart" :key="item.id">
								<td>{{ item.name }}</td>
								<td class="text-nowrap">€ {{ item.price }}</td>
								<td class="d-flex gap-2 align-items-center">
									<div class="btn rounded border" @click="decreaseQuantity(item)">
										<i class="fa-solid fa-minus"></i>
									</div>
									{{ item.quantity }}
									<div class="btn rounded border" @click="increaseQuantity(item)">
										<i class="fa-solid fa-plus"></i>
									</div>
								</td>
								<td>
									<button class="btn btn-sm" @click="removeFromCart(item.id)">
										<i class="fa-solid fa-trash-can"></i>
									</button>
								</td>
							</tr>
						</tbody>
					</table>

					<p class="text-end px-4">
						Totale
						<strong>€ {{ state.calculateTotal() }}</strong>
					</p>
				</div>

				<!-- azioni -->
				<div class="col-12 py-4 align-items-center d-flex gap-2 justify-content-center" v-if="cart.length > 0">
					<router-link :to="{ name: 'checkout' }">
						<button class="btn rounded-pill btn_secondary" @click="toggleModal()">
							Procedi al pagamento
						</button>
					</router-link>
					<button class="btn rounded-pill btn_tertiary" @click="clearCart">
						Svuota carrello
					</button>
				</div>
			</div>
		</div>

		<!-- carrello vuoto -->
		<div v-else class="container">
			<div class="row justify-content-center">
				<img src="../../assets/img/empty_cart2.png" alt="immagine carrello vuoto" class="pe-1 mb-2"
					style="width: 300px; height: 300px;">
				<p class="text-center fw-medium">Sembra che il tuo carrello sia vuoto...</p>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
@import '../../assets/scss/variables.scss';

#my_offcanvas {
	position: fixed;
	top: 0;
	right: 0;
	background-color: white;
	box-shadow: -4px 0 5px rgba(0, 0, 0, 0.4);
	transition: right 0.3s ease;
	z-index: 1050;
	height: 100vh;
	width: 100%;

	@media(min-width: 426px) {
		min-width: 425px;
		width: 35%;
	}


	i {
		color: black;
		font-size: 1rem;
	}

	td {
		vertical-align: middle;
		height: 65px;
	}
}
</style>
