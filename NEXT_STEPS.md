# Next Steps - Database Setup

## Current Status

✅ Code is ready
✅ Test scripts created
✅ Migration files prepared
⏳ **Waiting for:** Supabase database connection strings

---

## What You Need to Do

### Option 1: Quick Test (Recommended)

1. **Update `.env` with your Supabase credentials**
   - See detailed guide in: `GET_CONNECTION_STRINGS.md`
   - You need to replace `[PASSWORD]` placeholders in DATABASE_URL and DIRECT_URL

2. **Test the connection:**
   ```bash
   npm run db:check
   ```
   This will tell you if:
   - Connection strings are correct
   - Database is reachable
   - What needs to be done next

### Option 2: Just Give Me the Info

Alternatively, just paste your connection strings here and I'll update `.env` for you.

From Supabase dashboard (https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/settings/database):

1. **Select "Transaction" from dropdown** → Copy the URL → This is `DATABASE_URL`
2. **Select "Direct connection" from dropdown** → Copy the URL → This is `DIRECT_URL`

Then paste them like:
```env
DATABASE_URL="postgresql://postgres.jgicj..."
DIRECT_URL="postgresql://postgres.jgicj..."
```

---

## After Connection Works

Once `npm run db:check` passes, I'll:

1. ✅ Run database migrations (create all tables)
2. ✅ Enable PostGIS extension
3. ✅ Seed database with 80+ interests
4. ✅ Verify everything works
5. ✅ Continue building remaining features

---

## Quick Commands Reference

| Command | What it does |
|---------|-------------|
| `npm run db:check` | Test database connection |
| `npm run db:migrate` | Create/update database tables |
| `npm run db:seed` | Populate interests data |
| `npm run db:studio` | Open visual database editor |
| `npm run dev` | Start development server |

---

## Troubleshooting

### "I don't see Transaction/Direct connection dropdown"

Look for these tabs/options in Supabase:
- **"Connection string"** section
- **"Mode"** dropdown or **"Pooling mode"** selector
- Or just copy any two connection strings you see (one with port 6543, one with port 5432)

### "I forgot my database password"

1. Go to: https://supabase.com/dashboard/project/jgicjowvkthdqprncjlo/settings/database
2. Scroll to "Database password" section
3. Click "Reset database password"
4. Copy the new password immediately
5. Use it in both DATABASE_URL and DIRECT_URL

### "My project is paused"

- Free tier Supabase projects pause after 7 days of inactivity
- Just visit your project dashboard to wake it up
- Or click "Restore project" if you see that option

---

**Ready when you are!** Just let me know once you've updated `.env` or share the connection strings with me.
