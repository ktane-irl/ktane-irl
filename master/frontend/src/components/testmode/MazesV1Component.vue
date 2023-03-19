<template>
    <v-card class="mx-auto" width="500" :loading="is_sending || is_fetching" :disabled="is_sending">
        <v-col>
            <v-row>
                <v-card-title>Mazes v1 - slot_{{ current_slot }}</v-card-title>
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

            <v-subheader>Maze</v-subheader>
            <v-card-text>
                <v-row class="justify-center">
                    <v-icon v-if="config?.button.top" color="primary" x-large>mdi-menu-up</v-icon>
                    <v-icon v-else class="mt-6" style="top: 50%;transform: translateY(-50%);" medium>
                        mdi-menu-up-outline
                    </v-icon>
                </v-row>
                <v-row class="justify-center">
                    <v-col class="center">
                        <v-icon v-if="config?.button.left" style="top: 50%;transform: translateY(-50%);" color="primary"
                            x-large>
                            mdi-menu-left
                        </v-icon>
                        <v-icon v-else style="top: 50%;transform: translateY(-50%);" medium>
                            mdi-menu-left-outline
                        </v-icon>
                        <!-- credits to P.E. for css magic -->
                    </v-col>
                    <v-col class="pl-0 pr-0" v-for="_, j in config?.wallMatrix" :key="j">
                        <v-btn icon @click="switch_matrix(i, j)" class="mt-2 mb-2" align="center"
                            v-for="item, i in config?.wallMatrix[j]" :key="i">
                            <v-icon v-if="item" color="primary">mdi-checkbox-blank-circle</v-icon>
                            <v-icon v-else>mdi-checkbox-blank-circle-outline</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col>
                        <v-icon v-if="config?.button.right" style="top: 50%;transform: translateY(-50%);"
                            color="primary" x-large>
                            mdi-menu-right
                        </v-icon>
                        <v-icon v-else style="top: 50%;transform: translateY(-50%);" medium>
                            mdi-menu-right-outline
                        </v-icon>
                    </v-col>
                </v-row>
                <v-row class="justify-center">
                    <v-icon v-if="config?.button.bottom" color="primary" x-large>mdi-menu-down</v-icon>
                    <v-icon v-else class="mt-6" style="top: 50%;transform: translateY(-50%);" medium>
                        mdi-menu-down-outline
                    </v-icon>
                </v-row>
            </v-card-text>
        </v-col>

        <v-subheader>Circle 1</v-subheader>
        <v-card-text>
            <v-row v-if="config?.special.circle1" class="ml-4 mr-4">
                <v-col cols="12" md="6">
                    <v-autocomplete v-model="config.special.circle1.x" :items="matrix_items_x" @change="send_config()"
                        dense>
                    </v-autocomplete>
                </v-col>
                <v-col cols="12" md="6">
                    <v-autocomplete v-model="config.special.circle1.y" :items="matrix_items_y" @change="send_config()"
                        dense>
                    </v-autocomplete>
                </v-col>
            </v-row>
        </v-card-text>

        <v-subheader>Circle 2</v-subheader>
        <v-card-text>
            <v-row v-if="config?.special.circle2" class="ml-4 mr-4">
                <v-col cols="12" md="6">
                    <v-autocomplete v-model="config.special.circle2.x" :items="matrix_items_x" @change="send_config()"
                        dense>
                    </v-autocomplete>
                </v-col>
                <v-col cols="12" md="6">
                    <v-autocomplete v-model="config.special.circle2.y" :items="matrix_items_y" @change="send_config()"
                        dense>
                    </v-autocomplete>
                </v-col>
            </v-row>
        </v-card-text>

        <v-subheader>Player</v-subheader>
        <v-card-text>
            <v-row v-if="config?.special.player" class="ml-4 mr-4">
                <v-col cols="12" md="6">
                    <v-autocomplete v-model="config.special.player.x" :items="matrix_items_x" @change="send_config()"
                        dense>
                    </v-autocomplete>
                </v-col>
                <v-col cols="12" md="6">
                    <v-autocomplete v-model="config.special.player.y" :items="matrix_items_y" @change="send_config()"
                        dense>
                    </v-autocomplete>
                </v-col>
            </v-row>
        </v-card-text>

        <v-subheader>Target</v-subheader>
        <v-card-text>
            <v-row v-if="config?.special.target" class="ml-4 mr-4">
                <v-col cols="12" md="6">
                    <v-autocomplete v-model="config.special.target.x" :items="matrix_items_x" @change="send_config()"
                        dense>
                    </v-autocomplete>
                </v-col>
                <v-col cols="12" md="6">
                    <v-autocomplete v-model="config.special.target.y" :items="matrix_items_y" @change="send_config()"
                        dense>
                    </v-autocomplete>
                </v-col>
            </v-row>
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
import { MazesConfiguration } from "@/../../common/types/modules/questModules/mazes"

export default Vue.extend({
    name: "DummyV1Component",
    props: {
        current_slot: Number,
        autorefresh: Boolean
    },
    data: () => ({
        is_sending: false,
        is_fetching: false,
        fetcher: undefined as number | undefined,
        config: undefined as MazesConfiguration | undefined,
        matrix_items_x: [...Array(6).keys()],
        matrix_items_y: [...Array(6).keys()]
    }),
    methods: {
        switch_status_led(color: string) {
            if (this.config) {
                if (color == "red")
                    this.config.statusLed.red = !this.config?.statusLed.red
                else if (color == "green")
                    this.config.statusLed.green = !this.config?.statusLed.green
                this.send_config()
            }
        },
        switch_matrix(i: number, j: number) {
            if (this.config) {
                Vue.set(this.config.wallMatrix[j], i, !this.config.wallMatrix[j][i])
            }
            this.send_config()
        },
        fetch_config() {
            client.get(`/api/Mazes/1/${this.current_slot}`)
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
                        if (this.config.wallMatrix == undefined) {
                            this.config.wallMatrix = [
                                [false, false, false, false, false, true],
                                [false, false, false, false, true, false],
                                [false, false, false, true, false, false],
                                [false, false, true, false, false, false],
                                [false, true, false, false, false, false],
                                [true, false, false, false, false, false]
                            ]
                            send = true
                        }
                        if (this.config.special == undefined) {
                            this.config.special = {
                                circle1: { "x": 0, "y": 0 },
                                circle2: { "x": 1, "y": 1 },
                                player: { "x": 2, "y": 2 },
                                target: { "x": 3, "y": 3 }
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
                client.put(`/api/Mazes/1/${this.current_slot}`, {
                    "wallMatrix": this.config.wallMatrix,
                    "special": this.config.special,
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
    }
})

</script>
