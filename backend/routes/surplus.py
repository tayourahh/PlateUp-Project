# backend/routes/surplus.py
import os, json, time
from flask import request, jsonify

# Rate limiter sederhana — prevent spam ke Gemini API
_last_ai_call = 0

def _call_gemini(prompt: str) -> str:
    """
    Wrapper Gemini dengan rate limiting.
    Minimal 3 detik antar call supaya tidak kena 429.
    """
    global _last_ai_call
    now = time.time()
    wait = 3 - (now - _last_ai_call)
    if wait > 0:
        time.sleep(wait)
    _last_ai_call = time.time()

    from google import genai
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    response = client.models.generate_content(
        model='models/gemini-2.0-flash-lite',
        contents=prompt
    )
    return response.text.strip()


def register_surplus_routes(app, supabase, require_auth):

    # ── POST /api/ai/generate-expiry ────────────────────────────
    @app.route('/api/ai/generate-expiry', methods=['POST'])
    @require_auth
    def generate_expiry(user):
        data            = request.get_json()
        product_name    = data.get('product_name', '')
        category        = data.get('category', '')
        production_time = data.get('production_time', '')
        original_price  = float(data.get('original_price', 0) or 0)

        try:
            prompt = f"""Kamu pakar food safety. Analisis produk surplus:
Produk: {product_name}, Kategori: {category}, Waktu produksi: {production_time}, Harga asli: Rp {original_price}

Balas HANYA JSON ini tanpa markdown:
{{"expiry_estimate": "Konsumsi sebelum pukul 20.00", "plate_up_price": 9000}}

plate_up_price harus integer rupiah, 50-60% dari harga asli."""

            raw = _call_gemini(prompt)
            raw = raw.replace('```json', '').replace('```', '').strip()
            start = raw.find('{')
            end   = raw.rfind('}') + 1
            result = json.loads(raw[start:end])
            print(f"[AI] expiry OK: {result}")

            return jsonify({
                'expiry_estimate': str(result.get('expiry_estimate', 'Konsumsi dalam 2 jam')),
                'plate_up_price':  int(result.get('plate_up_price', int(original_price * 0.55)))
            }), 200

        except Exception as e:
            print(f"[AI] expiry fallback: {type(e).__name__}: {e}")
            # Smart fallback berdasarkan production_time
            expiry_map = {
                'Just cooked': 'Konsumsi sebelum pukul 22.00',
                '30 min':      'Konsumsi sebelum pukul 21.00',
                '1 - 2':       'Konsumsi sebelum pukul 20.00',
                '2 - 3':       'Konsumsi sebelum pukul 19.00',
                '3+':          'Segera dikonsumsi, maks 2 jam lagi',
            }
            expiry = 'Konsumsi dalam 2 jam'
            for key, val in expiry_map.items():
                if key in production_time:
                    expiry = val
                    break
            return jsonify({
                'expiry_estimate': expiry,
                'plate_up_price':  int(original_price * 0.55)
            }), 200


    # ── POST /api/ai/generate-description ───────────────────────
    @app.route('/api/ai/generate-description', methods=['POST'])
    @require_auth
    def generate_description(user):
        data           = request.get_json()
        product_name   = data.get('product_name', '')
        category       = data.get('category', '')
        original_price = float(data.get('original_price', 0) or 0)

        try:
            prompt = f"""Buat deskripsi produk surplus makanan, maksimal 2 kalimat.
Produk: {product_name}, Kategori: {category}, Harga: Rp {original_price}
Fokus pada kondisi makanan dan nilai bagi pembeli. Bahasa Indonesia natural.
Balas HANYA teks deskripsinya."""

            desc = _call_gemini(prompt)
            print(f"[AI] description OK: {desc[:50]}")
            return jsonify({'description': desc}), 200

        except Exception as e:
            print(f"[AI] description fallback: {type(e).__name__}: {e}")
            # Smart fallback
            fallbacks = {
                'Noodles': f'{product_name} masih dalam kondisi hangat dan segar, cocok dikonsumsi segera.',
                'Rice':    f'{product_name} baru matang, disimpan dalam kondisi tertutup rapat.',
                'Bread':   f'{product_name} masih lembut dan segar dari oven, terbaik dikonsumsi hari ini.',
                'Snack':   f'{product_name} dalam kondisi baik, dikemas higienis untuk kamu.',
                'Bever':   f'{product_name} segar dan siap minum, disimpan dalam suhu dingin.',
            }
            desc = f'{product_name} dalam kondisi baik dan layak konsumsi, dijual dengan harga spesial hari ini.'
            for key, val in fallbacks.items():
                if key.lower() in category.lower():
                    desc = val
                    break
            return jsonify({'description': desc}), 200


    # ── POST /api/surplus/products ───────────────────────────────
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


    # ── GET /api/surplus/products ────────────────────────────────
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