<script>
import { state } from '../../state';
import axios from 'axios';

export default {
	name: "SingleRestaurant",
	data() {
		return {
			state,
			dishes: [],
			restaurant: '',
			single_restaurant_api: 'api/restaurant',
			showModal: false
		}
	},
	mounted() {
		this.getSingleRestaurant(this.$route.params.id);
		/* console.log(this.$route.params.id) */
	},
	methods: {
		clearAndClose() {
			state.items = [];
			this.showModal = false;
		},
		getSingleRestaurant(id) {
			axios
				.get(state.base_api + this.single_restaurant_api + `/${id}`)
				.then(response => {
					/* console.log(state.base_api + this.single_restaurant_api + `/${id}`); */
					if (response.data.success) {
						/* console.log(response.data); */
						this.restaurant = response.data.restaurant;
						this.dishes = this.restaurant.dishes;
						console.log("ristorante selezionato:", this.restaurant);
						// console.log("dishes caricati:", this.dishes);
					} else {
						this.$router.push({ name: 'not-found' })
					}
				})
				.catch(err => {
					console.log(err);
				})
		},
		addItem(dish) {
			const restaurantId = this.restaurant.id;

			/* controlla restaurant_id dei dishes nel carrello */
			if (state.items.length > 0) {
				// Ottieni il restaurant_id del primo piatto nel carrello
				const existingRestaurantId = state.items[0].restaurant_id;
				if (existingRestaurantId !== restaurantId) {
					//apri modale con messaggio che non puoi effettuare tale operazione
					console.log("Non puoi aggiungere piatti da un ristorante diverso.");
					this.showModal = true;
					return;
				}
			}
			const index = state.items.findIndex(item => item.id === dish.id);
			/* vedi se il piatto è gia presente, quindi crea o aumenta quantity */
			if (index !== -1) {
				state.items[index].quantity++;
			} else {
				state.items.push({ ...dish, quantity: 1 });
			}
			this.saveToLocalStorage();

			/* nome ristorante */
			state.cartRestraurantName = this.restaurant.name_restaurant;
			localStorage.setItem("cartRestaurantName", this.restaurant.name_restaurant);
			console.log(state.cartRestraurantName, this.restaurant.name_restaurant);
		},
		removeItem(dish) {
			const index = state.items.findIndex(item => item.id === dish.id);
			if (index !== -1 && state.items[index].quantity > 1) {
				state.items[index].quantity--;
				console.log("hai rimosso il piatto ", dish);
				this.saveToLocalStorage();
			} else {
				state.items = state.items.filter(item => item.id !== state.items[index].id);
				this.saveToLocalStorage();
				console.log("it's working");
			}
		},
		/* salva gli items in local storage */
		saveToLocalStorage() {
			localStorage.setItem("items", JSON.stringify(state.items));
			console.log("carrello attuale: ", state.items);
		},
		getItemQuantity(itemId) {
			const item = state.items.find(item => item.id === itemId);
			return item ? item.quantity : 0;
		}
	}
};
</script>

<template>
	<div class="container-fluid">

		<!-- modale errore -->
		<div class="container" v-if="showModal">
			<div class="row justify-content-center py-3 shadow-lg border rounded bg-light" id="modalCartError">
				<div class="col-12 modal_header pb-3">
					<h3 class="text-center">Puoi ordinare da un solo ristorante!</h3>
				</div>
				<div class="col-12 modal_body">
					<!-- img -->
				</div>
				<div class="col-12 modal_footer d-flex gap-2 justify-content-end pt-3">
					<button type="button" class="btn btn_secondary_light rounded-pill " @click="this.showModal = false">
						Continua
					</button>
					<button type="button" class="btn btn_tertiary_light rounded-pill" @click="clearAndClose()">Svuota il
						Carrello</button>
				</div>
			</div>
		</div>

		<!-- vista principale -->
		<div class="row p-3 shadow-lg" id="my_single_restaurant">
			<div class="col-12 py-1">
				<router-link :to="{ name: 'home' }" class="no_style text-secondary px-1">
					<i class="fa-solid fa-arrow-left"></i>
					Torna Indietro
				</router-link>
			</div>

			<!-- restaurant dashboard -->
			<div class="col-12 col-md-4 py-3">
				<img v-if="restaurant.thumb" :src="state.base_api + 'storage/' + restaurant.thumb"
					:alt="restaurant.name_restaurant" class="card-img" style="width: 100%; height: auto;">
				<img v-else src="https://placehold.co/300x200" :alt="restaurant.name_restaurant">

			</div>
			<div class="col-12 col-md-8 py-3">
				<h2>{{ restaurant.name_restaurant }}</h2>
				<ul class="list-inline mb-5">
					<li v-for="type in restaurant.types" class="list-inline-item">{{ type.name }};</li>
				</ul>

				<!-- informazioni -->
				<div class="d-flex align-items-center gap-2 text-secondary mb-2">
					<i class="fa-solid fa-circle-info"></i>
					<span class="fs-5">Informazioni</span>
				</div>
				<div id="restaurant_info">
					<p><i class="fa-solid fa-phone"></i> {{ restaurant.phone_number }}</p>
					<p><i class="fa-solid fa-location-dot"></i> {{ restaurant.address }}</p>
					<p><i class="fa-solid fa-envelope"></i> {{ restaurant.contact_email }}</p>
				</div>

			</div>
		</div>

		<!-- dishes list -->
		<div class="row p-3 bg-light">
			<div class="col-12 px-5 py-2">
				<h4>MENU</h4>
			</div>
			<div class="col-12 col-md-6 g-4" v-for="dish in restaurant.dishes">
				<div class="card py-1 px-3 h-100">
					<div class="row h-100 align-items-center">
						<div class="col-6 col-md-8 col-xxl-9 px-3 py-1 align-items-around" id="dish_info">
							<h5>{{ dish.name }}</h5>
							<p class="text-secondary lh-sm dish_clamp"> {{ dish.description }}</p>
						</div>
						<div class="col-6 col-md-4 col-xxl-3 align-self-center p-1">
							<img v-if="dish.image" :src="state.base_api + 'storage/' + dish.image" :alt="restaurant.name_restaurant"
								class="card-img">
							<img v-else src="https://placehold.co/100x100" :alt="restaurant.name_restaurant" class="card-img">
						</div>
						<!-- stato del carrello -->
						<div class="col-12 d-flex gap-2 mb-1" id="dish_btn">
							<button class="btn rounded border" @click="removeItem(dish)">
								<i class="fa-solid fa-minus" :class="{ disable_btn: state.items.length === 0 }"></i>
							</button>
							<div class="border rounded text-center p-1 px-3" style="vertical-align: middle;">
								{{ getItemQuantity(dish.id) }}
							</div>
							<button class="btn rounded border" @click="addItem(dish)">
								<i class="fa-solid fa-plus"></i>
							</button>
							<div class="align-self-center">
								<span class="fw-medium" style="white-space: nowrap;">€ {{ dish.price }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
@import '../../assets/scss/variables.scss';

.no_style {
	text-decoration: none;
	color: inherit;
}

img {
	width: 80%;
	aspect-ratio: 1;
	object-fit: cover
}

/* #my_single_restaurant {
	@media(min-width:758px) {
		background-image: url('../../assets/img/restaurant2.jpg');
		background-position: bottom 0 right 10%;
		background-size: 30% auto;
		background-repeat: no-repeat;
	}
} */

#modalCartError {
	position: fixed;
	z-index: 10;
	top: 50vh;
	left: 50vw;
	transform: translate(-50%, -50%);
	width: 70vw;
	max-width: 700px;

	.modal_header {
		vertical-align: middle;

		h3 {
			font-family: $header;
			font-weight: 900;
			color: $tertiary;
		}
	}

	.modal_body {
		height: 300px;

		width: 100vw;
		background-image: url('../../assets/img/order_food3.jpg');
		background-size: 100% 100%;
		background-repeat: no-repeat;
	}

	.modal_footer {}

}

@media(max-width: 426px) {
	#modalCartError {
		.modal_body {
			display: none;
		}
	}
}

/* @media(max-width:425px) {
	#modalCartError {
		width: 400px;
	}

} */

#restaurant_info {
	p {
		margin-bottom: 0.5rem;
	}
}

.disable_btn {
	color: lightgray;
}

.dish_clamp {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 4;
	overflow: hidden;
	text-overflow: ellipsis;

	@media(max-width: 425px) {
		-webkit-line-clamp: 7;
	}
}

#dish_btn {
	@media(max-width: 425px) {
		flex-wrap: wrap;
	}
}

#dish_info {
	@media(max-width: 425px) {
		padding: 0 0.25rem 0 0.25rem !important;
	}
}
</style>
