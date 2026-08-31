/**
 * TinyFish Setup Script
 * Automatically configures TinyFish provider in Supabase
 * 
 * Usage: node setup_tinyfish.js
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🚀 TinyFish Setup Script\n');
  console.log('This script will:');
  console.log('1. Update ai_config table constraint to include tinyfish');
  console.log('2. Insert TinyFish provider row');
  console.log('3. Add your API key and enable the provider\n');

  // Check if .env exists
  const fs = await import('fs');
  const path = await import('path');
  
  const envPath = path.join(process.cwd(), 'artifacts', 'lawmind', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found at:', envPath);
    console.log('\nPlease ensure you are running this from the project root directory.');
    rl.close();
    return;
  }

  // Load environment variables
  const dotenv = await import('dotenv');
  dotenv.config({ path: envPath });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    console.error('❌ Error: VITE_SUPABASE_URL not found in .env file');
    rl.close();
    return;
  }

  if (!supabaseServiceKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY not found in .env file');
    rl.close();
    return;
  }

  console.log('✅ Environment variables loaded');
  console.log('📍 Supabase URL:', supabaseUrl);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Step 1: Run SQL to update constraint
    console.log('\n📝 Step 1: Updating ai_config table constraint...');
    
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.ai_config 
        DROP CONSTRAINT IF EXISTS ai_config_provider_check;
        
        ALTER TABLE public.ai_config 
        ADD CONSTRAINT ai_config_provider_check 
        CHECK (provider IN ('groq', 'openai', 'gemini', 'custom', 'tinyfish'));
      `
    });

    // If RPC doesn't exist, we'll insert directly (constraint will be checked on insert)
    if (constraintError) {
      console.log('⚠️  Note: Could not update constraint via RPC. Will attempt direct insert.');
      console.log('   You may need to run the migration manually in Supabase SQL Editor.');
    } else {
      console.log('✅ Constraint updated successfully');
    }

    // Step 2: Insert TinyFish row
    console.log('\n📝 Step 2: Inserting TinyFish provider row...');
    
    const { error: insertError } = await supabase
      .from('ai_config')
      .upsert({
        provider: 'tinyfish',
        api_key: '',
        model: 'agent-1',
        base_url: 'https://agent.tinyfish.ai/v1',
        is_active: false
      }, {
        onConflict: 'provider'
      });

    if (insertError) {
      console.error('❌ Error inserting TinyFish row:', insertError.message);
      console.log('\n💡 You need to run the SQL migration manually:');
      console.log('   1. Go to: https://supabase.com/dashboard/project/xfbbxtrzyeocbpwnjhcz/sql/new');
      console.log('   2. Paste and run: migrations/add_tinyfish_provider.sql');
      rl.close();
      return;
    }

    console.log('✅ TinyFish row inserted/updated');

    // Step 3: Add API key
    console.log('\n📝 Step 3: Configuring API key...');
    
    const apiKey = 'YOUR_TINYFISH_API_KEY';
    
    const proceed = await question('\n❓ Add API key and enable TinyFish? (y/n): ');
    
    if (proceed.toLowerCase() === 'y' || proceed.toLowerCase() === 'yes') {
      const { error: updateError } = await supabase
        .from('ai_config')
        .update({
          api_key: apiKey,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('provider', 'tinyfish');

      if (updateError) {
        console.error('❌ Error updating API key:', updateError.message);
      } else {
        console.log('✅ API key configured and provider enabled!');
      }
    } else {
      console.log('⏭️  Skipped API key configuration');
      console.log('   You can add it manually in AI Settings page');
    }

    // Verify
    console.log('\n📝 Step 4: Verifying setup...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('ai_config')
      .select('provider, model, base_url, is_active')
      .eq('provider', 'tinyfish')
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Setup verified successfully!');
      console.log('\n📊 TinyFish Configuration:');
      console.log('   Provider:', verifyData.provider);
      console.log('   Model:', verifyData.model);
      console.log('   Base URL:', verifyData.base_url);
      console.log('   Active:', verifyData.is_active ? '✅ YES' : '❌ NO');
    }

    console.log('\n🎉 TinyFish setup complete!');
    console.log('\n📍 Next Steps:');
    console.log('   1. Go to AI Agent page in LawMind');
    console.log('   2. Click "🌐 Web Research" button (teal colored)');
    console.log('   3. Select a preset and enter a query');
    console.log('   4. Test with: "Section 138 NI Act"\n');

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.log('\n💡 Manual Setup Required:');
    console.log('   1. Open Supabase SQL Editor:');
    console.log('      https://supabase.com/dashboard/project/xfbbxtrzyeocbpwnjhcz/sql/new');
    console.log('   2. Run: migrations/add_tinyfish_provider.sql');
    console.log('   3. Add API key in AI Settings page');
  } finally {
    rl.close();
  }
}

main().catch(console.error);
