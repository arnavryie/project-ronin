"use client"

import { useEffect, useState } from "react"

interface ContributionDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface ContributionGraphProps {
  username: string
}

const COLORS = [
  "#161b22", // level 0 - empty
  "#0e4429", // level 1
  "#006d32", // level 2
  "#26a641", // level 3
  "#39d353", // level 4
]

export function ContributionGraph({ username }: ContributionGraphProps) {
  const [weeks, setWeeks] = useState<ContributionDay[][]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!username || username === "guest") { setLoading(false); return }

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then(r => r.json())
      .then(data => {
        const contributions: ContributionDay[] = data.contributions || []
        setTotal(contributions.reduce((sum: number, d: ContributionDay) => sum + d.count, 0))

        // Group into weeks (7 days each)
        const grouped: ContributionDay[][] = []
        for (let i = 0; i < contributions.length; i += 7) {
          grouped.push(contributions.slice(i, i + 7))
        }
        setWeeks(grouped)
      })
      .catch(() => {
        setWeeks([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [username])

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  if (loading) {
    return (
      <div className="p-4 border border-gh-border rounded-md bg-gh-surface">
        <div className="h-4 w-48 bg-gh-surface2 rounded animate-pulse mb-4" />
        <div className="flex gap-[3px]">
          {Array.from({ length: 52 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-[3px]">
              {Array.from({ length: 7 }).map((_, j) => (
                <div key={j} className="w-[10px] h-[10px] rounded-sm bg-gh-surface2 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!weeks.length) {
    return (
      <div className="p-4 border border-gh-border rounded-md bg-gh-surface text-center text-gh-muted text-sm">
        No contribution data available.
      </div>
    )
  }

  // Build month labels by finding the first week of each month
  const monthLabels: { label: string; weekIndex: number }[] = []
  weeks.forEach((week, i) => {
    if (week[0]) {
      const month = new Date(week[0].date).getMonth()
      if (monthLabels.length === 0 || monthLabels[monthLabels.length - 1].label !== months[month]) {
        monthLabels.push({ label: months[month], weekIndex: i })
      }
    }
  })

  return (
    <div className="p-4 border border-gh-border rounded-md bg-gh-surface overflow-x-auto">
      <p className="text-sm text-gh-text font-medium mb-3">
        {total.toLocaleString()} contributions in the last year
      </p>

      {/* Month labels */}
      <div className="flex mb-1 text-[10px] text-gh-muted" style={{ paddingLeft: "28px" }}>
        {weeks.map((_, i) => {
          const label = monthLabels.find(m => m.weekIndex === i)
          return (
            <div key={i} className="w-[13px] shrink-0 text-left">
              {label ? label.label : ""}
            </div>
          )
        })}
      </div>

      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] mr-1 text-[10px] text-gh-muted w-6 shrink-0">
          <span className="h-[10px]" />
          <span className="h-[10px]">Mon</span>
          <span className="h-[10px]" />
          <span className="h-[10px]">Wed</span>
          <span className="h-[10px]" />
          <span className="h-[10px]">Fri</span>
          <span className="h-[10px]" />
        </div>

        {/* The actual grid */}
        <div className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day, di) => (
                <div
                  key={di}
                  className="w-[10px] h-[10px] rounded-sm cursor-pointer transition-opacity hover:opacity-70"
                  style={{ backgroundColor: COLORS[day.level] }}
                  title={`${day.count} contributions on ${day.date}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 mt-3 justify-end text-[10px] text-gh-muted">
        <span>Less</span>
        {COLORS.map((c, i) => (
          <div key={i} className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

export default ContributionGraph
