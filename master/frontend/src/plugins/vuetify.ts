import Vue from "vue"
import Vuetify from "vuetify/lib/framework"

Vue.use(Vuetify)

export default new Vuetify({
    theme: {
        dark: false,
        themes: {
            light: {
                secondary: "#EEEEEE"
            },
            dark: {
                secondary: "#424242"
            }
        },
    }
})
