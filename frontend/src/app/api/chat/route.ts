import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Call the backend Bagsy personality API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Backend API error');
    }

    const data = await response.json();

    return NextResponse.json({ response: data.message || data.response });
  } catch (error) {
    console.error('Chat API error:', error);

    // Fallback response if backend is unavailable
    const fallbackResponses = [
      "Yo, I'm a bit busy analyzing the markets right now. Hit me up again in a sec!",
      "My brain's processing some alpha right now, give me a moment!",
      "Just spotted something interesting on-chain, one sec...",
      "Hold up, I'm crunching some numbers. What's up?",
    ];

    const fallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return NextResponse.json({ response: fallback });
  }
}
