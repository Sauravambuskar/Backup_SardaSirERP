#!/usr/bin/env node
/**
 * TinyFish Automated Setup
 * Configures TinyFish provider in Supabase automatically
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xfbbxtrzyeocbpwnjhcz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmJ4dHJ6eWVvY2Jwd25qaGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMzIxMTIsImV4cCI6MjA5NzcwODExMn0.JeV1osYSCHcRnDsT2MHOWBPvAijhQQOb18YmymK4fMk';
const TINYFISH_API_KEY = 'YOUR_TINYFISH_API_KEY';

console.log('\n≡ƒÜÇ TinyFish Automated Setup\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setup() {
  try {
    // Step 1: Check if tinyfish row already exists
    console.log('≡ƒô¥ Step 1: Checking existing configuration...');
    
    const { data: existing, error: checkError } = await supabase
      .from('ai_config')
      .select('provider, is_active')
      .eq('provider', 'tinyfish')
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Γ¥î Error checking configuration:', checkError.message);
      console.log('\nΓÜá∩╕Å  The database constraint may not be updated yet.');
      console.log('\n≡ƒôï Manual Steps Required:');
      console.log('   1. Go to Supabase SQL Editor:');
      console.log('      https://supabase.com/dashboard/project/xfbbxtrzyeocbpwnjhcz/sql/new');
      console.log('\n   2. Paste and run this SQL:');
      console.log('\n' + sqlMigration + '\n');
      return;
    }

    if (existing) {
      console.log('Γ£à TinyFish row already exists');
      
      if (existing.is_active) {
        console.log('Γ£à TinyFish is already enabled');
        console.log('\n≡ƒÄë Setup already complete! Nothing to do.');
        return;
      }

      console.log('ΓÜá∩╕Å  TinyFish exists but is disabled. Updating...');
    } else {
      console.log('Γ¥î TinyFish row does not exist');
      console.log('\n≡ƒô¥ Step 2: Inserting TinyFish provider...');
      
      const { error: insertError } = await supabase
        .from('ai_config')
        .insert({
          provider: 'tinyfish',
          api_key: TINYFISH_API_KEY,
          model: 'agent-1',
          base_url: 'https://agent.tinyfish.ai/v1',
          is_active: true
        });

      if (insertError) {
        if (insertError.message.includes('violates check constraint')) {
          console.error('Γ¥î Database constraint needs updating');
          console.log('\n≡ƒôï Run this SQL in Supabase SQL Editor:');
          console.log('   https://supabase.com/dashboard/project/xfbbxtrzyeocbpwnjhcz/sql/new\n');
          console.log(sqlMigration);
          return;
        }
        
        console.error('Γ¥î Error inserting TinyFish:', insertError.message);
        return;
      }

      console.log('Γ£à TinyFish provider inserted successfully');
    }

    // Step 3: Update API key and enable
    if (existing && !existing.is_active) {
      console.log('\n≡ƒô¥ Step 3: Enabling TinyFish and adding API key...');
      
      const { error: updateError } = await supabase
        .from('ai_config')
        .update({
          api_key: TINYFISH_API_KEY,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('provider', 'tinyfish');

      if (updateError) {
        console.error('Γ¥î Error updating:', updateError.message);
        return;
      }

      console.log('Γ£à TinyFish enabled and API key added');
    }

    // Verification
    console.log('\n≡ƒô¥ Step 4: Verifying setup...');
    
    const { data: verify, error: verifyError } = await supabase
      .from('ai_config')
      .select('provider, model, base_url, is_active')
      .eq('provider', 'tinyfish')
      .single();

    if (verifyError) {
      console.error('Γ¥î Verification failed:', verifyError.message);
      return;
    }

    console.log('\nΓ£à Setup Complete!\n');
    console.log('≡ƒôè TinyFish Configuration:');
    console.log('   Provider:', verify.provider);
    console.log('   Model:', verify.model);
    console.log('   Base URL:', verify.base_url);
    console.log('   Status:', verify.is_active ? 'Γ£à ACTIVE' : 'Γ¥î INACTIVE');
    
    console.log('\n≡ƒÄë TinyFish is now ready to use!');
    console.log('\n≡ƒôì Next Steps:');
    console.log('   1. Go to AI Agent page in LawMind');
    console.log('   2. Click "≡ƒîÉ Web Research" button (top-right, teal colored)');
    console.log('   3. Select "Search Indian Kanoon"');
    console.log('   4. Enter query: "Section 138 NI Act"');
    console.log('   5. Click "Research"\n');

  } catch (error) {
    console.error('\nΓ¥î Unexpected error:', error.message);
    console.log('\n≡ƒÆí Please run the SQL migration manually in Supabase SQL Editor');
  }
}

const sqlMigration = `-- TinyFish Migration
ALTER TABLE public.ai_config DROP CONSTRAINT IF EXISTS ai_config_provider_check;
ALTER TABLE public.ai_config ADD CONSTRAINT ai_config_provider_check 
CHECK (provider IN ('groq', 'openai', 'gemini', 'custom', 'tinyfish'));

INSERT INTO public.ai_config (provider, api_key, model, base_url, is_active)
VALUES ('tinyfish', '${TINYFISH_API_KEY}', 'agent-1', 'https://agent.tinyfish.ai/v1', true)
ON CONFLICT (provider) DO UPDATE 
SET api_key = EXCLUDED.api_key, is_active = EXCLUDED.is_active;`;

setup();
