import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Fallback for dev

// ─── Shared Styles ──────────────────────────────────────────────────
const baseStyles = `
  * { box-sizing: border-box; }
  body { 
    font-family: 'Montserrat', system-ui, sans-serif; 
    background-color: #FAF7F2; 
    color: #3E2723; 
    display: flex; 
    justify-content: center; 
    align-items: center; 
    min-height: 100vh;
    margin: 0; 
    padding: 20px;
    text-align: center; 
    background-image: radial-gradient(circle at 1px 1px, rgba(62,39,35,0.04) 1px, transparent 0);
    background-size: 32px 32px;
  }
  .container { 
    max-width: 480px;
    width: 100%; 
    padding: 48px 40px; 
    background: #fff; 
    border-radius: 24px; 
    border: 1.5px solid #EDE6DA;
    box-shadow: 0 20px 60px rgba(62,39,35,0.1);
  }
  .icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
  }
  .icon svg { width: 32px; height: 32px; }
  .brand {
    font-size: 11px;
    font-weight: 700;
    color: #B87333;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  h1 { 
    color: #3E2723; 
    font-size: 24px; 
    margin: 0 0 12px;
    font-weight: 800;
    line-height: 1.3;
  }
  p { 
    color: #8C7365; 
    line-height: 1.6; 
    margin: 0 0 8px;
    font-weight: 500;
    font-size: 14px;
  }
  .btn-primary { 
    background: linear-gradient(135deg, #8B1C1C, #A52A2A);
    color: #FDF6EE; 
    text-decoration: none; 
    margin-top: 24px; 
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 32px;
    border-radius: 14px;
    font-weight: 700;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(139,28,28,0.25);
    font-family: 'Montserrat', system-ui, sans-serif;
  }
  .btn-primary:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 8px 24px rgba(139,28,28,0.35);
  }
  .btn-secondary {
    background: transparent;
    color: #8C7365;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 13px;
    border: 1.5px solid #EDE6DA;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 12px;
    font-family: 'Montserrat', system-ui, sans-serif;
  }
  .btn-secondary:hover { 
    background: #FAF7F2;
    border-color: #D4C9BB;
    color: #3E2723;
  }
  .btn-home {
    background: linear-gradient(135deg, #3E2723, #5C2317);
    color: #FDF6EE; 
    text-decoration: none; 
    margin-top: 24px; 
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 14px 28px;
    border-radius: 14px;
    font-weight: 700;
    font-size: 14px;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(62,39,35,0.2);
  }
  .btn-home:hover { transform: translateY(-2px); }
  .spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .hidden { display: none; }
  .fade-in {
    animation: fadeIn 0.4s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// ─── GET: Show confirmation page (no DB changes) ────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new NextResponse('Invalid request: Email missing', { status: 400 });
    }

    // Return confirmation landing page — NO database update here
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Confirm Unsubscribe - Buenos Mexican</title>
          <style>${baseStyles}</style>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&display=swap" rel="stylesheet">
        </head>
        <body>
          <div class="container">
            <!-- Confirmation View (default) -->
            <div id="confirm-view">
              <div class="brand">Buenos Mexican Cuisine</div>
              <div class="icon" style="background: rgba(184,115,51,0.1); color: #B87333;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1>Unsubscribe from Newsletter?</h1>
              <p>
                You're about to unsubscribe <strong style="color: #3E2723;">${email}</strong> 
                from all Buenos Mexican Cuisine marketing emails.
              </p>
              <p style="color: #B09080; font-size: 13px; margin-top: 4px;">
                You will no longer receive deals, secret menu items, or priority booking notifications.
              </p>

              <div style="display: flex; flex-direction: column; align-items: center; margin-top: 28px; gap: 0;">
                <button class="btn-primary" id="confirm-btn" onclick="handleUnsubscribe()">
                  Confirm Unsubscribe
                </button>
                <a href="/" class="btn-secondary">
                  ← Keep My Subscription
                </a>
              </div>
            </div>

            <!-- Loading View -->
            <div id="loading-view" class="hidden">
              <div class="icon" style="background: rgba(184,115,51,0.1); color: #B87333;">
                <div class="spinner" style="border-color: rgba(184,115,51,0.2); border-top-color: #B87333; width: 28px; height: 28px;"></div>
              </div>
              <p style="font-weight: 600; color: #3E2723;">Processing your request...</p>
            </div>

            <!-- Success View -->
            <div id="success-view" class="hidden">
              <div class="brand">Buenos Mexican Cuisine</div>
              <div class="icon fade-in" style="background: rgba(45,90,39,0.1); color: #2D5A27;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 class="fade-in">You've been unsubscribed</h1>
              <p class="fade-in">You will no longer receive newsletters or promotional emails from Buenos Mexican Cuisine.</p>
              <p class="fade-in" style="color: #B09080; font-size: 13px;">We're sorry to see you go! You're always welcome back.</p>
              <a href="/" class="btn-home fade-in">Return to Homepage</a>
            </div>

            <!-- Error View -->
            <div id="error-view" class="hidden">
              <div class="brand">Buenos Mexican Cuisine</div>
              <div class="icon fade-in" style="background: rgba(202,91,67,0.1); color: #CA5B43;">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 class="fade-in">Something went wrong</h1>
              <p class="fade-in" id="error-msg">An error occurred while processing your request. Please try again later.</p>
              <button class="btn-primary fade-in" onclick="handleUnsubscribe()" style="background: linear-gradient(135deg, #3E2723, #5C2317);">
                Try Again
              </button>
            </div>
          </div>

          <script>
            var email = ${JSON.stringify(email)};

            function showView(viewId) {
              ['confirm-view', 'loading-view', 'success-view', 'error-view'].forEach(function(id) {
                document.getElementById(id).classList.add('hidden');
              });
              document.getElementById(viewId).classList.remove('hidden');
            }

            function handleUnsubscribe() {
              showView('loading-view');

              fetch('/api/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
              })
              .then(function(res) {
                if (!res.ok) throw new Error('Server returned status ' + res.status);
                return res.json();
              })
              .then(function(data) {
                if (data.success) {
                  showView('success-view');
                } else {
                  throw new Error(data.error || 'Unknown error');
                }
              })
              .catch(function(err) {
                document.getElementById('error-msg').textContent = err.message || 'Please try again later.';
                showView('error-view');
              });
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (err) {
    console.error('Unsubscribe page error:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

// ─── POST: Perform actual unsubscribe (database update) ─────────────
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const email = body?.email;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Use service role key to bypass RLS for this public endpoint
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('subscribers')
      .update({ is_active: false })
      .eq('email', email);

    if (error) {
      console.error('Unsubscribe error:', error);
      return NextResponse.json({ error: 'Failed to process unsubscribe request' }, { status: 500 });
    }

    console.log(`[Unsubscribe] Confirmed: ${email}`);
    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Unsubscribe POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
