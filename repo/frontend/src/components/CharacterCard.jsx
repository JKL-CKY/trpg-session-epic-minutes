import React, { useState } from 'react';

const initialFormData = {
  name: '',
  race: '',
  character_class: '',
  level: 1,
  stats: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  backstory: ''
};

function CharacterCard({ characters, onAddCharacter, onDeleteCharacter }) {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.stats) {
      setFormData({
        ...formData,
        stats: {
          ...formData.stats,
          [name]: parseInt(value) || 0
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'level' ? parseInt(value) || 1 : value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.race || !formData.character_class) {
      alert('请填写姓名、种族和职业');
      return;
    }
    onAddCharacter(formData);
    setFormData(initialFormData);
  };

  const statLabels = {
    strength: '力量',
    dexterity: '敏捷',
    constitution: '体质',
    intelligence: '智力',
    wisdom: '感知',
    charisma: '魅力'
  };

  return (
    <div>
      <div className="section-header">
        <h2>创建人物卡</h2>
        {characters.length > 0 && (
          <span className="info-badge success">已创建 {characters.length} 个角色</span>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="character-form">
          <div className="form-group">
            <label>角色姓名</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="输入角色姓名"
            />
          </div>
          
          <div className="form-group">
            <label>种族</label>
            <input
              type="text"
              name="race"
              value={formData.race}
              onChange={handleChange}
              placeholder="例如：人类、精灵、矮人"
            />
          </div>
          
          <div className="form-group">
            <label>职业</label>
            <input
              type="text"
              name="character_class"
              value={formData.character_class}
              onChange={handleChange}
              placeholder="例如：战士、法师、盗贼"
            />
          </div>
          
          <div className="form-group">
            <label>等级</label>
            <input
              type="number"
              name="level"
              value={formData.level}
              onChange={handleChange}
              min="1"
              max="20"
            />
          </div>
        </div>
        
        <div className="form-group" style={{ marginTop: '25px' }}>
          <label>属性值</label>
          <div className="stats-grid">
            {Object.entries(formData.stats).map(([stat, value]) => (
              <div key={stat} className="stat-input">
                <label>{statLabels[stat]}</label>
                <input
                  type="number"
                  name={stat}
                  value={value}
                  onChange={handleChange}
                  min="1"
                  max="30"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group" style={{ marginTop: '25px' }}>
          <label>背景故事</label>
          <textarea
            name="backstory"
            value={formData.backstory}
            onChange={handleChange}
            placeholder="描述你的角色背景、性格和目标..."
            rows="4"
          />
        </div>
        
        <button type="submit" className="add-character-btn">
          ➕ 添加角色
        </button>
      </form>
      
      {characters.length > 0 && (
        <div style={{ marginTop: '50px' }}>
          <div className="section-header">
            <h2>已创建的角色</h2>
          </div>
          <div className="character-list">
            {characters.map(character => (
              <div key={character.id} className="character-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>{character.name}</h2>
                  <button
                    onClick={() => onDeleteCharacter(character.id)}
                    className="delete-btn"
                  >
                    🗑️ 删除
                  </button>
                </div>
                
                <div className="character-info">
                  <div className="info-item">
                    <span className="info-label">种族</span>
                    <span className="info-value">{character.race}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">职业</span>
                    <span className="info-value">{character.character_class}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">等级</span>
                    <span className="info-value">Lv.{character.level}</span>
                  </div>
                </div>
                
                <div className="stats-display">
                  {Object.entries(character.stats).map(([stat, value]) => (
                    <div key={stat} className="stat-item">
                      <div className="stat-name">{statLabels[stat]}</div>
                      <div className="stat-value">{value}</div>
                    </div>
                  ))}
                </div>
                
                {character.backstory && (
                  <div className="backstory">
                    <h3>📜 背景故事</h3>
                    <p>{character.backstory}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CharacterCard;
