import os, json, time, re, requests
from datetime import datetime, timedelta
from flask import request, jsonify

_last_ai_call = 0

def _call_ai(prompt: str) -> str:
    global _last_ai_call
    now = time.time()
    wait = 2 - (now - _last_ai_call)
    if wait > 0:
        time.sleep(wait)
    _last_ai_call = time.time()

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {os.environ.get('OPENROUTER_API_KEY')}",
            "Content-Type": "application/json",
        },
        json={
            "model": "google/gemini-2.0-flash-lite",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 500,
        },
        timeout=30
    )
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"].strip()


def _round_to_500(price: float) -> int:
    return int(round(price / 500) * 500)


def register_surplus_routes(app, supabase, require_auth):

    @app.route('/api/ai/generate-expiry', methods=['POST'])
    @require_auth
    def generate_expiry(user):
        data            = request.get_json()
        product_name    = data.get('product_name', '').strip()
        category        = data.get('category', '').strip()
        production_time = data.get('production_time', '').strip()
        original_price  = float(data.get('original_price', 0) or 0)

        now = datetime.now()
        try:
            prod_hour, prod_min = map(int, production_time.split(':'))
            prod_dt = now.replace(hour=prod_hour, minute=prod_min, second=0)
            if prod_dt > now:
                prod_dt -= timedelta(days=1)
            elapsed_hours = (now - prod_dt).total_seconds() / 3600
        except Exception:
            elapsed_hours = 0

        shelf_life_map = {
            'Rice': 6, 'Noodles': 5, 'Bread': 12, 'Snack': 24,
            'Beverage': 8, 'Dessert': 8, 'Salad': 4, 'Meat': 4,
        }
        max_shelf = 6
        for key, val in shelf_life_map.items():
            if key.lower() in category.lower():
                max_shelf = val
                break

        remaining_hours = max(0.5, max_shelf - elapsed_hours)
        latest_safe = now + timedelta(hours=remaining_hours)
        latest_safe_str = latest_safe.strftime('%H:%M')

        plate_up_price_floor = _round_to_500(original_price * 0.5)
        plate_up_price_ceil  = _round_to_500(original_price * 0.6)

        try:
            prompt = f"""Kamu adalah sistem food safety otomatis untuk PlateUp, platform surplus food Indonesia.

KONTEKS SAAT INI:
- Waktu sekarang: {now.strftime('%H:%M')} WIB
- Produk: {product_name}
- Kategori makanan: {category}
- Diproduksi pada: {production_time} WIB
- Sudah berlalu: {elapsed_hours:.1f} jam sejak produksi
- Harga asli: Rp {int(original_price):,}

ATURAN WAJIB:
1. expiry_time HARUS format "HH:MM" (24 jam), contoh: "19:30"
2. expiry_time TIDAK BOLEH lebih dari {latest_safe_str} WIB (batas aman food safety)
3. expiry_time TIDAK BOLEH sebelum waktu sekarang ({now.strftime('%H:%M')} WIB)
4. plate_up_price HARUS kelipatan 500, antara Rp {plate_up_price_floor:,} dan Rp {plate_up_price_ceil:,}
5. plate_up_price HARUS integer, bukan desimal

Balas HANYA JSON berikut, tanpa penjelasan, tanpa markdown:
{{"expiry_time": "HH:MM", "plate_up_price": 0}}"""

            raw = _call_ai(prompt)
            raw = re.sub(r'```(?:json)?', '', raw).strip()
            match = re.search(r'\{.*?\}', raw, re.DOTALL)
            result = json.loads(match.group())

            expiry_time = str(result.get('expiry_time', latest_safe_str))
            if not re.match(r'^\d{2}:\d{2}$', expiry_time):
                expiry_time = latest_safe_str

            plate_up_price = int(result.get('plate_up_price', 0))
            if not (plate_up_price_floor <= plate_up_price <= plate_up_price_ceil):
                plate_up_price = _round_to_500(original_price * 0.55)

            print(f"[AI] expiry OK → expiry: {expiry_time}, price: {plate_up_price}")
            return jsonify({
                'expiry_time':    expiry_time,
                'plate_up_price': plate_up_price
            }), 200

        except Exception as e:
            print(f"[AI] expiry fallback: {type(e).__name__}: {e}")
            return jsonify({
                'expiry_time':    latest_safe_str,
                'plate_up_price': _round_to_500(original_price * 0.55)
            }), 200


    @app.route('/api/ai/generate-description', methods=['POST'])
    @require_auth
    def generate_description(user):
        data           = request.get_json()
        product_name   = data.get('product_name', '').strip()
        category       = data.get('category', '').strip()
        original_price = float(data.get('original_price', 0) or 0)
        plate_up_price = float(data.get('plate_up_price', 0) or 0)
        expiry_time    = data.get('expiry_time', '').strip()

        discount_pct = 0
        if original_price > 0 and plate_up_price > 0:
            discount_pct = round((1 - plate_up_price / original_price) * 100)

        try:
            prompt = f"""Kamu copywriter untuk PlateUp, aplikasi surplus food Indonesia yang membantu mengurangi food waste.

PRODUK YANG DIJUAL:
- Nama: {product_name}
- Kategori: {category}
- Harga asli: Rp {int(original_price):,}
- Harga PlateUp: Rp {int(plate_up_price):,} (hemat {discount_pct}%)
- Batas konsumsi: sebelum pukul {expiry_time} WIB

TUGAS:
Tulis deskripsi produk surplus dalam Bahasa Indonesia yang natural dan mengajak beli.
Maksimal 2 kalimat.

ATURAN KETAT:
- Gunakan HANYA Bahasa Indonesia, tidak boleh ada kata Inggris
- Kalimat pertama: kondisi/kualitas makanan sekarang
- Kalimat kedua: nilai/keuntungan beli (harga hemat ATAU batas waktu sebagai urgensi)
- Jangan gunakan kata: "lezat", "nikmat", "mantap", "yummy", "fresh" (terlalu generik)
- Nada: hangat, jujur, tidak lebay
- Jangan sebut nama produk lagi di deskripsi (sudah ada di judul)

CONTOH OUTPUT YANG BENAR:
"Masih dalam kondisi hangat dan baru matang, disimpan dalam wadah tertutup. Dapatkan dengan harga Rp {int(plate_up_price):,} — hemat {discount_pct}% dari harga normal sebelum pukul {expiry_time}."

Balas HANYA teks deskripsinya saja, tanpa tanda kutip, tanpa penjelasan."""

            desc = _call_ai(prompt)
            desc = desc.strip('"\'')
            print(f"[AI] description OK: {desc[:60]}")
            return jsonify({'description': desc}), 200

        except Exception as e:
            print(f"[AI] description fallback: {type(e).__name__}: {e}")
            cat_lower = category.lower()
            if 'rice' in cat_lower:
                desc = f"Nasi masih hangat dan baru matang, disimpan dalam wadah tertutup rapat. Bisa kamu dapatkan dengan harga spesial Rp {int(plate_up_price):,} sebelum pukul {expiry_time}."
            elif 'noodle' in cat_lower:
                desc = f"Mie masih dalam kondisi baik dan baru dimasak, cocok langsung disantap. Ambil sekarang dengan harga Rp {int(plate_up_price):,}, hemat {discount_pct}% dari harga normal."
            elif 'bread' in cat_lower:
                desc = f"Roti masih lembut dan segar dari dapur, belum melewati satu hari. Harga spesial Rp {int(plate_up_price):,} untuk kamu yang mau hemat hari ini."
            elif 'snack' in cat_lower:
                desc = f"Camilan dalam kondisi baik dan dikemas dengan higienis. Dapatkan dengan harga Rp {int(plate_up_price):,} sebelum pukul {expiry_time}."
            else:
                desc = f"Makanan masih dalam kondisi layak konsumsi dan baru disiapkan. Tersedia dengan harga Rp {int(plate_up_price):,}, hemat {discount_pct}% dari harga aslinya."
            return jsonify({'description': desc}), 200


    @app.route('/api/surplus/products', methods=['POST'])
    @require_auth
    def create_surplus_product(user):
        try:
            name = request.form.get('product_name', '').strip()
            if not name:
                return jsonify({'error': 'Product name required'}), 400

            original_price = float(request.form.get('original_price', 0) or 0)
            plate_up_price = float(request.form.get('plate_up_price', 0) or 0)
            is_draft       = request.form.get('is_draft', 'false').lower() == 'true'

            image_url  = None
            image_file = request.files.get('image')
            if image_file and image_file.filename:
                try:
                    path = f"{user.id}/{image_file.filename.replace(' ', '_')}"
                    supabase.storage.from_('surplus-images').upload(
                        path, image_file.read(),
                        {"content-type": image_file.content_type}
                    )
                    image_url = supabase.storage.from_('surplus-images').get_public_url(path)
                except Exception as img_e:
                    print(f"[IMG] upload error (non-fatal): {img_e}")

            result = supabase.table('surplus_products').insert({
                'partner_id':      user.id,
                'product_name':    name,
                'category':        request.form.get('category', ''),
                'production_time': request.form.get('production_time', ''),
                'expiry_estimate': request.form.get('expiry_estimate', ''),
                'original_price':  original_price,
                'plate_up_price':  plate_up_price,
                'description':     request.form.get('description', ''),
                'image_url':       image_url,
                'is_draft':        is_draft,
                'status':          'draft' if is_draft else 'active',
            }).execute()

            return jsonify({
                'success': True,
                'message': 'Draft saved' if is_draft else 'Product uploaded',
                'data':    result.data[0] if result.data else {}
            }), 201

        except Exception as e:
            import traceback; traceback.print_exc()
            return jsonify({'error': str(e)}), 500


    @app.route('/api/surplus/products', methods=['GET'])
    @require_auth
    def get_surplus_products(user):
        try:
            result = supabase.table('surplus_products') \
                .select('*').eq('partner_id', user.id) \
                .order('created_at', desc=True).execute()
            return jsonify({'data': result.data}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500