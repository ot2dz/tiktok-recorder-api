from telethon.sync import TelegramClient
from telethon.tl.functions.messages import GetDialogsRequest
from telethon.tl.types import InputPeerEmpty

# أدخل بياناتك هنا
api_id = 2603125
api_hash = '770882946186a150db02cc3b492a3df4'
phone = '+213549644811'

# اسم ملف الجلسة، سيتم إنشاؤه تلقائياً
client = TelegramClient('extract_usernames_session', api_id, api_hash)

client.connect()
if not client.is_user_authorized():
    client.send_code_request(phone)
    client.sign_in(phone, input('Enter the code: '))

print("تم تسجيل الدخول بنجاح. جاري البحث عن القنوات...")

chats = []
last_date = None
chunk_size = 200

result = client(GetDialogsRequest(
             offset_date=last_date,
             offset_id=0,
             offset_peer=InputPeerEmpty(),
             limit=chunk_size,
             hash = 0
         ))
chats.extend(result.chats)

# سنقوم بتخزين اليوزرات في قائمة
usernames_list = []

for chat in chats:
    try:
        # الشرط: التحقق من أن المحادثة هي قناة (broadcast) AND أن لديها يوزر (username)
        if hasattr(chat, 'broadcast') and chat.broadcast and chat.username:
            # إضافة اليوزر مع @ في بدايته إلى القائمة
            usernames_list.append(f"@{chat.username}")
    except Exception as e:
        # تجاهل أي أخطاء قد تحدث مع بعض المحادثات
        continue

# الآن، نجمع كل عناصر القائمة في نص واحد مفصول بفاصلة
final_output = ",".join(usernames_list)

# طباعة النتيجة النهائية
print("\n" + "="*40)
print("قائمة يوزرات القنوات المستخرجة:")
print("="*40)
if final_output:
    print(final_output)
else:
    print("لم يتم العثور على أي قنوات لديها يوزر عام.")
print("="*40)
