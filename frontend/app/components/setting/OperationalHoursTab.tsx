'use client'

import { OperatingHours, DaySchedule } from '@/lib/api'
import OperatingHoursRow from './OperatingHoursRow'

const DAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday',
  'friday', 'saturday', 'sunday',
] as const

interface OperationalHoursTabProps {
  hours: OperatingHours
  isAutoActive: boolean
  onHoursChange: (updated: OperatingHours) => void
  onAutoActiveToggle: (value: boolean) => void
}

export default function OperationalHoursTab({
  hours,
  isAutoActive,
  onHoursChange,
  onAutoActiveToggle,
}: OperationalHoursTabProps) {
  const handleDayChange = (day: typeof DAYS[number], updated: DaySchedule) =>
    onHoursChange({ ...hours, [day]: updated })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-semibold text-gray-800">Operating Hours</label>
        <button
          type="button"
          onClick={() => onAutoActiveToggle(!isAutoActive)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
            isAutoActive
              ? 'bg-[#3a7d44] text-white border-[#3a7d44]'
              : 'bg-white text-gray-500 border-gray-300 hover:border-[#3a7d44]'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isAutoActive ? 'bg-white' : 'bg-gray-400'}`} />
          Auto - {isAutoActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      <div className="divide-y divide-gray-100">
        {DAYS.map((day) => (
          <OperatingHoursRow
            key={day}
            day={day}
            schedule={hours[day]}
            onChange={(updated) => handleDayChange(day, updated)}
          />
        ))}
      </div>
    </div>
  )
}
