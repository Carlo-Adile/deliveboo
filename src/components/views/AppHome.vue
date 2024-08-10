<script>
import axios from 'axios';
import RestaurantCard from '../partials/RestaurantCard.vue';
import { state } from '../../state';
import Fuse from 'fuse.js';

export default {
	name: "AppHome",
	components: {
		RestaurantCard
	},
	data() {
		return {
			state,
			loading: true,
			restaurants: [],
			types: [],
			typesList: [],
			searchQuery: '',
			fuse: null
		}
	},
	methods: {
		callFilters() {
			const request = {
				typesList: [],
				typesList: this.typesList
			}
			if (this.typesList.length > 0) {
				axios
					.get(state.base_api + `api/types`, { params: request })
					.then((response) => {
						state.restaurants = response.data.restaurants;
						/* console.log("ristoranti filtrati", state.restaurants); */
						/* console.log("tipologie attive:", this.typesList); */
					})
					.catch((error) => {
						console.error("Errore durante la chiamata API:", error);
					});
			} else {
				this.resetFilters();
			}
		},
		resetFilters() {
			this.typesList = [];
			state.callApi();
		},
		/* search bar */
		/* conferma se la query trova corrispondenza o passa il primo risultato proposto */
		setupFuse() {
			this.fuse = new Fuse(this.types, {
				keys: ['name'],
				includeScore: true,
				threshold: 0.4
			});
		},
		addType(type) {
			const typeName = this.searchQuery.trim().toLowerCase();
			if (!type) {
				type = this.filteredTypes[0];
			}
			if (type && !this.typesList.includes(type.id)) {
				this.typesList.push(type.id);
				this.searchQuery = '';
				this.callFilters();
			}
		},
		handleConfirm() {
			const query = this.searchQuery.trim().toLowerCase();
			if (query) {
				const results = this.fuse.search(query);
				if (results.length > 0) {
					this.addType(results[0].item);
				}
			}
		},
		goTo(pageNumber) {
			axios
				.get(state.base_api + state.restaurants_api + `?page=${pageNumber}`)
				.then((response) => {
					console.log(response.data);
					state.restaurants = response.data.restaurants;
				})
				.catch((error) => {
					console.error("Errore durante la chiamata API:", error);
				});
		},
	},
	mounted() {
		state.callApi();
		this.types = state.types;
		this.setupFuse();
	},
	computed: {
		filteredTypes() {
			const query = this.searchQuery.trim().toLowerCase();
			if (query && this.fuse) {
				const results = this.fuse.search(query);
				return results.map(result => result.item);
			}
			return [];
		}
	}
} 
</script>

<template>
	<!-- jumbotron with search bar -->
	<section id="my_jumbotron" loading="eager">
		<div class="container-fluid text-center h-100 py-5">
			<div class="row h-100 justify-content-center align-items-end">
				<div class="col-6 col-md-8 d-flex justify-content-center" id="search_card">
					<div class="card align-items-center py-5 mb-4 rounded-5 gap-2 shadow-lg">
						<!-- caption -->
						<h1>Tutto il gusto che ami, a casa tua</h1>
						<p class="fs-4 lh-sm d-none d-sm-block">
							Gusta la qualità del tuo ristorante preferito, senza lasciare il comfort di casa
						</p>
						<!-- search bar -->
						<div class="col d-flex justify-content-between border rounded-pill p-1 shadow-sm mb-2 position-relative">
							<div class="px-2 d-flex align-items-center flex-grow-1" id="search_bar">
								<i class="fa-solid fa-magnifying-glass fs-5 ps-2 text-secondary"></i>
								<input type="text" autocomplete="off" name="types.name" id="types.name" placeholder=" Cerca Categoria"
									class="border-0 py-3 px-2 flex-grow-1" v-model="searchQuery" @keydown.enter.prevent="handleConfirm">
							</div>
							<button type="submit" class="rounded-pill fw-bold border-0 px-3 px-lg-4" @click="handleConfirm">
								conferma
							</button>
							<!-- computed results -->
							<div v-if="filteredTypes.length > 0" class="position-absolute w-100 bg-white shadow-sm rounded"
								style="z-index: 1000; margin-top: 4rem;">
								<ul class="list-unstyled m-0 p-4">
									<li v-for="type in filteredTypes" :key="type.id" @click="addType(type)"
										class="p-2 border-bottom table-hover" style="cursor: pointer;">
										{{ type.name }}
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- vista principale -->
	<section id="show_restaurant">
		<div class="container py-4 my-2">
			<div class="row text-center">
				<h2>Scegli il ristorante</h2>

				<!-- filtri pillole -->
				<div class="row justify-content-center mx-auto" v-if="types">
					<div class="col-12 col-md-8 d-flex justify-content-center py-2 flex-wrap">
						<div class="badge rounded-pill m-1" v-for="type in state.types"
							:class="{ 'active_filter': typesList.includes(type.id) }" id="my_filters">

							<label :for="'type-' + type.id" class="d-flex align-items-center m-1"
								:class="{ 'active_filter': typesList.includes(type.id) }">
								<input name="typesList" class="fs-6 p-1 me-2 hidden-checkbox managing-filters" type="checkbox"
									:value="type.id" :id="'type-' + type.id" v-model="typesList" @change="callFilters" />
								{{ type.name }}
							</label>
						</div>
					</div>
				</div>

				<!-- ristoranti -->
				<template v-if="state.restaurants.data && state.restaurants.data.length > 0">
					<div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 w-100 py-3 mx-auto">
						<div class="col" v-for="restaurant in state.restaurants.data">
							<router-link :to="{ name: 'restaurant', params: { id: restaurant.id, slug: restaurant.slug } }"
								class="no_style">
								<RestaurantCard :restaurant="restaurant" :baseApiUrl="state.base_api" />
							</router-link>
						</div>
					</div>

					<!-- Pagination -->

					<nav aria-label="..." class="mt-3">
						<ul class="pagination pagination-lg">
							<li class="page-item pagination_navigation_button" v-for="pageNumber in state.restaurants.last_page"
								@click="goTo(pageNumber)">
								<a class="page-link">{{ pageNumber }}</a>
							</li>
						</ul>
					</nav>
				</template>
				<template v-else>
					<h3 class="text-center mt-4 text-secondary">
						Nessun ristorante soddisfa la tua ricerca
					</h3>
					<img src="../../assets/img/empty_cart.png" alt="no restaurant found" class="mx-auto py-1 pe-2"
						style="width: 25%; height: auto; min-width:250px;">
				</template>
			</div>
		</div>
	</section>
</template>

<style lang="scss">
@import '../../assets/scss/variables.scss';

input[type="text"] {
	border: none;
	outline: none;
}

#my_jumbotron {
	height: 650px;
	background-size: cover;
	background-repeat: no-repeat;
	background-image: url("/src/assets/img/jumbo-food-2.jpg");

	@media(max-width: 767px) {
		height: 425px;

		#search_card {
			.card {
				min-width: 360px;
			}
		}
	}

	@media(min-width: 1024px) {
		#search_bar {
			min-width: 400px;
		}

		#search_card {
			.card {
				min-width: 400px;
			}
		}
	}

	h1 {
		font-family: $header;
		font-weight: 800;
		color: $primary;
		width: 85%;
	}

	p {
		width: 75%;
	}

	button {
		color: white;
		background-color: $primary;
	}
}

#show_restaurant {
	h2 {
		font-family: $header;
		font-weight: 700;
		color: $primary;
	}
}

#my_filters {
	border: 1px solid $primary;
	color: $primary;
}

#filter_buttons {
	button {
		border-color: $primary;
		color: $primary;
	}
}

//nascondi estetica checkbox, inoltre mentre è attivo, applica questa classe:
.hidden-checkbox {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
}

.active_filter {
	background-color: $primary;
	color: white;
}

.pagination_navigation_button {
	cursor: pointer;
}
</style>
