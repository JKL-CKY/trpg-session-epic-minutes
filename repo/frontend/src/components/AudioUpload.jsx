import React, { useState } from 'react';
import axios from 'axios';

function AudioUpload({ characters, storyNodes }) {
  const [audioFile, setAudioFile] = useState(null);
  const [emails, setEmails] = useState(['']);
  const [status, setStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recap, setRecap] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index) => {
    if (emails.length > 1) {
      const newEmails = emails.filter((_, i) => i !== index);
      setEmails(newEmails);
    }
  };

  const validateEmails = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emails.filter(email => email.trim() !== '').every(email => emailRegex.test(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!audioFile) {
      setStatus({ type: 'error', message: '请选择要上传的音频文件' });
      return;
    }
    
    const validEmails = emails.filter(email => email.trim() !== '');
    if (validEmails.length === 0) {
      setStatus({ type: 'error', message: '请至少填写一个收件人邮箱' });
      return;
    }
    
    if (!validateEmails()) {
      setStatus({ type: 'error', message: '请输入有效的邮箱地址' });
      return;
    }
    
    setIsProcessing(true);
    setStatus({ 
      type: 'processing', 
      message: '🎤 正在处理音频文件，这可能需要几分钟时间，请耐心等待...' 
    });
    
    try {
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('characters', JSON.stringify(characters));
      formData.append('story_nodes', JSON.stringify(storyNodes));
      formData.append('recipient_emails', JSON.stringify(validEmails));
      
      const response = await axios.post('/api/process-session', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 600000
      });
      
      setRecap(response.data.recap);
      setStatus({ 
        type: 'success', 
        message: '🎉 处理完成！史诗战报已生成并发送至所有成员的邮箱。' 
      });
      
    } catch (error) {
      console.error('Error processing session:', error);
      setStatus({ 
        type: 'error', 
        message: `处理失败：${error.response?.data?.detail || error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestRecap = async () => {
    if (characters.length === 0) {
      setStatus({ type: 'error', message: '请先创建至少一个角色' });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: 'processing', message: '📝 正在生成测试战报...' });

    try {
      const formData = new FormData();
      formData.append('characters', JSON.stringify(characters));
      formData.append('story_nodes', JSON.stringify(storyNodes));
      
      const response = await axios.post('/api/test-recap', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setRecap(response.data.recap);
      setStatus({ 
        type: 'success', 
        message: '✅ 测试战报生成成功！' 
      });
      
    } catch (error) {
      console.error('Error generating test recap:', error);
      setStatus({ 
        type: 'error', 
        message: `生成失败：${error.response?.data?.detail || error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>生成史诗战报</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="upload-container">
          <input
            type="file"
            id="audio-upload"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          <label htmlFor="audio-upload">
            <span className="upload-icon">🎤</span>
            <div className="upload-text">
              {audioFile ? `✅ 已选择: ${audioFile.name}` : '点击或拖拽上传跑团录音文件'}
            </div>
            {audioFile && (
              <div style={{ marginTop: '15px', color: '#a0a0a0', fontSize: '1rem' }}>
                📁 文件大小: {(audioFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </label>
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#ffd700', marginBottom: '15px', fontSize: '1.3rem' }}>📧 收件人邮箱</h3>
          {emails.map((email, index) => (
            <div key={index} className="email-inputs">
              <input
                type="email"
                placeholder="输入成员邮箱地址，例如: player@example.com"
                value={email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                disabled={isProcessing}
              />
              {emails.length > 1 && (
                <button
                  type="button"
                  className="remove-email-btn"
                  onClick={() => removeEmailField(index)}
                  disabled={isProcessing}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-email-btn"
            onClick={addEmailField}
            disabled={isProcessing}
            style={{ marginTop: '12px' }}
          >
            ➕ 添加更多邮箱
          </button>
        </div>
        
        <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {characters.length > 0 && (
            <span className="info-badge success">✅ {characters.length} 个角色信息</span>
          )}
          {storyNodes.length > 0 && (
            <span className="info-badge info">✅ {storyNodes.length} 个剧情节点</span>
          )}
          {characters.length === 0 && (
            <span className="info-badge warning">⚠️ 未添加角色信息</span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            type="submit"
            className="process-btn"
            disabled={isProcessing}
            style={{ flex: 1 }}
          >
            {isProcessing ? '⏳ 正在处理中...' : '🚀 开始生成史诗战报'}
          </button>
          
          <button
            type="button"
            onClick={handleTestRecap}
            disabled={isProcessing}
            style={{
              padding: '18px 32px',
              background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 25px rgba(155, 89, 182, 0.3)'
            }}
            onMouseEnter={(e) => {
              if (!isProcessing) {
                e.target.style.transform = 'translateY(-3px)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🧪 测试战报（无音频）
          </button>
        </div>
      </form>
      
      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
      
      {recap && (
        <div className="recap-preview">
          <h3>📜 生成的战报预览</h3>
          <div className="recap-content">
            {recap}
          </div>
        </div>
      )}
    </div>
  );
}

export default AudioUpload;
