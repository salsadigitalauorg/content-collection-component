<template>
  <div id="app">
    <content-collection :schema="schema" />
  </div>
</template>

<script>
import ContentCollection from './components/ContentCollection.vue'

export default {
  name: 'App',
  components: {
    ContentCollection
  },
  data () {
    return {
      schema: {
        title: "hello world!",
        description: "Desc",
        callToAction: { text: 'View all', url: 'text' }
      }
    }
  }
}
</script>
