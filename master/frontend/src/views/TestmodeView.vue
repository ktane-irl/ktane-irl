<template>
    <v-container>
        <v-col align="center" justify="center">

            <v-alert border="left" colored-border type="info" max-width="600" elevation="2">
                Let's test your modules. You can see all the currently connected modules below. Select one to continue.
            </v-alert>

            <v-card :loading=is_fetching max-width="600">
                <v-card-title>Settings</v-card-title>
                <v-switch class="ma-2" v-model=autorefresh label="Autorefresh" @click=apply_autorefresh></v-switch>
                <v-card-title>Connected modules</v-card-title>
                <v-list :two-line=true :flat=true :rounded=true>
                    <v-list-item-group color="primary">
                        <v-list-item v-for="(item, i) in connected_modules" :key="i"
                            @click="show_component_dialog(item.name, item.version, +i.substring(5))">
                            <v-list-item-content>
                                <v-list-item-title v-if="item.name != 'not_connected'"
                                    v-html="item.name"></v-list-item-title>
                                <v-list-item-subtitle
                                    v-html="'<span class=\'text--primary\'>' + i + '</span> &mdash; v' + item.version">
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-card>
        </v-col>

        <v-tooltip top>
            <template v-slot:activator="{ on }">
                <v-btn v-on="on" color="primary" @click="is_fetching = true; fetch_connected_modules()" fixed bottom
                    right fab>
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
            </template>
            <span>Refresh connected modules</span>
        </v-tooltip>

        <v-dialog v-model=show_dialog width="unset">
            <component :is=current_component :current_slot=current_slot :autorefresh=autorefresh
                @hide_dialog="show_dialog = false">
            </component>
        </v-dialog>
    </v-container>
</template>


<script lang="ts">
import Vue from "vue"
import client from "@/api-client"
import DummyVersionComponent from "../components/testmode/DummyVersionComponent.vue"
import CaseV1Component from "../components/testmode/CaseV1Component.vue"
import ClockV1Component from "../components/testmode/ClockV1Component.vue"
import WiresV1Component from "../components/testmode/WiresV1Component.vue"
import SimonSaysV1Component from "../components/testmode/SimonSaysV1Component.vue"
import MazesV1Component from "../components/testmode/MazesV1Component.vue"

const components = {
    DummyVersionComponent,
    CaseV1Component,
    ClockV1Component,
    WiresV1Component,
    SimonSaysV1Component,
    MazesV1Component
}

export default Vue.extend({
    name: "TestmodeView",

    components,

    data: () => ({
        is_fetching: false,
        fetcher: undefined as number | undefined,
        autorefresh: true,

        show_dialog: false,
        current_component: undefined as typeof components[keyof typeof components] | undefined,

        current_slot: 42,
        connected_modules: {
            slot_0: {
                name: "Case",
                version: -1,
                configuration_target_reached: false
            },
        }
    }),

    methods: {
        fetch_connected_modules() {
            client.get("/api/connected-modules")
                .then((response) => {
                    this.connected_modules = response.data
                })
                .catch((e: Error) => {
                    alert(e)
                }).finally(() => {
                    this.is_fetching = false
                })
        },
        show_component_dialog(name: string, version: number, slot: number) {
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
            else if (name == "Mazes" && version == 1) {
                this.current_component = MazesV1Component
            }
            else {
                this.current_component = DummyVersionComponent
            }
        },
        apply_autorefresh() {
            if (this.autorefresh)
                this.fetcher = setInterval(() => {
                    this.fetch_connected_modules()
                }, 500)
            else
                clearInterval(this.fetcher)
        }
    },
    beforeDestroy() {
        clearInterval(this.fetcher)
    },
    mounted() {
        this.fetch_connected_modules()
        this.apply_autorefresh()
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
