"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] rounded-xl p-1.5 shadow-md dark:shadow-none border border-[#E2E8F0] dark:border-slate-800 bg-white dark:bg-slate-900">
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2.5 rounded-lg cursor-pointer py-2 text-[13px] font-medium text-[#0F172A] dark:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors focus:bg-[#F1F5F9] dark:focus:bg-slate-800">
          <Sun className="h-[15px] w-[15px] text-[#64748B] dark:text-slate-400" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2.5 rounded-lg cursor-pointer py-2 text-[13px] font-medium text-[#0F172A] dark:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors focus:bg-[#F1F5F9] dark:focus:bg-slate-800">
          <Moon className="h-[15px] w-[15px] text-[#64748B] dark:text-slate-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2.5 rounded-lg cursor-pointer py-2 text-[13px] font-medium text-[#0F172A] dark:text-slate-200 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors focus:bg-[#F1F5F9] dark:focus:bg-slate-800">
          <Monitor className="h-[15px] w-[15px] text-[#64748B] dark:text-slate-400" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
