'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Star, Sparkles } from 'lucide-react';

export function LandingReviews({ onOpenAuth }: { onOpenAuth: (mode: 'login' | 'signup') => void }) {
  return (
    <>
      <section id="reviews" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-bold text-foreground">
            <Users className="w-3.5 h-3.5 text-[#0052FF]" />
            <span>Trusted by 50,000+ High Performers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            What Our Community Is Saying
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            From software engineers to founders and students, here is how Monk Mode transforms daily output.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              name: 'Alex Vance',
              role: 'Staff Software Engineer',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
              text: 'The combination of Eisenhower quadrants with time-boxed 90m focus sprints completely eliminated my afternoon brain fog. Best productivity tool I have used in 5 years.',
            },
            {
              name: 'Sarah Chen',
              role: 'Founder & YC Alum',
              avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
              text: 'The liquid glass design is absolutely stunning. I can track my personal finances, sprint roadmap, and habit streaks all in one lightweight tab.',
            },
            {
              name: 'Marcus Brody',
              role: 'Product Designer',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
              text: 'The sticky notes pinboard with 8 predefined colors is genius. It feels like Apple Notes and Notion had a futuristic, hyper-fast baby.',
            },
            {
              name: 'Dr. Elena Rostova',
              role: 'Medical Resident & Researcher',
              avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
              text: 'The daily journal reflection and habit streak tracker kept me sane during 80-hour hospital weeks. The offline sync is rock solid.',
            },
            {
              name: 'Liam Patel',
              role: 'Indie Hacker & Creator',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
              text: 'Entered the Winter Arc challenge using this app. Up 18 days in a row on waking at 5 AM and coding 4 hours before my day job. Life changing.',
            },
            {
              name: 'Chloe Dubois',
              role: 'Senior Brand Architect',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
              text: 'Clean aesthetics matter. Working in an ugly spreadsheet ruins focus. This liquid glass UI makes me look forward to opening my task matrix every morning.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl ios-card border border-border/80 hover:border-[#0052FF]/40 transition-all duration-300 hover:-translate-y-1 shadow-md space-y-4 flex flex-col justify-between"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                "{item.text}"
              </p>

              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                <img
                  src={item.avatar}
                  alt={item.name}
                  draggable={false}
                  className="w-10 h-10 rounded-full object-cover border border-border no-drag select-none pointer-events-none"
                />
                <div>
                  <span className="text-xs font-extrabold text-foreground block">{item.name}</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{item.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL ISLAND CTA */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-14 rounded-[40px] bg-gradient-to-r from-[#0052FF] via-[#0043D6] to-purple-600 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to transform your output?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Stop Procrastinating. Enter Monk Mode Today.
          </h2>

          <p className="text-xs sm:text-sm text-white/85 max-w-lg mx-auto leading-relaxed">
            Join over 50,000 ambitious professionals taking control of their time, focus, and habits. Free forever.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto bg-white hover:bg-white/90 text-[#0052FF] text-xs sm:text-sm font-extrabold h-12 px-8 rounded-full shadow-2xl cursor-pointer hover:scale-105 transition"
            >
              Get Started Now — It's Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold h-12 px-6 rounded-full border border-white/25 cursor-pointer"
            >
              Existing Member Sign In
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}