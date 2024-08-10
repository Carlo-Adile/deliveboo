import axios from "axios";
import { reactive } from "vue";

const initialState = {
	restaurants: [],
	types: [],
	dishes: [],
	typesList: [],
	base_api: import.meta.env.MODE === 'development'
		? "http://127.0.0.1:8000/"
		: "https://deliveboo-back-office.carloadile.com/",
	restaurants_api: "api/restaurants",
	items: [],
	order_resume: [],
	cartRestraurantName: '',
	toggle: false
};

export const state = reactive(initialState);

/* salva item in local storage */
const saveToLocalStorage = () => {
	localStorage.setItem("items", JSON.stringify(state.items));
	localStorage.setItem("cartRestaurantName", state.cartRestaurantName);
};

/* carica local storage all'avvio */
const loadFromLocalStorage = () => {

	/* crea o ritorna istanza di getItem("oggetto desiderato json-ificato") */
	const storedItems = JSON.parse(localStorage.getItem("items"));

	state.items = storedItems ? storedItems : [];
	console.log("hai caricato carrello: ", storedItems);

	const storedCartRestaurantName = localStorage.getItem("cartRestaurantName");
	state.cartRestaurantName = storedCartRestaurantName ? storedCartRestaurantName : '';

	console.log("state prende i dati del carrello: ", state.items);
};

const loadName = () => {
	state.cartRestraurantName = localStorage.getItem("cartRestaurantName");
}

/* calcola il totale del carrello */
state.calculateTotal = function () {
	let total = 0;
	for (let item of this.items) {
		const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
		total += item.quantity * price;
	}
	return total.toFixed(2);
};

state.dishesTotal = function () {
	let dishTotal = 0;
	for (let item of this.items) {
		const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
		dishTotal += item.quantity;
	}
	return dishTotal;
};

/* axios call all'api */
state.callApi = function () {
	axios
		.get(this.base_api + this.restaurants_api)
		.then(response => {
			console.log(response);
			this.restaurants = response.data.restaurants;
			this.types = response.data.types;
			this.dishes = response.data.dishes;
			this.typesList = response.data.typesList;
			saveToLocalStorage();
			this.loading = false;

			console.log("types caricati:", this.types);
		})
		.catch(err => {
			console.log(err);
		});
};

/* carica local storage all'avvio */
loadFromLocalStorage();

loadName();

