<script lang="ts">
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'HighlightChars',
  props: {
    str: { type: String, required: true },
    indices: { type: Object as PropType<Set<number>>, required: true },
  },
  render() {
    const chars = Array.from(this.str)
    return chars.map((ch, i) =>
      this.indices.has(i) ? h('b', { key: i }, ch) : ch,
    )
  },
})
</script>
