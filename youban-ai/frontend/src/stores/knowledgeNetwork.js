import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getKnowledgeNetwork, updateKnowledgeNode } from '@/api/knowledgeNetwork'

export const useKnowledgeNetworkStore = defineStore('knowledgeNetwork', () => {
  const nodes = ref([])
  const edges = ref([])
  const stats = ref(null)
  const loading = ref(false)

  async function fetchNetwork() {
    loading.value = true
    try {
      const res = await getKnowledgeNetwork()
      if (res.code === 0) {
        nodes.value = res.data.nodes
        edges.value = res.data.edges
        stats.value = res.data.stats
      }
    } finally { loading.value = false }
  }

  async function updateNode(nodeName, masteryLevel, status) {
    const res = await updateKnowledgeNode({ nodeName, masteryLevel, status })
    if (res.code === 0) await fetchNetwork()
    return res
  }

  return { nodes, edges, stats, loading, fetchNetwork, updateNode }
})
