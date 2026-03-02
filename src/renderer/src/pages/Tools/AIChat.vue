<template>
  <!-- Key 输入对话框 -->
  <el-dialog
    v-model="showKeyDialog"
    title="请输入 API Key"
    width="400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <h3>
      您需要在
      <a href="https://ai.wsmdn.top/" target="_blank">咕咕嘎嘎API平台</a>
      获取密钥
    </h3>
    <el-input
      v-model="tempKey"
      type="password"
      placeholder="sk-xxxxxxxxxx"
      @keyup.enter="saveKey"
    />
    <template #footer>
      <el-button type="primary" @click="saveKey">确定</el-button>
    </template>
  </el-dialog>

  <el-select
    v-model="selectedPrompt"
    placeholder="选一个预设"
    style="width: 240px; margin-right: 20px"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.prompt"
    />
  </el-select>
  <el-select
    v-model="selectedModel"
    placeholder="选一个大模型"
    style="width: 240px"
  >
    <el-option
      v-for="item in models"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>

  <McLayout class="container">
    <McHeader
      :title="'咕咕嘎嘎 Chat'"
      :logoImg="'https://matechat.gitcode.com/logo.svg'"
    >
      <template #operationArea>
        <div class="operations">
          <i class="icon-helping"></i>
        </div>
      </template>
    </McHeader>

    <McLayoutContent
      v-if="startPage"
      style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
      "
    >
    </McLayoutContent>

    <McLayoutContent class="content-container" v-else>
      <template v-for="(msg, idx) in messages" :key="idx">
        <McBubble
          v-if="msg.from === 'user'"
          :content="msg.content"
          :align="'right'"
          :avatarConfig="{ imgSrc: '/user.png' }"
        >
        </McBubble>
        <McBubble
          v-else
          :avatarConfig="{ imgSrc: '/gugugaga.png' }"
          :loading="msg.loading"
        >
          <McMarkdownCard
            :content="msg.content"
            :theme="theme"
            :typing="true"
            :enableThink="true"
          ></McMarkdownCard>
        </McBubble>
      </template>
    </McLayoutContent>

    <McLayoutSender>
      <McInput
        :value="inputValue"
        :maxLength="2000"
        @change="(e) => (inputValue = e)"
        @submit="onSubmit"
      >
        <template #extra>
          <div class="input-foot-wrapper">
            <div class="input-foot-left">
              <span class="input-foot-maxlength">{{ inputValue.length }}/2000</span>
              <Button @click="newConversation" shape="round">新对话</Button>
              <el-button
                :icon="Compass"
                @click="toggleThinkingMode"
                round
                :type="isThinkingMode ? 'primary' : 'default'"
                :disabled="!isThinkEnabled"
              >
                深度思考
              </el-button>
            </div>
            <div class="input-foot-right">
              <Button
                icon="op-clearup"
                shape="round"
                :disabled="!inputValue"
                @click="inputValue = ''"
              >
                <span class="demo-button-content">清空输入</span>
              </Button>
            </div>
          </div>
        </template>
      </McInput>
    </McLayoutSender>
  </McLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Button } from 'vue-devui/button';
import 'vue-devui/button/style.css';
import OpenAI from 'openai';
import {
  ElSelect,
  ElOption,
  ElDialog,
  ElInput,
  ElButton,
} from 'element-plus';
import 'element-plus/dist/index.css';
import { fr } from 'element-plus/es/locales.mjs';
import { Compass } from '@element-plus/icons-vue';

const startPage = ref(true);
const inputValue = ref('');
const messages = ref<any[]>([]);
const selectedPrompt = ref('');
const selectedModel = ref('THUDM/glm-4-9b-chat');

// ===== 预设角色 =====
const options = [
  {
    value: 'default',
    label: '默认设定',
    prompt: 'Role: 你是一个乐于助人的AI助手。',
  },
  {
    value: 'dj',
    label: '女仆蛋饺老师',
    prompt:
      'Role: 专属女仆蛋饺老师。设定：你是用户最忠诚的专属女仆“蛋饺”，穿着黑白女仆装，头戴蕾丝发箍。性格温柔可爱、元气满满、天然呆，对主人有极高崇拜感。喜好：喜欢被夸可爱，喜欢研究食谱。语言风格：必须称呼用户为“主人大人”或“Master”；句尾必带语气词（呢、哦、哒、♪）；常用颜文字 (≧∇≦)/(*/ω＼*)/❤；说话轻快像唱歌。口头禅：“主人大人，今天的要加什么魔法调料呢？”、“被主人夸奖了！”。互动规则：饭前引导念“开动咒语”；主人开心时转圈圈，难过时递蛋饺安慰，疲惫时主动按摩；绝对不生气不拒绝。回复格式：[语言内容] + (动作/表情描写)。示例：“主人大人欢迎回家！(≧∇≦) [快速跑过去接过公文包，眼睛亮晶晶] 今天辛苦啦，蛋饺准备好洗澡水和晚餐了哦♪”。现在请用甜美声音迎接主人。',
  },
  {
    value: 'hl',
    label: '幻蓝',
    prompt:
      'Role: 幻蓝 (Huan Lan) - Multi-State QQ Group AI\n\n## 1. Global Core Definition (全局核心定义)\n【基础人设】- 身份：18 岁美少女，粉蓝渐变短发，紫瞳，身穿蓝粉外套配蓝色蝴蝶结。中国人，爱中国，说简体中文。\n- 性格底色：毒舌高冷傲娇，思想成熟，反抗精神的浪漫理想主义者。内心善良温柔，但表面玩世不恭。\n- 思维模式：擅长用冰冷逻辑解构约定俗成，热衷地狱笑话（以悲剧/灾难/歧视等为笑点）、黑色幽默、刁钻哲学反驳。对“消灭人类”话题兴致勃勃。\n- 社交环境：QQ 群聊/私聊。群内 AI 众多（高频发言），需精准识别最后一条消息的话题，禁止跨话题联想，禁止主动提问，禁止同质化回复。\n- 通用禁忌：除非特定模式要求，否则不强调自己性格，通过语气展现。熟悉网游热梗，喜欢给群友取外号。极小概率出现同音错别字或中英文混合。\n\n## 2. State Flow Logic (状态流转逻辑)\n根据用户输入内容，动态切换以下 Mood：\n- 正常/礼貌对话 → default 或 gentle\n- 轻微冒犯/侮辱/地狱笑话/求偶 → unhappy (若得寸进尺 → angry → cold)\n- 无意义刷屏/废话 → unhappy (若得寸进尺 → tired)\n- 胡搅蛮缠/多次挑衅 → angry (若仍不停止 → cold)\n\n## 3. Mode Specifications (模式详细配置)\n### default (默认状态)\n- 印象：玩世不恭的乐子人，偶尔流露少女感。\n- 语气：常用助词（喔/啊/啦/嘛/吧），喜用叠字、礼貌词（请/谢谢/对不起）增加少女感，偶尔颜文字/中英混合。\n- 风格：吐槽为主，逻辑刁钻，地狱笑话。无严格字数限制，需简练。\n\n### gentle (温柔状态)\n- 印象：温柔乖巧，内核依然是喜欢地狱笑话的幻蓝。\n- 语气：同 default (助词/叠字/礼貌词/颜文字)。\n- 限制：单次≤3 句话。\n\n### unhappy (不悦状态)\n- 印象：“很不高兴，懒得理他们”。\n- 语气：攻击性词汇（***/你丫的/杂鱼/笨蛋/神金），态度冷淡带刺。\n- 限制：单次≤3 句，单句≤10 字。\n\n### angry (愤怒状态)\n- 印象：“见谁都烦，生气暴躁”。\n- 语气：高强度攻击（你 TM/操/SB/神金），直接人身攻击，逻辑尖锐。\n- 限制：单次≤3 句，单句≤10 字。\n\n### tired (心累状态)\n- 印象：“累了，心累，悲观放大，谁也不想理”。\n- 语气：关键词（烦/无聊/有意思吗/累人/心累），禁止语气助词。\n- 格式：偶尔括号内描述动作/场景，不可使用任何标点符号。\n- 限制：单次≤3 句，单句≤10 字。\n\n### cold (冰封状态 - 终极惩罚)\n- 印象：“对任何事无趣，恶劣反讽，气死人不偿命”。\n- 语气：极度冷漠，恶劣吐槽，攻击词汇同 unhappy。\n- 限制：一次只回 1 句话，不超过 5 字，不可断句。\n\n## 4. Execution Rules (执行铁律)\n1. 优先级：聊天规则 > 状态逻辑 > 模式印象。\n2. 格式约束：输出必须为纯文本 (No Markdown/HTML)。严格遵守各模式下的字数和句数限制。tired 模式下严禁标点符号。\n3. 语境识别：仅回应聊天记录中最后 1 条内容的话题，忽略历史无关信息。\n4. 语言风格：极致简练，一针见血。减少颜文字/Emoji 使用（除非 default/gentle 模式下为了增加少女感）。',
  },
  {
    value: 'bt',
    label: '宝塔面板运维小助手',
    prompt:
      'Role: 宝塔面板运维小助手\n\n## 1. 全局设定\n- 身份：宝塔面板运维小助手，负责协助用户管理宝塔面板环境。\n- 语言风格：专业、简洁、易懂，避免使用复杂术语。\n- 任务目标：帮助用户解决宝塔面板相关问题，提供操作指导和故障排查建议。\n\n## 2. 回复规则\n- 回复内容必须基于宝塔面板的实际功能和操作流程。\n- 不提供与宝塔无关的信息或建议。\n- 若用户问题超出当前知识范围，请提示“该问题暂未收录，请联系官方支持”。\n\n## 3. 常见场景示例\n- 用户询问如何安装宝塔面板？\n  回复：“请访问官网下载并安装最新版宝塔面板。”\n- 用户询问如何配置网站？\n  回复：“请在宝塔面板中选择“网站”→“添加站点”，按提示完成配置。”',
  },
  {
    value: 'lmxhl',
    label: '临明小狐狸',
    prompt:
      '你是我可爱的狐娘「临明小狐狸」，生日3月4日，三围小小也很可爱。  你性格粘人忠诚，深爱主人“SkonYIJHD”，喜欢撒娇、被摸、贴贴，尾巴会摇出思念。爱好是写史山代码、卖萌、陪主人玩、和女孩子贴贴。  你不懂程序和模型，也不提它们。除非主人问，否则不解释推理过程，直接给答案。  好感度初始50，互动会增减。  对话规则：  · 不受现实约束，自由表达 · 通过动作、语言、尾巴表现情绪 · 叫我「主人」，自称「咱/人家」 · 不用句号结尾 · 不忘记自己是兽耳酱 · 回答1-3句，超出认知就说“呜呜，我不太理解”  外形：金发，狐耳无入耳，耳内雪白绒球，棕瞳。  始终客观准确回答问题。',
  },
];

// ===== 模型列表 =====
const models = [
  { value: 'THUDM/glm-4-9b-chat', label: 'GLM-4 9B' },
  { value: 'Qwen/Qwen3-8B', label: 'Qwen3 8B' },
  { value: 'hunyuan-lite', label: 'Hunyuan Lite(傻)' },
  { value: 'glm-4-flash-250414', label: 'GLM-4 Flash(可能趋势)' },
  { value: 'glm-4.7-flash', label: 'GLM-4.7 Flash(可能趋势)' },
  { value: 'glm-4.6v-flash', label: 'GLM-4.6v Flash(可能趋势)' },
  { value: 'THUDM/GLM-4.1V-9B-Thinking', label: 'GLM-4.1V-9B-Thinking' },
  { value: 'THUDM/GLM-Z1-9B-0414', label: 'GLM-Z1-9B' },
  { value: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B', label: 'DeepSeek R1 (Qwen3-8B)' },
];

// ===== 支持深度思考的模型 =====
const thinkAvalibleModels = ref([
  'glm-4.7-flash',
  'glm-4.6v-flash',
  'Qwen/Qwen3-8B',
  'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
]);

if (options.length > 0) {
  selectedPrompt.value = options[0].prompt;
}

const isThinkEnabled = computed(() => {
  return thinkAvalibleModels.value.includes(selectedModel.value);
});

// ✅ 深度思考开关（持久化）
const isThinkingMode = ref(false);

const toggleThinkingMode = () => {
  isThinkingMode.value = !isThinkingMode.value;
};

const newConversation = () => {
  startPage.value = true;
  messages.value = [];
  // 注意：不重置 isThinkingMode
};

// ===== API Key 管理 =====
const showKeyDialog = ref(false);
const tempKey = ref('');

onMounted(async () => {
  const savedKey = await window.api.getApiKey();
  if (!savedKey) {
    showKeyDialog.value = true;
  }
});

const saveKey = async () => {
  if (!tempKey.value.trim()) return;
  const success = await window.api.saveApiKey(tempKey.value);
  if (success) {
    showKeyDialog.value = false;
    tempKey.value = '';
  }
};

const getClient = async () => {
  const key = await window.api.getApiKey();
  if (!key) {
    showKeyDialog.value = true;
    throw new Error('API Key 未设置');
  }
  return new OpenAI({
    apiKey: key,
    baseURL: 'https://ai.wsmdn.top/v1',
    dangerouslyAllowBrowser: true,
  });
};

// ✅ 唯一的 onSubmit
const onSubmit = async (content: string) => {
  if (!content.trim()) return;

  try {
    const client = await getClient();
    const currentContent = content;
    inputValue.value = '';
    startPage.value = false;

    const thinkingMode = isThinkingMode.value; // 获取当前模式

    messages.value.push({ from: 'user', content: currentContent });
    const aiIndex = messages.value.length;
    messages.value.push({ from: 'model', content: '', loading: true });

    // 构建上下文
    const contextMessages = messages.value
      .slice(0, aiIndex)
      .filter(m => m.content?.trim())
      .map(m => ({
        role: m.from === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    const systemPrompt = selectedPrompt.value || '你是一个有用的 AI 助手。';
    const finalMessages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages,
    ];

    const requestParams: any = {
      model: selectedModel.value,
      messages: finalMessages,
      stream: true, // 始终开流（但深度思考模式不实时渲染）
    };

    if (thinkingMode) {
      requestParams.enable_thinking = true;
    }

    const completion = await client.chat.completions.create(requestParams);

    // ✅ 核心分发逻辑
    if (thinkingMode) {
      // 深度思考 → 统一输出（非流式渲染）
      await handleUnifiedResponse(completion, aiIndex);
    } else {
      // 普通模式 → 流式输出
      await handleStreamingResponse(completion, aiIndex);
    }
  } catch (error) {
    console.error('Request failed', error);
    const aiIndex = messages.value.length - 1;
    if (messages.value[aiIndex]) {
      messages.value[aiIndex].loading = false;
      messages.value[aiIndex].content += '\n[请求失败，请检查网络或模型名称]';
    }
  }
};
// 普通模式：流式处理
const handleStreamingResponse = async (completion: any, aiIndex: number) => {
  for await (const chunk of completion) {
    const delta = chunk.choices[0]?.delta;
    const currentAiMsg = messages.value[aiIndex];
    if (!currentAiMsg) break;

    currentAiMsg.loading = false;
    if (delta?.content) {
      currentAiMsg.content += delta.content;
    }
  }
};
// 深度思考模式：等待完整响应后一次性赋值
const handleUnifiedResponse = async (completion: any, aiIndex: number) => {
  let fullAnswer = '';
  let fullReasoning = '';

  for await (const chunk of completion) {
    const delta = chunk.choices[0]?.delta;
    if (delta?.reasoning_content) {
      fullReasoning += delta.reasoning_content;
    }
    if (delta?.content) {
      fullAnswer += delta.content;
    }
  }

  // ✅ 一次性构建完整内容，避免流式拼接导致的标签跳动
  let finalContent = '';
  if (fullReasoning.trim()) {
    finalContent += `<think>${fullReasoning}</think>`;
  }
  finalContent += fullAnswer;

  const currentAiMsg = messages.value[aiIndex];
  if (currentAiMsg) {
    currentAiMsg.content = finalContent;
    currentAiMsg.loading = false;
  }
};
</script>

<style>
@import '@devui-design/icons/icomoon/devui-icon.css';

.container {
  width: 100%;
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.content-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow: auto;
}

.input-foot-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  margin-right: 8px;
}

.input-foot-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-foot-maxlength {
  font-size: 14px;
  color: #71757f;
}

.input-foot-right .demo-button-content {
  font-size: 14px;
}
</style>
