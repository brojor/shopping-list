<script setup lang="ts">
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { watch } from 'vue'

interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  extensions: [StarterKit.configure({
    link: {
      openOnClick: false,
    },
  })],
  content: props.modelValue,
  onUpdate: () => {
    if (!editor.value)
      return

    // HTML
    emit('update:modelValue', editor.value.getHTML())

    // JSON
    // emit('update:modelValue', editor.value.getJSON())
  },
})

watch(() => props.modelValue, (value) => {
  if (!editor.value)
    return

  // HTML
  const isSame = editor.value.getHTML() === value

  // JSON
  // const isSame = JSON.stringify(editor.value.getJSON()) === JSON.stringify(value)

  if (isSame) {
    return
  }

  editor.value.commands.setContent(value)
})
</script>

<template>
  <EditorContent :editor="editor" />
</template>
