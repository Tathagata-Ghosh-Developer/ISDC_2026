import { SITE } from "@/lib/site";

/* ================================================================
   What the installed app shows when there is no signal.

   The service worker (public/sw.js) saves this on install and serves
   it for any page that cannot be fetched and was never saved. It is a
   route handler rather than a page on purpose: a page would carry the
   whole layout, the arrival sequence, the merchandise popup and the
   guide, none of which can work offline, and every script and font
   they need would have to be in the cache for it to look right. This
   is one self-contained document with its own styles, in the site's
   colours, that renders from the cache with nothing else.

   It links to the schedule and the venue, which the worker saves on
   install, and says when each was last saved, read from the cached
   copy itself. Donating is never offered offline: the worker never
   serves /daan from a cache.
   ================================================================ */

export const dynamic = "force-static";

const LIGHT = `--paper:#f2e7d2;--paper-3:#fbf6ea;--ink:#17110c;--soft:#4d3a2a;--faint:#76614e;--sindoor:#c0271a;--gold:#7d5f1a;--line:rgba(42,26,16,.16);color-scheme:light`;
const DARK = `--paper:#120d10;--paper-3:#241a1e;--ink:#f2e5d0;--soft:#c9b295;--faint:#93806c;--sindoor:#e35b43;--gold:#d8b45e;--line:rgba(242,229,208,.16);color-scheme:dark`;

const SAVED = [
  { href: "/utsab", title: "The five days", note: "The schedule, ritual by ritual", bangla: "উৎসব" },
  { href: "/thikana", title: "Find us", note: "The pandal, the gates and the map", bangla: "ঠিকানা" },
  { href: "/", title: "Home", note: "The countdown and the short version", bangla: "প্রথম পাতা" },
];

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f4e9d6">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#120d10">
<title>Offline · ${SITE.name}</title>
<link rel="icon" href="/media/brand/icon-192.png">
<script>(function(){try{var t=localStorage.getItem('isdc-theme');if(t){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()</script>
<style>
:root{${LIGHT}}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${DARK}}}
:root[data-theme="dark"]{${DARK}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;min-height:100dvh;background:var(--paper);color:var(--ink);font:16px/1.65 Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased;padding:max(2.618rem,env(safe-area-inset-top)) max(1.25rem,env(safe-area-inset-right)) max(2.618rem,env(safe-area-inset-bottom)) max(1.25rem,env(safe-area-inset-left))}
main{max-width:34rem;margin:0 auto}
.bn{font-family:"Noto Serif Bengali","Kohinoor Bangla","Bangla Sangam MN","Nirmala UI","Vrinda",serif}
.display{font-family:"Bodoni Moda","Bodoni 72",Didot,Georgia,serif;font-weight:400;letter-spacing:-.01em}
.crest{display:block;width:64px;height:64px;border-radius:50%}
.eyebrow{margin:1.618rem 0 0;font-size:.72rem;font-weight:500;letter-spacing:.34em;text-transform:uppercase;color:var(--gold)}
.bangla-title{margin:.618rem 0 0;font-size:1.6rem;line-height:1.3;color:var(--sindoor)}
h1{margin:.2rem 0 0;font-size:2.4rem;line-height:1.1}
.lede{margin:1rem 0 0;color:var(--soft)}
nav{margin-top:1.618rem;border-top:1px solid var(--line)}
.row{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding:1rem 0;border-bottom:1px solid var(--line);color:inherit;text-decoration:none}
.row:hover .t,.row:focus-visible .t{color:var(--sindoor)}
.t{display:block;font-size:1.35rem;line-height:1.25}
.note,.when{display:block;font-size:.8rem;color:var(--faint)}
.when{margin-top:.15rem}
.row .bn{flex-shrink:0;font-size:1.1rem;color:var(--gold)}
.row.missing{opacity:.55}
.give{margin:1.618rem 0 0;padding-left:1rem;border-left:2px solid var(--gold);font-size:.85rem;color:var(--soft)}
button{margin-top:1.618rem;display:inline-flex;align-items:center;gap:.6rem;padding:.8rem 1.6rem;border:0;background:var(--sindoor);color:#fdf6e8;font-family:inherit;font-size:.78rem;font-weight:500;line-height:1.2;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
button .bn{text-transform:none;letter-spacing:0;font-size:.9rem}
.foot{margin-top:2.618rem;font-size:.75rem;color:var(--faint)}
</style>
</head>
<body>
<main>
<img class="crest" src="/media/brand/icon-192.png" width="64" height="64" alt="">
<p class="eyebrow">No connection</p>
<p class="bn bangla-title" lang="bn">আপনি এখন অফলাইন</p>
<h1 class="display">You are offline</h1>
<p class="lede">The pages you opened before are saved on this device, so the five days and the way to the pandal still open without a signal.</p>
<nav aria-label="Saved pages">
${SAVED.map(
  (s) => `<a class="row" href="${s.href}" data-saved="${s.href}"><span><span class="display t">${s.title}</span><span class="note">${s.note}</span><span class="when"></span></span><span class="bn" lang="bn">${s.bangla}</span></a>`,
).join("\n")}
</nav>
<p class="give">Donating needs a connection, so the bank details are only ever shown fresh. <span class="bn" lang="bn">দান করতে ইন্টারনেট সংযোগ লাগবে।</span></p>
<button type="button" id="retry">Try again <span class="bn" lang="bn">আবার চেষ্টা করুন</span></button>
<p class="foot">${SITE.name} ${SITE.year} · ${SITE.venueShort}</p>
</main>
<script>(function(){
var retry=document.getElementById('retry');
retry.addEventListener('click',function(){location.reload()});
window.addEventListener('online',function(){location.reload()});
if(!('caches' in window))return;
document.querySelectorAll('[data-saved]').forEach(function(a){
var when=a.querySelector('.when');
caches.match(a.getAttribute('data-saved'),{ignoreSearch:true}).then(function(r){
if(!r){a.classList.add('missing');when.textContent='Not saved yet, needs a connection';return}
var d=new Date(r.headers.get('date')||'');
when.textContent=isNaN(d.getTime())?'Saved on this device':'Saved '+d.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'});
}).catch(function(){});
});
})()</script>
</body>
</html>
`;

export function GET() {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}
