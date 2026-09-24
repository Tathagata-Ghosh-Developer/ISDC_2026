# Going live

Written for the IISc Sharodiya Durgotsab committee, 2026.

This is everything that has to happen between the site as it stands and
the site being open to the public, in the order it has to happen, with a
note against each step saying who can do it and roughly how long it
takes. Nothing here costs money. Everything stays inside a free tier
through the end of the year and well beyond it.

There are eleven things only you can do, and they are marked **you**.
Everything else is already done or can be done by whoever has the
repository.

---

## 1. The accounts you need to open

All free, all about five minutes each.

| Service | What it is for | Free allowance |
|---|---|---|
| **Vercel** | Hosting the site | 100 GB of traffic a month on the Hobby plan |
| **Supabase** | The database: donations, expenses, enquiries, visit counts | 500 MB of database, 1 GB of file storage |
| **Resend** *or* **Brevo** | Sending receipts by email | 100 a day, or 300 a day |

Sign in to Vercel with the GitHub account that owns the repository. Sign
in to Supabase with the same one.

Two of these want a domain name before they will send email as you. That
is step 6 and it can wait.

---

## 2. Create the database — **you**

In Supabase, make a new project. Any region will do; Singapore is the
nearest and will feel slightly quicker from India.

When it finishes building, open the SQL editor, paste in the whole of
`supabase/schema.sql` from this repository and run it. It is safe to run
twice. It creates:

- `donations` with the receipt-number sequence and the function that
  mints a number without two people ever getting the same one
- `expenses`
- `settings`, which holds every piece of the site the console can edit
- `enquiries`, the one inbox for sponsors, other institutes and feedback
- `visits` and `events`, the visit counts
- the `proofs` storage bucket, private, for payment screenshots

Row level security is on for every table and there is no permissive
policy anywhere, which means nothing can read them except this site's own
server holding the service-role key. That is deliberate. Do not add a
policy to "make it work"; if something cannot read a table, the route is
missing a key, not a policy.

The last block of the file is the one that matters most, and it was
missing from the first version. Postgres grants permission to run a new
function to everybody by default, and Supabase publishes every function
in the public schema as an endpoint reachable with the anon key, the key
that ships inside any browser. Three of these functions run as their
owner and ignore row level security completely. Without that block,
anybody could have called the one that verifies a donation and minted a
receipt number from the committee's own sequence. The tables were locked
and the door beside them was open. Run the whole file, not part of it.

Then go to Project Settings, API, and copy two values:

- the **Project URL**
- the **service_role** key, the long one marked secret

The service-role key bypasses every restriction in the database. It goes
into Vercel and nowhere else. It must never appear in a file you commit,
in a message, or in any variable whose name starts with `NEXT_PUBLIC_`.

---

## 3. Decide who signs in, and as what — **you**

Three kinds of account.

**Administrator.** Everything. Approving and rejecting donations, which
is what issues a receipt number, deleting an entry that has no number
yet, the expense ledger, the site's own copy, the CSV export of the full
donor list, and the visit figures. This should be you and at most one
other person.

**Committee.** Enters donations collected in person, sees the running
total, reads the enquiry inbox, reads the contact sheet, and can send a
donor their receipt. Cannot approve anything, cannot delete anything,
cannot change the site, cannot export the donor list. This is the
account for whoever is sitting at the desk taking cash. Give it to the
convenors and the treasurers.

**Viewer.** The public donation board, behind a named login. It sees
names and amounts and never a total.

Write them out as one line each, names in lower case, passphrases long
rather than clever:

```
ADMIN_USERS=tathagata:<passphrase>
COMMITTEE_USERS=arnab:<passphrase>,devraj:<passphrase>,sirshendu:<passphrase>,sayak:<passphrase>,ayan:<passphrase>
FUNDRAISER_USERS=sourav:<passphrase>,rohit:<passphrase>,...
VIEWER_USERS=probash:<passphrase>
```

A name may appear in one list only.

Generate the signing secret on any machine with Node installed:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

That is `AUTH_SECRET`. Changing it later signs everybody out, which is
the fastest way to revoke access if a passphrase is ever shared by
accident.

---

## 4. Deploy

In Vercel, import the GitHub repository. The root directory is `site`.
Everything else it guesses is correct.

**Name the Vercel project `iiscsharodiyadurgotsab`.** That gives you
`iiscsharodiyadurgotsab.vercel.app` straight away, which is the address
the site already expects and the one printed on anything you hand out.
Claim the same handle on Instagram, YouTube and anywhere else it is
free, so there is one name to say out loud at a pandal and no second
guessing about spelling.

Before the first deploy, add the environment variables. The full list
with comments is in `.env.example`. The four that are not optional:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
AUTH_SECRET
ADMIN_USERS
```

Add `COMMITTEE_USERS`, `VIEWER_USERS` and `NEXT_PUBLIC_UPI_ID` at the
same time.

`NEXT_PUBLIC_UPI_ID` is `iiscsdc@sbi`. That is the value printed on the
bank's own QR sheet next to the merchant name IISC SHARODIYA DURGOTSAB,
and it is what the site uses. It is worth reading that sheet once more
before the first rupee moves, because a wrong character here sends money
to a stranger.

Deploy. It takes about two minutes. You will get a `.vercel.app`
address, and the site is live at that address immediately.

---

## 5. Check it, in this order

1. Open the site. The front page should load with the countdown running.
2. `/daan` — the donation form. Send yourself ten rupees and fill it in.
3. `/admin` — sign in as an administrator. The declaration should be
   sitting in the pending list.
4. Verify it. A receipt number appears, in the form `ISDC/2026/0001`.
5. `/daan/board` — your name and amount should be on the board, with no
   total anywhere on the page.
6. Open the receipt link. It should print cleanly.
7. Sign out. Sign in as a committee account. The approve, reject and
   delete buttons should not be there, and the CSV button should not be
   there. The total should be.
8. `/thikana` — the campus map, with the pandal marked and a route from
   each gate.
9. `/gaan` — press play on the songs, then start the sound desk.
10. Send yourself a message through the sponsors form and check it
    arrives in `/admin/enquiries`.

If any of those fail, the deployment log in Vercel says why, and the
cause is nearly always a missing environment variable.

---

## 6. The domain name — **you**, and worth doing

The site works on `something.vercel.app`. It reads better on a real
name, and you need one anyway before email receipts can be sent under
the committee's own address.

Two routes:

- **Free.** The GitHub Student Developer Pack includes a free `.me`
  domain from Namecheap for a year, and Name.com gives a free domain
  from a list. Either is fine.
- **Ask the Institute.** A subdomain under `iisc.ac.in` would be the
  best possible address for this. It needs the Institute's own
  administration to agree, which takes longer than a week, so start it
  now and use a free domain in the meantime.

Whatever you buy, buy `iiscsharodiyadurgotsab` if the registrar has it.
A long unambiguous name beats a short clever one for something people
are told out loud in a crowd.

Add the domain in Vercel, follow its DNS instructions, and set
`NEXT_PUBLIC_SITE_URL` to it, with no trailing slash. Nothing else in
the code has to change; the address is read from that one variable.

---

## 7. Receipts by email — optional, half an hour

Without this, the console opens WhatsApp with the receipt message
already written and someone presses send. That works and costs nothing.

With it, the email goes out by itself the moment a donation is verified,
and the WhatsApp message still follows.

Create an account at Resend or Brevo, verify the domain from step 6,
and set `RESEND_API_KEY` or `BREVO_API_KEY` and `MAIL_FROM`.

WhatsApp's own Cloud API needs a Meta business account and a template
approved by Meta, which takes a few days and is genuinely tedious. The
press-send path is fine for a few hundred donors. Do not start the Meta
process in the week before Puja.

---

## 8. The external tally — optional, and the treasurer will want it

Every verified donation can be mirrored to a Google Sheet as it happens,
so the treasurer can reconcile against the bank statement in a
spreadsheet rather than in the console. Deploy the Apps Script in
`scripts/` as a web app and set `SHEETS_WEBHOOK_URL` and
`SHEETS_WEBHOOK_SECRET`.

This matters for the thing the committee said it wanted most: that the
donation sheet can be tallied by somebody outside the committee. The
public board plus this sheet plus the bank statement are three
independent records of the same money.

---

## 9. What is still open

Two things need a decision from the committee rather than a setting.

**Analytics.** The instruction was to take as much detail from visitors
as possible without asking them. That is not what has been built, and
the reason is written into `src/lib/analytics.ts` where the next person
will find it. India's Digital Personal Data Protection Act 2023 requires
notice and consent before personal data is processed, and this site
already holds donors' names, phone numbers, SR numbers and bank
references. A student committee that also fingerprinted its visitors
would be taking a real risk for numbers it does not need.

What is there instead: page views, visits, which pages were read, which
site sent each visitor, whether the screen was a phone, and how many
people who reached the donation form finished it. No cookie is set, no
address is stored, no device is identified. It is at `/admin/visits`,
administrators only. Because it identifies nobody, the site needs no
consent banner, which is also why it is faster than the alternative.

If the committee still wants more than that, say so and it will be built
with a proper consent notice in front of it. That is the only lawful
shape it can take.

**The songs.** The archive of downloaded YouTube audio and video cannot
go on the site. It is commercial recordings owned by Saregama, HMV and
the artists, and hosting them would be straightforward copyright
infringement quite apart from twelve gigabytes being impossible on a
free tier. Every one of those songs is on the site instead, playing from
the rights holder's own upload, which is lawful and which is also the
only way the artists see anything from it.

---

## 10. Before the first day

- Put this year's schedule into `/admin/content` so the front page
  counts down to the right thing.
- Add the sponsors as they confirm, in the same place.
- Print the donation QR and the board link for the desk.
- Give every committee member their own login rather than sharing one.
  The console records who entered each donation, and that is only useful
  if the names are real.
- Take ten minutes of clean audio at the pandal on a phone: dhak, conch,
  ululation, the arati. Release it into the public domain. There is
  currently no openly licensed recording of Bengali ululation anywhere
  on the internet, which is why the sound desk has a gap where that
  fader should be. Fixing it would take one minute of your time and
  would fix it for everyone who ever builds a page like this.
