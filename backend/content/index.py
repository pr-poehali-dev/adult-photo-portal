import json
import os
import base64
import uuid
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
    'Access-Control-Max-Age': '86400',
}


SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')


def ensure_schema(conn):
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS site_settings (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL DEFAULT '',
            description TEXT NOT NULL DEFAULT '',
            video_url TEXT NOT NULL DEFAULT '',
            video_name TEXT NOT NULL DEFAULT '',
            age_warning TEXT NOT NULL DEFAULT '',
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS site_links (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL DEFAULT '',
            url TEXT NOT NULL DEFAULT '',
            icon TEXT NOT NULL DEFAULT 'Link',
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        )
    ''')
    cur.execute('SELECT COUNT(*) FROM site_settings WHERE id = 1')
    if cur.fetchone()[0] == 0:
        cur.execute(
            "INSERT INTO site_settings (id, title, description, age_warning) VALUES (1, %s, %s, %s)",
            ('NEON GATE',
             'Эксклюзивный контент для взрослых. Оживляем фотографии и видео с помощью передовых технологий. Только проверенные материалы 18+.',
             'Контент предназначен только для лиц старше 18 лет.')
        )
        cur.execute(
            "INSERT INTO site_links (title, url, icon, sort_order) VALUES (%s,%s,%s,%s),(%s,%s,%s,%s),(%s,%s,%s,%s)",
            ('Telegram канал', 'https://t.me', 'Send', 1,
             'Закрытый чат', 'https://t.me', 'Lock', 2,
             'Премиум доступ', '#', 'Crown', 3)
        )
    conn.commit()
    cur.close()


def get_content(conn):
    cur = conn.cursor()
    cur.execute('SELECT title, description, video_url, video_name, age_warning FROM site_settings WHERE id = 1')
    s = cur.fetchone()
    cur.execute('SELECT id, title, url, icon FROM site_links ORDER BY sort_order, id')
    links = [{'id': str(r[0]), 'title': r[1], 'url': r[2], 'icon': r[3]} for r in cur.fetchall()]
    cur.close()
    return {
        'title': s[0], 'description': s[1], 'videoUrl': s[2],
        'videoName': s[3], 'ageWarning': s[4], 'links': links,
    }


def upload_video(body):
    import boto3
    data = base64.b64decode(body['fileBase64'])
    ext = body.get('fileName', 'video.mp4').split('.')[-1].lower()
    key = f"videos/{uuid.uuid4().hex}.{ext}"
    s3 = boto3.client(
        's3', endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    ctype = 'video/mp4' if ext == 'mp4' else ('video/webm' if ext == 'webm' else 'video/quicktime')
    s3.put_object(Bucket='files', Key=key, Body=data, ContentType=ctype)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def handler(event, context):
    '''Управление контентом сайта-переходника: настройки, ссылки, загрузка видео в S3'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    conn = get_conn()
    ensure_schema(conn)

    if method == 'GET':
        result = get_content(conn)
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
                'body': json.dumps(result, ensure_ascii=False)}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')
    cur = conn.cursor()

    if action == 'uploadVideo':
        url = upload_video(body)
        cur.execute('UPDATE site_settings SET video_url=%s, video_name=%s, updated_at=NOW() WHERE id=1',
                    (url, body.get('fileName', '')))
        conn.commit()

    elif action == 'saveSettings':
        cur.execute(
            'UPDATE site_settings SET title=%s, description=%s, age_warning=%s, updated_at=NOW() WHERE id=1',
            (body.get('title', ''), body.get('description', ''), body.get('ageWarning', '')))
        conn.commit()

    elif action == 'deleteVideo':
        cur.execute("UPDATE site_settings SET video_url='', video_name='' WHERE id=1")
        conn.commit()

    elif action == 'saveLinks':
        cur.execute('DELETE FROM site_links')
        for i, link in enumerate(body.get('links', [])):
            cur.execute('INSERT INTO site_links (title, url, icon, sort_order) VALUES (%s,%s,%s,%s)',
                        (link.get('title', ''), link.get('url', ''), link.get('icon', 'Link'), i))
        conn.commit()

    result = get_content(conn)
    cur.close()
    conn.close()
    return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
            'body': json.dumps(result, ensure_ascii=False)}