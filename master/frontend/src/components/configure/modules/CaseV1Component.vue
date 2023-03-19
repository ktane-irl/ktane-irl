<template>
    <v-card class="mx-auto" max-width="300" :loading="is_fetching">
        <v-card-title>Case v1 - slot_{{ current_slot }}</v-card-title>
        <div v-if="config?.caseTarget.ports.Parallel">
            <v-subheader>Ports</v-subheader>
            <v-card-text align="center">
                <v-caption class="font-weight-bold font-weight-black">Parallel port</v-caption>
                <v-img src="@/assets/ports/parallel.png" alt="parallel port" max-height="30" contain>
                </v-img>
                <!-- other ports are not valid for case v1 -->
            </v-card-text>
        </div>
        <v-subheader v-else>No Ports</v-subheader>
        <v-subheader>Batteries</v-subheader>
        <v-card-text>
            <v-row>
                <v-col v-for="(item, i) in config?.caseTarget.batteries" :key="i">
                    <v-chip class="ma-2">
                        <v-icon v-if="item" class="ma-2" color="primary">mdi-battery-heart-variant</v-icon>
                        <v-icon v-else class="ma-2">mdi-battery-remove-outline</v-icon>
                    </v-chip>
                    <v-icon v-if="config?.caseState.batteries[i] == item" class="ml-2" color="green">mdi-check</v-icon>
                    <v-icon v-else class="ml-2" color="red">mdi-close</v-icon>
                </v-col>
            </v-row>
        </v-card-text>
        <v-subheader>Serial number</v-subheader>
        <v-card-text align="center" class="font-weight-bold font-weight-black">{{
            config?.caseTarget.serialNumber
        }}</v-card-text>
        <v-subheader>Indicator Text</v-subheader>
        <v-card-text>
            <v-chip class="ma-2" v-for="(item, i) in config?.caseTarget.indicatorText" :key="i">{{ item }}</v-chip>
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
    props: {
        current_slot: Number,
        autorefresh: Boolean
    },
    name: "CaseComponent",
    data: () => ({
        is_fetching: false,
        fetcher: undefined as number | undefined,
        config: undefined as { caseState: CaseConfiguration, caseTarget: CaseConfiguration } | undefined,
    }),
    methods: {
        fetch_config() {
            client.get(`/api/play/config/Case/1/${this.current_slot}`)
                .then((response) => {
                    this.config = response.data
                })
                .catch((e: Error) => {
                    alert(e)
                }).finally(() => {
                    this.is_fetching = false
                })
        }
    },
    mounted() {
        this.is_fetching = true
        this.fetch_config()
        if (this.autorefresh)
            this.fetcher = setInterval(() => {
                this.fetch_config()
            }, 500)
    },
    beforeDestroy() {
        clearInterval(this.fetcher)
    }
})
</script>
