---
title: "在 Arch Linux + Intel GPU 上跑通 Qwen3-ASR-GGUF"
date: 2026-05-12T15:57:00+08:00
description: "在 Intel Lunar Lake 集显上部署 Qwen3-ASR-GGUF 的完整记录：本地编译 llama.cpp Vulkan 后端、两个模型的实际性能对比、OpenVINO NPU 路线踩坑，以及踩过的五个坑。"
categories: ["AI", "Linux系统"]
tags: ["ASR", "语音识别", "Qwen3", "Arch Linux", "Intel GPU", "Vulkan", "GGUF", "llama.cpp", "OpenVINO", "NPU"]
---

Qwen3-ASR 是阿里的开源语音识别模型，[Qwen3-ASR-GGUF](https://github.com/HaujetZhao/Qwen3-ASR-GGUF) 是社区用 llama.cpp 做的 GGUF 量化版本，能在本地 GPU 上跑，不需要 NVIDIA 卡。这篇文章记录我在 Arch Linux + Intel Lunar Lake 集显上从零部署的完整过程，包括 0.6B 和 1.7B 两个模型的实际性能对比。

## 环境

| 项目 | 版本/型号 |
|------|-----------|
| OS | Arch Linux (rolling) |
| CPU | Intel Lunar Lake |
| GPU | Intel Arc Graphics 130V/140V (Xe2) |
| RAM | 30 GB |
| Python | 3.14.4 |
| Vulkan 驱动 | vulkan-intel 1:26.0.6-1, Mesa 1:26.0.6-1 |

## 安装

### 1. 虚拟环境和依赖

```bash
python3 -m venv /home/xzl/qwen3-asr-venv
/home/xzl/qwen3-asr-venv/bin/pip install onnxruntime typer rich pydub numpy scipy gguf srt librosa soundfile
```

### 2. 克隆项目

```bash
git clone https://github.com/HaujetZhao/Qwen3-ASR-GGUF.git /home/xzl/AI/Model/Qwen3-ASR-GGUF
```

### 3. 本地编译 llama.cpp（Vulkan 后端）

这步是整个部署里最关键的坑：GitHub Releases 提供的 Ubuntu 预编译二进制在 Arch 上直接 coredump，必须本地源码编译。

```bash
git clone --depth 1 --branch b9106 https://github.com/ggml-org/llama.cpp.git /home/xzl/AI/Model/llama.cpp-build
cd /home/xzl/AI/Model/llama.cpp-build
mkdir -p build && cd build
cmake .. -DGGML_VULKAN=ON -DCMAKE_BUILD_TYPE=Release -G Ninja
ninja -j$(nproc)
```

编译完成后把生成的 `.so` 文件复制到项目的 `inference/bin` 目录。项目启动时会从这个目录加载动态库：

```bash
mkdir -p /home/xzl/AI/Model/Qwen3-ASR-GGUF/qwen_asr_gguf/inference/bin

cp -a /home/xzl/AI/Model/llama.cpp-build/build/bin/libggml.so \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libggml.so.0 \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libggml.so.0.11.1 \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libggml-base.so \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libggml-base.so.0 \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libggml-base.so.0.11.1 \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libllama.so \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libllama.so.0 \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libllama.so.0.0.1 \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libggml-vulkan.so \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libggml-vulkan.so.0 \
       /home/xzl/AI/Model/llama.cpp-build/build/bin/libggml-vulkan.so.0.11.1 \
       /home/xzl/AI/Model/Qwen3-ASR-GGUF/qwen_asr_gguf/inference/bin/
```

### 4. 下载模型

作者提供了 0.6B 和 1.7B 两个预转换量化版本：

```bash
# 0.6B (~538MB)
curl -L -o /home/xzl/AI/Model/Qwen3-ASR-GGUF/Qwen3-ASR-0.6B-gguf.zip \
  "https://github.com/HaujetZhao/Qwen3-ASR-GGUF/releases/download/models/Qwen3-ASR-0.6B-gguf.zip"
unzip -o /home/xzl/AI/Model/Qwen3-ASR-GGUF/Qwen3-ASR-0.6B-gguf.zip -d /home/xzl/AI/Model/Qwen3-ASR-GGUF/model/

# 1.7B (~1.3GB)
curl -L -o /home/xzl/AI/Model/Qwen3-ASR-GGUF/Qwen3-ASR-1.7B-gguf.zip \
  "https://github.com/HaujetZhao/Qwen3-ASR-GGUF/releases/download/models/Qwen3-ASR-1.7B-gguf.zip"
unzip -o /home/xzl/AI/Model/Qwen3-ASR-GGUF/Qwen3-ASR-1.7B-gguf.zip -d /home/xzl/AI/Model/Qwen3-ASR-GGUF/model-1.7B/
```

模型文件名有个细节：默认配置里期望的文件名是 `q5_k`，而预编译模型实际是 `q4_k`。不创建 symlink 的话会直接报文件不存在：

```bash
cd /home/xzl/AI/Model/Qwen3-ASR-GGUF/model && ln -sf qwen3_asr_llm.q4_k.gguf qwen3_asr_llm.q5_k.gguf
cd /home/xzl/AI/Model/Qwen3-ASR-GGUF/model-1.7B && ln -sf qwen3_asr_llm.q4_k.gguf qwen3_asr_llm.q5_k.gguf
```

## 使用

### 环境变量

```bash
export GGML_VK_DISABLE_F16=1
export LD_LIBRARY_PATH="/home/xzl/AI/Model/Qwen3-ASR-GGUF/qwen_asr_gguf/inference/bin:$LD_LIBRARY_PATH"
```

`GGML_VK_DISABLE_F16=1` 不是可选项。Intel 集显的 Vulkan FP16 计算会溢出，不设这个变量的话输出全是 `!!!!!`，不管模型多大。

### 转录命令

```bash
# 0.6B 模型
/home/xzl/qwen3-asr-venv/bin/python3 /home/xzl/AI/Model/Qwen3-ASR-GGUF/transcribe.py \
   你的音频.mp3 \
   --model-dir /home/xzl/AI/Model/Qwen3-ASR-GGUF/model \
   --prec int4 \
   --provider CPU \
   --verbose -y

# 1.7B 模型
/home/xzl/qwen3-asr-venv/bin/python3 /home/xzl/AI/Model/Qwen3-ASR-GGUF/transcribe.py \
   你的音频.mp3 \
   --model-dir /home/xzl/AI/Model/Qwen3-ASR-GGUF/model-1.7B \
   --prec int4 \
   --provider CPU \
   --verbose -y
```

### 常用参数

| 参数 | 说明 |
|------|------|
| `--model-dir` | 模型目录 |
| `--prec int4` | 编码器精度，可选 fp32/fp16/int8/int4 |
| `--provider CPU` | ONNX 后端，Linux 只能用 CPU |
| `--no-ts` | 关闭时间戳对齐以加快速度 |
| `--no-vulkan` | 关闭 Vulkan，走纯 CPU |
| `--language Chinese` | 强制指定语种 |
| `-y` | 覆盖已存在的输出文件 |

## 性能实测

### 0.6B vs 1.7B

| | 0.6B | 1.7B |
|---|---|---|
| 模型大小 | 462 MB | 1.2 GB |
| 引擎初始化 | 0.56s | 0.66s |
| RTF（实时率） | 0.084 | 0.197 |
| LLM 生成速度 | 11.7 t/s | 33.6 t/s |
| 准确率 | 一般 | 高 |

RTF 是实际处理时间除以音频时长。0.084 的意思是处理 1 秒音频只需要 0.084 秒——比实时快 12 倍。1.7B 慢一倍多（RTF 0.197），但仍然远低于 1.0 的实时线。

值得注意的反直觉数据：1.7B 的 LLM 生成速度（33.6 t/s）比 0.6B（11.7 t/s）快将近三倍。原因是 1.7B 模型虽然更大，但在这个任务上预测更准、需要的 token 更少，反而整体更快。

### 1.7B 长句识别测试

输入：
> 今天天气真好，适合出去散步。人工智能正在改变我们的生活方式，语音识别技术已经非常成熟了。

输出完全一致，识别率 100%：

```
RTF: 0.197（12.86 秒音频，处理耗时 2.53 秒）
LLM 预填充: 686 t/s
LLM 生成: 33.6 t/s
```

## 架构

```
音频输入 → ONNX Encoder (CPU) → 特征向量 → GGUF Decoder (Vulkan/GPU) → 文本输出
             ↑ 极轻量 (~0.2s)                    ↑ 绝对主力
```

- **ONNX Encoder**：固定跑 CPU，因为 onnxruntime 的 DirectML 后端是 Windows 独占，Linux 下只能用 CPU provider。好在 encoder 极轻，0.6B 初始化才 0.56 秒。
- **GGUF Decoder**：通过 llama.cpp + Vulkan 后端跑在 Intel Arc iGPU 上。编译时 cmake 自动检测 Intel GPU，不需要额外配置。
- **Vulkan 后端**：`libggml-vulkan.so` 是核心，编译过程完全透明。

## 五个坑

1. **Ubuntu 预编译 .so 在 Arch 上 coredump。** 不同发行版的 glibc 和系统库版本不一样，必须本地源码编译 llama.cpp。
2. **`GGML_VK_DISABLE_F16=1` 不能省略。** Intel 集显 Vulkan FP16 计算精度不足导致数值溢出，输出全是 `!!!!!`。不设这个变量你会以为模型坏了，其实只是精度问题。
3. **模型文件名不匹配。** 配置期望 `q5_k.gguf`，预编译模型是 `q4_k.gguf`，要手动建 symlink。
4. **zsh 的 glob 展开。** 批量操作 `*` 时 zsh 的行为和 bash 不一样，用显式路径代替通配符更可靠。
5. **Python 3.14.4 兼容。** 部分旧包的 wheel 不支持 3.14，但 pip 会自动 fallback 到源码编译，只是需要系统有对应的编译工具链。

## NPU 路线（OpenVINO）：当前不可行

我试了 OpenVINO 的 NPU 推理路线，结论是 Qwen3-ASR 目前**不支持 Intel NPU**。

OpenVINO 官方 notebook 里直接排除了 NPU：

```python
device = device_widget("CPU", exclude=["NPU"])
```

实测各个组件的支持情况：

| 组件 | CPU | GPU | NPU |
|------|-----|-----|-----|
| Audio Conv（CNN） | ✅ | ❌ 缺驱动 | ❌ 算子不支持 |
| Audio Encoder（Transformer） | ✅ | — | ❌ |
| Embedding | ✅ | — | ❌ |
| Language Model（LLM） | ✅ | — | ❌（FP16/INT8 均失败） |

NPU 报错是 `ZE_RESULT_ERROR_UNSUPPORTED_FEATURE`——NPU 编译器不支持 Qwen3-ASR 的音频特定算子。OpenVINO NPU 只适配了纯文本 Qwen3 LLM（1.7B/4B/8B），ASR 版的定制架构还跑不通。GPU 未识别是因为没装 `intel-compute-runtime`，这个后续可以补上试试，不过现阶段 Vulkan 路线已经完全够用了。

OpenVINO 的 CPU 模式倒是没问题：

```bash
pip install "openvino>=2025.4.0" qwen-asr torch transformers
```

然后走标准转换 → 推理流程，和 onnxruntime CPU 模式性能相当，没有明显优势，也不比 GGUF + Vulkan 快。

## 结论

部署本身不复杂，就五个步骤：建环境 → 编 llama.cpp → 复制 .so → 下模型 → 跑。

真正花时间的是填那两个坑：本地编译替代预编译二进制，以及 `GGML_VK_DISABLE_F16`。这两个问题在 Intel 集显上几乎一定会遇到。

性能方面，0.6B 足够满足实时转录（RTF 0.084），1.7B 的准确率明显更高且实际并不慢（RTF 0.197）。如果你的场景对准确率有要求，直接上 1.7B，1.2GB 的模型在现代机器上不算重。

相关链接：

- [Qwen3-ASR-GGUF](https://github.com/HaujetZhao/Qwen3-ASR-GGUF)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Qwen3-ASR 官方](https://github.com/QwenLM/Qwen3-ASR)
- [ModelScope 模型集合](https://www.modelscope.cn/collections/Qwen/Qwen3-ASR)
- [OpenVINO Qwen3-ASR Notebook](https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/qwen3-asr)
