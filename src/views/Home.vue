<template>
  <div>
    <div class="controls">
      <div class="controls__inner">
        <div class="controls__left">
          <label>
            <span>Elasticsearch config:</span>
            <prism-editor class="code-editor" v-model="customES" :highlight="highlighter" line-numbers></prism-editor>
          </label>
          <label>
            <span>Environment config:</span>
            <prism-editor class="code-editor" v-model="customEnvironment" :highlight="highlighter" line-numbers></prism-editor>
          </label>
        </div>
        <div class="controls__right">
          <label>
            <span>Schema config:</span>
            <prism-editor class="code-editor" v-model="customSchema" :highlight="highlighter" line-numbers></prism-editor>
          </label>
        </div>
      </div>
      <button @click="updateSchema">Apply configuration</button>
      <button
        class="controls__show-schema"
        :class="{ 'controls__show-schema--expanded': viewSchema}"
        @click="viewSchema = !viewSchema"
      >{{ viewSchema ? 'hide' : 'show' }} reference schema</button>
      <div  v-if="viewSchema">
        <label>
          <span>Reference:</span>
          <prism-editor class="code-editor" v-model="validationSchema" :highlight="highlighter" line-numbers :readonly="true"></prism-editor>
        </label>
      </div>
    </div>
    <div class="display">
      <content-collection v-if="schema" :schema="schema" :environment="environment" :key="count"/>
    </div>
  </div>
</template>

<script>
import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-json'
import 'prismjs/themes/prism-coy.css'

import ContentCollection from '../components/ContentCollection.vue'
import defaultSchema from '../config/default-schema.json'
import defaultEnvironment from '../config/default-environment.json'
import defaultES from '../config/default-es.json'

const Ajv = require("ajv")
const ajv = new Ajv({ allErrors: true })
import validationSchema from '../validation/schema.json'

export default {
  name: 'App',
  components: {
    PrismEditor,
    ContentCollection
  },
  data () {
    return {
      customES: JSON.stringify(defaultES, null, 2),
      customEnvironment: JSON.stringify(defaultEnvironment, null, 2),
      customSchema: JSON.stringify(defaultSchema, null, 2),
      validationSchema: JSON.stringify(validationSchema, null, 2),
      environment: null,
      schema: null,
      count: 0,
      viewSchema: false
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

      try {
        const schema = JSON.parse(this.customSchema)
        const validate = ajv.compile(validationSchema)
        const isValid = validate(schema)
        if (isValid) {
          this.schema = schema
          this.count++
        } else {
          this.printError(validate.errors)
        }
      } catch (e) {
        alert(e)
      }
    },
    highlighter(code) {
      return highlight(code, languages.json); // returns html
    },
    printError(errors) {
      console.log(errors)
      const errorMsg = errors.map(e => {
        const path = e.instancePath || 'root'
        const sPath = e.schemaPath
        const msg = e.message
        const params = Object.keys(e.params).map(key => `${key}: ${e.params[key]}`)
        return `${path} -> ${sPath}:\n\t${msg}\n\t\t${params}`
      }).join('\n')
      alert(errorMsg)
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

  &__show-schema {
    float: right;
    background-color: transparent;
    border: 0;
    text-decoration: underline;

    &::after {
      content: ' ↓'
    }

    &--expanded {
      &::after {
        content: ' ↑'
      }
    }
  }

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

  .code-editor {
    background: white;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.4em;
    box-sizing: border-box;
    width: 100%;
  }

  &__left {
    .code-editor {
      height: 150px;
    }
  }

  &__right {
    padding-left: 2px;
    .code-editor {
      height: 324px;
    }
  }
}
.display {
  padding: 22px;
}
</style>
