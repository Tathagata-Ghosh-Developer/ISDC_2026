# Sending receipts by WhatsApp and email

Written for the IISc Sharodiya Durgotsab committee to discuss and decide.
Nothing here needs a developer to read. Every figure is from the
provider's own published page, checked in September 2026.

The question is narrow: **when a treasurer verifies a donation, how does
the receipt reach the donor without anybody typing it out?**

Right now it reaches them because a committee member presses a button,
their own WhatsApp opens with the message already written, and they
press send. That works today, costs nothing, and needs no decision. The
rest of this document is about replacing that press with a machine.

---

## The short version

| | WhatsApp | Email |
|---|---|---|
| Is it possible at all? | Yes, two ways | Yes, one way |
| Blocking requirement | **A spare SIM** | **A domain name** |
| Cost | ₹0 to about ₹50 for the whole festival | ₹0 |
| Lead time | 3 days to 3 weeks | About 2 hours |
| Risk if it goes wrong | A phone number is banned, usually permanently | Receipts land in spam |

**If the team can produce one spare SIM and about ₹700 for a domain,
both work.** Without a spare SIM, WhatsApp cannot be automated at all,
by any route, and the button stays. That is the single fact worth
taking to the meeting.

---

## WhatsApp

### The blocker nobody expects

Meta's own documentation is explicit:

> Numbers already in use with WhatsApp cannot be registered unless they
> are deleted first.

So **7890825610 cannot be the sender**. Neither can any number that
already has WhatsApp on it. This is true for both routes below, for
different reasons, and it is the reason to start with a SIM rather than
with software.

A spare prepaid SIM costs a few hundred rupees and can be a cheap
handset or an eSIM. It needs to receive one verification code and then
stay active.

### Route A: Meta's official Cloud API

The proper way. Nothing can be banned for using it.

**What the team must provide**

1. A spare phone number, as above.
2. A Meta (Facebook) business account. Free.
3. A message template submitted to Meta and approved. This is a fixed
   form of words with blanks, like *"Namaskar {{1}}, your contribution
   of {{2}} has been received. Receipt {{3}}."* Approval usually takes
   a day or two and can be rejected for wording.
4. Somebody to do steps 2 and 3, which is fiddly form-filling rather
   than anything technical. Budget an afternoon.

**What it costs**

From Meta's own rate table for India, effective 1 July 2026:

| Conversation type | Price |
|---|---|
| Service (donor messaged you first, within 24 hours) | **₹0** |
| Utility (you message first, e.g. a receipt) | ₹0.1150 |

Three hundred receipts as utility messages is about ₹35 plus GST.

**The trick that makes it free.** A service conversation costs nothing,
and one opens whenever the donor messages you first. If the donation
page ends with a button saying "I have paid, tell the committee", the
donor's tap opens that window and every receipt inside the next 24 hours
is free and needs no template at all. Worth designing in for next year.

**What it does not need.** Business verification is *not* required to
start sending. A new account can message 250 different people every 24
hours, which covers a festival comfortably.

**Lead time**: three days to three weeks, almost all of it waiting for
Meta. Not something to start in October.

### Route B: OpenWA, self-hosted

The route the committee asked about. It is already built into the site
and switches on with three settings.

**What it is.** A free, open-source gateway the committee runs on its
own machine. It logs into WhatsApp the way WhatsApp Web does, by
scanning a QR code, and then the site can ask it to send messages.

**What its own authors say**, quoted rather than paraphrased:

> OpenWA is an unofficial, community-maintained gateway. It connects to
> WhatsApp through reverse-engineered clients, not through Meta's
> official Cloud API.

> There is always a non-zero risk of account restriction or ban.
> WhatsApp's anti-abuse systems actively look for unofficial
> automation. No amount of code quality on our side can make that risk
> zero.

**What the team must provide**

1. A spare phone number. Not a personal one. If it is banned there is
   frequently no appeal, and whatever else that number is used for goes
   with it.
2. **A computer that stays on.** This is the part people underestimate.
   It holds a live WhatsApp session and several hundred megabytes of
   headless browser, so it cannot live on the website's hosting. It
   needs one of:
   - a free always-on cloud machine (Oracle Cloud's always-free tier,
     or Fly.io's allowance), or
   - a small paid virtual machine, roughly ₹400 a month, or
   - a machine on campus that nobody switches off for five days.
3. Somebody to run three Docker commands and scan a QR code. Half an
   hour for anyone who has used a terminal.
4. Patience with the number for a few days beforehand. Their own
   guidance: behave like a person, exchange a few real messages, join a
   group, set a photo. Do not send to strangers on day one.

**What it costs**: nothing, or the price of the smallest virtual
machine.

**The honest risk assessment.** The per-festival chance of a ban is
low, plausibly under one in five, and many people run these for years
without trouble. The argument against is not the odds, it is the shape
of the bet: the downside is losing a number permanently with no appeal,
and the alternative is a button that already works. Receipts also go to
people who have just paid but have usually never messaged the committee,
which is exactly the pattern their own guidance warns produces
restrictions.

### What is already built

The site supports both. It tries Meta's API if configured, then OpenWA
if configured, then falls back to the button. Whichever fails, the
button comes back with the failure, so no receipt is ever stuck.

There is also an administrators-only page that reports whether the
gateway is connected and sends a clearly marked test receipt to any
number, so the committee can confirm delivery in September rather than
discovering a logged-out session in October.

---

## Email

### The blocker

`tathagatag@iisc.ac.in` **cannot be the sending address.** This is not a
policy choice, it is arithmetic. The Institute's DNS says:

```
iisc.ac.in       SPF:   v=spf1 include:spf.protection.outlook.com -all
_dmarc.iisc.ac.in       v=DMARC1; p=quarantine; ruf=...; fo=1
```

In plain terms: IISc has told the world that mail from `iisc.ac.in` sent
by anybody other than Microsoft should be treated as forged and
quarantined, and that a forensic report should be filed when it happens.
Sending receipts as that address would put them in spam folders and
generate reports to IISc IT naming the committee.

One provider, Brevo, will *accept* the address after a click-to-verify
step, which makes this worse rather than better: it looks like it worked
right up until a donor says they never received anything.

IISc's Microsoft 365 also cannot issue an SMTP app password. That is an
administrator-only setting and basic authentication for SMTP is being
switched off entirely at the end of 2026.

### What actually works

**Buy a domain.** `iiscsharodiyadurgotsab.in` costs roughly ₹500 to
₹900 a year, or is free for a year through the GitHub Student Developer
Pack, which the committee already has access to.

Then:

1. Create a free Resend account. Free tier: 3,000 emails a month,
   100 a day. A festival needs a few hundred.
2. Add the domain and paste three DNS records. Fifteen minutes.
3. Send as `receipts@iiscsharodiyadurgotsab.in`, with **reply-to set to
   `tathagatag@iisc.ac.in`**, so a donor replying still reaches a human
   at the Institute. This is already built and needs no code change.

**Total: about two hours, mostly waiting for DNS, and ₹0 to ₹900.**

The alternative, a committee Gmail account sending over SMTP, works and
is limited to 500 a day, but it looks like a personal Gmail on the
receipt rather than the committee.

### Self-hosting a mail server

The team asked about open-source email. It is possible and it is the
wrong tool here. Running your own mail server means building a sending
reputation from nothing, and a brand-new server sending a burst of
receipts with links and amounts in them is what spam filters are built
to catch. The software is not the hard part; the reputation is, and it
takes months. Revisit in a year if the committee wants its own
infrastructure.

---

## What to decide in the meeting

1. **Can we get a spare SIM?** If no, WhatsApp automation is off the
   table entirely and the button stays. Everything else follows from
   this.
2. **If yes, official or self-hosted?** Official is slower to set up,
   costs about ₹35, and carries no risk. Self-hosted is free, works
   this week, and can lose the number.
3. **Do we have a machine that stays on for five days?** Only matters
   for the self-hosted route.
4. **Will we buy a domain?** About ₹700, or free through the Student
   Pack. It unlocks email entirely and improves the website's address at
   the same time.
5. **Who owns each of these accounts?** Whoever creates the Meta
   account, the domain and the Resend account still owns them next year.
   Put two committee members on each before anybody graduates.

## The recommendation, if it helps

Buy the domain and set up email. Two hours, near-zero cost, no risk, and
it fixes the website's address as well.

Leave WhatsApp on the button for this festival. It works, a committee
member is standing at the desk anyway, and pressing send takes two
seconds. Start the Meta account in July next year, when three weeks of
waiting costs nothing.

Use OpenWA only if the team both wants it and can produce a SIM that
nobody would mind losing.
