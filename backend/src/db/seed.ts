import { db } from '../config/db.js';
import { users, dailyPrompts } from './schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('[SEED] Starting Database Seeding...');

  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.role, 'superadmin'))
    .limit(1);

  if (!existingAdmin) {
    const [created] = await db
      .insert(users)
      .values({
        email: 'admin@trymonkmode.in',
        name: 'Admin',
        role: 'superadmin',
        title: 'Productivity Architect & Founder',
        xp: 1540,
        level: 5,
        streak: 12,
      })
      .returning();
    console.log(`[SEED] Superadmin created: ${created.email} (ID: ${created.id})`);
  } else {
    console.log(`[SEED] Superadmin already exists: ${existingAdmin.email}`);
  }

  const promptsData = [
    { prompt: 'What is one hard truth you embraced today that made you wiser?', category: 'Stoic Growth' },
    { prompt: 'What high-leverage decision did you make that saved hours of future effort?', category: 'Productivity' },
    { prompt: 'Where did you succumb to shallow urgency instead of deep priority today?', category: 'Deep Focus' },
    { prompt: 'What are 3 small things you are deeply grateful for right now?', category: 'Mindfulness' },
    { prompt: 'If today was your last day working on this project, what would you be proudest of?', category: 'Self Mastery' },
    { prompt: 'What fear or friction did you lean into rather than avoiding?', category: 'Courage' },
    { prompt: 'How did you protect your energy and biological focus window today?', category: 'Wellness' },
    { prompt: 'What cognitive assumption did you test and invalidate today?', category: 'Mental Models' },
    { prompt: 'Who helped you or taught you something meaningful this week?', category: 'Gratitude' },
    { prompt: 'What was your single most impactful deep work session today?', category: 'Flow State' },
    { prompt: 'What is one habit or micro-behavior you want to sharpen tomorrow?', category: 'Habits' },
    { prompt: 'How did you respond to unexpected chaos or friction today?', category: 'Equanimity' },
    { prompt: 'What is the highest-value deliverable you completed today?', category: 'Execution' },
    { prompt: 'What did you say NO to today so you could say YES to your primary goal?', category: 'Focus' },
    { prompt: 'What message would today\'s wiser self give to yourself from 5 years ago?', category: 'Perspective' },
  ];

  for (const item of promptsData) {
    await db.insert(dailyPrompts).values({
      prompt: item.prompt,
      category: item.category,
      tags: ['stoic', 'growth', 'reflection'],
      isActive: true,
    });
  }
  console.log(`[SEED] Seeded ${promptsData.length} curated daily journal reflection prompts.`);

  console.log('[SEED] Database Seeding Finished Successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('[SEED ERROR] Seeding failed:', err);
  process.exit(1);
});