from pydantic import BaseModel
from typing import List, Dict, Optional


class Character(BaseModel):
    id: Optional[int] = None
    name: str
    race: str
    character_class: str
    level: int
    stats: Dict[str, int]
    backstory: str


class StoryNode(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, str]


class StoryEdge(BaseModel):
    id: str
    source: str
    target: str


class SessionRequest(BaseModel):
    characters: List[Character]
    story_nodes: List[StoryNode]
    story_edges: List[StoryEdge]
    recipient_emails: List[str]
