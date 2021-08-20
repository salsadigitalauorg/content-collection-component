<template>
  <div class="rpl-content-collection-select">
    <label v-if="label" class="rpl-content-collection-select__label">{{ label }}</label>
    <rpl-select
      class="rpl-content-collection-select__select"
      :state="selected"
      :values="values || []"
      :config="config"
      @rpl-select-update="update"
    ></rpl-select>
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
          return typeof v === 'object' &&
            v.hasOwnProperty('label') &&
            v.hasOwnProperty('value')
        })
      }
    },
    value: {
      type: [Object, Array]
    }
  },
  computed: {
    selected () {
      const match = this.options.find(o => isEqual(o.value, this.value))
      if (match) {
        return `${kebabCase(match.label)}`
      }
    },
    values () {
      return this.options.map(o => {
        return {
          id: `${kebabCase(o.label)}`,
          name: o.label
        }
      })
    }
  },
  methods: {
    update (val) {
      const match = this.values.find(v => v.id === val)
      if (match) {
        this.selected = match.id
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
$sort-select-width-m: 15rem;
$sort-select-width-xs: 100%;
.rpl-content-collection-select {
  display: flex;
  align-items: center;
  &__label {
    @include rpl_typography_ruleset($sort-label-ruleset);
    margin-right: $rpl-space-3;
    width: 20%;
    @include rpl_breakpoint('m') {
      width: auto;
      min-width: 5rem;
    }
  }
  &__select {
    width: $sort-select-width-xs;
    @include rpl_typography_ruleset($rpl-form-text-ruleset);

    @include rpl_breakpoint('m') {
      min-width: $sort-select-width-m;
    }
    .rpl-select__trigger {
      padding: $rpl-space-3;
    }
  }
}
</style>
