import React, { useState } from 'react'
import axios from 'axios'
import { QRCodeSVG } from 'qrcode.react'
import { API_BASE_URL } from './config'
import './App.css'

function App() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [shareUrl, setShareUrl] = useState('')
  const [error, setError] = useState('')

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const fileExtension = file.name.toLowerCase().split('.').pop()
    if (!['apk', 'ipa'].includes(fileExtension)) {
      setError('Please select an APK or IPA file')
      return
    }

    // Validate file size (500MB)
    if (file.size > 500 * 1024 * 1024) {
      setError('File size must be less than 500MB')
      return
    }

    setUploading(true)
    setError('')
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('appFile', file)

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setUploadProgress(percentCompleted)
          }
        },
      })

      setShareUrl(response.data.shareUrl)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code')
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = 'aipk-qr-code.png'
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>📱 AIPK</h1>
          <p>Share your Android APK and iOS IPA files easily</p>
        </header>

        <main className="main-content">
          {!shareUrl ? (
            <div className="upload-section">
              <div className="upload-card">
                <div className="upload-icon">📤</div>
                <h2>Upload Your App</h2>
                <p>Select an APK or IPA file to generate a shareable install link</p>
                
                <label className="file-input-label">
                  <input
                    type="file"
                    accept=".apk,.ipa"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <span className="file-input-button">
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </span>
                </label>

                {uploading && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{uploadProgress}%</div>
                  </div>
                )}

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="features">
                  <div className="feature">
                    <span className="feature-icon">🔒</span>
                    <span>Files auto-delete after 30 days</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">📱</span>
                    <span>Mobile-optimized install pages</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">⚡</span>
                    <span>Fast global CDN</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="success-section">
              <div className="success-card">
                <div className="success-icon">✅</div>
                <h2>Upload Successful!</h2>
                <p>Your app is ready to be shared</p>
                
                {/* QR Code Section */}
                <div className="qr-section">
                  <h3>Scan to Install</h3>
                  <div className="qr-code-container">
                    <QRCodeSVG 
                      id="qr-code"
                      value={shareUrl} 
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <button onClick={downloadQRCode} className="download-qr-button">
                    Download QR Code
                  </button>
                </div>

                {/* Share URL Section */}
                <div className="share-section">
                  <h3>Share Link</h3>
                  <div className="share-url">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="url-input"
                    />
                    <button onClick={copyToClipboard} className="copy-button">
                      Copy
                    </button>
                  </div>
                </div>

                <div className="action-buttons">
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="test-button">
                    Test Install Page
                  </a>
                  <button 
                    onClick={() => {
                      setShareUrl('')
                      setError('')
                    }} 
                    className="upload-new-button"
                  >
                    Upload Another App
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>© 2024 AIPK. For testing purposes only.</p>
        </footer>
      </div>
    </div>
  )
}

export default App
