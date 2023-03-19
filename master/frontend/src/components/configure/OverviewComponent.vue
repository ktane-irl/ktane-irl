<template>
    <v-container>
        <v-card class="mx-auto" max-width="1200" :loading="is_fetching || is_sending" :disabled="is_sending">
            <v-card-title align="left">Target modules</v-card-title>
            <v-card-text>
                <v-row>
                    <v-card class="ma-6" v-for="(item, i) in done_modules" :key="i"
                        @click="show_component_dialog(item.name, item.slot, item.version)" width="150" height="150"
                        elevation="0" color="secondary">
                        <h4>{{ item.name }}</h4>
                        <p>slot_{{ item.slot }} - v{{ item.version }}</p>
                        <v-icon class="ma-2" x-large color="green">mdi-check-outline
                        </v-icon>
                    </v-card>
                    <v-card class="ma-6" v-for="(item, i) in conn_modules" :key="i"
                        @click="show_component_dialog(item.name, item.slot, item.version)" width="150" height="150"
                        elevation="0" color="secondary">
                        <h4>{{ item.name }}</h4>
                        <p>slot_{{ item.slot }} - v{{ item.version }}</p>
                        <v-icon class="ma-2" x-large color="amber">mdi-cog-outline</v-icon>
                    </v-card>
                    <v-card class="ma-6" v-for="(item, i) in not_conn_modules" :key="i" width="150" height="150"
                        elevation="0" color="secondary">
                        <h4>{{ item }}</h4>
                        <v-icon class="ma-2 mt-12" x-large color="gray">mdi-connection</v-icon>
                    </v-card>
                </v-row>
            </v-card-text>

            <v-card-title align="left" class="mt-3">To remove</v-card-title>
            <v-card-text>
                <v-row>
                    <v-card class="ma-6" v-for="(item, i) in to_remove_modules" :key="i" width="150" height="150"
                        elevation="0" color="secondary">
                        <h4>{{ item.name }}</h4>
                        <p>slot_{{ item.slot }} - v{{ item.version }}</p>
                        <v-icon class="ma-2" x-large color="red">mdi-close-outline</v-icon>
                    </v-card>
                </v-row>
            </v-card-text>

            <v-card-title align="left" class="mt-3">Debug zone</v-card-title>
            <v-card-text>
                <v-switch class="ma-2" v-model=autorefresh label="Autorefresh" @click=apply_autorefresh></v-switch>
                <v-btn color="error" @click="set_game_state('playing')" :disabled="game_state == 'playing'">
                    Force game start
                </v-btn>
                <p>{{ game_state }}</p>
            </v-card-text>

            <v-card-actions>
                <v-btn text @click="$emit('form_back', true)">
                    Back
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="fetch_module_configuration(); is_fetching = true" text>
                    Refresh
                </v-btn>
                <v-btn
                    :disabled="(to_remove_modules.length != 0 || conn_modules.length != 0 || not_conn_modules.length != 0) && (done_modules.length != 0)"
                    @click="set_game_state('playing'); form_continue()" text>
                    Continue
                </v-btn>
            </v-card-actions>
        </v-card>

        <v-dialog v-model=show_dialog width="unset">
            <component :is=current_component :current_slot=current_slot :autorefresh=autorefresh
                @hide_dialog="show_dialog = false"></component>
        </v-dialog>
    </v-container>
</template>


<script lang="ts">
import Vue from "vue"
import client from "@/api-client"
import NoCaseFoundComponent from "./modules/NoCaseFoundComponent.vue"
import NoClockFoundComponent from "./modules/NoClockFoundComponent.vue"
import CaseV1Component from "./modules/CaseV1Component.vue"
import ClockV1Component from "./modules/ClockV1Component.vue"
import SimonSaysV1Component from "./modules/SimonSaysV1Component.vue"
import WiresV1Component from "./modules/WiresV1Component.vue"

const components = {
    NoCaseFoundComponent,
    NoClockFoundComponent,
    CaseV1Component,
    ClockV1Component,
    SimonSaysV1Component,
    WiresV1Component
}

type module = {
    name: string,
    slot: number,
    version: number,
    configuration_target_reached: number
}

export default Vue.extend({
    name: "OverviewComponent",

    components,

    data: () => ({
        is_fetching: true,
        is_sending: false,
        fetcher: undefined as number | undefined,
        autorefresh: true,

        current_component: undefined as typeof components[keyof typeof components] | undefined,
        current_slot: 0,
        show_dialog: false,
        done_modules: [] as Array<module>,
        conn_modules: [] as Array<module>,
        not_conn_modules: [] as Array<string>,
        to_remove_modules: [] as Array<module>,
        game_state: undefined as string | undefined
    }),
    methods: {
        fetch_module_configuration() {
            let tmp_done_modules = [] as Array<module>
            let tmp_conn_modules = [] as Array<module>
            let tmp_not_conn_modules = [] as Array<string>
            let tmp_to_remove_modules = [] as Array<module>

            const push_to_arr = (module: module) => {
                if (module.configuration_target_reached) {
                    tmp_done_modules.push(module)
                } else {
                    tmp_conn_modules.push(module)
                }
            }

            //// this.current_component = undefined
            //// this.show_dialog = false

            client.get("/api/play/config")
                .then((response) => {
                    let target_modules = response.data

                    client.get("/api/connected-modules")
                        .then((response) => {

                            let rsp_conn_modules = response.data

                            //todo use array in api...
                            let modules_arr = [{ name: rsp_conn_modules.slot_0.name, slot: 0, version: rsp_conn_modules.slot_0.version, configuration_target_reached: rsp_conn_modules.slot_0.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_1.name, slot: 1, version: rsp_conn_modules.slot_1.version, configuration_target_reached: rsp_conn_modules.slot_1.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_2.name, slot: 2, version: rsp_conn_modules.slot_2.version, configuration_target_reached: rsp_conn_modules.slot_2.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_3.name, slot: 3, version: rsp_conn_modules.slot_3.version, configuration_target_reached: rsp_conn_modules.slot_3.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_4.name, slot: 4, version: rsp_conn_modules.slot_4.version, configuration_target_reached: rsp_conn_modules.slot_4.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_5.name, slot: 5, version: rsp_conn_modules.slot_5.version, configuration_target_reached: rsp_conn_modules.slot_5.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_6.name, slot: 6, version: rsp_conn_modules.slot_6.version, configuration_target_reached: rsp_conn_modules.slot_6.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_7.name, slot: 7, version: rsp_conn_modules.slot_7.version, configuration_target_reached: rsp_conn_modules.slot_7.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_8.name, slot: 8, version: rsp_conn_modules.slot_8.version, configuration_target_reached: rsp_conn_modules.slot_8.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_9.name, slot: 9, version: rsp_conn_modules.slot_9.version, configuration_target_reached: rsp_conn_modules.slot_9.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_10.name, slot: 10, version: rsp_conn_modules.slot_10.version, configuration_target_reached: rsp_conn_modules.slot_10.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_11.name, slot: 11, version: rsp_conn_modules.slot_11.version, configuration_target_reached: rsp_conn_modules.slot_11.configuration_target_reached } as module,
                            { name: rsp_conn_modules.slot_12.name, slot: 12, version: rsp_conn_modules.slot_12.version, configuration_target_reached: rsp_conn_modules.slot_12.configuration_target_reached } as module]

                            const _case = modules_arr.find(v => v.name == "Case")
                            const _clock = modules_arr.find(v => v.name == "ClockModule")

                            if (!_case) {
                                this.current_component = NoCaseFoundComponent
                                this.show_dialog = true
                                return
                            }
                            if (!_clock) {
                                this.current_component = NoClockFoundComponent
                                this.show_dialog = true
                                return
                            }

                            push_to_arr(_case)
                            push_to_arr(_clock)

                            modules_arr = modules_arr.filter(v => (v != _case && v != _clock))

                            modules_arr.forEach(module => {
                                if (target_modules.includes(module.name)) {
                                    target_modules.splice(target_modules.indexOf(module.name), 1)
                                    push_to_arr(module)
                                } else if (module.name != "not_connected") {
                                    tmp_to_remove_modules.push(module)
                                }
                            })

                            target_modules.forEach((module: string) => {
                                tmp_not_conn_modules.push(module)
                            })

                            this.done_modules = tmp_done_modules
                            this.conn_modules = tmp_conn_modules
                            this.not_conn_modules = tmp_not_conn_modules
                            this.to_remove_modules = tmp_to_remove_modules
                        })
                        .catch((e: Error) => {
                            alert(e)
                        })
                })
                .catch((e: Error) => {
                    alert(e)
                }).finally(() => {
                    this.is_fetching = false
                })
        },
        show_component_dialog(name: string, slot: number, version: number) {
            console.log(slot)
            this.current_slot = slot
            this.show_dialog = true
            if (name == "Case" && version == 1) {
                this.current_component = CaseV1Component
            }
            else if (name == "ClockModule" && version == 1) {
                this.current_component = ClockV1Component

            }
            else if (name == "SimonSays" && version == 1) {
                this.current_component = SimonSaysV1Component
            }
            else if (name == "Wires" && version == 1) {
                this.current_component = WiresV1Component
            }
            else {
                this.show_dialog = false
            }
        },
        apply_autorefresh() {
            if (this.autorefresh)
                this.fetcher = setInterval(() => {
                    this.fetch_module_configuration()
                    this.fetch_game_state()
                }, 2000)
            else
                clearInterval(this.fetcher)
        },
        set_game_state(state: string) {
            this.is_sending = true
            client.put(`/api/play/SetGameState`, {
                "gamemode": state
            }).then((response) => {
                this.game_state = response.data.gamemode
            }).catch((e: Error) => {
                alert(e)
            }).finally(() => {
                this.is_sending = false
            })
        },
        form_continue() {
            //todo create next page with countdown
            // this.$emit("form_continue", true)
        },
        fetch_game_state() {
            client.get(`/api/play/SetGameState`)
                .then((response) => {
                    this.game_state = response.data.gamemode
                })
                .catch((e: Error) => {
                    alert(e)
                }).finally(() => {
                    this.is_fetching = false
                })
        }
    },

    beforeDestroy() {
        clearInterval(this.fetcher)
        this.set_game_state("test_idle")
    },
    mounted() {
        this.fetch_module_configuration()
        this.apply_autorefresh()
        this.set_game_state("setup")
    },
    watch: {
        show_dialog: function (newValue, _) {
            if (!newValue) {
                this.current_component = undefined
            }
        }
    }
})
</script>
