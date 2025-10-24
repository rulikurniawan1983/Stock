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
    console.log('Note: Please run the SQL schema manually in your Supabase dashboard.')
    console.log('The schema file is located at: supabase/schema.sql')
    console.log('Copy and paste the contents into the SQL editor in your Supabase dashboard.')
    console.log('')
    
    // Skip automatic schema setup for now
    console.log('Skipping automatic schema setup...')
    
    // Create sample users
    console.log('Creating sample users...')
    
    const sampleUsers = [
      {
        email: 'admin@yankes.com',
        password: 'admin123',
        role: 'dinas'
      },
      {
        email: 'upt1@yankes.com',
        password: 'upt123',
        role: 'upt',
        upt_id: '11111111-1111-1111-1111-111111111111'
      },
      {
        email: 'upt2@yankes.com',
        password: 'upt123',
        role: 'upt',
        upt_id: '22222222-2222-2222-2222-222222222222'
      },
      {
        email: 'upt3@yankes.com',
        password: 'upt123',
        role: 'upt',
        upt_id: '33333333-3333-3333-3333-333333333333'
      },
      {
        email: 'upt4@yankes.com',
        password: 'upt123',
        role: 'upt',
        upt_id: '44444444-4444-4444-4444-444444444444'
      },
      {
        email: 'upt5@yankes.com',
        password: 'upt123',
        role: 'upt',
        upt_id: '55555555-5555-5555-5555-555555555555'
      },
      {
        email: 'upt6@yankes.com',
        password: 'upt123',
        role: 'upt',
        upt_id: '66666666-6666-6666-6666-666666666666'
      }
    ]
    
    for (const user of sampleUsers) {
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === user.email)
      
      if (existingUser) {
        console.log(`User ${user.email} already exists, skipping creation`)
        
        // Check if profile exists in users table
        const { data: existingProfile } = await supabase
          .from('users')
          .select('id')
          .eq('id', existingUser.id)
          .single()
        
        if (!existingProfile) {
          // Create profile if it doesn't exist
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: existingUser.id,
              email: user.email,
              role: user.role,
              upt_id: user.upt_id
            }])
          
          if (profileError) {
            console.error(`Error creating profile for existing user ${user.email}:`, profileError)
          } else {
            console.log(`Profile created for existing user ${user.email}`)
          }
        }
        continue
      }
      
      // Create new user
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
    console.log('Dinas Admin: admin@yankes.com / admin123')
    console.log('UPT 1: upt1@yankes.com / upt123')
    console.log('UPT 2: upt2@yankes.com / upt123')
    console.log('UPT 3: upt3@yankes.com / upt123')
    console.log('UPT 4: upt4@yankes.com / upt123')
    console.log('UPT 5: upt5@yankes.com / upt123')
    console.log('UPT 6: upt6@yankes.com / upt123')
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupDatabase()
