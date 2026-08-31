import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing supabase URL or Key in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  const email = 'admin@lawmind.com';
  const password = 'adminpassword123';
  
  console.log('Signing up user...');
  let { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: 'Super Admin' },
    }
  });

  if (error && error.message.includes('already registered')) {
     console.log('User exists, signing in...');
     const res = await supabase.auth.signInWithPassword({ email, password });
     if (res.error) {
       console.error('Login failed:', res.error);
       return;
     }
     data = res.data;
  } else if (error) {
    console.error('Signup error:', error);
    return;
  }

  console.log('User logged in. UUID:', data.user.id);
  
  // Need to wait a tiny bit for the trigger to insert the profile if just signed up
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Updating role to super_admin...');
  const updateRes = await supabase
    .from('profiles')
    .update({ role: 'super_admin' })
    .eq('user_id', data.user.id);
    
  if (updateRes.error) {
    console.error('Update error:', updateRes.error);
  } else {
    console.log('\n--- SUCCESS ---');
    console.log('Successfully created/updated super_admin account.');
    console.log('Email: ' + email);
    console.log('Password: ' + password);
    console.log('-----------------\n');
  }
}

main();
