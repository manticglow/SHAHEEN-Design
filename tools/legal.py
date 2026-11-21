# يولّد privacy.html و terms.html (شغّله: python3 tools/legal.py)
UPDATED = '٢١ نوفمبر ٢٠٢٦'
CONTACT = '''<ul class="ct"><li>واتساب وجوال: <a href="https://wa.me/966582409776" dir="ltr">0582409776</a></li><li>البريد: <a href="mailto:owner@shaheendesign.sa" dir="ltr">owner@shaheendesign.sa</a></li><li>جدة، المملكة العربية السعودية</li></ul>'''
CSS = '''*{box-sizing:border-box}:root{--ink:#121215;--cream:#F3EDE2;--gold:#A8803F;--mut:#5d584f;--line:#e2d8c6}
body{margin:0;background:var(--cream);color:var(--ink);font:400 17px/1.95 "IBM Plex Sans Arabic",Tahoma,sans-serif}
header{border-bottom:1px solid var(--line);background:#F8F3EA}.bar{max-width:820px;margin:auto;padding:18px 20px;display:flex;justify-content:space-between;align-items:center}
.bar a{color:var(--ink);text-decoration:none;font-weight:600;display:flex;gap:10px;align-items:center}.bar img{width:30px}
.bar nav{white-space:nowrap;font-size:15px;color:var(--mut)}.bar nav a{font-weight:400;color:var(--mut)}
main{max-width:820px;margin:auto;padding:44px 20px 70px}h1{font-size:34px;line-height:1.4;margin:0 0 6px}
.up{color:var(--mut);font-size:14px;margin:0 0 30px}h2{font-size:21px;margin:36px 0 8px;color:var(--ink)}h2::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--gold);margin-left:10px;vertical-align:middle}
p,li{color:#2b2925}ul{padding-right:22px}a{color:var(--gold)}.ct{list-style:none;padding:16px 20px;background:#fff;border:1px solid var(--line);border-radius:14px}
.en{margin-top:50px;padding-top:24px;border-top:1px solid var(--line);direction:ltr;text-align:left;font-family:system-ui,sans-serif;font-size:15px;color:var(--mut)}.en h2{font-size:17px}.en h2::before{display:none}
footer{text-align:center;color:var(--mut);font-size:14px;padding:26px;border-top:1px solid var(--line)}footer a{color:var(--mut);margin:0 8px}footer .fl{margin-bottom:8px;line-height:2.2}footer p{margin:0 0 6px;font-size:13px}
.bar nav a{display:inline}@media(max-width:700px){.bar nav{display:none}}.note{background:#fff;border:1px solid var(--line);border-right:3px solid var(--gold);border-radius:12px;padding:14px 18px}'''
LINKS = [('/privacy','الخصوصية'),('/terms','الشروط'),('/refund','الاسترداد'),('/delivery','تنفيذ الخدمة'),('/complaints','الشكاوى')]
NAV = ' · '.join(f'<a href="{u}">{t}</a>' for u,t in LINKS)
NAV_FOOT = ''.join(f'<a href="{u}">{t}</a>' for u,t in LINKS) + '<a href="#" onclick="try{localStorage.removeItem(\'sd-consent\')}catch(e){};location.href=\'/?cookies=1\';return false">إعدادات الكوكيز</a>'
ID_LINE = 'الخدمات مقدمة من عبدالرحمن فهد يوسف شاهين · مستقل بوثيقة العمل الحر FL-609963534 · جدة، المملكة العربية السعودية'
def page(slug, title, desc, body, en, extra=''):
    return f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} | شاهين ديزاين</title><meta name="description" content="{desc}"><link rel="canonical" href="https://www.shaheendesign.sa/{slug}">
<link rel="icon" href="/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet"><style>{CSS}</style></head><body>
<header><div class="bar"><a href="/"><img src="/favicon.svg" alt="">شاهين ديزاين</a><nav>{NAV}</nav></div></header>
<main><h1>{title}</h1><p class="up">آخر تحديث: {UPDATED}</p>{body}<section class="en">{en}</section></main>
<footer><div class="fl">{NAV_FOOT}</div><p>{ID_LINE}</p>© ٢٠٢٦ شاهين ديزاين · <a href="/">الرئيسية</a><a href="/book">احجز استشارة</a></footer>{extra}</body></html>'''


privacy = f'''<p>نحترم خصوصيتك. هذي الصفحة توضح وش البيانات اللي نجمعها في موقع <b>شاهين ديزاين</b> (shaheendesign.sa) وفي أنظمتنا الجاهزة وعبر حسابنا في واتساب، وليش نجمعها، وكيف نحميها، وكيف تمارس حقوقك. شاهين ديزاين نشاط مستقل يعمل بوثيقة العمل الحر في جدة، ونلتزم بنظام حماية البيانات الشخصية في المملكة العربية السعودية ولوائحه.</p>
<h2>البيانات اللي نجمعها</h2><ul>
<li><b>حجز الاستشارة:</b> الاسم، رقم الجوال، الموعد اللي تختاره، وأي ملاحظة تكتبها عن مشروعك.</li>
<li><b>المحادثة معنا في واتساب:</b> رقمك واسمك الظاهر في واتساب، ونص الرسائل، والخدمة اللي تطلبها وتفاصيل طلبك. بعض الردود يرسلها مساعد آلي يرتّب طلبك ويحوّله لنا.</li>
<li><b>حسابات الأنظمة الجاهزة:</b> اسم النشاط، رقم الجوال، كلمة المرور (محفوظة مشفّرة بشكل ما يقدر أحد يقراه)، وسجل الاشتراك والفواتير.</li>
<li><b>الدفع الإلكتروني:</b> تتم عملية الدفع عند بوابة <b>ميسّر</b> المرخّصة، وما نشوف ولا نحفظ رقم بطاقتك. نحفظ بس مرجع العملية ومبلغها ونتيجتها.</li>
<li><b>الشكاوى وطلبات البيانات:</b> الاسم والجوال والبريد (اختياري) وتفاصيل الطلب، عشان نرد عليك ونتابع.</li>
<li><b>إحصاءات الزيارة:</b> نعد الزيارات والصفحات الأكثر زيارة بشكل مجمّع، بدون اسمك أو رقمك أو عنوان IP.</li></ul>
<h2 id="cookies">ملفات تعريف الارتباط (الكوكيز)</h2><ul>
<li><b>ضرورية:</b> جلسة الدخول للوحة التحكم ولحسابات الأنظمة، وحفظ اختيارك للكوكيز. الموقع ما يشتغل صح بدونها، وما تُستخدم للتتبع.</li>
<li><b>إعلانية (Meta Pixel):</b> تقيس أداء إعلاناتنا على فيسبوك وإنستقرام، وترسل لـ Meta الصفحات اللي تزورها وضغطات التواصل، بدون اسمك أو رقمك. <b>ما تشتغل إلا بعد موافقتك</b> من شريط الكوكيز اللي يطلع أول زيارة، وتقدر تغيّر اختيارك في أي وقت من رابط «إعدادات الكوكيز» أسفل الصفحة.</li></ul>
<h2>ليش نستخدمها</h2><ul><li>للتواصل معك بخصوص طلبك أو موعدك، وإرسال تأكيد الموعد أو تذكير به.</li><li>لتجهيز عرض السعر وتنفيذ المشروع أو تشغيل اشتراكك وإصدار فواتيرك.</li><li>للرد على شكواك أو طلبك.</li><li>لتحسين الموقع وخدماتنا من خلال الإحصاءات المجمّعة.</li></ul>
<p>ما نبيع بياناتك، وما نشاركها مع أي جهة لأغراض تسويقية، و<b>ما نرسل لك رسائل ترويجية إلا إذا وافقت عليها بشكل منفصل</b>، وتقدر توقفها متى ما تبي.</p>
<h2>مع مين تُشارك</h2><p>نستخدم مزودي خدمة تقنيين يعالجون البيانات نيابة عنا فقط ولتشغيل الخدمة:</p><ul>
<li><b>Vercel</b>: استضافة الموقع.</li><li><b>Supabase</b>: قاعدة البيانات اللي تُحفظ فيها الحجوزات والطلبات والحسابات.</li><li><b>Meta (واتساب للأعمال)</b>: إرسال واستقبال رسائل واتساب، وMeta Pixel بعد موافقتك.</li><li><b>ميسّر</b>: معالجة المدفوعات.</li></ul>
<p>بعض خوادم مزودي الخدمة موجودة خارج المملكة (مثل أوروبا)، ونختار مزودين يطبقون معايير حماية وتشفير عالية. وممكن نفصح عن بيانات إذا طلبتها جهة رسمية بموجب نظام.</p>
<h2>مدة الحفظ</h2><p>نحتفظ ببيانات الطلبات والحجوزات والمحادثات طول فترة التعامل معك، وحتى سنتين بعد آخر تواصل، ثم نحذفها. <b>الفواتير وسجلات الدفع</b> نحتفظ فيها المدة اللي تفرضها الأنظمة المحاسبية والضريبية حتى لو طلبت حذف حسابك.</p>
<h2>حماية البيانات</h2><p>البيانات تنتقل مشفّرة (HTTPS)، وكلمات المرور محفوظة مشفّرة، ولوحة التحكم محمية بكلمة مرور وحد لمحاولات الدخول، وكل تعديل في اللوحة ينسجّل بوقته. وإذا صار تسرّب لبيانات شخصية لا قدّر الله، نسجّله ونبلغ الجهة المختصة والمتأثرين حسب ما يفرضه النظام.</p>
<h2 id="delete">حقوقك</h2><p>لك الحق:</p><ul><li>تعرف وش البيانات اللي عندنا عنك، وتاخذ نسخة منها.</li><li>تطلب تصحيحها أو تحديثها.</li><li>تطلب حذفها (إلا اللي يلزمنا النظام نحتفظ فيه مثل الفواتير).</li><li>تسحب موافقتك على الكوكيز الإعلانية أو الرسائل في أي وقت.</li></ul>
<p class="note">قدّم طلبك من <a href="/complaints#data">نموذج طلبات البيانات</a>، وتاخذ رقم مرجعي تتابع فيه. ننفّذ الطلب خلال ٣٠ يوم كحد أقصى بعد التحقق من هويتك.</p>
<h2>مسؤول حماية البيانات</h2><ul class="ct"><li>الاسم: عبدالرحمن فهد يوسف شاهين</li><li>البريد: <a href="mailto:owner@shaheendesign.sa" dir="ltr">owner@shaheendesign.sa</a></li></ul>
<h2>تواصل معنا</h2>{CONTACT}
<p>وإذا ما كنت راضي عن ردّنا، لك الحق ترفع شكوى للهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا).</p>
<h2>تحديث السياسة</h2><p>ممكن نحدّث هذي السياسة، ونكتب تاريخ آخر تحديث أعلى الصفحة.</p>'''
privacy_en = '''<h2>Privacy Policy (summary)</h2><p>Shaheen Design (shaheendesign.sa), a licensed freelance studio in Jeddah, Saudi Arabia, follows the Saudi Personal Data Protection Law. We collect only what is needed: booking details, WhatsApp conversations (some replies are automated), subscription accounts (passwords stored hashed) and invoices, and complaint or data-request details. Card payments are processed by Moyasar; we never see or store card numbers. Advertising cookies (Meta Pixel) run <b>only after you consent</b> in the cookie banner; you can change this anytime from "Cookie settings" in the footer. We do not sell data or send marketing without separate consent. Processors: Vercel, Supabase, Meta, Moyasar; some servers are outside Saudi Arabia. We keep records up to two years after our last contact, and invoices as long as tax and accounting rules require. You may request access, a copy, correction or deletion via <a href="/complaints#data">our data request form</a>; we respond within 30 days. Data protection contact: owner@shaheendesign.sa.</p>'''

terms = f'''<p>باستخدامك موقع <b>شاهين ديزاين</b> أو أنظمتنا الجاهزة أو تواصلك معنا، أنت توافق على هذي الشروط. شاهين ديزاين نشاط مستقل يعمل بوثيقة العمل الحر رقم <span dir="ltr">FL-609963534</span> في جدة، ويقدّم خدمات تصميم وبرمجة المواقع والمتاجر والأنظمة، واشتراكات أنظمة جاهزة.</p>
<h2>الخدمات</h2><p>المنتجات المعروضة في الموقع نماذج توضيحية لما نقدّمه. نطاق كل مشروع خاص ومدته وسعره يتحدد في عرض سعر مكتوب أو عقد بيننا وبينك، وهو المرجع عند أي اختلاف.</p>
<h2>الأسعار</h2><p>الأسعار بالريال السعودي. أسعار الأنظمة الجاهزة واضحة في صفحة الاشتراك قبل الدفع، وتطلع لك قبل ما تدفع تفاصيل المبلغ (الاشتراك، ورسوم التجهيز إن وجدت، والضريبة إن كانت مطبّقة) والإجمالي، بدون أي رسوم مخفية.</p>
<h2>الاستشارة المجانية</h2><p>الاستشارة المجانية مكالمة تعارف مدتها ١٥ دقيقة تقريبًا لفهم احتياجك، وما تلزمك بأي شي. إذا ما تقدر تحضر، بلغنا قبلها عشان نفتح الموعد لغيرك.</p>
<h2>المشاريع الخاصة</h2><ul><li>الدفع على دفعتين: دفعة عند بدء المشروع، والباقي عند التسليم، ما لم يُتفق على غير كذا.</li><li>نبدأ بتصميم تشوفه وتعتمده قبل البرمجة، والتعديلات المشمولة يحددها العرض.</li><li>تأخر تزويدنا بالمحتوى أو الصور أو الصلاحيات يأخر التسليم بنفس المدة.</li></ul>
<h2>اشتراكات الأنظمة الجاهزة</h2><ul><li>تقدر تجرّب كل نظام مجانًا قبل الاشتراك من <a href="/demos">صفحة التجارب</a>.</li><li>الاشتراك شهري أو سنوي، ويتفعّل مباشرة بعد تأكيد الدفع.</li><li>التجديد <b>مو تلقائي</b>: ما ننسحب منك أي مبلغ إلا إذا جددت بنفسك. وإذا انتهى الاشتراك نعطيك ٣ أيام سماح، بعدها يتوقف النظام مؤقتًا وتبقى بياناتك محفوظة لين تجدد أو تطلب حذفها.</li><li>أنت مسؤول عن صحة البيانات اللي تدخلها في نظامك وعن حصولك على موافقة عملائك على بياناتهم.</li></ul>
<h2>الاسترداد والتنفيذ</h2><p>شروط الاسترداد والإلغاء في <a href="/refund">سياسة الاسترداد</a>، وطريقة تنفيذ الخدمة وتسليمها في <a href="/delivery">سياسة تنفيذ الخدمة</a>.</p>
<h2>الملكية</h2><p>بعد سداد كامل المبلغ، تنتقل لك ملكية التصميم والمحتوى الخاص بمشروعك. ونحتفظ بحق عرض المشروع ضمن أعمالنا ما لم تطلب غير كذا كتابيًا. الأدوات والمكونات العامة اللي نستخدمها في أكثر من مشروع، والأنظمة الجاهزة نفسها، تبقى ملكنا، ولك حق استخدامها ضمن مشروعك أو اشتراكك.</p>
<h2>المحادثة في واتساب</h2><p>بعض ردودنا في واتساب يرسلها مساعد آلي يرتّب طلبك، وتقدر تطلب التحدث معنا مباشرة في أي وقت. المعلومات اللي يرسلها المساعد الآلي للتوضيح، والمرجع هو العرض المكتوب.</p>
<h2>المسؤولية</h2><p>نبذل أفضل جهدنا لجودة العمل وأمانه، لكن ما نتحمل مسؤولية توقف خدمات الجهات الخارجية مثل سلة أو مزودي الاستضافة أو Meta، أو أي محتوى يضيفه العميل بعد التسليم.</p>
<h2>الشكاوى</h2><p>تقدر تقدّم شكوى من <a href="/complaints">صفحة الشكاوى</a> وتاخذ رقم مرجعي تتابع فيه، ونرد خلال ١٤ يوم كحد أقصى.</p>
<h2>الخصوصية</h2><p>تعاملنا مع بياناتك موضّح في <a href="/privacy">سياسة الخصوصية</a>.</p>
<h2>النظام المطبّق</h2><p>تخضع هذي الشروط لأنظمة المملكة العربية السعودية، ومنها نظام التجارة الإلكترونية ونظام حماية البيانات الشخصية.</p>
<h2>تواصل معنا</h2>{CONTACT}'''
terms_en = '''<h2>Terms of Service (summary)</h2><p>Shaheen Design is a licensed freelance studio (FL-609963534) in Jeddah, Saudi Arabia, providing website, store and system design and development, and ready-made system subscriptions. Prices are in SAR and the full breakdown is shown before payment with no hidden fees. Custom projects follow a written quote, usually paid in two stages. Subscriptions are monthly or yearly, can be tried free beforehand on our demos page, activate right after payment and never renew automatically. See our <a href="/refund">Refund Policy</a>, <a href="/delivery">Service Delivery Policy</a>, <a href="/complaints">Complaints</a> and <a href="/privacy">Privacy Policy</a>. Governed by the laws of the Kingdom of Saudi Arabia.</p>'''

refund = f'''<p>نحب تكون واضح قبل ما تدفع. هذي السياسة تشرح متى يمديك تلغي ومتى يُسترد المبلغ، حسب نوع الخدمة.</p>
<h2>المشاريع الخاصة (موقع أو متجر أو نظام نصممه لك)</h2>
<p>المشروع الخاص يُنفّذ حسب مواصفاتك وطلبك، ونبدأ نشتغل عليه أول ما توصلنا الدفعة الأولى، عشان كذا <b>المبالغ المدفوعة للمشاريع الخاصة ما تُسترد</b>. قبل ما تدفع، تاخذ عرض سعر مكتوب فيه النطاق والمدة والتعديلات المشمولة، وتقدر تسأل عن أي تفصيل.</p>
<h2>اشتراكات الأنظمة الجاهزة</h2>
<ul><li><b>جرّب قبل ما تدفع:</b> كل نظام له تجربة حية مجانية في <a href="/demos">صفحة التجارب</a>، تقدر تستخدمها بالكامل قبل الاشتراك.</li>
<li>عشان كذا <b>الاشتراك المدفوع (شهري أو سنوي) ورسوم التجهيز ما تُسترد</b> بعد تفعيل النظام.</li>
<li>التجديد مو تلقائي: إذا ما تبي تكمل، لا تجدد، وما ينسحب منك شي.</li>
<li>دعوات المناسبات الإلكترونية ما تُسترد بعد تفعيل صفحة المناسبة.</li></ul>
<h2>حالات نرجع لك فيها المبلغ</h2><ul>
<li>إذا انسحب منك المبلغ مرتين بالغلط، أو انسحب ولا تفعّلت الخدمة: نرجع المبلغ الزايد كامل.</li>
<li>إذا ما قدرنا ننفّذ اللي التزمنا فيه في العرض المكتوب لسبب من عندنا: نرجع لك قيمة الجزء اللي ما تنفّذ.</li></ul>
<p>الاسترداد يكون بنفس طريقة الدفع، خلال ١٤ يوم من الموافقة عليه.</p>
<h2>كيف تطلب</h2><p>قدّم طلبك من <a href="/complaints">صفحة الشكاوى</a> واختر «الفوترة والدفع»، واكتب رقم الفاتورة أو مرجع الدفع. تاخذ رقم مرجعي تتابع فيه طلبك.</p>
<h2>تواصل معنا</h2>{CONTACT}'''
refund_en = '''<h2>Refund Policy (summary)</h2><p><b>Custom projects</b> are built to your specifications and work starts on the first payment, so payments for custom projects are non-refundable. <b>Ready-made system subscriptions</b> can be tried free in full on our <a href="/demos">demos page</a> before you buy, so paid subscriptions and setup fees are non-refundable once activated; renewals are never automatic. Event invitations are non-refundable once the event page is activated. We refund duplicate or erroneous charges, charges where the service was not activated, and the value of any committed work we fail to deliver, to the original payment method within 14 days of approval. Request via <a href="/complaints">our complaints page</a>.</p>'''

delivery = f'''<p>خدماتنا رقمية بالكامل، ما فيها شحن منتجات. هذي الصفحة توضح متى وكيف تستلم الخدمة.</p>
<h2>الأنظمة الجاهزة</h2><ul><li>يتفعّل النظام <b>مباشرة بعد تأكيد الدفع</b> تلقائيًا، وتوصلك الفاتورة ورابط نظامك (shaheendesign.sa/s/اسم-نشاطك) ورابط لوحة التحكم.</li>
<li>إذا تأخر التفعيل أكثر من ساعة بعد الدفع، كلمنا ونفعّله لك فورًا أو نرجع المبلغ.</li>
<li>النظام متاح على مدار الساعة طول مدة الاشتراك، وإذا صار توقف مجدول للصيانة نحاول يكون في وقت قليل الاستخدام.</li></ul>
<h2>المشاريع الخاصة</h2><ul><li><b>المدة</b> مكتوبة في عرض السعر، وتبدأ من استلام الدفعة الأولى والمحتوى المطلوب.</li>
<li><b>المراحل:</b> تصميم تعتمده ← برمجة ← مراجعة وتعديلات حسب العرض ← إطلاق.</li>
<li><b>التسليم:</b> نطلق المشروع على نطاقك أو استضافتك، ونسلّمك صلاحيات الدخول وطريقة الاستخدام.</li>
<li>تأخر تزويدنا بالمحتوى أو الاعتمادات أو الصلاحيات يأخر التسليم بنفس المدة.</li></ul>
<h2>الاستشارة</h2><p>الاستشارة المجانية تكون بالموعد اللي تختاره، مكالمة أو واتساب حسب اختيارك، ويوصلك تأكيد وتذكير على واتساب.</p>
<h2>الدعم</h2><p>للأنظمة الجاهزة: الدعم على واتساب طول مدة الاشتراك. للمشاريع الخاصة: فترة الدعم بعد التسليم مكتوبة في العرض.</p>
<h2>تواصل معنا</h2>{CONTACT}'''
delivery_en = '''<h2>Service Delivery Policy (summary)</h2><p>All our services are digital; nothing is shipped. Ready-made systems activate automatically right after payment confirmation and you receive your invoice and links; if activation takes over an hour, contact us and we will activate it or refund you. Custom projects follow the timeline in the written quote, starting from the first payment and content handover: design approval, development, revisions, then launch on your domain with access handed over. Support for subscriptions runs for the subscription period; for custom projects, as stated in the quote.</p>'''

COMPLAINTS_CSS = '''<style>.tabs{display:flex;gap:8px;margin:8px 0 18px;flex-wrap:wrap}.tabs button{font:600 15px/1 inherit;font-family:inherit;padding:12px 16px;border-radius:999px;border:1px solid var(--line);background:#fff;color:var(--ink);cursor:pointer}.tabs button[aria-selected=true]{background:var(--ink);color:#fff;border-color:var(--ink)}
form,.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:22px}label{display:block;font-weight:600;font-size:15px;margin:14px 0 6px}label small{font-weight:400;color:var(--mut)}input,select,textarea{width:100%;font:inherit;font-size:16px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:#FCFAF6;color:var(--ink)}textarea{min-height:130px;resize:vertical}
input:focus,select:focus,textarea:focus{outline:2px solid var(--gold);outline-offset:1px}.row2{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}@media(max-width:600px){.row2{grid-template-columns:1fr}}
.go{margin-top:20px;width:100%;font:700 17px/1 inherit;font-family:inherit;padding:16px;border:0;border-radius:14px;background:var(--ink);color:#fff;cursor:pointer}.go:disabled{opacity:.6}.hp{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;border:0!important;opacity:0;overflow:hidden;clip-path:inset(50%);pointer-events:none}
.msg{margin-top:14px;padding:14px 16px;border-radius:12px;display:none}.msg.ok{display:block;background:#EEF6EC;border:1px solid #BFDDB8}.msg.err{display:block;background:#FBEDEA;border:1px solid #E9C2BA}.ref{font:700 22px/1.4 ui-monospace,monospace;letter-spacing:1px;direction:ltr;display:inline-block}
.tl{list-style:none;padding:0;margin:14px 0 0}.tl li{border-right:2px solid var(--line);padding:2px 16px 12px;position:relative}.tl li::before{content:"";position:absolute;right:-6px;top:10px;width:10px;height:10px;border-radius:50%;background:var(--gold)}.tl small{color:var(--mut);display:block}
.pill{display:inline-block;padding:4px 12px;border-radius:999px;background:#F3EDE2;font-weight:600;font-size:14px}[hidden]{display:none!important}</style>'''

complaints = f'''{COMPLAINTS_CSS}<p>نبي نسمع منك. قدّم شكوى أو طلب يخص بياناتك الشخصية، وتاخذ <b>رقم مرجعي</b> تتابع فيه طلبك من نفس الصفحة. نرد على الشكاوى خلال <b>١٤ يوم</b> كحد أقصى، وننفّذ طلبات البيانات خلال <b>٣٠ يوم</b>.</p>
<div class="tabs" role="tablist"><button type="button" role="tab" data-t="c" aria-selected="true">تقديم شكوى</button><button type="button" role="tab" data-t="data" aria-selected="false">طلب يخص بياناتي</button><button type="button" role="tab" data-t="track" aria-selected="false">متابعة طلب</button></div>

<form id="f-c" data-kind="complaint" novalidate><h2 style="margin-top:0">تقديم شكوى</h2>
<label for="c-type">نوع الشكوى</label><select id="c-type" name="type"><option value="service">جودة الخدمة</option><option value="delay">تأخير في التنفيذ</option><option value="billing">الفوترة والدفع (ومنها طلبات الاسترداد)</option><option value="subscription">الاشتراك في نظام</option><option value="bot">رد البوت أو الواتساب</option><option value="privacy">الخصوصية والبيانات</option><option value="other">أخرى</option></select>
<div class="row2"><div><label for="c-name">الاسم</label><input id="c-name" name="name" autocomplete="name" required maxlength="80"></div><div><label for="c-phone">رقم الجوال</label><input id="c-phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" dir="ltr" required></div></div>
<div class="row2"><div><label for="c-email">البريد <small>(اختياري)</small></label><input id="c-email" name="email" type="email" autocomplete="email" dir="ltr" maxlength="160"></div><div><label for="c-ref">رقم الفاتورة أو الطلب <small>(اختياري)</small></label><input id="c-ref" name="orderRef" dir="ltr" maxlength="60"></div></div>
<label for="c-details">التفاصيل</label><textarea id="c-details" name="details" required maxlength="2000" placeholder="وش صار؟ ومتى؟ ووش تتوقع منا؟"></textarea>
<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<button class="go" type="submit">إرسال الشكوى</button><div class="msg" role="status" aria-live="polite"></div></form>

<form id="f-data" data-kind="data-request" novalidate hidden><h2 style="margin-top:0">طلب يخص بياناتي الشخصية</h2>
<label for="d-type">وش تبي؟</label><select id="d-type" name="type"><option value="access">أعرف وش البيانات المحفوظة عني</option><option value="export">نسخة من بياناتي</option><option value="correct">تصحيح بياناتي</option><option value="delete">حذف بياناتي</option><option value="stop">إيقاف رسائل واتساب</option></select>
<div class="row2"><div><label for="d-name">الاسم</label><input id="d-name" name="name" autocomplete="name" required maxlength="80"></div><div><label for="d-phone">رقم الجوال المرتبط بطلباتك</label><input id="d-phone" name="phone" inputmode="tel" autocomplete="tel" placeholder="05xxxxxxxx" dir="ltr" required></div></div>
<label for="d-email">البريد <small>(اختياري، لو تبي النسخة توصلك عليه)</small></label><input id="d-email" name="email" type="email" autocomplete="email" dir="ltr" maxlength="160">
<label for="d-details">تفاصيل <small>(اختياري)</small></label><textarea id="d-details" name="details" maxlength="1500" placeholder="مثلًا: البيانات اللي تبي تصححها، أو اسم نظامك لو عندك اشتراك"></textarea>
<p style="font-size:14px;color:var(--mut)">عشان نحمي بياناتك، نتحقق إن الطلب منك برسالة على واتساب للرقم اللي كتبته قبل ما ننفّذه. الفواتير وسجلات الدفع نحتفظ فيها المدة اللي يفرضها النظام.</p>
<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<button class="go" type="submit">إرسال الطلب</button><div class="msg" role="status" aria-live="polite"></div></form>

<form id="f-track" novalidate hidden><h2 style="margin-top:0">متابعة طلب</h2>
<div class="row2"><div><label for="t-ref">الرقم المرجعي</label><input id="t-ref" name="ref" dir="ltr" placeholder="SDC-261121-AB12" required style="text-transform:uppercase"></div><div><label for="t-p">آخر ٤ أرقام من جوالك</label><input id="t-p" name="p" inputmode="numeric" maxlength="4" dir="ltr" required></div></div>
<button class="go" type="submit">عرض الحالة</button><div class="msg" role="status" aria-live="polite"></div><div id="t-out"></div></form>
<h2>تواصل مباشر</h2>{CONTACT}'''
complaints_en = '''<h2>Complaints &amp; data requests</h2><p>Submit a complaint or a personal data request (access, copy, correction, deletion, or stopping WhatsApp messages) using the forms above. You will receive a reference number to track it on this page. We respond to complaints within 14 days and fulfil data requests within 30 days after verifying your identity over WhatsApp.</p>'''
COMPLAINTS_JS = '''<script>
(function(){var tabs=document.querySelectorAll('[data-t]'),F={c:document.getElementById('f-c'),data:document.getElementById('f-data'),track:document.getElementById('f-track')};
function show(t){if(!F[t])t='c';tabs.forEach(function(b){b.setAttribute('aria-selected',b.getAttribute('data-t')===t)});Object.keys(F).forEach(function(k){F[k].hidden=k!==t})}
tabs.forEach(function(b){b.addEventListener('click',function(){var t=b.getAttribute('data-t');show(t);history.replaceState(null,'',t==='c'?location.pathname:'#'+t)})});
show((location.hash||'').slice(1));window.addEventListener('hashchange',function(){show(location.hash.slice(1))});
function E(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function day(s){try{return new Date(s).toLocaleDateString('ar-SA-u-ca-gregory',{day:'numeric',month:'long',year:'numeric'})}catch(e){return s}}
function msg(f,ok,h){var m=f.querySelector('.msg');m.className='msg '+(ok?'ok':'err');m.innerHTML=h}
[F.c,F.data].forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var b=f.querySelector('.go'),d={};new FormData(f).forEach(function(v,k){d[k]=v});b.disabled=true;
fetch('/api/legal/'+f.getAttribute('data-kind'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(d)}).then(function(r){return r.json()}).then(function(j){b.disabled=false;
if(j.ok){f.reset();msg(f,true,'وصلنا طلبك. رقمك المرجعي:<br><span class="ref">'+E(j.ref)+'</span><br>احفظه عشان تتابع من تبويب «متابعة طلب». نرد قبل '+E(day(j.due))+'.')}else msg(f,false,E(j.error||'ما قدرنا نرسل، جرّب مرة ثانية'))}).catch(function(){b.disabled=false;msg(f,false,'ما قدرنا نرسل، تأكد من الاتصال وجرّب مرة ثانية')})})});
F.track.addEventListener('submit',function(e){e.preventDefault();var f=F.track,b=f.querySelector('.go'),out=document.getElementById('t-out');out.innerHTML='';b.disabled=true;
fetch('/api/legal/track?ref='+encodeURIComponent(f.ref.value.trim().toUpperCase())+'&p='+encodeURIComponent(f.p.value.trim())).then(function(r){return r.json()}).then(function(j){b.disabled=false;
if(j.error){msg(f,false,E(j.error));return}f.querySelector('.msg').className='msg';
out.innerHTML='<div class="card" style="margin-top:16px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><span class="ref" style="font-size:18px">'+E(j.ref)+'</span><span class="pill">'+E(j.statusLabel)+'</span></div><p style="margin:8px 0 0">'+E(j.type)+' · قُدّم '+E(day(j.at))+' · الرد قبل '+E(day(j.due))+'</p><ul class="tl">'+j.events.map(function(x){return '<li><small>'+E(day(x.at))+' · '+(x.by==='owner'?'شاهين ديزاين':'أنت')+'</small>'+E(x.msg)+'</li>'}).join('')+'</ul></div>'}).catch(function(){b.disabled=false;msg(f,false,'تعذّر الاتصال')})});
})();
</script>'''

def fill(html):
    return html.replace('{NAV}', NAV).replace('{NAV_FOOT}', NAV_FOOT).replace('{ID_LINE}', ID_LINE)
for slug, title, desc, body, en, extra in [
    ('privacy','سياسة الخصوصية','كيف تجمع شاهين ديزاين بياناتك وتستخدمها وتحميها، والكوكيز، وحقوقك وطريقة طلبها.',privacy,privacy_en,''),
    ('terms','الشروط والأحكام','شروط استخدام موقع شاهين ديزاين وخدمات التصميم والبرمجة واشتراكات الأنظمة الجاهزة.',terms,terms_en,''),
    ('refund','سياسة الاسترداد والإلغاء','متى يُسترد المبلغ في المشاريع الخاصة واشتراكات الأنظمة الجاهزة لدى شاهين ديزاين.',refund,refund_en,''),
    ('delivery','سياسة تنفيذ الخدمة','متى وكيف تستلم خدمتك من شاهين ديزاين: تفعيل الأنظمة الجاهزة وتسليم المشاريع الخاصة.',delivery,delivery_en,''),
    ('complaints','الشكاوى وطلبات البيانات','قدّم شكوى أو طلب يخص بياناتك الشخصية لدى شاهين ديزاين وتابعه برقم مرجعي.',complaints,complaints_en,COMPLAINTS_JS)]:
    open(slug + '.html','w').write(fill(page(slug,title,desc,body,en,extra)))
print('ok')
