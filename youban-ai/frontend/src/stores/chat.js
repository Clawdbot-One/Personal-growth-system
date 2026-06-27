import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const sessions = ref([
    { id: 's1', title: '优势解读咨询', date: '2026-06-27', messages: [
      { role: 'assistant', content: '你好！我是你的专属AI成长助手。我可以帮你解读优势报告、拆解成长目标、分析成长瓶颈，也可以在你感到迷茫时陪你聊聊。今天想和我聊什么？', time: '10:00' },
      { role: 'user', content: '我想了解一下我的优势测评结果，能帮我解读一下吗？', time: '10:01' },
      { role: 'assistant', content: '当然可以！根据你的测评结果，你的TOP5核心优势是：\n\n1. **战略思维**：你善于从宏观角度分析问题，能够预见未来趋势，制定长远规划。这是非常宝贵的能力，建议在职业发展中多承担需要前瞻性思考的工作。\n\n2. **学习能力**：你拥有强烈的好奇心和快速吸收新知识的能力。建议持续保持学习节奏，将学到的知识及时输出和实践。\n\n3. **责任担当**：你是一个可靠的人，对自己承诺的事情高度负责。这让你在团队中非常值得信赖。\n\n4. **沟通表达**：你善于清晰表达想法，能够有效影响他人。建议多争取公开表达的机会。\n\n5. **适应力**：面对变化时你能保持灵活，快速调整。这在当前快速变化的环境中非常关键。\n\n你觉得这些解读符合你的实际情况吗？想深入聊聊哪个优势？', time: '10:02' },
      { role: 'user', content: '很符合！我想知道如何更好地发挥"战略思维"这个优势', time: '10:03' },
      { role: 'assistant', content: '很好的问题！发挥"战略思维"优势，可以从以下几个方面入手：\n\n**日常工作中：**\n- 主动参与项目规划和决策讨论\n- 在做任何任务前，先花5分钟构思整体框架\n- 定期做行业趋势分析，培养前瞻性视角\n\n**刻意练习：**\n- 每周做一次"未来推演"练习：预测3个可能发生的变化，并制定应对策略\n- 阅读战略类书籍（推荐《好战略，坏战略》）\n- 参与策略类游戏或模拟经营\n\n**避坑提醒：**\n- 战略思维强的人有时会"想太多而做太少"，记得平衡思考与行动\n- 不是所有决策都需要完美方案，有时"够好就行"\n\n要不要我帮你制定一个发挥战略思维优势的30天行动计划？', time: '10:04' },
    ]},
    { id: 's2', title: '目标拆解咨询', date: '2026-06-26', messages: [
      { role: 'assistant', content: '你好！有什么成长相关的问题想和我聊聊吗？', time: '14:30' },
      { role: 'user', content: '我想提升演讲能力，但不知道怎么开始', time: '14:31' },
      { role: 'assistant', content: '提升演讲能力是一个很好的目标！根据你的优势画像（沟通表达是你的核心优势之一），你已经有很好的基础。\n\n让我帮你拆解一下：\n\n**第一阶段（第1-2周）：基础准备**\n- 每天朗读10分钟，练习发音和语速\n- 录制3分钟自我介绍视频，观察自己的表现\n- 阅读《演讲的力量》前3章\n\n**第二阶段（第3-6周）：小范围练习**\n- 每周在朋友面前做一次5分钟演讲\n- 加入Toastmasters俱乐部\n- 学习演讲结构：开场-主体-结尾\n\n**第三阶段（第7-12周）：实战提升**\n- 争取在公司/学校做一次公开分享\n- 录制演讲视频并复盘改进\n- 向优秀演讲者学习\n\n要不要我帮你把这些任务添加到成长计划中？', time: '14:32' },
    ]},
  ])
  const currentSessionId = ref('s1')

  const currentSession = () => sessions.value.find(s => s.id === currentSessionId.value)

  function switchSession(id) {
    currentSessionId.value = id
  }

  function sendMessage(content) {
    const session = sessions.value.find(s => s.id === currentSessionId.value)
    if (!session) return
    session.messages.push({
      role: 'user',
      content,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    })
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        '这是一个很好的问题！让我从你的优势画像出发来分析...',
        '我理解你的感受。成长过程中遇到瓶颈是很正常的，重要的是我们如何突破它。',
        '基于你的情况，我建议从以下几个方面来思考...',
        '你的优势在这方面可以发挥很大作用。让我具体说说...',
        '感谢你的信任！根据积极心理学的研究，我建议你尝试...',
      ]
      session.messages.push({
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      })
    }, 1500)
  }

  function newSession() {
    const id = 's' + Date.now()
    sessions.value.unshift({
      id,
      title: '新对话',
      date: new Date().toISOString().split('T')[0],
      messages: [{
        role: 'assistant',
        content: '你好！我是你的专属AI成长助手，有什么可以帮你的吗？',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }],
    })
    currentSessionId.value = id
  }

  return { sessions, currentSessionId, currentSession, switchSession, sendMessage, newSession }
})