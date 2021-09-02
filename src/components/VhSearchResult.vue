<template>
  <div class="vh-search-result">
    <rpl-link :href="link.linkUrl">
      <h2 class="vh-search-result__heading">{{ title }}</h2>
    </rpl-link>

    <div class="vh-search-result__sub-top">{{ subTop }}</div>
    <div class="vh-search-result__summary" v-html="summary"></div>
    <div class="vh-search-result__sub-bottom">{{ subBottom }}</div>

    <ul class="vh-search-result__terms" v-if="tags">
      <li class="vh-search-result__term" v-for="(tag, index) in tags" :key="index">
        <rpl-meta-tag :linkText="tag.linkText" :linkUrl="tag.linkUrl" />
      </li>
    </ul>
  </div>
</template>

<script>
import RplLink from '@dpc-sdp/ripple-link'
import RplMetaTag from '@dpc-sdp/ripple-meta-tag'

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
    RplLink,
    RplMetaTag
  }
}
</script>

<style lang="scss">
  @import "~@dpc-sdp/ripple-global/scss/settings";
  @import "~@dpc-sdp/ripple-global/scss/tools";

  $vh-search-result-term-margin: 0 $rpl-space-2 $rpl-space-2 0 !default;
  $vh-search-result-terms-margin-xs: ($rpl-space * 6) 0 0 !default;
  $vh-search-result-terms-margin-m: $rpl-space 0 0 !default;
  $vh-search-result-terms-margin-l: ($rpl-space * 7) 0 0 !default;
  $vh-search-result-link-ruleset: ('s', 1.25em, 'medium') !default;
  $vh-search-result-link-text-color: rpl-color('primary') !default;
  $vh-search-result-heading-text-color: rpl-color('extra_dark_neutral') !default;
  $vh-search-result-heading-ruleset: (
    'xs': ('l', 1.2em, 'bold'),
    's': ('xl', 1em, 'bold')
  ) !default;
  $vh-search-result-summary-ruleset: (
    'xs': ('xs', 1.43em, 'regular'),
    's': ('s', 1.5em, 'regular')
  ) !default;
  $vh-search-result-date-summary-text-color: rpl-color('extra_dark_neutral') !default;
  $vh-search-result-date-ruleset: (
    'xs': ('xs', 1.43em, 'medium'),
    's': ('s', 1.5em, 'medium')
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
    }

    &__link {
      @include rpl_typography_ruleset($vh-search-result-link-ruleset);
      color: $vh-search-result-link-text-color;
      word-wrap: break-word;
    }

    &__summary {
      @include rpl_typography_ruleset($vh-search-result-summary-ruleset);
      color: $vh-search-result-date-summary-text-color;
      max-width: $rpl-content-max-width;
      padding-bottom: $rpl-space-4;
    }

    &__terms {
      padding: 0;
      list-style: none;
      margin: $vh-search-result-terms-margin-xs;
      @include rpl_breakpoint('m') {
        margin: $vh-search-result-terms-margin-m;
      }
      @include rpl_breakpoint('l') {
        margin: $vh-search-result-terms-margin-l;
      }
    }

    &__term {
      display: inline-block;
      margin: $vh-search-result-term-margin;
    }
  }
</style>
