const express = require('express');
const router = express.Router();
const App = require('../models/App');

// Share page route - SIMPLE like InstallOnAir.com
router.get('/:shareId', async (req, res) => {
  try {
    const app = await App.findOne({ shareId: req.params.shareId });
    
    if (!app) {
      return res.status(404).send(`
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 50px;">
            <h1>App Not Found</h1>
            <p>The app you're looking for doesn't exist or has expired.</p>
          </body>
        </html>
      `);
    }

    // Increment download count
    app.downloadCount += 1;
    await app.save();

    const appName = app.originalName.replace('.ipa', '').replace('.apk', '');

    // SIMPLE HTML like InstallOnAir.com
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Install ${appName}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f5f5f7;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px 30px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
                width: 100%;
            }
            .app-icon {
                width: 80px;
                height: 80px;
                background: #007AFF;
                border-radius: 16px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 32px;
                color: white;
            }
            h1 {
                color: #1d1d1f;
                margin-bottom: 8px;
                font-size: 24px;
                font-weight: 600;
            }
            .app-info {
                color: #86868b;
                margin-bottom: 30px;
                line-height: 1.4;
            }
            .download-button {
                display: inline-block;
                background: #007AFF;
                color: white;
                padding: 16px 40px;
                border-radius: 12px;
                text-decoration: none;
                font-weight: 600;
                font-size: 17px;
                transition: all 0.2s ease;
                border: none;
                cursor: pointer;
                margin-bottom: 20px;
                width: 100%;
                max-width: 280px;
            }
            .download-button:hover {
                background: #0056CC;
                transform: translateY(-1px);
            }
            .instructions {
                color: #86868b;
                font-size: 14px;
                line-height: 1.5;
                margin-top: 20px;
                text-align: left;
            }
            .instructions h3 {
                color: #1d1d1f;
                margin-bottom: 8px;
                font-size: 16px;
            }
            .platform-badge {
                display: inline-block;
                background: #f5f5f7;
                color: #86868b;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="app-icon">
                ${app.platform === 'ios' ? '📱' : '🤖'}
            </div>
            
            <div class="platform-badge">
                ${app.platform === 'ios' ? 'iOS APP' : 'ANDROID APP'}
            </div>
            
            <h1>${appName}</h1>
            
            <div class="app-info">
                ${(app.fileSize / (1024 * 1024)).toFixed(1)} MB
            </div>

            <a href="${app.fileUrl}" class="download-button" onclick="trackDownload()">
                Download
            </a>

            <div class="instructions">
                ${app.platform === 'android' ? `
                    <h3>Android Installation</h3>
                    <p>1. Tap "Download" to get the APK file</p>
                    <p>2. Open the downloaded file to install</p>
                    <p>3. Allow installation from unknown sources if prompted</p>
                ` : `
                    <h3>iOS Installation</h3>
                    <p>1. Tap "Download" to get the IPA file</p>
                    <p>2. Install using AltStore, TrollStore, or sideloading tool</p>
                    <p>3. Trust the developer in Settings if required</p>
                `}
            </div>
        </div>

        <script>
            function trackDownload() {
                // Simple analytics
                console.log('Download started for ${appName}');
            }
        </script>
    </body>
    </html>
    `);

  } catch (error) {
    console.error('Share page error:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
