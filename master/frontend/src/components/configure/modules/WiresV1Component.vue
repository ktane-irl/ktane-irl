<template>
    <v-card class="mx-auto" max-width="600" :loading="is_fetching">
        <v-card-title>Wires v1 - slot_{{ current_slot }}</v-card-title>
        <v-card-text>
            <div v-for="(item, i) in config?.wiresTarget.wiresColor" :key="i">
                <!-- todo convert to config? -->
                <v-row class="ma-0">
                    <v-img :src="require('@/assets/wires/' + wireColor[item] + '.svg')" height="40"></v-img>
                    <v-icon v-if="config?.wiresState.wiresColor[i] == item" class="ml-2"
                        color="green">mdi-check</v-icon>
                    <v-icon v-else class="ml-2" color="red">mdi-close</v-icon>
                </v-row>
            </div>
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
import { WiresConfiguration, wireColor } from "@/../../common/types/modules/questModules/wires"

export default Vue.extend({
    name: "WiresV1Component",
    props: {
        current_slot: Number,
        autorefresh: Boolean
    },
    data: () => ({
        is_fetching: false,
        fetcher: undefined as number | undefined,
        config: undefined as { wiresState: WiresConfiguration, wiresTarget: WiresConfiguration } | undefined,
        wireColor,
    }),
    methods: {
        fetch_config() {
            client.get(`/api/play/config/Wires/1/${this.current_slot}`)
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
