const WEEKLY_ALARM = "weekly-checkin";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(WEEKLY_ALARM, {
    periodInMinutes: 7 * 24 * 60,
    delayInMinutes: 7 * 24 * 60,
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== WEEKLY_ALARM) return;

  chrome.notifications.create("weekly-checkin", {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon128.png"),
    title: "Curiosity Coach",
    message: "Time for your weekly check-in. What are you curious about this week?",
    priority: 1,
  });
});
