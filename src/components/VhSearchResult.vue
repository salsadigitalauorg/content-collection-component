<template>
  <div>
    <h2>{{ title }}</h2>
    <ul>
      <li>{{ icon }}</li>
      <li>{{ date }}</li>
      <li>{{ subTop }}</li>
      <li>{{ summary }}</li>
      <li>{{ subBottom }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    icon: String,
    title: String,
    date: String,
    subTop: String,
    summary: String,
    subBottom: String
  }
}
</script>