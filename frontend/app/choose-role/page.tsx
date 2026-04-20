import Link from 'next/link'
import Image from 'next/image'

export default function ChooseRolePage() {
    return (
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-[#F5F5F5] py-10 px-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">
                    Choose Your Role
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Select how you want to use PlateUp! to start making an impact.
                </p>

                <div className="flex flex-col gap-4">

                    {/* Culinary Partner */}
                    <Link href="/register?role=partner">
                        <div className="flex items-center gap-4 p-5 bg-[#f6fabc] border-2 border-[#f6fabc] hover:border-[#666c11] rounded-2xl transition-all cursor-pointer">
                            <div className="w-14 h-14 rounded-xl  flex items-center justify-center shrink-0 shadow-sm">
                                <Image
                                    src="/icons/icon-partner.png"
                                    alt="Partner"
                                    width={36}
                                    height={36}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-base font-bold text-[#666c11] mb-0.5">
                                    Culinary Partner
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Turn your surplus food into revenue and reduce waste.
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Food Saver */}
                    <Link href="/register?role=customer">
                        <div className="flex items-center gap-4 p-5 bg-[#f6fabc] border-2 border-[#f6fabc] hover:border-[#666c11] rounded-2xl transition-all cursor-pointer">
                            <div className="w-14 h-14 rounded-xl  flex items-center justify-center shrink-0 shadow-sm">
                                <Image
                                    src="/icons/icon-student.png"
                                    alt="Food Saver"
                                    width={36}
                                    height={36}
                                    className="object-contain"
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-base font-bold text-[#666c11] mb-0.5">
                                    Food Saver
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Find quality, affordable meals around campus and save the planet.
                                </p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Bottom links */}
                <div className="flex items-center justify-between mt-6">
                    <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to home
                    </Link>

                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-gradient-login font-bold">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}