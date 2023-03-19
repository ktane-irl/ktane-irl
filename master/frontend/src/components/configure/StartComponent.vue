<template>
    <v-container>
        <v-alert border="left" colored-border type="info" max-width="600" elevation="2">
            I will guide you through the configuration. You need to provide some information first. Let's get
            started!
        </v-alert>

        <v-card max-width="600" :loading="is_sending" :disabled="is_sending">
            <v-card-title align="left">With how many modules do you wish to play?</v-card-title>
            <v-card-text>
                <v-slider class="pt-6" v-model="play_config.count_of_wished_modules" :min="minModuleCount"
                    :max="maxModuleCount" step="1" thumb-label="always" ticks="always" tick-size="4">
                </v-slider>
            </v-card-text>

            <v-card-title align="left">Witch modules do you have?</v-card-title>
            <v-card-text>
                <v-col>
                    <v-row v-for="(item, i) in play_config.available_modules" :key="i" class="ml-2 mr-2" align="center">
                        <p class="mr-auto ml-auto">{{ item.name }}</p>
                        <v-btn :disabled="play_config.available_modules[i].count <= 0 ? true : false" color="primary"
                            elevation="1" class="mb-4" @click="sub_available_module(i)" fab small>-
                        </v-btn>
                        <p class="pr-2 pl-2 font-weight-bold">{{ item.count }}</p>
                        <v-btn :disabled="play_config.available_modules[i].count >= 9 ? true : false" color="primary"
                            elevation="1" class="mb-4" @click="add_available_module(i)" fab small>+
                        </v-btn>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-title align="left">Time</v-card-title>
            <v-card-text>
                <v-row class="ml-4 mr-4">
                    <v-col cols="12" md="6">

                        <v-autocomplete v-model="time_min" :items="item_min" dense>
                        </v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="6">

                        <v-autocomplete v-model="time_sec" :items="item_sec" dense>
                        </v-autocomplete>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-title align="left">Your severity level</v-card-title>
            <v-card-text>
                <v-row class="ml-4 mr-4">
                    <v-col cols="12" md="6">
                        <v-autocomplete v-model="play_config.severity_level" :items="severities" dense>
                        </v-autocomplete>
                    </v-col>
                </v-row>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text
                    :disabled="play_config.available_modules.reduce((accumulator, object) => { return accumulator + object.count }, 0) >= play_config.count_of_wished_modules ? false : true"
                    @click="form_continue">
                    Continue
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>
  
<script lang="ts">
import Vue from "vue"
import client from "@/api-client"

export default Vue.extend({
    name: "StartComponent",
    data: () => ({
        is_sending: false,

        minModuleCount: 2,
        maxModuleCount: 11,

        item_min: [...Array(60).keys()].map(i => {
            return String(i).padStart(2, "0")
        }),
        item_sec: [...Array(60).keys()].map(i => {
            return String(i).padStart(2, "0")
        }),

        time_min: "10",
        time_sec: "00",

        severities: ([...Array(6).keys()].map(i => i + 1)),

        play_config: {
            available_modules: [
                { name: "Wires", count: 0 },
                { name: "TheButton", count: 0 },
                { name: "Keypads", count: 0 },
                { name: "SimonSays", count: 0 },
                { name: "WhosOnFirst", count: 0 },
                { name: "Memory", count: 0 },
                { name: "MorseCode", count: 0 },
                { name: "ComplicatedWires", count: 0 },
                { name: "WireSequences", count: 0 },
                { name: "Mazes", count: 0 },
                { name: "Passwords", count: 0 },
                { name: "VentingGas", count: 0 },
                { name: "CapacitorDischarge", count: 0 },
                { name: "Knobs", count: 0 }
            ],
            count_of_wished_modules: 2,
            seconds_to_play: 0,
            severity_level: 1
        },
    }),
    methods: {
        add_available_module(i: number) {
            this.play_config.available_modules[i].count++
        },
        sub_available_module(i: number) {
            this.play_config.available_modules[i].count--
        },
        send_config() {
            this.play_config.seconds_to_play = 60 * (+this.time_min) + (+this.time_sec)
            client.put("/api/play/config", this.play_config)
        },
        set_game_state(state: string) {
            client.put(`/api/play/SetGameState`, {
                "gamemode": state
            }).then((response) => {
                if (response.data.gamemode != "test_idle")
                    alert("Error while changing gamestate to test_idle. Gamestate is " + response.data.gamemode + ".")
            }).catch((e: Error) => {
                alert(e)
            }).finally(() => {
                this.is_sending = false
            })
        },
        form_continue() {
            this.send_config()
            this.$emit("form_continue", true)
        }
    },
    mounted() {
        this.is_sending = true
        this.set_game_state("test_idle")
    },
})
</script>
