const express = require('express');
const router = express.Router();
const App = require('../models/App');

// Share page route
router.get('/:shareId', async (req, res) => {
  try {
    const app = await App.findOne({ shareId: req.params.shareId });
    
    if (!app) {
      return res.status(404).send(`
        <html>
          <body>
            <h1>App Not Found</h1>
            <p>The app you're looking for doesn't exist or has expired.</p>
          </body>
        </html>
      `);
    }

    // Increment download count
    app.downloadCount += 1;
    await app.save();

    // Generate iOS installation URL
    const iosInstallUrl = `itms-services://?action=download-manifest&url=https://installonair-clone-production.up.railway.app/plist/${app.shareId}`;

    // Render install page
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Install ${app.originalName}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 500px;
                width: 100%;
            }
            .app-icon {
                width: 80px;
                height: 80px;
                background: #f0f0f0;
                border-radius: 20px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                color: #666;
            }
            h1 {
                color: #333;
                margin-bottom: 10px;
                font-size: 24px;
            }
            .app-info {
                color: #666;
                margin-bottom: 30px;
                line-height: 1.5;
            }
            .install-button {
                display: inline-block;
                background: #007AFF;
                color: white;
                padding: 15px 30px;
                border-radius: 12px;
                text-decoration: none;
                font-weight: 600;
                font-size: 18px;
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
                margin: 10px 5px;
                min-width: 140px;
            }
            .install-button.secondary {
                background: #6c757d;
            }
            .install-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.2);
            }
            .install-button.primary:hover {
                background: #0056CC;
            }
            .install-button.secondary:hover {
                background: #545b62;
            }
            .instructions {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 12px;
                margin-top: 20px;
                text-align: left;
                font-size: 14px;
                color: #666;
            }
            .instructions h3 {
                color: #333;
                margin-bottom: 10px;
            }
            .button-group {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
                margin: 20px 0;
            }
            .info-box {
                background: #d1ecf1;
                border: 1px solid #bee5eb;
                color: #0c5460;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                text-align: left;
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                text-align: left;
            }
            .hidden {
                display: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="app-icon">
                ${app.platform === 'ios' ? '📱' : '🤖'}
            </div>
            <h1>Install ${app.originalName.replace('.ipa', '').replace('.apk', '')}</h1>
            <div class="app-info">
                <p>Platform: <strong>${app.platform.toUpperCase()}</strong></p>
                <p>Size: <strong>${(app.fileSize / (1024 * 1024)).toFixed(2)} MB</strong></p>
                <p>Uploaded: <strong>${new Date(app.uploadDate).toLocaleDateString()}</strong></p>
            </div>

            ${app.platform === 'android' ? `
                <a href="${app.fileUrl}" class="install-button primary" onclick="trackDownload('direct')">
                    Install APK
                </a>
                <div class="instructions">
                    <h3>Android Installation Instructions:</h3>
                    <p>1. Tap "Install APK" above</p>
                    <p>2. Allow installation from unknown sources when prompted</p>
                    <p>3. Wait for installation to complete</p>
                    <p>4. Open the app from your home screen</p>
                </div>
            ` : ''}

            ${app.platform === 'ios' ? `
                <div class="info-box">
                    <strong>📱 iOS Installation</strong><br>
                    Choose your preferred installation method below.
                </div>
                
                <div class="button-group">
                    <button class="install-button primary" onclick="startIosInstall()">
                        Auto Install
                    </button>
                    <a href="${app.fileUrl}" class="install-button secondary" onclick="trackDownload('manual')">
                        Download IPA
                    </a>
                </div>

                <div id="iosInstallInfo" class="hidden">
                    <div class="warning">
                        <strong>If installation doesn't start automatically:</strong>
                        <p>1. Tap "Download IPA" first to download the file</p>
                        <p>2. Then use a tool like AltStore, Cydia Impactor, or Xcode to install</p>
                    </div>
                </div>

                <div class="instructions">
                    <h3>iOS Installation Methods:</h3>
                    
                    <p><strong>Method 1 - Auto Install (Recommended):</strong></p>
                    <p>1. Tap "Auto Install" above</p>
                    <p>2. Tap "Install" when prompted</p>
                    <p>3. Go to Settings → General → VPN & Device Management</p>
                    <p>4. Trust the developer certificate</p>
                    <p>5. Return to home screen and open the app</p>
                    
                    <p><strong>Method 2 - Manual Download:</strong></p>
                    <p>1. Tap "Download IPA" to get the file</p>
                    <p>2. Use AltStore, Cydia Impactor, or Xcode to install</p>
                    <p>3. Trust the developer in Settings</p>
                </div>
            ` : ''}

            <script>
                function trackDownload(method) {
                    console.log('Download started via:', method);
                    // You can add analytics here
                }

                ${app.platform === 'ios' ? `
                function startIosInstall() {
                    trackDownload('auto_install');
                    // Show the manual option in case auto-install fails
                    document.getElementById('iosInstallInfo').classList.remove('hidden');
                    
                    // Try the OTA installation
                    const installUrl = '${iosInstallUrl}';
                    console.log('Starting iOS OTA installation:', installUrl);
                    
                    // Create iframe method (more reliable)
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = installUrl;
                    document.body.appendChild(iframe);
                    
                    // Also try direct navigation as backup
                    setTimeout(() => {
                        window.location.href = installUrl;
                    }, 500);
                    
                    // Show manual download option after a delay
                    setTimeout(() => {
                        document.getElementById('iosInstallInfo').classList.remove('hidden');
                    }, 3000);
                }
                
                // Check if we're on iOS and show appropriate instructions
                function isIOS() {
                    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                }
                
                if (isIOS()) {
                    console.log('iOS device detected');
                    // You could auto-start installation here if desired
                    // startIosInstall();
                }
                ` : ''}
            </script>
        </div>
    </body>
    </html>
    `);

  } catch (error) {
    console.error('Share page error:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
