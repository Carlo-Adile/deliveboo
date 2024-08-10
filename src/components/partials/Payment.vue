<script>
import dropin from 'braintree-web-drop-in';
import axios from 'axios';
import { state } from '../../state';
import router from '../../router';

export default {
	data() {
		return {
			instance: null,
			form: {
				token: '',
				order: [], //array di oggetti da inviare per il controllo, devono contenere chiave id e chiave quantity
				restaurantId: null, //id del ristorante singolo, bisogna controllare che il valore inserito sia un numero e solo uno 
				customerName: '',
				customerLastName: '',
				customerPhoneNumber: '',
				customerAddress: '',
				customerEmail: '',
				isValid: true,
				allDishes: state.items,
				//il total price verrà calcolato lato back per sicurezza
				//status ha un valore di default
			},
			error: '',
			state,
			btnDisabled: false,
		}
	},
	props: [
		'authorization'
	],
	mounted() {
		this.createDropIn()
	},
	methods: {
		createDropIn() {
			dropin.create({
				authorization: this.authorization,
				container: '#dropin-container', loading: false,
				locale: 'it_IT',
			}, (error, instance) => {
				if (error) {
					this.error = error.message;
					console.error(error)
					return
				}
				this.instance = instance
			})
		},
		submitPayment() {
			this.disableButton()
			this.valData();
			if (this.instance) {
				this.instance.requestPaymentMethod((error, payload) => {
					if (error) {
						if (error.message === 'No payment method is available.') {
							this.error = 'Seleziona un metodo di Pagamento'
						} else {
							this.error = error.response.data.message;
						}
						console.error(error);
						return;
					}
					this.form.token = payload.nonce;

					this.form.order = state.items.map(item => ({
						id: item.id,
						restaurantId: item.restaurant_id,
						quantity: item.quantity
					}));
					/* otteniamo restaurant_id dagli items */
					const uniqueRestaurantId = state.items.length > 0 ? state.items[0].restaurant_id : null;
					this.form.restaurantId = uniqueRestaurantId;
					console.log('Payment Method Nonce + this.form:', payload.nonce, this.form);


					/* axios post */
					if (this.isValid === true) {
						axios.post(state.base_api + 'api/orders/make/payment', this.form)
							.then((response) => {
								state.order_resume = state.items
								this.clearCart();
								console.log(response);
								this.$router.push({ name: 'checkout_success' })
							})
							.catch((error) => {
								if (error.message === 'Request failed with status code 422') {
									this.error = 'Controlla il tuo ordine';
								} else {
									console.log(error.response.data.message)
									this.error = error.response.data.message;
								}
								console.log(error)
							});
					} else {
						console.log('Validazione fallita')
						this.error = 'Hai sbagliato a compilare il form per l\'invio';
						console.log(error);
					}
				});
			}
		},
		valData() {
			const inputs = [
				{ id: 'customerName', message: 'Inserisci il tuo nome' },
				{ id: 'customerLastName', message: 'Inserisci il tuo cognome' },
				{ id: 'customerEmail', message: 'Inserisci la tua email' },
				{ id: 'customerPhoneNumber', message: 'Inserisci il tuo numero di telefono' },
				{ id: 'customerAddress', message: 'Inserisci il tuo indirizzo' },

			];
			this.isValid = true;
			let allInputsInserted = true;
			inputs.forEach(input => {
				const element = document.getElementById(input.id);
				const helpElement = document.getElementById(`${input.id}Help`);

				if (helpElement) {
					helpElement.remove();
				}
				if (!element.value.trim()) {
					element.classList.add('is-invalid');
					element.insertAdjacentHTML('afterend', `<small id="${input.id}Help" class="text-danger">${input.message}</small>`);
					allInputsInserted = false;
				} else {
					element.classList.remove('is-invalid');
					element.classList.add('is-valid');
				}
			});


			if (allInputsInserted) {
				if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.form.customerEmail)) {
					if (document.getElementById('customerEmailHelp')) {
						document.getElementById('customerEmailHelp').remove();
					}
					const element = document.getElementById('customerEmail');
					element.classList.add('is-invalid');
					element.insertAdjacentHTML('afterend', `<small id="customerEmailHelp" class="text-danger">Email non valida</small>`);
					this.isValid = false;
				}

				if (this.form.customerPhoneNumber.length < 5 || this.form.customerPhoneNumber.length > 15 || isNaN(this.form.customerPhoneNumber) || this.form.customerPhoneNumber < 0) {
					if (document.getElementById('customerPhoneNumberHelp')) {
						document.getElementById('customerPhoneNumberHelp').remove();
					}
					const element = document.getElementById('customerPhoneNumber');
					element.classList.add('is-invalid');
					element.insertAdjacentHTML('afterend', `<small id="customerPhoneNumberHelp" class="text-danger">Numero di telefono non valido</small>`);
					this.isValid = false;
				}
			}
		},
		clearCart() {
			state.items = [];
			localStorage.removeItem('items');
			console.log('carrello svuotato');
		},
		disableButton() {
			this.btnDisabled = true;
			setTimeout(() => {
				this.btnDisabled = false
			}, 5000)
		}
	},
	beforeDestroy() {
		if (this.instance) {
			this.instance.teardown(() => {
				console.log('Braintree instance torn down')
			})
		}
	}

}
</script>

<template>
	<div class="d-flex align-items-center flex-column p-3">
		<h2 class="mb-4">Pagamento</h2>
		<!-- dati cliente -->
		<form @submit.prevent="onSubmit" @submit="submitPayment" class="container" id="my_payment_form">
			<div class="row row-cols-1 row-cols-md-2">
				<div class="col">
					<div class="mb-2">
						<label for="customerName" class="form-label">Nome*</label>
						<input id="customerName" class="d-block w-100" type="text" v-model="form.customerName"
							placeholder="Mario" />
					</div>
					<div class="mb-2">
						<label for="customerLastName" class="form-label">Cognome*</label>
						<input id="customerLastName" class="d-block w-100" type="text" v-model="form.customerLastName"
							placeholder="Rossi" />
					</div>
					<div class="mb-2">
						<label for="customerEmail" class="form-label">Email*</label>
						<input id="customerEmail" class="d-block w-100" type="text" v-model="form.customerEmail"
							placeholder="mariorossi@email.com" />
					</div>
					<div class="mb-2">
						<label for="customerPhoneNumber" class="form-label">Cellulare*</label>
						<input id="customerPhoneNumber" class="d-block w-100" type="tel"
							v-model="form.customerPhoneNumber" placeholder="1234567890" />
					</div>
					<div class="mb-2">
						<label for="customerAddress" class="form-label">Indirizzo*</label>
						<input id="customerAddress" class="d-block w-100" type="text" v-model="form.customerAddress"
							placeholder="Via del Corso 10" />
					</div>
				</div>

				<!-- braintree -->
				<div id="dropin-container"></div>

				<!-- bottone pagamento -->
				<button type="submit" class="btn btn-primary mx-auto px-5 mt-3" :disabled="btnDisabled"><span
						v-if="btnDisabled">
						<i class="fa-solid fa-arrows-rotate"></i> Invio...
					</span>
					<span v-else>
						Procedi con il pagamento
					</span>
				</button>

			</div>
		</form>
	</div>

	<!-- riepilogo ordine -->
	<div class="container py-4 mb-5">
		<div class="accordion" id="my_accordion">
			<div class="accordion-item">
				<h2 class="accordion-header">
					<button class="accordion-button fs-5 fw-medium text-white" type="button" data-bs-toggle="collapse"
						data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
						Riepilogo Ordine
					</button>
				</h2>
				<div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#my_accordion">
					<div class="accordion-body">
						<div class="table-responsive">
							<table class="table">
								<thead>
									<tr>
										<th scope="col">Prodotto</th>
										<th scope="col">Prezzo</th>
										<th scope="col">Quantità</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="order_item in state.items">
										<td scope="row">{{ order_item.name }}</td>
										<td>€ {{ order_item.price }}</td>
										<td>x {{ order_item.quantity }}</td>
									</tr>
									<tr>
										<td></td>
										<td></td>
										<td>
											<strong>Totale</strong>
											€ {{ state.calculateTotal() }}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

		</div>
	</div>

</template>

<style lang="scss">
@import '../../assets/scss/variables.scss';

#my_payment_form {
	input {
		height: 42px;
		padding: 0 8px 0 8px;
		margin: 4px 0 0 0;
		border: 1px solid #bfbfbf;
	}

	label {
		margin: 0;
		font-size: 14px;
	}
}

#my_accordion {
	color: white;

	.accordion-button {
		color: white;
		background-color: $primary;
	}

	.accordion-button::after {
		color: white;
	}

	$accordion-icon-color: white;
}

/* braintree native */
.braintree-sheet__content--form .braintree-form__flexible-fields {
	display: block;
}
</style>
