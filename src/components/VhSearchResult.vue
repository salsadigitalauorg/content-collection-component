<template>
  <div class="vh-search-result">
    <div class="vh-search-result__title-bar">
      <rpl-icon v-if="icon" class="vh-search-result__title-icon" :symbol="icon" color="primary" />
      <rpl-link class="vh-search-result__link" v-if="title" :href="link.linkUrl">
        <h2 class="vh-search-result__heading">{{ title }}</h2>
      </rpl-link>
    </div>
    <div v-if="subTop" class="vh-search-result__sub-top">{{ subTop }}</div>
    <div v-if="summary" class="vh-search-result__summary" v-html="summary"></div>
    <div v-if="subBottom" class="vh-search-result__sub-bottom">{{ subBottom }}</div>
  </div>
</template>

<script>
import RplLink from '@dpc-sdp/ripple-link'
import { RplIcon } from '@dpc-sdp/ripple-icon'

export default {
  name: 'VhSearchResult',
  props: {
    icon: String,
    title: String,
    link: Object,
    subTop: String,
    summary: String,
    subBottom: String
  },
  components: {
    RplLink,
    RplIcon
  }
}
</script>

<style lang="scss">
  @import "~@dpc-sdp/ripple-global/scss/settings";
  @import "~@dpc-sdp/ripple-global/scss/tools";

  $vh-search-result-heading-text-color: rpl-color('primary') !default;
  $vh-search-result-summary-text-color: rpl-color('extra_dark_neutral') !default;
  $vh-search-result-sub-bottom-text-color: rpl-color('secondary') !default;

  $vh-search-result-heading-ruleset: (
    'xs': ('l', 1.2em, 'bold'),
    's': ('xl', 1em, 'bold')
  ) !default;
  $vh-search-result-summary-ruleset: (
    'xs': ('xs', 1.43em, 'regular'),
    's': ('s', 1.5em, 'regular')
  ) !default;
  $vh-search-result-sub-bottom-ruleset: (
    'xs': ('xs', 1em, 'medium'),
    's': ('xs', 1.2em, 'medium')
  ) !default;

  .vh-search-result {
    padding-bottom: $rpl-space-4;

    &__title-bar {
      display: flex;
      margin-bottom: $rpl-space-4;
    }

    &__title-icon {
      margin-right: $rpl-space-3;
    }

    &__heading {
      @include rpl_typography_ruleset($vh-search-result-heading-ruleset);
      color: $vh-search-result-heading-text-color;
      max-width: $rpl-content-max-width;
      margin: 0;
    }

    &__link {
      color: $vh-search-result-heading-text-color;
      word-wrap: break-word;
    }

    &__summary {
      @include rpl_typography_ruleset($vh-search-result-summary-ruleset);
      color: $vh-search-result-summary-text-color;
      max-width: $rpl-content-max-width;
      padding-bottom: $rpl-space-4;
    }

    &__sub-bottom {
      @include rpl_typography_ruleset($vh-search-result-sub-bottom-ruleset);
      color: $vh-search-result-sub-bottom-text-color;
    }
  }
</style>
