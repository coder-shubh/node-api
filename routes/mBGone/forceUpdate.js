const fetch = require('node-fetch');
const express = require("express");
const router = express.Router();

router.get('/latest-version/android', async (req, res) => {
  try {
    const response = await fetch(
      'https://play.google.com/store/apps/details?id=com.mavesys.mBGone&hl=en'
    );
    const html = await response.text();

    const versionMatch = html.match(/"Current Version","([^"]+)"/);
    if (versionMatch && versionMatch[1]) {
      res.json({ version: versionMatch[1] });
    } else {
      res.status(404).json({ error: 'Version not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
