    <script>
    import Payment from '../partials/Payment.vue';
    import axios from 'axios';
    import { state } from '../../state';

    export default {
        data() {
            return {
                initialToken: '',
            }
        },
        components: {
            Payment,
        },
        methods: {
            getInitialToken() {
                axios.get(state.base_api + 'api/orders/generate').then((response) => {
                    // console.log(response.data.token);
                    this.initialToken = response.data.token
                    /* if (this.initialToken !== '') {
                        console.log('yes');
                    } */
                })
            }
        },
        mounted() {
            this.getInitialToken()
        }
    }
</script>

<template>
    <template v-if="initialToken !== ''">
        <Payment :authorization="initialToken"></Payment>
    </template>
    <div v-else>
        <div class="container py-5">
            <div class="row">
                <h4>Stiamo caricando la tua pagina per il pagamento...</h4>
            </div>
        </div>
    </div>

</template>
<style></style>