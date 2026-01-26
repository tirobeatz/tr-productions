-- About Page Content Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS about_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Hero Section
  hero_tagline TEXT DEFAULT 'The Story Behind The Sound',
  hero_title TEXT DEFAULT 'TR Productions',
  hero_texts JSONB DEFAULT '["Producer. Engineer. Artist.", "Making beats that hit different.", "From Trier to the world.", "Your vision, my sound."]',

  -- Stats (will auto-display based on values)
  stats JSONB DEFAULT '[
    {"label": "Beats Made", "value": 500},
    {"label": "Artists Worked With", "value": 120},
    {"label": "Years Experience", "value": 5},
    {"label": "Projects Completed", "value": 200}
  ]',

  -- Timeline/Journey
  timeline JSONB DEFAULT '[
    {"year": "2019", "title": "The Beginning", "desc": "Started making beats in my bedroom with just a laptop and FL Studio.", "icon": "🌱", "milestone": "First beat ever made"},
    {"year": "2020", "title": "First Placement", "desc": "Landed my first placement with a local artist.", "icon": "🎯", "milestone": "1st official release"},
    {"year": "2021", "title": "Building the Studio", "desc": "Invested in proper equipment and acoustic treatment.", "icon": "🏠", "milestone": "Home studio complete"},
    {"year": "2022", "title": "Going Online", "desc": "Started selling beats online and offering mixing services.", "icon": "🌍", "milestone": "100+ beats sold"},
    {"year": "2023", "title": "Full-Time Producer", "desc": "Took the leap and went full-time. No backup plan.", "icon": "🚀", "milestone": "Full-time music"},
    {"year": "2024", "title": "TR Productions", "desc": "Launched the official brand. The full package.", "icon": "👑", "milestone": "Brand launch"}
  ]',

  -- Skills (name, level 0-100, icon)
  skills JSONB DEFAULT '[
    {"name": "Beat Production", "level": 95, "icon": "🎹"},
    {"name": "Mixing", "level": 88, "icon": "🎚️"},
    {"name": "Mastering", "level": 85, "icon": "💎"},
    {"name": "Sound Design", "level": 80, "icon": "🔊"},
    {"name": "Vocal Recording", "level": 82, "icon": "🎤"},
    {"name": "Music Theory", "level": 70, "icon": "📚"}
  ]',

  -- Tools
  tools JSONB DEFAULT '[
    {"name": "FL Studio", "icon": "🍊", "years": 5, "primary": true},
    {"name": "Pro Tools", "icon": "🎛️", "years": 2, "primary": false},
    {"name": "iZotope", "icon": "🔮", "years": 3, "primary": false},
    {"name": "Waves", "icon": "🌊", "years": 4, "primary": false},
    {"name": "Serum", "icon": "💉", "years": 4, "primary": true},
    {"name": "Kontakt", "icon": "🎻", "years": 3, "primary": false}
  ]',

  -- Genres/Music DNA (name, influence 0-100, color hex)
  genres JSONB DEFAULT '[
    {"name": "Trap", "influence": 95, "color": "#8B5CF6"},
    {"name": "Drill", "influence": 90, "color": "#EF4444"},
    {"name": "Hip-Hop", "influence": 88, "color": "#F59E0B"},
    {"name": "R&B", "influence": 75, "color": "#EC4899"},
    {"name": "Afrobeat", "influence": 60, "color": "#10B981"},
    {"name": "Pop", "influence": 50, "color": "#3B82F6"}
  ]',

  -- Day in Life
  day_schedule JSONB DEFAULT '[
    {"time": "09:00", "activity": "Wake up, coffee, check emails", "icon": "☕", "type": "morning"},
    {"time": "10:00", "activity": "Sound design & sample hunting", "icon": "🔍", "type": "morning"},
    {"time": "12:00", "activity": "Beat making session", "icon": "🎹", "type": "work"},
    {"time": "14:00", "activity": "Lunch break & social media", "icon": "🍜", "type": "break"},
    {"time": "15:00", "activity": "Client mixing projects", "icon": "🎚️", "type": "work"},
    {"time": "18:00", "activity": "Studio sessions (if booked)", "icon": "🎤", "type": "work"},
    {"time": "20:00", "activity": "Dinner & chill", "icon": "🍕", "type": "break"},
    {"time": "22:00", "activity": "Late night creative session", "icon": "🌙", "type": "creative"},
    {"time": "01:00", "activity": "Sleep (sometimes...)", "icon": "😴", "type": "end"}
  ]',

  -- Fun Facts (flip cards)
  fun_facts JSONB DEFAULT '[
    {"front": "Favorite DAW?", "back": "FL Studio forever 🍊", "icon": "💻"},
    {"front": "Coffee or Tea?", "back": "Coffee. Black. Always. ☕", "icon": "🍵"},
    {"front": "Night or Day?", "back": "Night owl - best beats after midnight 🦉", "icon": "🌙"},
    {"front": "First instrument?", "back": "Piano at age 8 🎹", "icon": "🎸"},
    {"front": "Dream collab?", "back": "Metro Boomin or Southside 🔥", "icon": "🤝"},
    {"front": "Guilty pleasure?", "back": "Lo-fi beats while cooking 🍳", "icon": "🎧"},
    {"front": "Studio snack?", "back": "Gummy bears. No debate. 🐻", "icon": "🍕"},
    {"front": "Beats made at 3AM?", "back": "Too many to count... 😅", "icon": "⏰"}
  ]',

  -- Social links
  socials JSONB DEFAULT '[
    {"name": "Instagram", "icon": "📸", "url": "#", "color": "from-purple-500 to-pink-500", "handle": "@trproductions"},
    {"name": "YouTube", "icon": "🎬", "url": "#", "color": "from-red-500 to-red-600", "handle": "TR Productions"},
    {"name": "TikTok", "icon": "🎵", "url": "#", "color": "from-gray-800 to-black", "handle": "@trproductions"},
    {"name": "Twitter", "icon": "🐦", "url": "#", "color": "from-blue-400 to-blue-500", "handle": "@tr_beats"},
    {"name": "Spotify", "icon": "🎧", "url": "#", "color": "from-green-500 to-green-600", "handle": "TR Productions"},
    {"name": "SoundCloud", "icon": "☁️", "url": "#", "color": "from-orange-500 to-orange-600", "handle": "trproductions"}
  ]',

  -- CTA Section
  cta_title TEXT DEFAULT 'Let''s Create Together',
  cta_subtitle TEXT DEFAULT 'Got a project in mind? Need a beat? Want to book a session?',
  cta_hint TEXT DEFAULT 'Psst... there''s a secret code hidden on this page 🎮',

  -- Easter egg
  easter_egg_code TEXT DEFAULT 'KONAMI10',
  easter_egg_discount TEXT DEFAULT '10% off your next beat!',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default row if not exists
INSERT INTO about_content (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM about_content);

-- Disable RLS for simplicity (or add proper policies)
ALTER TABLE about_content DISABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON about_content TO authenticated;
GRANT SELECT ON about_content TO anon;
