import os
import json
from openai import OpenAI
from typing import List, Dict, Any


class RecapGenerator:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4-turbo"

    def _format_characters(self, characters: List[Dict[str, Any]]) -> str:
        if not characters:
            return "暂无角色信息"
        
        stat_labels = {
            "strength": "力量",
            "dexterity": "敏捷",
            "constitution": "体质",
            "intelligence": "智力",
            "wisdom": "感知",
            "charisma": "魅力"
        }
        
        formatted = []
        for char in characters:
            stats_str = ", ".join([
                f"{stat_labels.get(k, k)}: {v}" 
                for k, v in char.get("stats", {}).items()
            ])
            
            char_str = f"""
**{char.get('name', '未知角色')}**
- 种族: {char.get('race', '未知')}
- 职业: {char.get('character_class', '未知')}
- 等级: {char.get('level', 1)}
- 属性: {stats_str}
- 背景: {char.get('backstory', '无')}
"""
            formatted.append(char_str)
        
        return "\n".join(formatted)

    def _format_story_map(self, nodes: List[Dict[str, Any]]) -> str:
        if not nodes:
            return "暂无剧情地图"
        
        type_labels = {
            "location": "📍 地点",
            "event": "⚔️ 事件",
            "npc": "👤 NPC"
        }
        
        formatted = []
        for node in nodes:
            node_data = node.get("data", {})
            node_type = node.get("type", "location")
            formatted.append(
                f"- {type_labels.get(node_type, node_type)}: {node_data.get('label', '未命名')}"
            )
        
        return "\n".join(formatted)

    def _format_transcript(self, transcript: List[Dict[str, Any]]) -> str:
        if not transcript:
            return "暂无对话记录"
        
        formatted = []
        for item in transcript:
            speaker = item.get("speaker", "未知")
            text = item.get("text", "")
            formatted.append(f"[{speaker}]: {text}")
        
        return "\n".join(formatted)

    def generate(
        self,
        characters: List[Dict[str, Any]],
        story_nodes: List[Dict[str, Any]],
        transcript: List[Dict[str, Any]]
    ) -> str:
        characters_str = self._format_characters(characters)
        story_map_str = self._format_story_map(story_nodes)
        transcript_str = self._format_transcript(transcript)

        prompt = f"""你是一位才华横溢的小说家和跑团记录者。请根据以下跑团（TRPG）的角色信息、剧情地图和对话记录，写一篇兼具故事性和游戏记录的史诗纪要战报。战报应采用小说笔法，生动描绘冒险过程，同时准确记录关键事件、角色行动和对话精华。

## 角色信息
{characters_str}

## 剧情地图节点
{story_map_str}

## 对话记录
{transcript_str}

请以Markdown格式输出，包含以下部分：

# 🎲 冒险标题
（一个吸引人的标题，体现冒险的核心主题）

## 📜 出场人物
简要介绍每位角色，突出他们的特点和在本次冒险中的角色定位。

## 🌟 冒险概要
一段引人入胜的故事概述，300-500字，让读者迅速了解本次冒险的核心内容。

## ⚔️ 精彩时刻
3-5个关键事件的详细描述，每个事件都要有：
- 生动的场景描写
- 角色的行动和决策
- 关键对话引用
- 事件的影响和后果

## 💬 完整对话纪要
按时间线整理的重要对话，保留原汁原味的角色扮演内容。

## 🔮 后续展望
对下一次冒险的预示，留下悬念和期待。

---
*战报由AI自动生成，保留了冒险的核心精神和精彩瞬间*

请确保语言生动、富有想象力，使用中文写作，字数控制在3000-5000字之间。"""

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "你是一位擅长将跑团记录转化为文学作品的作家，精通TRPG文化和叙事技巧。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.8,
            max_tokens=6000
        )

        return response.choices[0].message.content
