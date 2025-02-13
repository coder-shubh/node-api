const express = require("express");
const router = express.Router();
const AppOpen = require("../../models/XMood/XMAppOpen"); // Import the model

function getDeviceInfo(userAgent) {
  let deviceInfo = "Unknown Device";

  if (userAgent.includes("Mobile")) {
    deviceInfo = "Mobile Device";
  } else if (userAgent.includes("Tablet")) {
    deviceInfo = "Tablet Device";
  } else if (userAgent.includes("Windows")) {
    deviceInfo = "Windows PC";
  } else if (userAgent.includes("Macintosh")) {
    deviceInfo = "Mac Computer";
  }

  return deviceInfo;
}

router.get("/XMAppOpen", async (req, res) => {
  const userAgent = req.headers["user-agent"];
  const deviceInfo = getDeviceInfo(userAgent);

  try {
    // Find the document for this deviceInfo in the database
    let appData = await AppOpen.findOne({ deviceInfo });

    // If the document does not exist, create a new one
    if (!appData) {
      appData = new AppOpen({
        deviceInfo,
        totalOpens: 0,
        deviceVisits: {},
      });
    }

    // Increment the total opens and device-specific visits
    appData.totalOpens++;
    if (!appData.deviceVisits[userAgent]) {
      appData.deviceVisits[userAgent] = 0;
    }
    appData.deviceVisits[userAgent]++;

    // Save the data back to the database
    await appData.save();

    // Send response with updated data
    res.json({
      message: `App has been opened on a ${deviceInfo}`,
      totalOpens: appData.totalOpens,
      deviceOpens: appData.deviceVisits[userAgent],
      statusCode: res.statusCode,
    });
  } catch (error) {
    console.error("Error handling app open request", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", statusCode: res.statusCode });
  }
});

module.exports = router;
