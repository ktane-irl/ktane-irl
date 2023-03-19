<template>
    <v-card class="mx-auto" max-width="300" :loading="is_sending || is_fetching" :disabled="is_sending">
        <v-card-title>Clock v1 - slot_{{ current_slot }}</v-card-title>
        <v-col>
            <v-subheader>Strikes</v-subheader>
            <v-card-text>
                <v-row>
                    <v-col v-for="item, i in config?.strikeLed" :key="i">
                        <v-chip class="ma-2" @click=toggle_strike(i)>
                            <v-icon v-if=item class="ma-2" color="primary">mdi-close-box-outline</v-icon>
                            <v-icon v-else class="ma-2">mdi-checkbox-blank-outline</v-icon>
                        </v-chip>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-subheader>Time</v-subheader>
            <v-card-text>
                <v-form>
                    <v-container>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-autocomplete v-model="time_min" :items="item_min" dense @change="send_config()">
                                </v-autocomplete>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-autocomplete v-model="time_sec" :items="item_sec" dense @change="send_config()">
                                </v-autocomplete>
                            </v-col>
                            <v-row class="text-center">
                            </v-row>
                        </v-row>
                    </v-container>
                </v-form>
            </v-card-text>
        </v-col>


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
import client from "@/api-client"
import { AxiosResponse } from "axios"
import { ClockConfiguration } from "@/../../common/types/modules/clock"

export default Vue.extend({
    name: "ClockV1Component",
    props: {
        current_slot: Number,
        autorefresh: Boolean
    },
    data: () => ({
        is_sending: false,
        is_fetching: false,
        fetcher: undefined as number | undefined,
        item_min: [...Array(68).keys()].map(i => { // Module data of seconds is 12 Bits => max 68 min and 15 sec
            return String(i).padStart(2, "0")
        }),
        item_sec: [...Array(60).keys()].map(i => {
            return String(i).padStart(2, "0")
        }),
        time_min: "10",
        time_sec: "00",

        config: undefined as ClockConfiguration | undefined
        // config: {
        //     secondsLeft: 600,
        //     strikeLed: [false, false],
        // } as ClockConfiguration
    }),
    methods: {
        toggle_strike(i: number) {
            if (this.config) {
                Vue.set(this.config.strikeLed, i, !this.config.strikeLed[i])
                this.send_config()
            }
        },
        apply_config(new_config: ClockConfiguration) {
            this.config = new_config
            if (this.config != undefined) {
                this.time_min = String(Math.floor(this.config.secondsLeft / 60)).padStart(2, "0")
                this.time_sec = String(this.config.secondsLeft % 60).padStart(2, "0")
            }
        },
        fetch_config() {
            client.get(`/api/ClockModule/1/${this.current_slot}`)
                .then((response) => {
                    let new_config = response.data as ClockConfiguration
                    let flag = false
                    if (new_config != undefined && new_config.strikeLed == undefined) {
                        new_config.strikeLed = [false, false]
                        flag = true
                    }
                    if (new_config != undefined && new_config.secondsLeft == undefined) {
                        new_config.secondsLeft = 60
                        flag = true
                    }
                    this.apply_config(new_config)

                    if (flag)
                        this.send_config()

                })
                .catch((e: Error) => {
                    alert(e)
                }).finally(() => {
                    this.is_fetching = false
                })
        },

        send_config() {
            if (this.config) {
                if ((this.time_min != null) && (this.time_sec != null) && (this.time_min.length == 2) && (this.time_sec.length == 2)) {
                    this.is_sending = true
                    this.config.secondsLeft = 60 * (+this.time_min) + (+this.time_sec)
                    client.put(`/api/ClockModule/1/${this.current_slot}`, {
                        secondsLeft: this.config.secondsLeft,
                        strikeLed: this.config.strikeLed
                    }).then((response) => {
                        this.apply_config(response.data)
                    }).catch((e: Error) => {
                        alert(e)
                    }).finally(() => {
                        this.is_sending = false
                    })
                }
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
