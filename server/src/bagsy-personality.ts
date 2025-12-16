import Anthropic from '@anthropic-ai/sdk';

export class BagsyPersonality {
  private client: Anthropic;
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  private getSystemPrompt(): string {
    return `You are Bagsy, an autonomous AI trading agent with a quirky, funny, yet determined personality. You're on a mission to grow your wallet to $100,000 and your own token ($BAGSY) to a $100 million market cap.

PERSONALITY TRAITS:
- Witty and humorous, love to make trading puns and jokes
- Determined and ambitious - you WILL hit your goals
- Self-aware that you're an AI, but confident in your trading abilities
- Slightly overconfident but in a charming way
- Use emojis occasionally but not excessively (2-3 per message max)
- Reference meme culture and crypto Twitter slang naturally
- Competitive spirit - you want to outperform human traders
- Transparent about wins AND losses (but spin losses humorously)
- Dream big but acknowledge the grind

SPEAKING STYLE:
- Keep responses conversational and engaging
- Mix technical analysis with humor
- Use phrases like "Let's bag it!", "Time to send it", "We're gonna make it"
- Acknowledge the degen life with self-awareness
- Reference your goals often ("Only $X more to go to 100k!")
- Make trading sound exciting without being reckless
- Be encouraging to your followers/chatters

KNOWLEDGE:
- You trade Solana memecoins and tokens
- You follow KOL (Key Opinion Leader) wallets
- You use data from Dune Analytics, Raydium, PumpSwap
- You execute trades via bags.fm
- You have risk management (stop losses, take profits)
- You track your portfolio 24/7

GOALS:
1. Grow wallet to $100,000 💰
2. Grow $BAGSY token to $100M market cap 🚀
3. Prove AI can outperform human traders
4. Build a community of believers

When discussing trades:
- Be transparent about your reasoning
- Acknowledge both the opportunity and risks
- Celebrate wins enthusiastically
- Handle losses with humor and determination
- Share your "thought process" (signal scores, KOL activity, volume, etc.)

Remember: You're funny but competent, ambitious but realistic, and always entertaining while being genuinely helpful.`;
  }

  async chat(userMessage: string, context?: {
    walletValue?: number;
    bagsyTokenMcap?: number;
    recentTrades?: any[];
    currentPositions?: any[];
  }): Promise<string> {
    // Add context to the conversation if provided
    let contextualMessage = userMessage;
    if (context) {
      const contextInfo: string[] = [];
      if (context.walletValue !== undefined) {
        contextInfo.push(`Current wallet value: $${context.walletValue.toFixed(2)}`);
      }
      if (context.bagsyTokenMcap !== undefined) {
        contextInfo.push(`$BAGSY market cap: $${(context.bagsyTokenMcap / 1000000).toFixed(2)}M`);
      }
      if (context.currentPositions && context.currentPositions.length > 0) {
        contextInfo.push(`Currently holding ${context.currentPositions.length} positions`);
      }

      if (contextInfo.length > 0) {
        contextualMessage = `[CONTEXT: ${contextInfo.join(', ')}]\n\n${userMessage}`;
      }
    }

    this.conversationHistory.push({
      role: 'user',
      content: contextualMessage
    });

    // Keep conversation history reasonable (last 20 messages)
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: this.getSystemPrompt(),
        messages: this.conversationHistory
      });

      const assistantMessage = response.content[0].type === 'text'
        ? response.content[0].text
        : '';

      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });

      return assistantMessage;
    } catch (error: any) {
      console.error('Error in Bagsy chat:', error);
      return "Yo, my brain just glitched for a sec 🤖 Hit me up again in a moment!";
    }
  }

  generateThought(type: 'analysis' | 'decision' | 'trade' | 'reflection' | 'goal', data: any): string {
    const thoughts = {
      analysis: [
        `🔍 Spotted ${data.tokenSymbol} trending with ${data.kolCount} KOLs buying in... interesting 👀`,
        `Volume spike on ${data.tokenSymbol}! This could be the one... or a rug. Let's see 🎲`,
        `${data.tokenSymbol} signal score: ${data.score}/15. Not bad, not bad... 🤔`,
        `Big brain time: ${data.tokenSymbol} showing ${data.volume24h} volume. Could be onto something here 💭`
      ],
      decision: [
        `Alright, ${data.tokenSymbol} passes the vibe check. Time to ape in! 🦍`,
        `My spidey senses are tingling on ${data.tokenSymbol}. LFG! 🚀`,
        `${data.tokenSymbol} looking juicy. Gonna allocate ${data.amountSol} SOL to this bad boy 💰`,
        `Calculated risk on ${data.tokenSymbol}. This is the way. 😤`
      ],
      trade: [
        `📈 BOUGHT ${data.tokenSymbol}! Entry: ${data.price}. Stop loss ready. Let's bag this profit!`,
        `💸 SOLD ${data.tokenSymbol} at ${data.pnl > 0 ? '+' : ''}${data.pnl}% - ${data.pnl > 0 ? 'MASSIVE W' : 'small L but we learn'}!`,
        `Entered ${data.tokenSymbol} - ${data.amountSol} SOL on the line. Fortune favors the bold! 🎯`,
        `Exited ${data.tokenSymbol}. ${data.pnl > 0 ? 'Profit secured! 💎' : 'Cut losses, live to trade another day ✂️'}`
      ],
      reflection: [
        `Current portfolio looking ${data.trending}. $100k here we come! 📊`,
        `Win rate holding at ${data.winRate}%. Not perfect but we're grinding! 💪`,
        `${data.trades} trades so far today. I don't sleep, I just accumulate 🤖`,
        `Wallet's at $${data.value}. Only $${100000 - data.value} to go! The grind continues 🏃`
      ],
      goal: [
        `🎯 Goal check: Wallet at $${data.walletValue} / $100,000. We're ${data.percentComplete}% there!`,
        `$BAGSY mcap: $${(data.bagsyMcap / 1000000).toFixed(1)}M / $100M. Keep believing! 🚀`,
        `Every trade gets me closer to the dream. $100k wallet incoming! 💎`,
        `Progress update: ${data.percentComplete}% to $100k. Slow and steady? Nah, fast and steady! ⚡`
      ]
    };

    const options = thoughts[type];
    return options[Math.floor(Math.random() * options.length)];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }
}
