# يولّد privacy.html و terms.html (شغّله: python3 tools/legal.py)
UPDATED = '١٦ نوفمبر ٢٠٢٦'
CONTACT = '''<ul class="ct"><li>واتساب وجوال: <a href="https://wa.me/966582409776" dir="ltr">0582409776</a></li><li>البريد: <a href="mailto:Abdullrahmanshaheen1@gmail.com" dir="ltr">Abdullrahmanshaheen1@gmail.com</a></li><li>جدة، المملكة العربية السعودية</li></ul>'''
CSS = '''*{box-sizing:border-box}:root{--ink:#121215;--cream:#F3EDE2;--gold:#A8803F;--mut:#5d584f;--line:#e2d8c6}
body{margin:0;background:var(--cream);color:var(--ink);font:400 17px/1.95 "IBM Plex Sans Arabic",Tahoma,sans-serif}
header{border-bottom:1px solid var(--line);background:#F8F3EA}.bar{max-width:820px;margin:auto;padding:18px 20px;display:flex;justify-content:space-between;align-items:center}
.bar a{color:var(--ink);text-decoration:none;font-weight:600;display:flex;gap:10px;align-items:center}.bar img{width:30px}
.bar nav{white-space:nowrap;font-size:15px;color:var(--mut)}.bar nav a{font-weight:400;color:var(--mut)}
main{max-width:820px;margin:auto;padding:44px 20px 70px}h1{font-size:34px;line-height:1.4;margin:0 0 6px}
.up{color:var(--mut);font-size:14px;margin:0 0 30px}h2{font-size:21px;margin:36px 0 8px;color:var(--ink)}h2::before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--gold);margin-left:10px;vertical-align:middle}
p,li{color:#2b2925}ul{padding-right:22px}a{color:var(--gold)}.ct{list-style:none;padding:16px 20px;background:#fff;border:1px solid var(--line);border-radius:14px}
.en{margin-top:50px;padding-top:24px;border-top:1px solid var(--line);direction:ltr;text-align:left;font-family:system-ui,sans-serif;font-size:15px;color:var(--mut)}.en h2{font-size:17px}.en h2::before{display:none}
footer{text-align:center;color:var(--mut);font-size:14px;padding:26px;border-top:1px solid var(--line)}footer a{color:var(--mut);margin:0 8px}'''
def page(slug, title, desc, body, en):
    return f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} | شاهين ديزاين</title><meta name="description" content="{desc}"><link rel="canonical" href="https://www.shaheendesign.sa/{slug}">
<link rel="icon" href="/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet"><style>{CSS}</style></head><body>
<header><div class="bar"><a href="/"><img src="/favicon.svg" alt="">شاهين ديزاين</a><nav><a href="/privacy">الخصوصية</a> · <a href="/terms">الشروط</a></nav></div></header>
<main><h1>{title}</h1><p class="up">آخر تحديث: {UPDATED}</p>{body}<section class="en">{en}</section></main>
<footer>© ٢٠٢٦ شاهين ديزاين · <a href="/">الرئيسية</a><a href="/book">احجز استشارة</a></footer></body></html>'''

privacy = f'''<p>نحترم خصوصيتك. هذي الصفحة توضح وش البيانات اللي نجمعها في موقع <b>شاهين ديزاين</b> (shaheendesign.sa) وعبر حسابنا في واتساب، وليش نجمعها، وكيف نحميها. شاهين ديزاين نشاط مستقل يعمل بوثيقة العمل الحر في جدة، ونلتزم بنظام حماية البيانات الشخصية في المملكة العربية السعودية.</p>
<h2>البيانات اللي نجمعها</h2><ul>
<li><b>حجز الاستشارة:</b> الاسم، رقم الجوال، الموعد اللي تختاره، وأي ملاحظة تكتبها عن مشروعك.</li>
<li><b>المحادثة معنا في واتساب:</b> رقمك واسمك الظاهر في واتساب، ونص الرسائل، والخدمة اللي تطلبها وتفاصيل طلبك. بعض الردود يرسلها مساعد آلي يرتّب طلبك ويحوّله لنا.</li>
<li><b>إحصاءات الزيارة:</b> نعد الزيارات والصفحات الأكثر زيارة بشكل مجمّع، بدون اسمك أو رقمك أو عنوان IP، وبدون ملفات تعريف (Cookies) إعلانية.</li>
<li><b>ملف تعريف واحد</b> يُستخدم فقط لتسجيل دخول صاحب الموقع للوحة التحكم، وما يُستخدم للزوار.</li></ul>
<h2>ليش نستخدمها</h2><ul><li>للتواصل معك بخصوص طلبك أو موعدك، وإرسال تأكيد الموعد أو تذكير به.</li><li>لتجهيز عرض السعر وتنفيذ المشروع المتفق عليه.</li><li>لتحسين الموقع وخدماتنا من خلال الإحصاءات المجمّعة.</li></ul>
<p>ما نبيع بياناتك، وما نشاركها مع أي جهة لأغراض تسويقية، وما نرسل لك رسائل ترويجية إلا إذا طلبت أو وافقت.</p>
<h2>مع مين تُشارك</h2><p>نستخدم مزودي خدمة تقنيين لتشغيل الموقع، ويعالجون البيانات نيابة عنا فقط:</p><ul>
<li><b>Vercel</b>: استضافة الموقع.</li><li><b>Supabase</b>: قاعدة البيانات اللي تُحفظ فيها الحجوزات والطلبات.</li><li><b>Meta (واتساب للأعمال)</b>: إرسال واستقبال رسائل واتساب، وتخضع لسياسة خصوصية واتساب.</li></ul>
<p>وممكن نفصح عن بيانات إذا طلبتها جهة رسمية بموجب نظام.</p>
<h2>مدة الحفظ</h2><p>نحتفظ ببيانات الطلبات والحجوزات طول فترة التعامل معك، وحتى سنتين بعد آخر تواصل لأغراض المتابعة والفوترة، ثم نحذفها. وتقدر تطلب الحذف قبل كذا في أي وقت.</p>
<h2>حماية البيانات</h2><p>البيانات تنتقل مشفّرة (HTTPS)، ولوحة التحكم محمية بكلمة مرور، والوصول للبيانات مقصور على صاحب النشاط.</p>
<h2 id="delete">حقوقك وطلب حذف البيانات</h2><p>لك الحق تعرف وش البيانات اللي عندنا عنك، وتطلب تصحيحها أو حذفها، وتطلب إيقاف رسائل واتساب. تواصل معنا على واتساب أو البريد واطلب حذف بياناتك، وننفّذ طلبك خلال ٣٠ يوم كحد أقصى ونأكد لك.</p>
<h2>تواصل معنا</h2>{CONTACT}
<h2>تحديث السياسة</h2><p>ممكن نحدّث هذي السياسة، ونكتب تاريخ آخر تحديث أعلى الصفحة.</p>'''
privacy_en = '''<h2>Privacy Policy (summary)</h2><p>Shaheen Design (shaheendesign.sa), a licensed freelance studio in Jeddah, Saudi Arabia, collects only what is needed to respond to you: your name, phone number, booking time and notes when you book a consultation, and your WhatsApp number, profile name and messages when you contact us on WhatsApp (some replies are sent by an automated assistant). Site visits are counted in aggregate without names, phone numbers or IP addresses. We do not sell or share your data for marketing. Data is processed by our service providers Vercel (hosting), Supabase (database) and Meta (WhatsApp Business Platform). We keep records for up to two years after our last contact. <b>Data deletion:</b> contact us on WhatsApp or email Abdullrahmanshaheen1@gmail.com to request deletion and we will delete it within 30 days. Contact: +966 58 240 9776.</p>'''

terms = f'''<p>باستخدامك موقع <b>شاهين ديزاين</b> أو تواصلك معنا، أنت توافق على هذي الشروط. شاهين ديزاين نشاط مستقل يعمل بوثيقة العمل الحر في جدة، ويقدّم خدمات تصميم وبرمجة المواقع والمتاجر والأنظمة.</p>
<h2>الخدمات</h2><p>المنتجات المعروضة في الموقع نماذج توضيحية لما نقدّمه. نطاق كل مشروع ومدته وسعره يتحدد في عرض سعر مكتوب أو عقد بيننا وبينك، وهو المرجع عند أي اختلاف.</p>
<h2>الاستشارة المجانية</h2><p>الاستشارة المجانية مكالمة تعارف مدتها ١٥ دقيقة تقريبًا لفهم احتياجك، وما تلزمك بأي شي. إذا ما تقدر تحضر، بلغنا قبلها عشان نفتح الموعد لغيرك.</p>
<h2>الدفع والتنفيذ</h2><ul><li>الدفع على دفعتين: دفعة عند بدء المشروع، والباقي عند التسليم، ما لم يُتفق على غير كذا.</li><li>نبدأ بتصميم تشوفه وتعتمده قبل البرمجة، والتعديلات المشمولة يحددها العرض.</li><li>تأخر تزويدنا بالمحتوى أو الصور أو الصلاحيات يأخر التسليم بنفس المدة.</li></ul>
<h2>الملكية</h2><p>بعد سداد كامل المبلغ، تنتقل لك ملكية التصميم والمحتوى الخاص بمشروعك. ونحتفظ بحق عرض المشروع ضمن أعمالنا ما لم تطلب غير كذا كتابيًا. الأدوات والمكونات العامة اللي نستخدمها في أكثر من مشروع تبقى ملكنا، ولك حق استخدامها ضمن مشروعك.</p>
<h2>المحادثة في واتساب</h2><p>بعض ردودنا في واتساب يرسلها مساعد آلي يرتّب طلبك، وتقدر تطلب التحدث معنا مباشرة في أي وقت. المعلومات اللي يرسلها المساعد الآلي للتوضيح، والمرجع هو العرض المكتوب.</p>
<h2>المسؤولية</h2><p>نبذل أفضل جهدنا لجودة العمل وأمانه، لكن ما نتحمل مسؤولية توقف خدمات الجهات الخارجية مثل سلة أو مزودي الاستضافة أو Meta، أو أي محتوى يضيفه العميل بعد التسليم.</p>
<h2>الخصوصية</h2><p>تعاملنا مع بياناتك موضّح في <a href="/privacy">سياسة الخصوصية</a>.</p>
<h2>النظام المطبّق</h2><p>تخضع هذي الشروط لأنظمة المملكة العربية السعودية.</p>
<h2>تواصل معنا</h2>{CONTACT}'''
terms_en = '''<h2>Terms of Service (summary)</h2><p>Shaheen Design is a licensed freelance studio in Jeddah, Saudi Arabia, providing website, store and system design and development. Products shown on the site are examples; each project's scope, timeline and price are set in a written quote or contract. Payment is in two stages unless agreed otherwise. Ownership of project-specific work transfers to the client after full payment. Some WhatsApp replies are sent by an automated assistant; you can ask for a human at any time. These terms are governed by the laws of the Kingdom of Saudi Arabia. See our <a href="/privacy">Privacy Policy</a>.</p>'''

open('privacy.html','w').write(page('privacy','سياسة الخصوصية','كيف تجمع شاهين ديزاين بياناتك وتستخدمها وتحميها، وكيف تطلب حذفها.',privacy,privacy_en))
open('terms.html','w').write(page('terms','الشروط والأحكام','شروط استخدام موقع شاهين ديزاين وخدمات التصميم والبرمجة.',terms,terms_en))
print('ok')
