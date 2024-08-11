<script>

export default {
	name: 'RestaurantCard',
	data() {
		return {

		}
	},
	props: {
		restaurant: {
			type: Object,
			required: true
		},
		baseApiUrl: {
			type: String,
			required: true
		}
	},
	mounted() {
		/* console.log("tutte le tipologie", this.restaurant.types); */
	},
	computed: {
		/* limita i badge in vista per non rompere l'altezza delle card */
		limitedTypes() {
			return this.restaurant.types.slice(0, 3);
		},
		extraBadgeCount() {
			return this.restaurant.types.length > 3 ? this.restaurant.types.length - 3 : 0;
		}
	}
}
</script>

<template>
	<div class="card card_style rounded-1 mb-4" id="restaurant_card">

		<img v-if="restaurant.thumb" :src="baseApiUrl + 'storage/' + restaurant.thumb" :alt="restaurant.name_restaurant"
			class="card-img-top border">
		<img v-else src="https://placehold.co/200x100" :alt="restaurant.name_restaurant" class="card-img-top">

		<div class="card-body align-self-center">
			<h4>{{ restaurant.name_restaurant }}</h4>
			<!-- address -->
			<div class="card-text address_clamp" v-if="restaurant.address">
				<i class="fa-solid fa-location-dot"></i>
				{{ restaurant.address }}
			</div>
			<!-- badges -->
			<div class="card-text mt-2 d-flex flex-wrap gap-1 justify-content-center" id="restaurant_badge">
				<span v-for="(type, index) in limitedTypes" :key="type.id" class="badge border rounded-pill">
					{{ type.name }}
					{{ type.type_name }}
				</span>
				<span v-if="extraBadgeCount > 0" class="badge border rounded-pill">
					+{{ extraBadgeCount }}
				</span>
			</div>
		</div>
	</div>

</template>


<style lang="scss">
@import '../../assets/scss/variables.scss';

#restaurant_card {

	img {
		height: 250px;

		@media(min-width: 1440px) {
			height: 300px;
		}
	}
}

.no_style {
	text-decoration: none;
	color: inherit;
}

#restaurant_badge {
	.badge {
		border: $primary;
		color: $primary;
	}
}

.address_clamp {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 1;
	overflow: hidden;
	text-overflow: ellipsis;
}
</style>