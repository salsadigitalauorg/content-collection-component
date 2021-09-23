<template>
  <div class="vh-search-result">
    <rpl-link :href="link.linkUrl">
      <h2 class="vh-search-result__heading">{{ title }}</h2>
    </rpl-link>
    <div class="vh-search-result__sub-top">{{ subTop }}</div>
    <div class="vh-search-result__summary" v-html="summary"></div>
    <div class="vh-search-result__sub-bottom">{{ subBottom }}</div>
  </div>
</template>

<script>
import RplLink from '@dpc-sdp/ripple-link'

export default {
  name: 'VhSearchResult',
  props: {
    title: String,
    link: Object,
    date: String,
    summary: String,
    tags: Array,
    icon: String,
    subTop: String,
    subBottom: String
  },
  components: {
    RplLink
  }
}
</script>

<style lang="scss">
  @import "~@dpc-sdp/ripple-global/scss/settings";
  @import "~@dpc-sdp/ripple-global/scss/tools";

  $vh-search-result-link-ruleset: ('s', 1.25em, 'medium') !default;
  $vh-search-result-link-text-color: rpl-color('primary') !default;
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
    'xs': ('xs', 1em, 'regular'),
    's': ('xs', 1.2em, 'regular')
  ) !default;

  .vh-search-result {
    padding-bottom: $rpl-space-4;

    @include rpl_breakpoint('m') {
      padding-bottom: $rpl-space-4 * 2;
    }

    &__heading {
      @include rpl_typography_ruleset($vh-search-result-heading-ruleset);
      color: $vh-search-result-heading-text-color;
      max-width: $rpl-content-max-width;
      margin: $rpl-space-4 0;
    }

    &__link {
      @include rpl_typography_ruleset($vh-search-result-link-ruleset);
      color: $vh-search-result-link-text-color;
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
