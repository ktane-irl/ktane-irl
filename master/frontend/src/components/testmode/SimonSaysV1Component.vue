<template>
    <v-card class="mx-auto" max-width="500" :loading="is_sending || is_fetching" :disabled="is_sending">
        <v-col>
            <v-row>
                <v-card-title>Simon Says v1 - slot_{{ current_slot }}</v-card-title>
                <v-spacer></v-spacer>
                <div class="pt-2 pr-2">
                    <v-chip class="ma-2" @click="switch_status_led('red')">
                        <v-icon v-if="config?.statusLed.red" class="ma-2" color="red">mdi-checkbox-blank-circle</v-icon>
                        <v-icon v-else class="ma-2" color="red">mdi-checkbox-blank-circle-outline</v-icon>
                    </v-chip>
                    <v-chip class="ma-2" @click="switch_status_led('green')">
                        <v-icon v-if=config?.statusLed.green class="ma-2"
                            color="green">mdi-checkbox-blank-circle</v-icon>
                        <v-icon v-else class="ma-2" color="green">mdi-checkbox-blank-circle-outline</v-icon>
                    </v-chip>
                </div>
            </v-row>
        </v-col>

        <v-col class="pb-6">
            <v-row>
                <v-col class="ml-6">
                    <p>LEDs</p>
                    <v-row>
                        <v-chip class="ma-2" @click="switch_led(SimonSaysColor.red)">
                            <v-icon v-if="config?.led[SimonSaysColor.red]" class="ma-2"
                                color="red">mdi-checkbox-blank-circle</v-icon>
                            <v-icon v-else class="ma-2" color="red">mdi-checkbox-blank-circle-outline
                            </v-icon>
                        </v-chip>
                        <v-chip class="ma-2" @click="switch_led(SimonSaysColor.blue)">
                            <v-icon v-if="config?.led[SimonSaysColor.blue]" class="ma-2"
                                color="blue">mdi-checkbox-blank-circle
                            </v-icon>
                            <v-icon v-else class="ma-2" color="blue">
                                mdi-checkbox-blank-circle-outline
                            </v-icon>
                        </v-chip>
                    </v-row>
                    <v-row>
                        <v-chip class="ma-2" @click="switch_led(SimonSaysColor.green)">
                            <v-icon v-if="config?.led[SimonSaysColor.green]" class="ma-2"
                                color="green">mdi-checkbox-blank-circle</v-icon>
                            <v-icon v-else class="ma-2" color="green">mdi-checkbox-blank-circle-outline
                            </v-icon>
                        </v-chip>
                        <v-chip class="ma-2" @click="switch_led(SimonSaysColor.yellow)">
                            <v-icon v-if="config?.led[SimonSaysColor.yellow]" class="ma-2"
                                color="yellow">mdi-checkbox-blank-circle
                            </v-icon>
                            <v-icon v-else class="ma-2" color="yellow">
                                mdi-checkbox-blank-circle-outline
                            </v-icon>
                        </v-chip>
                    </v-row>
                </v-col>

                <v-col class="ml-6">
                    <p>Buttons</p>
                    <v-row>
                        <div class="pa-1">
                            <v-icon v-if="config?.button['red']" class="ma-2" color="red">mdi-checkbox-blank-circle
                            </v-icon>
                            <v-icon v-else class="ma-2" color="red">
                                mdi-checkbox-blank-circle-outline
                            </v-icon>
                        </div>
                        <div class="pa-1">
                            <v-icon v-if="config?.button['blue']" class="ma-2" color="blue">mdi-checkbox-blank-circle
                            </v-icon>
                            <v-icon v-else class="ma-2" color="blue">
                                mdi-checkbox-blank-circle-outline
                            </v-icon>
                        </div>
                    </v-row>
                    <v-row>
                        <div class="pa-1">
                            <v-icon v-if="config?.button['green']" class="ma-2" color="green">mdi-checkbox-blank-circle
                            </v-icon>
                            <v-icon v-else class="ma-2" color="green">
                                mdi-checkbox-blank-circle-outline
                            </v-icon>
                        </div>
                        <div class="pa-1">
                            <v-icon v-if="config?.button['yellow']" class="ma-2"
                                color="yellow">mdi-checkbox-blank-circle
                            </v-icon>
                            <v-icon v-else class="ma-2" color="yellow">
                                mdi-checkbox-blank-circle-outline
                            </v-icon>
                        </div>
                    </v-row>
                </v-col>
            </v-row>
        </v-col>

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
import { SimonSaysColor, SimonSaysConfiguration } from "@/../../common/types/modules/questModules/simonSays"

export default Vue.extend({
    name: "SimonSaysV1Component",
    props: {
        current_slot: Number,
        autorefresh: Boolean
    },
    data: () => ({
        is_sending: false,
        is_fetching: false,
        fetcher: undefined as number | undefined,
        config: undefined as SimonSaysConfiguration | undefined,
        SimonSaysColor
    }),
    methods: {
        switch_led(color: SimonSaysColor) {
            if (this.config) {
                this.config.led[color] = !this.config.led[color]
                this.send_config()
            }
        },
        switch_status_led(color: string) {
            if (this.config) {
                if (color == "red")
                    this.config.statusLed.red = !this.config?.statusLed.red
                else if (color == "green")
                    this.config.statusLed.green = !this.config?.statusLed.green
                this.send_config()
            }
        },
        fetch_config() {
            client.get(`/api/SimonSays/1/${this.current_slot}`)
                .then((response) => {
                    this.config = response.data
                    if (this.config != undefined) {
                        let send = false
                        if (this.config.statusLed == undefined) {
                            this.config.statusLed = {
                                red: false,
                                green: false
                            }
                            send = true
                        }
                        if (this.config.led == undefined) {
                            this.config.led = {
                                blue: false,
                                green: false,
                                red: false,
                                yellow: false
                            }
                            send = true
                        }
                        if (send)
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
                client.put(`/api/SimonSays/1/${this.current_slot}`, {
                    "led": this.config.led,
                    "statusLed": this.config.statusLed
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
    },
})

</script>
