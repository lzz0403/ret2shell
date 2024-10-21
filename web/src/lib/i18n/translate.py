import json
import sys

from openai import OpenAI

prompt = f"""
你是一个术语翻译官，你的任务是将一个网站的界面语言翻译为另一种语言。

以下是一个 CTF 平台的中文词汇表，请帮我翻译为 {sys.argv[1]}。在翻译时请注意一些固定词组，以下以 English 作为示例：

1. 回归终端 -> Ret 2 Shell （但是 返回 应当正常翻译为 Return）
2. 比赛/赛事 -> Game
3. 题目/挑战 -> Challenge
4. 练习场 -> Playground

在翻译网络请求错误时，请统一格式为 failed to xxx, 在翻译成功时，统一翻译为 succeeded to xxx.

请准确判断某个词组在UI界面中的位置，尽量简洁.

在你的回复中，不要使用 markdown 格式，也不要输出额外语句，请返回一个翻译后的 json object。
"""

client = OpenAI(
    api_key="sk-292d270cb2044f4e860d51eba099b722", base_url="https://api.deepseek.com"
)


def get_translation(f: str):
    response = client.chat.completions.create(
        model="deepseek-coder",
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": f},
        ],
        stream=False,
        response_format={"type": "json_object"},
    )

    print(response.choices[0].message.content)
    return response.choices[0].message.content


source = ""
with open(sys.argv[2], "r") as f:
    source = f.read()

source = json.loads(source)


# the source json will be large, so we need to split the translation
# into multiple requests
def translate_obj(obj):
    dicts = []
    strs = []
    result = {}
    for key, value in obj.items():
        if isinstance(value, dict):
            dicts.append((key, value))
        elif isinstance(value, str):
            strs.append((key, value))
    # translate the strings first
    for i in range(0, len(strs), 20):
        strings = dict(strs[i : i + 20])
        response = get_translation(json.dumps(strings))
        response = json.loads(response)
        result.update(response)
    # translate the dictionaries
    for key, value in dicts:
        result[key] = translate_obj(value)
    return result


result = translate_obj(source)

with open(f"{sys.argv[1]}.json", "w") as f:
    f.write(json.dumps(result, ensure_ascii=False, indent=2))
