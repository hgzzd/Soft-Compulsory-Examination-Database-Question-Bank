<template>
  <div class="code-editor-container">
    <div class="editor-toolbar">
      <select v-model="language" class="language-selector">
        <option value="sql">SQL</option>
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="java">Java</option>
        <option value="csharp">C#</option>
      </select>
      <div class="toolbar-actions">
        <button @click="runCode" class="run-button" :disabled="isRunning">
          <span v-if="isRunning">运行中...</span>
          <span v-else>运行代码</span>
        </button>
      </div>
    </div>
    
    <div ref="editorContainer" class="monaco-editor-container"></div>
    
    <div v-if="output" class="output-container">
      <div class="output-header">
        <span>执行结果</span>
        <button @click="clearOutput" class="clear-button">清除</button>
      </div>
      <pre class="output-content">{{ output }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as monaco from 'monaco-editor';

export default defineComponent({
  name: 'CodeEditor',
  props: {
    initialCode: {
      type: String,
      default: '-- 请在这里编写SQL代码\nSELECT * FROM users WHERE id = 1;'
    },
    initialLanguage: {
      type: String,
      default: 'sql'
    },
    readOnly: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['update:code', 'run'],
  
  setup(props, { emit }) {
    const editorContainer = ref<HTMLElement | null>(null);
    const editor = ref<monaco.editor.IStandaloneCodeEditor | null>(null);
    const language = ref(props.initialLanguage);
    const output = ref('');
    const isRunning = ref(false);
    
    const initializeEditor = () => {
      if (!editorContainer.value) return;
      
      editor.value = monaco.editor.create(editorContainer.value, {
        value: props.initialCode,
        language: language.value,
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        readOnly: props.readOnly,
        fontSize: 14,
      });
      
      editor.value.onDidChangeModelContent(() => {
        if (editor.value) {
          emit('update:code', editor.value.getValue());
        }
      });
    };
    
    const disposeEditor = () => {
      if (editor.value) {
        editor.value.dispose();
        editor.value = null;
      }
    };
    
    const updateEditorLanguage = () => {
      if (editor.value) {
        const currentModel = editor.value.getModel();
        if (currentModel) {
          monaco.editor.setModelLanguage(currentModel, language.value);
        }
      }
    };
    
    const runCode = async () => {
      if (!editor.value) return;
      
      const code = editor.value.getValue();
      isRunning.value = true;
      
      try {
        // 这里可以根据实际需求调用后端API执行代码
        // 以下是模拟执行
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (language.value === 'sql') {
          output.value = '查询成功！\n模拟结果:\n{\n  "id": 1,\n  "name": "张三",\n  "email": "zhangsan@example.com"\n}';
        } else {
          output.value = `代码执行成功，语言: ${language.value}`;
        }
        
        emit('run', { code, language: language.value, success: true });
      } catch (error) {
        output.value = `执行错误: ${error}`;
        emit('run', { code, language: language.value, success: false, error });
      } finally {
        isRunning.value = false;
      }
    };
    
    const clearOutput = () => {
      output.value = '';
    };
    
    onMounted(() => {
      initializeEditor();
    });
    
    onBeforeUnmount(() => {
      disposeEditor();
    });
    
    watch(() => language.value, updateEditorLanguage);
    
    watch(() => props.initialCode, (newValue) => {
      if (editor.value && newValue !== editor.value.getValue()) {
        editor.value.setValue(newValue);
      }
    });
    
    return {
      editorContainer,
      language,
      output,
      isRunning,
      runCode,
      clearOutput
    };
  }
});
</script>

<style scoped>
.code-editor-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  height: 500px;
  background-color: #1e1e1e;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #2d2d2d;
  border-bottom: 1px solid #444;
}

.language-selector {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #555;
  background-color: #333;
  color: #fff;
  font-size: 14px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.run-button {
  padding: 4px 12px;
  border-radius: 4px;
  border: none;
  background-color: #0078d4;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.run-button:hover:not(:disabled) {
  background-color: #106ebe;
}

.run-button:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.monaco-editor-container {
  flex-grow: 1;
  min-height: 300px;
}

.output-container {
  background-color: #252525;
  border-top: 1px solid #444;
  max-height: 150px;
  overflow: auto;
}

.output-header {
  display: flex;
  justify-content: space-between;
  padding: 6px 12px;
  background-color: #333;
  font-size: 14px;
  color: #e0e0e0;
}

.clear-button {
  background: none;
  border: none;
  color: #0078d4;
  cursor: pointer;
  font-size: 13px;
}

.clear-button:hover {
  text-decoration: underline;
}

.output-content {
  padding: 8px 12px;
  margin: 0;
  color: #e0e0e0;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', monospace;
  white-space: pre-wrap;
}
</style> 