# Steady pitch (about 5 minutes)

Run it with `npm run demo`. Words in **bold** are buttons to tap. Lines in *italics* are what to say. The student in the story is made up; never use a real student's name or story.

## Two minutes before

- Phone: Do Not Disturb on, brightness up, other apps closed, Expo Go open on the **Demo** screen.
- Tap **Start as a first-time visitor** *before* you share, so the audience first sees the Welcome screen, not the Demo screen.
- Share the phone screen in Zoom (phone joined as a second, muted participant, or scrcpy on the Mac).
- Have this page open on the Mac, not on the phone.

## 1. Open (30 seconds, no phone yet)

*"It's late. Exams start tomorrow. You're a student in a city that isn't home yet, and you feel stressed and on your own. You don't want to sign up for anything, explain yourself to an app, or be told what to do. You just want something gentle, and maybe a real person to talk to."*

*"We started from one question: whose pain have we listened to directly?"* (Add one thing your team heard from students here, in your own words, with no names.)

*"So we built Steady."*

## 2. What it is (20 seconds)

*"Steady is a gentle support app for adult students. It does four small things: a daily check-in, a one-minute calm moment, a list of trusted people (pastors and counsellors from local churches), and a Need help now screen. No account. Nothing leaves the phone."*

## 3. Live demo (about 3 minutes)

**Welcome.** *"This is the first thing you see. No sign-up, no email. And it says honestly, up front, that Steady is not emergency care."*
Tap **Continue**.

**Age question.** *"Steady is for adults, so we ask one question. Not a date of birth, just yes or no. The answer isn't stored. The app only remembers that you've seen this screen."*
Tap **I am 18 or older**.

**Home.** *"Three choices, nothing else. No streaks, no points, no notifications nagging you to come back. And top right, on every screen, there's Need help now. It's one tap from anywhere."*
Tap **Daily check-in**.

**Check-in.** *"How are you today? Our student is stressed."*
Tap **Stressed**.

**Reply.** Read it aloud: *"That sounds heavy. Would you like to breathe, or talk to someone?"* Then: *"No advice, no lecture. Just two gentle next steps."*
Tap **Breathe**.

**Calm moment.** *"A short breathing exercise: in, hold, out. In the real app it's about a minute; we've shortened it for today."* While it runs: *"It works with no internet at all. And the mood they just tapped? It was never saved. Close the app and it's gone."*
(It moves on by itself.)

**How do you feel now?** *"At the end we ask how they feel. Notice both answers look exactly the same. 'Still hard' should never feel like the wrong answer."*
Tap **Still hard**.

**Talk to someone.** *"Steady points to real people, not a chatbot: pastors and counsellors from local churches, with what each can and can't help with."*
Tap **Call** on the **Demo contact**. *"In the real app this opens the phone's own call screen. For today it just shows a note."*
Point at the other contacts: *"These buttons are switched off on purpose. Steady never lets anyone tap a number nobody has checked. Our reviewer verifies each one, and only then does it switch on."*
Tap **Need help now** (at the bottom).

**Need help now.** *"If it's urgent, this is the screen: who to reach right now. Emergency numbers and helplines appear here once they're verified."*
Tap **Home**.

## 4. How we built it (40 seconds)

*"Three choices shaped everything:"*
- *"**Privacy first.** No accounts, no server, no analytics. The only thing saved on the phone is that you've seen the welcome screen."*
- *"**Safety first.** A phone number only works once a person has checked it. We'd rather show nothing than a wrong number."*
- *"**Real people own the words.** Every line of text lives in one file that our counsellor reviewer edits. Developers don't write the care."*

## 5. Next and close (30 seconds)

*"Next: our reviewer approves the wording and verifies the contacts, and we test Steady with students before the final presentation."*

*"Steady won't fix a hard night. But it can make the next step gentle, and point to a real person. Thank you."*

## Likely questions

- **"Why not an AI chatbot?"** *"Someone in a hard moment needs a real person and an honest answer, not a bot that might get it wrong. Steady points to people."*
- **"What about emergencies?"** *"Steady says clearly that it isn't emergency care, and Need help now is one tap from every screen."*
- **"Why adults only?"** *"Supporting under-18s needs different safeguards. For now, under-18s see a kind message and where to get help, and nothing is stored."*
- **"Isn't it religious?"** *"The trusted people are pastors and counsellors from local churches, but the app itself is gentle and never preachy. Each contact says plainly what they can and can't help with."*
- **"Where does data go?"** *"Nowhere. There's no account and no server. It works in airplane mode."*
- **"Why are the numbers empty?"** *"On purpose. Our reviewer verifies each number before it can be tapped."*
- **"What's it built with?"** *"Expo and React Native, so one codebase runs on iPhone and Android."*

## If something goes wrong

- **The app opens on Home:** start the demo at Home and say the age question appears on first launch.
- **The app freezes or reloads:** shake the phone, tap **Reload**, then **Start as a first-time visitor**, and skip ahead to where you were.
- **Short on time:** skip the breathing (go Home → **Talk to someone**) and the "How we built it" part.
