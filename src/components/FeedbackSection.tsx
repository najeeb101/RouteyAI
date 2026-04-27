'use client'

import { useState } from 'react'
import { Star, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function FeedbackSection() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLoading(false)
    setIsSubmitted(true)
    toast.success('Thank you for your feedback!')
  }

  if (isSubmitted) {
    return (
      <section id="feedback" className="pt-12 pb-24 max-w-4xl mx-auto px-6 text-center scroll-mt-[56px]">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E2E8F0] dark:border-slate-800 p-12 shadow-sm animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-white mb-4">Feedback Received!</h2>
          <p className="text-[#64748B] dark:text-slate-400 text-lg mb-8">
            Thank you for helping us improve RouteyAI. Your input is invaluable to our mission of safer school transport in Qatar.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="rounded-xl px-8"
          >
            Send another
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section id="feedback" className="pt-12 pb-24 relative overflow-hidden scroll-mt-[56px]">
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-400/10 dark:bg-emerald-600/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight mb-4">
            We value your feedback
          </h2>
          <p className="text-[#64748B] dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Tell us about your experience or suggest new features. We&apos;re building the future of school transport together.
          </p>
        </div>

        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-[#E2E8F0] dark:border-slate-800 rounded-3xl shadow-xl shadow-blue-500/5 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl dark:text-white">Share your thoughts</CardTitle>
            <CardDescription className="dark:text-slate-400">All feedback helps us grow.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="dark:text-slate-300">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Ahmed Al-Thani" 
                    className="rounded-xl bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="dark:text-slate-300">Email (Optional)</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="ahmed@example.com" 
                    className="rounded-xl bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="dark:text-slate-300">How would you rate your experience?</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="transition-all hover:scale-110 focus:outline-none"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-colors",
                          (hoveredRating || rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300 dark:text-slate-600"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="dark:text-slate-300">Your Message</Label>
                <textarea
                  id="message"
                  required
                  placeholder="What can we do better?"
                  className="flex min-h-[120px] w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all dark:text-white"
                />
              </div>

              <Button 
                type="submit" 
                disabled={loading || rating === 0}
                className="w-full h-12 rounded-xl bg-[#1E3A8A] hover:bg-[#1e40af] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Submit Feedback
                    <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
