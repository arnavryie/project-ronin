"use client"
import { useEffect, useState } from "react"
import { BrainCircuit } from "lucide-react"

interface DeveloperDossierProps {
  username: string
  skills: string[]
  topRepos: string[]
}

export function DeveloperDossier({ username, skills, topRepos }: DeveloperDossierProps) {
  const [dossier, setDossier] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/ai/developer-dossier`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, skills, top_repos: topRepos })
    })
      .then(r => r.json())
      .then(d => setDossier(d.dossier))
      .catch(() => setDossier("Unable to generate dossier."))
      .finally(() => setLoading(false))
  }, [username, skills, topRepos])

  return (
    <div className="p-5 bg-gh-surface border border-gh-border rounded-md flex flex-col gap-4">
      <div className="border-b border-gh-border/60 pb-3 flex items-center gap-2 select-none">
        <BrainCircuit className="w-5 h-5 text-gh-purple animate-pulse" />
        <h3 className="text-sm font-bold text-white tracking-tight">AI Platform Analysis Dossier</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-full" />
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-11/12" />
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-4/5" />
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-full mt-4" />
          <div className="h-3 bg-[#21262d] rounded animate-pulse w-9/12" />
        </div>
      ) : (
        <div className="flex flex-col gap-4 leading-relaxed">
          <p className="text-[12px] text-gh-muted whitespace-pre-wrap">{dossier}</p>
        </div>
      )}
    </div>
  )
}
