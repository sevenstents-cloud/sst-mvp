import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    // Note: Ideally this would use the SERVICE_ROLE_KEY to bypass email verification if needed, 
    // but in this client-side env we might only have ANON. 
    // If we only have ANON, we can sign up, but email confirmation might be required depending on project settings.
    // Let's try with what we have.

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const email = 'sevenstents@gmail.com';
    const password = 'Mendonca@e!246';

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User created (or confirmation sent)', user: data.user });
}
