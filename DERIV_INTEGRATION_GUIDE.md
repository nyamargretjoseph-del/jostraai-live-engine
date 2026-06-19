# Deriv Live Data Integration Guide

## 🚀 Overview

This guide explains how to connect real Deriv market data to your JostraAI application with live signal generation, heatmap tracking, and pattern detection.

---

## 📊 Architecture

```
Deriv WebSocket API
        ↓
   DerivWS (Connection)
        ↓
  LiveSignalEngine
        ↓
   ┌──────┬──────┬──────┐
   ↓      ↓      ↓      ↓
 Signal Heatmap Pattern LiveSignalUpdate
 Engine  System Detection
        ↓
  React Components
        ↓
   User Interface
```

---

## 🔧 Setup

### 1. Environment Configuration

Ensure your `.env.production` has valid Deriv credentials:

```env
NEXT_PUBLIC_DERIV_APP_ID=your_app_id_here
NEXT_PUBLIC_DERIV_REDIRECT_URI=https://your-domain.com
NEXT_PUBLIC_DERIV_APP_NAME=JostraAI Live Engine
NEXT_PUBLIC_DERIV_OAUTH_SCOPES=trade,account_manage
NEXT_PUBLIC_DERIV_ENV=production
```

**Get Your App ID:**
1. Go to https://app.deriv.com/account/api-token
2. Create an API token
3. Go to https://developers.deriv.com/dashboard/
4. Register a new application
5. Copy the App ID

### 2. Install Dependencies

All required packages are in `package.json` and `packages/core/package.json`.

```bash
npm install
```

---

## 💻 Usage

### Basic Setup

```typescript
import { useLiveSignalEngine } from '@/hooks/use-live-signal-engine';
import { useDerivWSContext } from '@/components/custom/deriv-ws-provider';

function MyComponent() {
  const { ws, isConnected } = useDerivWSContext();
  
  const { signal, isRunning, start, stop } = useLiveSignalEngine(ws, {
    symbol: 'R_50',  // Volatility Index 50 Rises/Falls
    updateInterval: 5000,  // 5 seconds
    enableHeatmap: true,
    enablePatterns: true,
    disciplineMode: 'balanced',
  });

  return (
    <div>
      {isRunning ? (
        <button onClick={stop}>Stop</button>
      ) : (
        <button onClick={start}>Start</button>
      )}
      
      {signal && (
        <div>
          <h2>{signal.signal.decision}</h2>
          <p>Confidence: {signal.signal.overall}%</p>
        </div>
      )}
    </div>
  );
}
```

---

## 📋 Available Symbols

Common Deriv symbols for digits trading:

| Symbol | Description |
|--------|-------------|
| `R_50` | Volatility Index 50 Rises/Falls |
| `R_75` | Volatility Index 75 Rises/Falls |
| `R_100` | Volatility Index 100 Rises/Falls |
| `EURUSD` | EUR/USD |
| `GBPUSD` | GBP/USD |
| `AUDUSD` | AUD/USD |

---

## 🎯 Signal Engine Configuration

### Discipline Modes

```typescript
// Strict: Only trades with very high confidence (>75%)
disciplineMode: 'strict'

// Balanced: Standard trading rules (>65%)
disciplineMode: 'balanced'

// Aggressive: Lower threshold trading (>50%)
disciplineMode: 'aggressive'
```

### Signal Decisions

- **STRONG**: High confidence signal, recommended to trade
- **WATCH**: Medium confidence, monitor before trading
- **BLOCK**: Low confidence, avoid trading

---

## 🔥 Heatmap System

Tracks digit frequency patterns in real-time.

### Heat Levels

- **Hot (>60%)**: Digit appearing frequently
- **Warm (30-60%)**: Digit appearing moderately
- **Cold (<30%)**: Digit appearing rarely

### Usage

```typescript
const { signal } = useLiveSignalEngine(ws);

if (signal?.heatmap) {
  signal.heatmap.digits.forEach(digit => {
    console.log(`Digit ${digit.digit}: ${digit.frequency}% (${digit.level})`);
  });
  
  console.log(`Dominant digit: ${signal.heatmap.dominantDigit}`);
  console.log(`Trend: ${signal.heatmap.trendDirection}`);
}
```

---

## 🧩 Pattern Detection

Analyzes even/odd and match/differ patterns.

### Even/Odd Patterns

Tracks sequences of even (0, 2, 4, 6, 8) and odd (1, 3, 5, 7, 9) digits.

```typescript
const patterns = signal?.patterns;
if (patterns) {
  console.log(`Even/Odd: ${patterns.evenOdd.dominantPattern}`);
  console.log(`Consistency: ${patterns.evenOdd.consistency}%`);
  console.log(`Confidence: ${patterns.evenOdd.confidence}%`);
}
```

### Match/Differ Patterns

Tracks when consecutive digits match or differ.

```typescript
const patterns = signal?.patterns;
if (patterns) {
  console.log(`Direction: ${patterns.matchDiffer.direction}`);
  console.log(`Strength: ${patterns.matchDiffer.strength}%`);
  console.log(`Momentum: ${patterns.matchDiffer.momentum}`);
}
```

---

## 📱 React Components

### LiveSignalDisplay

Shows the main signal decision and confidence.

```tsx
import { LiveSignalDisplay } from '@/components/live-signal-display';

<LiveSignalDisplay signal={signal} isRunning={isRunning} />
```

### HeatmapGrid

Visualizes digit frequency with heat colors.

```tsx
import { HeatmapGrid } from '@/components/heatmap-grid';

<HeatmapGrid heatmap={signal?.heatmap} />
```

### PatternAnalysis

Displays even/odd and match/differ patterns.

```tsx
import { PatternAnalysis } from '@/components/pattern-analysis';

<PatternAnalysis patterns={signal?.patterns} />
```

### DerivConnectionStatus

Shows connection and authentication status.

```tsx
import { DerivConnectionStatus } from '@/components/deriv-connection-status';

<DerivConnectionStatus
  isConnected={isConnected}
  isAuthenticated={auth.authState === 'authenticated'}
  lastUpdate={lastUpdateTime}
  error={error}
/>
```

---

## 🌐 Live Engine Page

Full-featured page with all components:

```
http://localhost:3000/live-engine
```

Features:
- ✅ Live signal generation
- ✅ Real-time heatmap
- ✅ Pattern detection
- ✅ Status monitoring
- ✅ Start/Stop controls

---

## 🔌 WebSocket Data Flow

### 1. Connection

```typescript
const ws = new DerivWS();
await ws.connect();
```

### 2. Subscribe to Ticks

```typescript
ws.subscribe(
  { ticks: 'R_50' },
  (response) => {
    console.log('New tick:', response.tick);
  }
);
```

### 3. Process Data

```typescript
// LiveSignalEngine automatically:
// 1. Extracts digit from tick
// 2. Updates heatmap
// 3. Detects patterns
// 4. Calculates signal
// 5. Emits update
```

---

## 📊 Signal Output Example

```json
{
  "signal": {
    "overall": 78,
    "strong": 0.85,
    "watch": 0.15,
    "blocked": false,
    "decision": "STRONG",
    "reason": "Confidence above 65%"
  },
  "heatmap": {
    "digits": [
      { "digit": 5, "frequency": 24, "level": "warm", "heatIndex": 45 },
      { "digit": 7, "frequency": 68, "level": "hot", "heatIndex": 92 }
    ],
    "hotDigitCount": 3,
    "coldDigitCount": 4,
    "dominantDigit": 7,
    "trendDirection": "up"
  },
  "patterns": {
    "evenOdd": {
      "dominantPattern": "even",
      "consistency": 64,
      "confidence": 76
    },
    "matchDiffer": {
      "direction": "differ",
      "strength": 72,
      "confidence": 80
    },
    "recommendation": "strong",
    "combinedScore": 74
  },
  "timestamp": 1719023450000
}
```

---

## 🧪 Testing

### Local Development

```bash
npm run dev
open http://localhost:3000/live-engine
```

### Requirements

1. Valid Deriv account
2. App ID registered
3. Authenticated user
4. Active internet connection

---

## 🐛 Troubleshooting

### "Connection Error"
- Verify App ID in `.env.production`
- Check internet connection
- Ensure Deriv API is accessible

### "No signals generated"
- Verify you're authenticated
- Check symbol exists (use 'R_50')
- Wait 10+ seconds for data

### "Pattern detection not working"
- Ensure `enablePatterns: true`
- Need at least 10 ticks of data
- Check console for errors

---

## 📈 Performance Tips

1. **Increase Update Interval**: Use `updateInterval: 10000` for less frequent updates
2. **Reduce Sample Window**: Use `sampleWindow: 25` for faster pattern detection
3. **Disable Unused Features**: Set `enableHeatmap: false` if not needed

---

## 🔒 Security

- All Deriv credentials stored in environment variables
- No API keys exposed in frontend code
- OAuth flow handles authentication securely
- WebSocket connections encrypted with TLS

---

## 📚 Resources

- [Deriv API Documentation](https://api.deriv.com)
- [Deriv Developer Dashboard](https://developers.deriv.com)
- [Digits Trading Guide](https://deriv.com/en/trade-types/digits/)

---

## ✅ Checklist

- [ ] App ID registered at Deriv
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Local development server running
- [ ] Able to authenticate
- [ ] Live signals generating
- [ ] Heatmap updating
- [ ] Patterns detecting

---

## 🚀 Next Steps

1. **Deploy**: Push to production with proper environment variables
2. **Monitor**: Track signal accuracy over time
3. **Optimize**: Adjust discipline mode and thresholds
4. **Extend**: Add more indicators and analysis
