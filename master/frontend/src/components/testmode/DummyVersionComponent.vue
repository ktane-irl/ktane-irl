<template>
    <v-card class="mx-auto" max-width="500" :loading="is_sending || is_fetching" :disabled="is_sending">
        <v-col>
            <v-row>
                <v-card-title>Dummy v1 - slot_{{ current_slot }}</v-card-title>
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

            <v-subheader>Dummy</v-subheader>
            <v-card-text>
                Lorem ipsum
            </v-card-text>
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
//todo import { DummyConfiguration } from "@/../../common/types/modules/dummy"

type DummyConfiguration = {
    statusLed: {
        red: boolean
        green: boolean
    }
}

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

        config: {
            statusLed: {
                "red": false,
                "green": false
            }
        } as DummyConfiguration | undefined
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
        fetch_config() {
            //todo
            // client.get(`/api/Dummy/1/${this.current_slot}`)
            //     .then((response) => {
            //         this.config = response.data
            //     })
            //     .catch((e: Error) => {
            //         alert(e)
            //     }).finally(() => {
            //         this.is_fetching = false
            //     })
        },
        send_config() {
            //todo
            // if (this.config) {
            //     client.put(`/api/Dummy/1/${this.current_slot}`, {
            //         dummy_config: this.config
            //     }).then((response) => {
            //         this.config = response.data
            //         if (this.config != undefined && this.config.statusLed == undefined) {
            //             this.config.statusLed = {
            //                 red: false,
            //                 green: false
            //             }
            //             this.send_config()
            //         }
            //     }).catch((e: Error) => {
            //         alert(e)
            //     }).finally(() => {
            //         this.is_sending = false
            //     })
            // }
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
