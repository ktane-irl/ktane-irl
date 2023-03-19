<template>
    <v-card class="mx-auto" max-width="300" :loading="is_sending || is_fetching" :disabled="is_sending">
        <v-card-title>Case v1 - slot_{{ current_slot }}</v-card-title>
        <v-subheader>Detected batteries</v-subheader>
        <v-card-text>
            <v-row>
                <v-col class="ml-2 mr-2" v-for="(item, i) in config?.batteries" :key="i">
                    <v-icon v-if="item" class="ma-2" color="primary">mdi-battery-heart-variant</v-icon>
                    <v-icon v-else class="ma-2">mdi-battery-remove-outline</v-icon>
                </v-col>
            </v-row>
        </v-card-text>
        <v-subheader>Indicator Identification Reference</v-subheader>
        <v-card-text>
            <v-chip class="ma-2" v-for="(item, i) in config?.indicatorLed" :key="i" @click="switch_led(i)">
                <v-icon v-if="item" class="ma-2" color="green">mdi-checkbox-blank-circle</v-icon>
                <v-icon v-else class="ma-2">mdi-checkbox-blank-circle-outline</v-icon>
            </v-chip>
        </v-card-text>

        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="is_fetching = true; fetch_config()">
                Refresh
            </v-btn>
            <v-btn text @click="$emit('hide_dialog', true)">
                Close
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
  
<script lang="ts">
import Vue from "vue"
import client from "@/api-client"
import { CaseConfiguration } from "@/../../common/types/modules/case"

export default Vue.extend({
    name: "CaseV1Component",
    props: {
        current_slot: Number,
        autorefresh: Boolean
    },
    data: () => ({
        is_sending: false,
        is_fetching: false,
        fetcher: undefined as number | undefined,
        config: undefined as CaseConfiguration | undefined,
    }),
    methods: {
        switch_led(i: number) {
            if (this.config) {
                Vue.set(this.config.indicatorLed, i, !this.config.indicatorLed[i])
                this.send_config()
            }
        },
        fetch_config() {
            client.get(`/api/Case/1/${this.current_slot}`)
                .then((response) => {
                    this.config = response.data
                    if (this.config != undefined && this.config.indicatorLed == undefined) {
                        this.config.indicatorLed = [false, false, false, false, false]
                        this.send_config()
                    }
                })
                .catch((e: Error) => {
                    alert(e)
                }).finally(() => {
                    this.is_fetching = false
                })
        },
        send_config() {
            if (this.config) {
                this.is_sending = true
                client.put(`/api/Case/1/${this.current_slot}`, {
                    indicatorLed: this.config.indicatorLed
                }).then((response) => {
                    this.config = response.data
                }).catch((e: Error) => {
                    alert(e)
                }).finally(() => {
                    this.is_sending = false
                })
            }
        }
    },

    mounted() {
        this.is_fetching = true
        this.fetch_config()
        if (this.autorefresh)
            this.fetcher = setInterval(() => {
                if (!this.is_sending)
                    this.fetch_config()
            }, 500)
    },
    beforeDestroy() {
        clearInterval(this.fetcher)
    }
})

</script>
