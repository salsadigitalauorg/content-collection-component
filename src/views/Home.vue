<template>
  <div>
    <div class="controls">
      <div class="controls__inner">
        <div class="controls__left">
          <label>
            <span>elasticsearch:</span>
            <textarea v-model="customES"></textarea>
          </label>
          <label>
            <span>Environment:</span>
            <textarea v-model="customEnvironment"></textarea>
          </label>
        </div>
        <div class="controls__right">
          <label>
            <span>Schema:</span>
            <textarea v-model="customSchema"></textarea>
          </label>
        </div>
      </div>
      <button @click="updateSchema">Update Schema</button>
    </div>
    <div class="display">
      <content-collection v-if="schema" :schema="schema" :environment="environment" :key="count"/>
    </div>
  </div>
</template>

<script>
import ContentCollection from '../components/ContentCollection.vue'
import defaultSchema from '../config/default-schema.json'
import defaultEnvironment from '../config/default-environment.json'
import defaultES from '../config/default-es.json'

export default {
  name: 'App',
  components: {
    ContentCollection
  },
  data () {
    return {
      customES: JSON.stringify(defaultES, null, 2),
      customEnvironment: JSON.stringify(defaultEnvironment, null, 2),
      customSchema: JSON.stringify(defaultSchema, null, 2),
      environment: null,
      schema: null,
      count: 0
    }
  },
  methods: {
    updateSchema () {
      const es = JSON.parse(this.customES)
      if (es) {
        this.$tideSearchApi.setParams(es)
      }
      const environment = JSON.parse(this.customEnvironment)
      if (environment) {
        this.environment = environment
      }
      const schema = JSON.parse(this.customSchema)
      if (schema) {
        this.schema = schema
      }
      this.count++
    }
  },
  mounted () {
    this.updateSchema()
  }
}
</script>

<style lang="scss">
.controls {
  background-color: lightgrey;
  padding: 22px;

  &__inner {
    @media screen and (min-width: 768px) {
      display: flex;
      width: 100%;
    }
  }

  &__left,
  &__right {
    width: 100%;
    @media screen and (min-width: 768px) {
      width: 50%;
    }
  }

  textarea {
    box-sizing: border-box;
    width: 100%;
    font-family: monospace;
  }

  &__left {
    textarea {
      height: 150px;
    }
  }

  &__right {
    textarea {
      height: 325px;
    }
  }
}
.display {
  padding: 22px;
}
</style>
