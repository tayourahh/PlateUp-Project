'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, MapPin, Clock, Minus, Plus, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SurplusProduct = {
    id: string
    partner_id: string
    product_name: string
    category: string
    production_time: string
    expiry_estimate: string
    original_price: number
    plate_up_price: number
    description: string
    image_url: string | null
    status: string
    is_draft: boolean
    created_at: string
    updated_at: string
    expiry_datetime: string
    quantity: number
    // optional join fields
    partner_name?: string
    partner_address?: string
}

type Props = {
    food: SurplusProduct
    onClose: () => void
    customerId: string
    onOrderSuccess: () => void
}

export default function FoodOrderModal({ food, onClose, customerId, onOrderSuccess }: Props) {
    const supabase = createClient()
    const [qty, setQty] = useState(1)
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const totalPrice = food.plate_up_price * qty
    const discount = Math.round(((food.original_price - food.plate_up_price) / food.original_price) * 100)

    const handleOrder = async () => {
        setLoading(true)
        try {
            const { error } = await supabase
                .from('pickup_orders')
                .insert({
                    customer_id: customerId,
                    partner_id: food.partner_id,
                    product_name: food.product_name,
                    product_image_url: food.image_url,
                    item_count: qty,
                    total_price: totalPrice,
                    status: 'Pickup Ready',
                    ordered_at: new Date().toISOString(),
                })

            if (error) throw error

            setSuccess(true)
            setTimeout(() => {
                onOrderSuccess()
                onClose()
            }, 1800)
        } catch (err) {
            console.error('Order error:', err)
            alert('Gagal membuat pesanan. Coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl animate-slide-up">

                {/* Image */}
                <div className="relative h-56 w-full">
                    {food.image_url ? (
                        <Image src={food.image_url} alt={food.product_name} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-5xl">🍱</div>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md"
                    >
                        <X size={16} className="text-gray-700" />
                    </button>
                    <span className="absolute top-3 left-3 bg-[#3a7d44] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                        {food.status ?? 'Ready to Eat'}
                    </span>
                    {discount > 0 && (
                        <span className="absolute bottom-3 left-3 bg-red-500 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                            -{discount}% OFF
                        </span>
                    )}
                </div>

                <div className="p-5 space-y-4">
                    {/* Title & price */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">{food.product_name}</h2>
                        {food.partner_name && (
                            <p className="text-sm text-gray-400 mt-0.5">{food.partner_name}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-xl font-bold text-[#3a7d44]">
                                Rp {Number(food.plate_up_price).toLocaleString('id-ID')}
                            </span>
                            {food.original_price > food.plate_up_price && (
                                <span className="text-sm text-gray-400 line-through">
                                    Rp {Number(food.original_price).toLocaleString('id-ID')}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {food.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">{food.description}</p>
                    )}

                    {/* Expiry warning */}
                    {food.expiry_estimate && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                            <Clock size={14} className="text-red-400 shrink-0" />
                            <p className="text-xs text-red-500 font-medium">
                                Estimated Expiry: {food.expiry_estimate} — Order now to prevent waste
                            </p>
                        </div>
                    )}

                    {/* Pickup details */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700 uppercase tracking-widest">Pick-up Details</p>
                        {food.partner_address && (
                            <div className="flex items-start gap-2">
                                <MapPin size={13} className="text-[#3a7d44] mt-0.5 shrink-0" />
                                <p className="text-xs text-gray-600">{food.partner_address}</p>
                            </div>
                        )}
                        {food.production_time && (
                            <div className="flex items-center gap-2">
                                <Clock size={13} className="text-[#3a7d44] shrink-0" />
                                <p className="text-xs text-gray-600">Pick-up before {food.production_time}</p>
                            </div>
                        )}
                    </div>

                    {/* Quantity */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#3a7d44] hover:text-[#3a7d44] transition-colors"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-lg font-bold text-gray-900 w-6 text-center">{qty}</span>
                            <button
                                onClick={() => setQty(q => Math.min(food.quantity ?? 99, q + 1))}
                                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-[#3a7d44] hover:text-[#3a7d44] transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                            <span className="text-xs text-gray-400 ml-1">{food.quantity} available</span>
                        </div>
                    </div>

                    {/* Special instructions */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Special Instructions</p>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Allergies? Preferences? Let the chef know..."
                            rows={2}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#3a7d44] resize-none transition-colors"
                        />
                    </div>

                    {/* Food shelf life bar */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Food Shelf Life Remaining</span>
                            <span className="text-red-500 font-semibold">Critical</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-400 to-orange-400 rounded-full" style={{ width: '25%' }} />
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-600">TOTAL PRICE</span>
                            <span className="font-bold text-[#3a7d44] text-lg">Rp {totalPrice.toLocaleString('id-ID')}</span>
                        </div>

                        {success ? (
                            <div className="w-full py-3.5 bg-[#3a7d44] text-white rounded-2xl text-sm font-semibold text-center flex items-center justify-center gap-2">
                                ✅ Order Placed! Redirecting...
                            </div>
                        ) : (
                            <button
                                onClick={handleOrder}
                                disabled={loading}
                                className="w-full py-3.5 bg-[#3a7d44] hover:bg-[#2d6435] text-white rounded-2xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : (
                                    <>
                                        <ShoppingBag size={16} />
                                        Claim & Secure Food
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-up {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}