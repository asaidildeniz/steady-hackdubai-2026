/* Need help now and Talk to someone: wording, verified emergency numbers and the example contacts,
   copied from the app's src/content/content.json (needHelp, talkToSomeone, demo.contacts). Keep them in step.
   Only verified, non-empty numbers are listed. This is a demo, so no call button ever dials. */
window.SteadyHelp = {
  "needHelp": {
    "title": "Need help now",
    "message": "You are not alone. If you are in danger or cannot keep yourself safe, contact emergency services now. They answer any time, unlike our volunteers.",
    "emergencyHeading": "Emergency numbers",
    "emergency": [
      {
        "label": "Ambulance",
        "number": "998",
        "when": "if you’ve hurt yourself, taken something, or might."
      },
      {
        "label": "Police",
        "number": "999",
        "when": "if someone is hurting you, or you’re not safe where you are."
      }
    ],
    "helplines": [],
    "pending": "Verified numbers will appear here once our reviewer has checked them."
  },
  "talk": {
    "title": "Talk to someone",
    "note": "These people can listen and pray with you. They are volunteers and may not reply straight away. Send a message to arrange a time. If you are in danger, use Need help now.",
    "roles": {
      "pastor": "Pastor",
      "counsellor": "Counsellor"
    },
    "canHelpWith": "Can help with",
    "cannotHelpWith": "Cannot help with",
    "call": "Call",
    "message": "Message",
    "pending": "We are still checking this number",
    "contacts": [
      {
        "name": "Example pastor",
        "role": "pastor",
        "church": "A local partner church",
        "canHelpWith": "Listening, prayer, encouragement",
        "cannotHelpWith": "Emergencies, medical advice",
        "phone": "+971 00 000 0000",
        "tappable": true
      },
      {
        "name": "Example counsellor",
        "role": "counsellor",
        "church": "A local partner church",
        "canHelpWith": "Talking through stress and loneliness",
        "cannotHelpWith": "Emergencies",
        "phone": "",
        "tappable": null
      }
    ]
  },
  "callNote": "Demo: in the real app, this opens your phone's call or message app."
};
