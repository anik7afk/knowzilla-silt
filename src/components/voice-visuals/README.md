# Knowzilla revenue interface components

Twenty-three code-native product visuals for the full live-call, deal-desk, automation, and revenue-intelligence journey. Every component is a named export from this folder:

```tsx
import {
  AccountContext,
  BuyerIntent,
  CallCoaching,
  CrmWriteback,
  DealRisk,
  FollowUpReady,
  LiveTranscript,
  NextBestAction,
  ObjectionDetected,
  PostCallSummary,
  StakeholderMap,
  MutualActionPlan,
  StageRecommendation,
  WorkflowCanvas,
  AutomationRun,
  SignalRouting,
  EnrichmentWaterfall,
  EventStream,
  ForecastPulse,
  PipelineFunnel,
  ConversationBalance,
  QuestionIntelligence,
  TeamCoaching,
} from '@/components/voice-visuals'
```

Each component accepts an optional `className`. The full review surface is available at `/voice-components`; the same gallery is also included in the marketing page.

## Motion and interaction

- `LiveTranscript` streams both sides of the call with the shared rAF typewriter engine.
- `CrmWriteback` stages field confirmations.
- `BuyerIntent` draws the signal path and resolves its current point.
- `CallCoaching` fills each score track with a short stagger.
- The gallery uses the project entrance grammar.
- `NextBestAction`, `FollowUpReady`, `DealRisk`, and `PostCallSummary` expose real click states.
- Workflow nodes, run traces, routing, enrichment, charts, funnels, maps, and leaderboards all expose visible operational state.
- `prefers-reduced-motion` resolves every component to its complete static frame.

The components use only the tokens in `design-system/tokens.css`.
