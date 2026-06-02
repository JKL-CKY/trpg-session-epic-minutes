import React, { useState } from 'react';
import CharacterCard from './components/CharacterCard';
import StoryMap from './components/StoryMap';
import AudioUpload from './components/AudioUpload';

function App() {
  const [activeTab, setActiveTab] = useState('characters');
  const [characters, setCharacters] = useState([]);
  const [storyNodes, setStoryNodes] = useState([]);
  const [storyEdges, setStoryEdges] = useState([]);

  const handleAddCharacter = (character) => {
    setCharacters([...characters, { ...character, id: Date.now() }]);
  };

  const handleDeleteCharacter = (id) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const tabs = [
    { id: 'characters', label: '🎭 人物卡' },
    { id: 'storymap', label: '🗺️ 剧情地图' },
    { id: 'upload', label: '🎤 生成战报' }
  ];

  return (
    <div className="app">
      <header>
        <h1>🎲 TRPG史诗纪要生成器 🎲</h1>
        <p>记录你的冒险旅程，生成史诗级战报</p>
      </header>

      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'characters' && (
          <CharacterCard
            characters={characters}
            onAddCharacter={handleAddCharacter}
            onDeleteCharacter={handleDeleteCharacter}
          />
        )}
        {activeTab === 'storymap' && (
          <StoryMap
            nodes={storyNodes}
            edges={storyEdges}
            onNodesChange={setStoryNodes}
            onEdgesChange={setStoryEdges}
          />
        )}
        {activeTab === 'upload' && (
          <AudioUpload
            characters={characters}
            storyNodes={storyNodes}
          />
        )}
      </div>
    </div>
  );
}

export default App;
