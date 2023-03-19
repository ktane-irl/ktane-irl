<template>
    <v-col align="center" justify="center">
        <component :is="current_component" @form_continue="form_continue" @form_back="form_back"></component>
    </v-col>
</template>

<script lang="ts">
import Vue from "vue"
import StartComponent from "@/components/configure/StartComponent.vue"
import OverviewComponent from "@/components/configure/OverviewComponent.vue"

const components = {
    StartComponent,
    OverviewComponent
}

export default Vue.extend({
    name: "ConfigureView",
    components,

    data: () => ({
        current_component: StartComponent as typeof components[keyof typeof components]
    }),
    methods: {
        form_continue() {
            switch (this.current_component) {
                case StartComponent:
                    this.current_component = OverviewComponent
                    break
            }
            console.log(this.current_component)
        },
        form_back() {
            switch (this.current_component) {
                case OverviewComponent:
                    this.current_component = StartComponent
                    break
            }
        }
    }
})
</script>
