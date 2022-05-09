<template>
  <div>
    <div class="controls" :class="{
      'controls--fullscreen': fullscreen,
      'controls--minimal': !fullscreen,
    }">
      <div class="controls__top">
        <button
          class="controls__fullscreen-btn"
          @click="toggleFullscreen"
        >
          <span v-if="!fullscreen">Fullscreen</span>
          <span v-if="fullscreen">Minimize</span>
        </button>
        <button
          class="controls__tab-btn"
          :class="{ 'controls__tab-btn--selected': tab === 1 }"
          @click="tab = 1"
        >Configuration</button>
        <button
          class="controls__tab-btn"
          :class="{ 'controls__tab-btn--selected': tab === 2 }"
          @click="tab = 2"
        >Reference schema</button>
      </div>
      <div class="controls__tab" v-if="tab === 1">
        <div class="controls__grid">
          <div class="controls__left">
            <div class="controls__editor controls__editor--half">
              <label>
                <span>Elasticsearch config:</span>
                <prism-editor class="code-editor" v-model="customES" :highlight="highlighter" line-numbers></prism-editor>
              </label>
            </div>
            <div class="controls__editor controls__editor--half">
              <label>
                <span>Environment config:</span>
                <prism-editor class="code-editor" v-model="customEnvironment" :highlight="highlighter" line-numbers></prism-editor>
              </label>
            </div>
          </div>
          <div class="controls__right">
            <div class="controls__editor">
              <label>
                <span>Schema config:</span>
                <prism-editor class="code-editor" v-model="customSchema" :highlight="highlighter" line-numbers></prism-editor>
              </label>
            </div>
          </div>
        </div>
        <div class="controls__bottom">
          <button class="controls__apply" @click="updateSchema">Apply configuration</button>
          <label class="controls__presets">
            <span>Presets:</span>
            <select v-model="selectedPreset" @change="changePreset">
              <option v-for="(preset, key) in presets" :key="key" :value="preset.value">{{ preset.label }}</option>
            </select>
          </label>
        </div>
      </div>
      <div class="controls__tab" v-if="tab === 2">
        <div class="controls__full-inner">
          <div class="controls__editor">
            <label>
              <span>Reference:</span>
              <prism-editor class="code-editor" v-model="validationSchema" :highlight="highlighter" line-numbers :readonly="true"></prism-editor>
            </label>
          </div>
        </div>
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

// Default Schemas
import defaultEnvironment from '../config/default-environment.json'
import defaultES from '../config/default-es.json'

import vicgovauFilters from '../config/vicgovau-filters.json'
import vicgovauList from '../config/vicgovau-list.json'
import vicgovauSearch from '../config/vicgovau-search.json'
import vicgovauExtras from '../config/vicgovau-extras.json'

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
    const defaultPreset = 'vicgovau_list'
    const presetData = {
      "vicgovau_list": {
        "es": JSON.stringify(defaultES, null, 2),
        "env": JSON.stringify(defaultEnvironment, null, 2),
        "schema": JSON.stringify(vicgovauList, null, 2)
      },
      "vicgovau_filters": {
        "es": JSON.stringify(defaultES, null, 2),
        "env": JSON.stringify(defaultEnvironment, null, 2),
        "schema": JSON.stringify(vicgovauFilters, null, 2)
      },
      "vicgovau_search": {
        "es": JSON.stringify(defaultES, null, 2),
        "env": JSON.stringify(defaultEnvironment, null, 2),
        "schema": JSON.stringify(vicgovauSearch, null, 2)
      },
      "vicgovau_extras": {
        "es": JSON.stringify(defaultES, null, 2),
        "env": JSON.stringify(defaultEnvironment, null, 2),
        "schema": JSON.stringify(vicgovauExtras, null, 2)
      }
    };
    return {
      presetData,
      customES: presetData[defaultPreset].es,
      customEnvironment: presetData[defaultPreset].env,
      customSchema: presetData[defaultPreset].schema,
      validationSchema: JSON.stringify(validationSchema, null, 2),
      environment: null,
      schema: null,
      count: 0,
      tab: 1,
      fullscreen: false,
      presets: [
        { label: 'List - Cards / No filters', value: 'vicgovau_list' },
        { label: 'Filters - Cards / Custom Filter', value: 'vicgovau_filters' },
        { label: 'Search - Results / Aggregation', value: 'vicgovau_search' },
        { label: 'Extras - Custom Results', value: 'vicgovau_extras' },
      ],
      selectedPreset: defaultPreset
    }
  },
  methods: {
    toggleFullscreen () {
      this.fullscreen = !this.fullscreen
    },
    changePreset () {
      this.customES = this.presetData[this.selectedPreset].es
      this.customEnvironment = this.presetData[this.selectedPreset].env
      this.customSchema = this.presetData[this.selectedPreset].schema
      this.updateSchema()
    },
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
  $root: &;
  background-color: grey;
  padding: 4px;

  &--fullscreen {
    position: fixed;
    z-index: 1;
    top: 12px;
    bottom: 12px;
    left: 12px;
    right: 12px;
    box-shadow: 0 0 16px #333;
    #{$root}__grid {
      height: calc(100% - 46px);
    }
    #{$root}__left,
    #{$root}__right {
      width: 100%;
    }
    #{$root}__right {
      height: calc(100vh - 265px);
    }
    #{$root}__left {
      display: flex;

      #{$root}__editor {
        width: 50%;
        height: 173px;

        &:nth-child(2) {
          padding-left: 2px;
        }
      }
    }
    #{$root}__full-inner {
      height: calc(100vh - 60px);
    }
  }

  &--minimal {
    #{$root}__grid {
      background-color: white;
      @media screen and (min-width: 768px) {
        display: flex;
        width: 100%;
        height: 330px;
      }
    }
    #{$root}__left,
    #{$root}__right {
      width: 100%;
      @media screen and (min-width: 768px) {
        width: 50%;
      }
    }
    #{$root}__left {
      height: 324px;
    }
    #{$root}__right {
      padding-left: 2px;
      height: 324px;
    }
    #{$root}__full-inner {
      height: 330px;
    }
  }

  &__fullscreen-btn {
    float: right;
  }

  .code-editor {
    background: white;
    font-family: monospace;
    font-size: 12px;
    line-height: 1.4em;
    box-sizing: border-box;
    width: 100%;
    height: calc(100% - 22px);
  }

  &__editor {
    height: 100%;

    &--half {
      height: 50%;
    }
  }

  &__tab {
    width: 100%;
    background-color: white;
  }

  &__tab-btn {
    border: 1px;
    background-color: grey;
    padding: 4px;

    &--selected {
      background-color: white;
    }
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    background-color: lightgrey;
  }

  &__presets {
    select {
      width: 300px;
    }
  }

  &__right {
    padding-left: 2px;
  }
}
.display {
  padding: 22px;
}
</style>
