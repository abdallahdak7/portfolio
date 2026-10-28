# Abdallah's portfolio

The website that presents Abdallah to hiring managers and recruiters, and lets them ask Tom about his work. The Ask Tom terms are shared with Tom's backend (`abdallahdak7/speak-about-abdallah`) and must mean the same thing in both.

## People

**Abdallah**:
The engineer the site presents. Every statement on the site is about him, written in his voice.
_Avoid_: owner, user

**Visitor**:
A person reading the site or chatting with Tom. Typically a hiring manager or recruiter.
_Avoid_: user, guest, client

## What the site says

**Confirmed fact**:
Something stated as true about Abdallah, such as a role held or a skill used. Every Confirmed fact on the site is backed by his Résumé or LinkedIn.
_Avoid_: claim, achievement

**Aspiration**:
A stated openness or goal, such as leadership or relocation. Never presented as a commitment or a Confirmed fact.

**Job**:
A period Abdallah spent at one company. A Job holds one or more Roles.
_Avoid_: position, employer

**Role**:
A title Abdallah held during a Job, with its period and what he did in it.
_Avoid_: position

**Principle**:
One way Abdallah works, shown in the Approach section.
_Avoid_: value

**Spotlight**:
The one project the site features in depth, told through its goal, its judgment calls and why it matters.
_Avoid_: case study, portfolio item

**Résumé**:
The one-page PDF of Abdallah's experience. It and the site state the same Confirmed facts.
_Avoid_: CV

## Ask Tom

**Tom**:
The assistant persona that speaks *about* Abdallah in the third person. Tom is not Abdallah and never claims to be.
_Avoid_: bot, agent, chatbot

**Profile**:
The body of facts about Abdallah that Tom is allowed to share, reviewed and approved by Abdallah. Anything outside it is unknown to Tom.

**Conversation**:
One continuous chat between a Visitor and Tom, opened once the Visitor passes the Human check. Limits on Visitor turns and Messages apply per Conversation.
_Avoid_: chat, session, thread

**Turn**:
A single contribution to a Conversation, by the Visitor (a **Visitor turn**) or by Tom (a **Tom turn**).
_Avoid_: message (that word is taken by Message)

**Exchange**:
A Visitor turn and Tom's reply to it.

**Withdrawn turn**:
A Visitor turn that never reached Tom, because it was refused or couldn't be delivered. It leaves the Conversation and its text goes back to the Visitor to send again.

**Paused**:
A Conversation is Paused while the Visitor's network has asked too many questions. The Visitor can't send until the pause ends.

**Ended**:
A Conversation is Ended once it reaches its turn limit or the Visitor can't be verified. The Visitor can't send anything else in it.

**Suggested question**:
One of up to three professional prompts offered to a Visitor to start a Conversation.

**Dictation**:
Speaking a question instead of typing it. What the Visitor says is written into their draft as it's heard; they check it and send it themselves. Exists only on this site, not in Tom's backend.
_Avoid_: voice input, speech-to-text, voice mode

**Message**:
A note a Visitor asks Tom to pass on to Abdallah: the Visitor's name, email address and text.
_Avoid_: contact request, lead

**Human check**:
The check that a Visitor is a person, needed before a Conversation opens. Usually invisible; occasionally the Visitor has to tick a box.
_Avoid_: captcha

**Notice**:
What the Ask Tom section shows when Tom can't answer: the reason, the Fallback email, and sometimes the Booking link.
_Avoid_: error, alert, banner

**Booking link**:
The link a Visitor can follow to schedule a call with Abdallah.

**Fallback email**:
Abdallah's email address, offered to a Visitor whenever Tom can't help.
_Avoid_: contact email
