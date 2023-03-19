<template>
    <v-card class="mx-auto" max-width="300">
        <v-card-title>Clock v1 - slot_{{ current_slot }}</v-card-title>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="$emit('hide_dialog', true)">
                Close
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
  
<script lang="ts">
import Vue from "vue"

export default Vue.extend({
    props: {
        current_slot: Number
    },
    name: "ClockComponent",
    data: () => ({}),
    methods: {}
})
</script>
