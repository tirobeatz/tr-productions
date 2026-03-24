import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// GET: Fetch the weekly schedule
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('studio_schedule')
      .select('*')
      .order('day_of_week', { ascending: true })

    if (error) throw error

    // If no schedule exists, return defaults (10-22 every day)
    if (!data || data.length === 0) {
      const defaults = Array.from({ length: 7 }, (_, i) => ({
        day_of_week: i, // 0=Sunday, 1=Monday, ..., 6=Saturday
        is_open: i >= 1 && i <= 6, // Closed Sunday by default
        open_hour: 10,
        close_hour: 22,
        break_start: null,
        break_end: null,
      }))
      return NextResponse.json({ schedule: defaults, isDefault: true })
    }

    return NextResponse.json({ schedule: data, isDefault: false })
  } catch (error) {
    console.error('Error fetching schedule:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Save the weekly schedule
export async function POST(request) {
  try {
    const { schedule } = await request.json()

    if (!schedule || !Array.isArray(schedule) || schedule.length !== 7) {
      return NextResponse.json({ error: 'Invalid schedule: must be array of 7 days' }, { status: 400 })
    }

    // Validate each day
    for (const day of schedule) {
      if (day.day_of_week < 0 || day.day_of_week > 6) {
        return NextResponse.json({ error: 'Invalid day_of_week' }, { status: 400 })
      }
      if (day.is_open) {
        if (day.open_hour < 0 || day.open_hour > 23 || day.close_hour < 1 || day.close_hour > 24) {
          return NextResponse.json({ error: 'Invalid hours' }, { status: 400 })
        }
        if (day.open_hour >= day.close_hour) {
          return NextResponse.json({ error: `Open hour must be before close hour for day ${day.day_of_week}` }, { status: 400 })
        }
      }
    }

    // Upsert each day (insert or update based on day_of_week)
    for (const day of schedule) {
      const { error } = await supabaseAdmin
        .from('studio_schedule')
        .upsert({
          day_of_week: day.day_of_week,
          is_open: day.is_open,
          open_hour: day.is_open ? day.open_hour : null,
          close_hour: day.is_open ? day.close_hour : null,
          break_start: day.is_open ? day.break_start : null,
          break_end: day.is_open ? day.break_end : null,
        }, { onConflict: 'day_of_week' })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving schedule:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
