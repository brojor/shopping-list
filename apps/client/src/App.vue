<script setup lang="ts">
import { Fzf } from 'fzf'
import { computed, onMounted, ref } from 'vue'
import HighlightChars from './components/HighlightChars.vue'
import PWABadge from './components/PWABadge.vue'

interface CatalogItem {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

let fzf = new Fzf([] as CatalogItem[], {
  selector: (item: CatalogItem) => item.name,
})

const query = ref('')
const results = computed(() => fzf.find(query.value))
const actualListId = ref(0)

const shoppingList = ref<CatalogItem[]>([])

async function getCatalogItems() {
  const response = await fetch('/api/catalog')
  const data = await response.json() as CatalogItem[]
  return data
}

async function initShoppingList() {
  const response = await fetch('/api/lists')
  const data = await response.json() as { id: number }[]

  if (!data.length) {
    const response = await fetch('/api/lists', {
      method: 'POST',
    })
    const data = await response.json() as { id: number }
    actualListId.value = data.id
  }
  else {
    actualListId.value = data[data.length - 1].id
  }
}

async function updateCatalog() {
  const data = await getCatalogItems()
  fzf = new Fzf(data, {
    selector: (item: CatalogItem) => item.name,
  })
}

onMounted(async () => {
  await initShoppingList()

  const data = await fetch(`/api/lists/${actualListId.value}/items`)
  shoppingList.value = await data.json() as CatalogItem[]

  updateCatalog()
})

async function addCatalogItem(item: CatalogItem) {
  const response = await fetch(`/api/lists/${actualListId.value}/items`, {
    method: 'POST',
    body: JSON.stringify({ catalogId: item.id }),
  })
  const data = await response.json() as CatalogItem[]
  shoppingList.value = data
  query.value = ''
}

async function addCustomItem() {
  const response = await fetch(`/api/lists/${actualListId.value}/items`, {
    method: 'POST',
    body: JSON.stringify({ name: query.value }),
  })
  const data = await response.json() as CatalogItem[]
  shoppingList.value = data
  updateCatalog()
  query.value = ''
}
</script>

<template>
  <div class="mx-auto h-full max-w-md flex flex-col py-4 text-neutral-200">
    <div class="mb-4 text-center">
      <h1 class="text-2xl text-indigo-700 font-bold">
        Nákupní seznam
      </h1>
    </div>
    <input v-model="query" name="query" type="text" class="m-auto block h-14 max-w-md w-full rounded-full bg-[#262626] px-6 outline-none" @keyup.enter="addCatalogItem(results[0].item)">
    <ul class="mt-4">
      <template v-if="query.length > 0">
        <li v-for="(res, idx) in results" :key="res.item.name" class="bg-[#262626] p-2" :class="{ 'bg-indigo-700/20': idx === 0 }" @click="addCatalogItem(res.item)">
          <HighlightChars :str="res.item.name" :indices="res.positions" />
        </li>
        <li class="cursor-pointer bg-[#262626] p-2 text-indigo-500" @click="addCustomItem">
          + {{ query }}
        </li>
      </template>
    </ul>
    <ul class="mt-4 flex-1">
      <li v-for="item in shoppingList" :key="item.name" class="bg-[#262626] p-2">
        {{ item.name }}
      </li>
    </ul>
  </div>
  <PWABadge />
</template>

<style>
#app {
  background-color: #1E1E1E;
  height: 100dvh;
}

b {
  color: rgb(67 56 202);
}
</style>
