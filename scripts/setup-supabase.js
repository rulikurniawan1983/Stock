const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('Setting up database schema...')
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../supabase/schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    const { error } = await supabase.rpc('exec_sql', { sql: schema })
    
    if (error) {
      console.error('Error setting up database:', error)
      return
    }
    
    console.log('Database schema setup completed!')
    
    // Create sample users
    console.log('Creating sample users...')
    
    const sampleUsers = [
      {
        email: 'admin@dinas.com',
        password: 'admin123',
        role: 'dinas'
      },
      {
        email: 'upt1@puskeswan.com',
        password: 'upt123',
        role: 'upt',
        upt_id: '11111111-1111-1111-1111-111111111111'
      },
      {
        email: 'upt2@puskeswan.com',
        password: 'upt123',
        role: 'upt',
        upt_id: '22222222-2222-2222-2222-222222222222'
      }
    ]
    
    for (const user of sampleUsers) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      })
      
      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError)
        continue
      }
      
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: user.email,
          role: user.role,
          upt_id: user.upt_id
        }])
      
      if (profileError) {
        console.error(`Error creating profile for ${user.email}:`, profileError)
      } else {
        console.log(`User ${user.email} created successfully`)
      }
    }
    
    console.log('Setup completed!')
    console.log('\nSample accounts:')
    console.log('Dinas Admin: admin@dinas.com / admin123')
    console.log('UPT 1: upt1@puskeswan.com / upt123')
    console.log('UPT 2: upt2@puskeswan.com / upt123')
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupDatabase()
