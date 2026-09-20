# IISc Sharodiya Durgotsab

The website for the Durga Puja of the Indian Institute of Science, Bengaluru.

It is a public site, a donation ledger and a committee console in one
application. It costs nothing to run: the hosting, the database and the
assistant all sit inside free tiers, and there is no payment gateway, so
no percentage of any donation is lost to fees.

---

## What it does

**For visitors**

- An arrival sequence in four movements, drawn in SVG, playing once per
  browser session and skippable at any point.
- The history of Durga Puja across five eras, with ninety facts, each
  carrying the source it came from and a Bengali rendering.
- Twenty-four art forms the festival commissions every year, each naming
  a living practitioner or institution.
- The four days hour by hour, a gallery, the Probash magazine, volunteer
  roles and sponsorship.
- A guide in the corner that answers questions from this site's own
  content, and keeps working when no AI key is configured.

**For donors**

- Bank details and a QR code to pay with, then a form recording what was
  sent. The form never charges anyone.
- A numbered receipt, viewable and printable, sent to the donor over
  WhatsApp once the treasurer has matched the payment.
- A public board showing everyone who gave, ranked by amount. Totals are
  deliberately not published.

**For the committee**

- A console at `/admin` to verify donations, issue receipts, record
  expenses and edit the content of the public site.
- CSV export of donations and expenses, plus an optional live mirror into
  a Google Sheet for tallying outside this application.

---

## Setting it up

### 1. The database

Create a free project at [supabase.com](https://supabase.com). Open the
SQL editor, paste the whole of [`supabase/schema.sql`](supabase/schema.sql)
and run it. That creates the tables, the receipt-number function, the
private bucket for payment screenshots, and turns on row level security.

From **Project Settings → API**, copy the project URL and the
**service_role** key.

> The service role key bypasses row level security. It belongs only in
> the server environment, never in a variable beginning `NEXT_PUBLIC_`,
> and never in the repository.

### 2. The environment

Copy `.env.example` to `.env.local` and fill it in.

```bash
cp .env.example .env.local
```

Generate the session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set at minimum:

| Variable | What it is |
| --- | --- |
| `SUPABASE_URL` | Project URL from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key from Supabase |
| `AUTH_SECRET` | The 64 characters generated above |
| `ADMIN_USERS` | `treasurer:some-long-passphrase,secretary:another-one` |

Optional:

| Variable | What it adds |
| --- | --- |
| `NEXT_PUBLIC_UPI_ID` | Shows the UPI address on the donation page |
| `SHEETS_WEBHOOK_URL` | Mirrors every donation into a Google Sheet |
| `GROQ_API_KEY` | Prose answers from the guide, free tier |
| `GEMINI_API_KEY` | Alternative provider for the same |

### 3. Running it

```bash
npm install
npm run dev
```

The site is at `http://localhost:3000`, the console at
`http://localhost:3000/admin`.

### 4. Deploying

Push to GitHub, then import the repository at
[vercel.com/new](https://vercel.com/new). Set the same environment
variables under **Settings → Environment Variables** and deploy. The free
Hobby plan is enough; nothing here needs a paid feature.

Every push to `main` deploys automatically after that.

---

## Running the Puja on it

### Verifying a donation

1. Open `/admin`. New declarations sit under **Awaiting check**.
2. Find the payment in the bank statement. The transaction reference the
   donor gave makes this immediate.
3. Press **Verify and issue receipt**. The next receipt number in
   sequence is issued, and the entry appears on the public board.
4. Press **Send on WhatsApp**. The message opens with the receipt link
   already written; press send.

Receipt numbers are minted inside a database function, so two people
verifying at the same moment cannot produce the same number. They run in
an unbroken sequence, so a gap is visible to anyone auditing the export.

If a payment cannot be found, use **Not found in statement** rather than
deleting the row. Nothing is ever silently removed.

### Recording what was spent

Under **Expenses**, add each payment with its head, vendor and date. These
are recorded for the committee's own accounts and the CSV export. They
are not currently published on the public site.

### Changing the site

Under **Content**, every part of the public site the committee is likely
to change is editable: the announcement bar, the hero, the dates, the
bank details, the schedule, contacts, links and sponsors. Each section
has a **Reset to default** button that restores the version compiled into
the code, so nothing here can be permanently broken.

### Adding photographs

Drop image files into `public/media/puja`, `public/media/iisc` or
`public/media/art` and push. The gallery reads the folders at build time,
so they appear without any code change.

### Adding the payment QR

Save the bank's QR image as `public/media/qr/upi-qr.png`. The donation
page shows it automatically and hides the placeholder note.

---

## Handing over next year

1. Change `ADMIN_USERS` to the new committee's passphrases and rotate
   `AUTH_SECRET`. Old sessions stop working immediately.
2. Update the bank account under **Content → Bank account** if the
   signatories have changed.
3. Update the dates and the schedule under **Content**.
4. Export both CSVs for the outgoing treasurer's audit file.

No developer is needed for any of that.

---

## How it is built

- **Next.js** with the App Router, **TypeScript**, **Tailwind CSS**
- **Supabase** for Postgres and private file storage
- **Framer Motion** for the arrival sequence and page transitions
- Sessions are a signed cookie; there is no user table to maintain
- The browser never holds a database key. Every read and write goes
  through a server route, which is why the tables carry row level
  security with no permissive policy.

### Privacy

A receipt is reachable by its own `receipt_token`, never by the row id,
and the public board sends the browser no identifier at all. That
separation is deliberate: an earlier version put the row id in the
board's HTML, which turned a public page into an index of every donor's
name, email, phone and SR number, anonymous donors included. If you
change the board, do not reintroduce an id into `BoardEntry`.

Receipts and the console are excluded from search engines in
`src/app/robots.ts` and by an `X-Robots-Tag` header in `next.config.ts`.

### Design

The visual language is Satyajit Ray's. Before Pather Panchali he spent
thirteen years as a visualiser at D. J. Keymer, lettered his own title
cards by hand, and drew four Latin typefaces — two of which, Ray Roman
and Ray Bizarre, won an international competition in 1971.

So: Bengali headings in a brush face, roman display with the high stroke
contrast of Ray Roman, rules and ticks drawn rather than ruled, and flat
unmodelled fields of scarlet and turmeric placed off-centre the way he
placed them on posters and Sandesh covers. None of Ray's own typefaces
are freely licensed, so nothing here is his; Bodoni Moda and Galada
stand in.

Type and spacing run on powers of the golden ratio. The palette inverts
into a night-pandal dark theme through a single set of tokens, so there
are no `dark:` variants scattered through the markup.

Everything respects `prefers-reduced-motion`: the arrival sequence
collapses to a single fade, and parallax and drift stop.

### Sources

The historical material is researched and sourced rather than repeated.
Where accounts conflict, the site says so. Several widely circulated
claims were checked and left out because no reliable source supports
them — including the story that Robert Clive attended the Shobhabazar
Puja of 1757, and the claim that J. C. Bose, P. C. Ray, S. N. Bose or
Meghnad Saha held posts at this Institute. The real Bengal link runs
through Jnan Chandra Ghosh, Director from 1939 to 1947.

If you find an error, correct it and say so publicly. That is the whole
premise of the donation board too.
