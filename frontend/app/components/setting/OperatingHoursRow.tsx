'use client'

import { DaySchedule } from '@/lib/api'

interface OperatingHoursRowProps {
  day: string
  schedule: DaySchedule
  onChange: (updated: DaySchedule) => void
}

export default function OperatingHoursRow({ day, schedule, onChange }: OperatingHoursRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <input
        type="checkbox"
        checked={schedule.enabled}
        onChange={(e) => onChange({ ...schedule, enabled: e.target.checked })}
        className="w-4 h-4 accent-[#3a7d44] cursor-pointer shrink-0"
      />
      <span className="w-24 text-sm text-gray-700 capitalize shrink-0">{day}</span>
      <input
        type="time"
        value={schedule.open}
        disabled={!schedule.enabled}
        onChange={(e) => onChange({ ...schedule, open: e.target.value })}
        style={{ colorScheme: 'light' }}
        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-[#c8e84a] focus:ring-2 focus:ring-[#c8e84a]/20 transition-all"
      />
      <span className="text-sm text-gray-400 shrink-0">to</span>
      <input
        type="time"
        value={schedule.close}
        disabled={!schedule.enabled}
        onChange={(e) => onChange({ ...schedule, close: e.target.value })}
        style={{ colorScheme: 'light' }}
        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:border-[#c8e84a] focus:ring-2 focus:ring-[#c8e84a]/20 transition-all"
      />
    </div>
  )
}
