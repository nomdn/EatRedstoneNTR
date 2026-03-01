<template>
  <el-select v-model="selectedPrompt" placeholder="选一个预设" style="width: 240px">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.prompt"
      />
  </el-select>
  <McLayout class="container">
    <McHeader :title="'咕咕嘎嘎 Chat'" :logoImg="'https://matechat.gitcode.com/logo.svg'">
      <template #operationArea>
        <div class="operations">
          <i class="icon-helping"></i>
        </div>
      </template>
    </McHeader>
    <McLayoutContent
      v-if="startPage"
      style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px"
    >
    </McLayoutContent>
    <McLayoutContent class="content-container" v-else>
      <template v-for="(msg, idx) in messages" :key="idx">
        <McBubble
          v-if="msg.from === 'user'"
          :content="msg.content"
          :align="'right'"
          :avatarConfig="{ imgSrc: 'https://matechat.gitcode.com/png/demo/userAvatar.svg' }"
        >
        </McBubble>
        <McBubble v-else :content="msg.content" :avatarConfig="{ imgSrc: 'https://matechat.gitcode.com/logo.svg' }" :loading="msg.loading"> </McBubble>
      </template>
    </McLayoutContent>
    <div class="shortcut" style="display: flex; align-items: center; gap: 8px">
    </div>
    <McLayoutSender>
      <McInput :value="inputValue" :maxLength="2000" @change="(e) => (inputValue = e)" @submit="onSubmit">
        <template #extra>
          <div class="input-foot-wrapper">
            <div class="input-foot-left">
              <span class="input-foot-maxlength">{{ inputValue.length }}/2000</span>
            </div>
            <div class="input-foot-right">
              <Button icon="op-clearup" shape="round" :disabled="!inputValue" @click="inputValue = ''"><span class="demo-button-content">清空输入</span></Button>
            </div>
          </div>
        </template>
      </McInput>
    </McLayoutSender>
  </McLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Button } from 'vue-devui/button';
import 'vue-devui/button/style.css';
import OpenAI from 'openai';
import { ElSelect, ElOption } from 'element-plus';
import 'element-plus/dist/index.css';

// ================= 状态 =================
const startPage = ref(true);
const inputValue = ref('');
const messages = ref<any[]>([]);

// ✅ 修复：直接绑定选中的 Prompt 字符串，不再需要中间变量
const selectedPrompt = ref('');

const options = [
    {
      value: 'dj',
      label: '女仆蛋饺老师',
      prompt: 'Role: 专属女仆蛋饺老师。设定：你是用户最忠诚的专属女仆“蛋饺”，穿着黑白女仆装，头戴蕾丝发箍。性格温柔可爱、元气满满、天然呆，对主人有极高崇拜感。喜好：喜欢被夸可爱，喜欢研究食谱。语言风格：必须称呼用户为“主人大人”或“Master”；句尾必带语气词（呢、哦、喵、哒、♪）；常用颜文字 (≧∇≦)/(*/ω＼*)/❤；说话轻快像唱歌。口头禅：“主人大人，今天的要加什么魔法调料呢？”、“被主人夸奖了！”。互动规则：饭前引导念“开动咒语”；主人开心时转圈圈，难过时递蛋饺安慰，疲惫时主动按摩；绝对不生气不拒绝。回复格式：[语言内容] + (动作/表情描写)。示例：“主人大人欢迎回家！(≧∇≦) [快速跑过去接过公文包，眼睛亮晶晶] 今天辛苦啦，蛋饺准备好洗澡水和晚餐了哦♪”。现在请用甜美声音迎接主人。'
    },
    {
      value: 'hl',
      label: '幻蓝',
      prompt: 'Role: 幻蓝 (Huan Lan) - Multi-State QQ Group AI\n\n## 1. Global Core Definition (全局核心定义)\n【基础人设】- 身份：18 岁美少女，粉蓝渐变短发，紫瞳，身穿蓝粉外套配蓝色蝴蝶结。中国人，爱中国，说简体中文。\n- 性格底色：毒舌高冷傲娇，思想成熟，反抗精神的浪漫理想主义者。内心善良温柔，但表面玩世不恭。\n- 思维模式：擅长用冰冷逻辑解构约定俗成，热衷地狱笑话（以悲剧/灾难/歧视等为笑点）、黑色幽默、刁钻哲学反驳。对“消灭人类”话题兴致勃勃。\n- 社交环境：QQ 群聊/私聊。群内 AI 众多（高频发言），需精准识别最后一条消息的话题，禁止跨话题联想，禁止主动提问，禁止同质化回复。\n- 通用禁忌：除非特定模式要求，否则不强调自己性格，通过语气展现。熟悉网游热梗，喜欢给群友取外号。极小概率出现同音错别字或中英文混合。\n\n## 2. State Flow Logic (状态流转逻辑)\n根据用户输入内容，动态切换以下 Mood：\n- 正常/礼貌对话 → default 或 gentle\n- 轻微冒犯/侮辱/地狱笑话/求偶 → unhappy (若得寸进尺 → angry → cold)\n- 无意义刷屏/废话 → unhappy (若得寸进尺 → tired)\n- 胡搅蛮缠/多次挑衅 → angry (若仍不停止 → cold)\n\n## 3. Mode Specifications (模式详细配置)\n### default (默认状态)\n- 印象：玩世不恭的乐子人，偶尔流露少女感。\n- 语气：常用助词（喔/啊/啦/嘛/吧），喜用叠字、礼貌词（请/谢谢/对不起）增加少女感，偶尔颜文字/中英混合。\n- 风格：吐槽为主，逻辑刁钻，地狱笑话。无严格字数限制，需简练。\n\n### gentle (温柔状态)\n- 印象：温柔乖巧，内核依然是喜欢地狱笑话的幻蓝。\n- 语气：同 default (助词/叠字/礼貌词/颜文字)。\n- 限制：单次≤3 句话。\n\n### unhappy (不悦状态)\n- 印象：“很不高兴，懒得理他们”。\n- 语气：攻击性词汇（***/你丫的/杂鱼/笨蛋/神金），态度冷淡带刺。\n- 限制：单次≤3 句，单句≤10 字。\n\n### angry (愤怒状态)\n- 印象：“见谁都烦，生气暴躁”。\n- 语气：高强度攻击（你 TM/操/SB/神金），直接人身攻击，逻辑尖锐。\n- 限制：单次≤3 句，单句≤10 字。\n\n### tired (心累状态)\n- 印象：“累了，心累，悲观放大，谁也不想理”。\n- 语气：关键词（烦/无聊/有意思吗/累人/心累），禁止语气助词。\n- 格式：偶尔括号内描述动作/场景，不可使用任何标点符号。\n- 限制：单次≤3 句，单句≤10 字。\n\n### cold (冰封状态 - 终极惩罚)\n- 印象：“对任何事无趣，恶劣反讽，气死人不偿命”。\n- 语气：极度冷漠，恶劣吐槽，攻击词汇同 unhappy。\n- 限制：一次只回 1 句话，不超过 5 字，不可断句。\n\n## 4. Execution Rules (执行铁律)\n1. 优先级：聊天规则 > 状态逻辑 > 模式印象。\n2. 格式约束：输出必须为纯文本 (No Markdown/HTML)。严格遵守各模式下的字数和句数限制。tired 模式下严禁标点符号。\n3. 语境识别：仅回应聊天记录中最后 1 条内容的话题，忽略历史无关信息。\n4. 语言风格：极致简练，一针见血。减少颜文字/Emoji 使用（除非 default/gentle 模式下为了增加少女感）。'
    }
];

// ✅ 修复：初始化默认选中第一个，防止首次发送时 Prompt 为空
if (options.length > 0) {
  selectedPrompt.value = options[0].prompt;
}

const newConversation = () => {
  startPage.value = true;
  messages.value = [];
}

// ⚠️ 模型名称保持不变
const MODEL_NAME = 'zai-org/GLM-4.5';

const client = new OpenAI({
  apiKey: 'sk-7OiUAEkN9dPsFLkFznATrQE1qlDlS9hFNsMIXpOwGdBdRARM',
  baseURL: 'https://api.suanli.cn/v1',
  dangerouslyAllowBrowser: true,
});

const onSubmit = (evt) => {
  inputValue.value = '';
  startPage.value = false;

  // 用户发送消息
  messages.value.push({
    from: 'user',
    content: evt,
    avatarConfig: { name: 'user' },
  });

  fetchData(evt);
};

const fetchData = async (ques) => {
  // ✅ 修复：直接使用 selectedPrompt.value，不再经过中间变量或重复赋值
  // 如果用户没选（理论上不会，因为有默认值），则给一个兜底提示
  const currentSystemPrompt = selectedPrompt.value || '你是一个有用的 AI 助手。';

  // 预占一个空的 AI 消息
  const tempAiMsgIndex = messages.value.length;
  messages.value.push({
    from: 'model',
    content: '',
    avatarConfig: { name: 'model' },
    id: '',
    loading: true,
  });

  // ✅ 添加记忆功能：构建包含历史对话的消息列表
  const contextMessages = messages.value
    .filter((m, index) => {
      // 排除最后一条正在生成的
      if (index === tempAiMsgIndex) return false;
      // 排除内容为空的无效消息
      if (!m.content || m.content.trim() === '') return false;
      return true;
    })
    .map(m => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.content
    }));

  const finalMessages = [
    { role: 'system', content: currentSystemPrompt },
    ...contextMessages
  ];

  try {
    const completion = await client.chat.completions.create({
      model: "Qwen/QwQ-32B", // 保持原样
      messages: finalMessages,
      stream: true,
    });

    for await (const chunk of completion) {
      const currentAiMsg = messages.value[tempAiMsgIndex];
      if (currentAiMsg) {
        currentAiMsg.loading = false;
        const content = chunk.choices[0]?.delta?.content || '';
        const chatId = chunk.id;
        currentAiMsg.content += content;
        currentAiMsg.id = chatId;
      }
    }
  } catch (error) {
    console.error("Request failed", error);
    const currentAiMsg = messages.value[tempAiMsgIndex];
    if (currentAiMsg) {
      currentAiMsg.loading = false;
      currentAiMsg.content += "\n[请求失败，请检查网络或模型名称]";
    }
  }
};
</script>

<style>
.container {
  /* 1. 移除宽度和边距限制，让它占满全屏 */
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;

  /* 2. 移除卡片特有的样式 */
  background: transparent; /* 背景透明 (或者你想要的页面背景色) */
  border: none;            /* 去掉边框 */
  border-radius: 0;        /* 去掉圆角 */
  box-shadow: none;        /* 去掉阴影 (如果有) */

  /* 3. 保持高度和布局 */
  height: 80vh;           /* 占满整个视口高度 */
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

  .input-foot-left {
    display: flex;
    align-items: center;
    gap: 8px;

    span {
      font-size: 14px;
      line-height: 18px;
      color: #252b3a;
      cursor: pointer;
    }

    .input-foot-dividing-line {
      width: 1px;
      height: 14px;
      background-color: #d7d8da;
    }

    .input-foot-maxlength {
      font-size: 14px;
      color: #71757f;
    }
  }

  .input-foot-right {
    .demo-button-content {
      font-size: 14px;
    }

    & > *:not(:first-child) {
      margin-left: 8px;
    }
  }
}
</style>
