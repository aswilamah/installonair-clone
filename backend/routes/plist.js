const express = require('express');
const router = express.Router();
const App = require('../models/App');

// Dynamic plist generation for iOS
router.get('/:shareId', async (req, res) => {
  try {
    const app = await App.findOne({ shareId: req.params.shareId });
    
    if (!app || app.platform !== 'ios') {
      return res.status(404).send('Not found');
    }

    // Set content type for plist
    res.set('Content-Type', 'application/xml');
    res.set('Content-Disposition', 'attachment; filename="manifest.plist"');

    const appName = app.originalName.replace('.ipa', '');
    const bundleId = app.bundleId || `com.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}.app`;
    
    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>${app.fileUrl}</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>${bundleId}</string>
                <key>bundle-version</key>
                <string>${app.version || '1.0'}</string>
                <key>kind</key>
                <string>software</string>
                <key>title</key>
                <string>${appName}</string>
                <key>subtitle</key>
                <string>${appName}</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>`;

    console.log('📱 Generated plist for:', appName);
    console.log('📦 Bundle ID:', bundleId);
    console.log('🔗 IPA URL:', app.fileUrl);
    
    res.send(plist);

  } catch (error) {
    console.error('Plist generation error:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
