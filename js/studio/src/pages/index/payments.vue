<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h1>Payments</h1>
            </v-col>
        </v-row>
        <template v-if="is_loading">
            <v-row>
                <v-col cols="12">
                    <v-progress-linear indeterminate color="primary"></v-progress-linear>
                </v-col>
            </v-row>
        </template>
        <template v-else>
            <v-row>
                <v-col cols="12">
                    <v-table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Created At</th>
                                <th>Sender</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="payment in payments" :key="payment.id">
                                <td>{{ payment.id }}</td>
                                <td>{{ (new Date(payment.created_at)).toLocaleString() }}</td>
                                <td>{{ payment.sender_email }}</td>
                                <td>{{ payment.amount }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-col>
            </v-row>
        </template>
    </v-container>
    <v-fab icon="mdi-chat-question-outline" class="mb-4 ms-n4" color="#1DB954" location="bottom end" absolute app appear></v-fab>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CreatorService, PaymentResponse } from '@/api';

const is_loading = ref(true);
const payments = ref<PaymentResponse[]>([]);

CreatorService.creatorPayments().then((res) => {
    payments.value = res;
    is_loading.value = false;
});
</script>