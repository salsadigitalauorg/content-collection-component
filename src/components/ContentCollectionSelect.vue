<template>
  <div class="rpl-content-collection-select">
    <label v-if="label" class="rpl-content-collection-select__label">{{ label }}</label>
    <rpl-select
      class="rpl-content-collection-select__select"
      :state="componentState"
      :values="componentValues"
      :config="config"
      @rpl-select-update="update"
    />
  </div>
</template>

<script>
import { RplSelect } from '@dpc-sdp/ripple-form'
import { kebabCase, isEqual } from 'lodash'

export default {
  components: { RplSelect },
  name: 'rpl-content-collection-select',
  props: {
    label: String,
    config: { type: Object, default: () => { fieldId: 'search-sort' }},
    options: {
      type: Array,
      validator: value => {
        return value.every(v => {
          return (typeof v === 'object' && v.hasOwnProperty('label') && v.hasOwnProperty('value'))
        })
      }
    },
    value: {
      type: [Object, Array, Number, String]
    }
  },
  data () {
    const initialState = this.options.find(o => isEqual(o.value, this.value))
    return {
      selectedValue: this.value,
      componentState: initialState ? `${kebabCase(initialState.label)}` : ''
    }
  },
  computed: {
    componentValues () {
      if (Array.isArray(this.options)) {
        return this.options.map(o => ({id: `${kebabCase(o.label)}`, name: o.label }))
      } else {
        return []
      }
    }
  },
  methods: {
    update (val) {
      const match = this.componentValues.find(v => v.id === val)
      if (match) {
        this.componentState = match.id
        const option = this.options.find(o => o.label === match.name)
        this.$emit('change', option.value)
      }
    }
  }
}
</script>

<style lang="scss">
@import "~@dpc-sdp/ripple-global/style";
@import "~@dpc-sdp/ripple-form/scss/form";

$sort-label-ruleset: ('s', 1em, 'bold');

.rpl-content-collection-select {
  &__label {
    @include rpl_typography_ruleset($sort-label-ruleset);
  }
}
</style>
