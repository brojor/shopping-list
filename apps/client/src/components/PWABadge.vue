<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { computed, ref } from 'vue'

// check for updates every hour
const period = 60 * 60 * 1000

const swActivated = ref(false)

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(swUrl: string, r: ServiceWorkerRegistration) {
  if (period <= 0)
    return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine)
      return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200)
      await r.update()
  }, period)
}

const { needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisteredSW(swUrl, r) {
    if (period <= 0)
      return
    if (r?.active?.state === 'activated') {
      swActivated.value = true
      registerPeriodicSync(swUrl, r)
    }
    else if (r?.installing) {
      r.installing.addEventListener('statechange', (e) => {
        const sw = e.target as ServiceWorker
        swActivated.value = sw.state === 'activated'
        if (swActivated.value)
          registerPeriodicSync(swUrl, r)
      })
    }
  },
})

const title = computed(() => {
  if (needRefresh.value)
    return 'New content available, click on reload button to update.'
  return ''
})

function close() {
  needRefresh.value = false
}
</script>

<template>
  <div
    v-if="needRefresh"
    class="fixed bottom-0 right-0 z-10 grid m-4 border border-gray-400/30 rounded bg-white p-3 text-left shadow-lg"
    aria-labelledby="toast-message"
    role="alert"
  >
    <div class="mb-2">
      <span id="toast-message">
        {{ title }}
      </span>
    </div>
    <div class="flex">
      <button type="button" class="mr-1 block border border-gray-400/30 rounded px-2.5 py-1 outline-none" @click="updateServiceWorker()">
        Reload
      </button>
      <button type="button" class="mr-1 border border-gray-400/30 rounded px-2.5 py-1 outline-none" @click="close">
        Close
      </button>
    </div>
  </div>
</template>
