import { useCallback, useEffect, useState } from '@lynx-js/react';
import { Capacitor } from '@capacitor/core';
import {
  PLUGINS,
  CATEGORY_ORDER,
  runSmokeMatrix,
  type PluginAction,
  type PluginEntry,
} from './plugins.js';
import './App.css';

(globalThis as typeof globalThis & {
  runCapacitorSmokeMatrix?: typeof runSmokeMatrix;
}).runCapacitorSmokeMatrix = runSmokeMatrix;

interface RunResult {
  key: string;
  ok: boolean;
  text: string;
}

function stringify(value: unknown): string {
  if (value === undefined) return 'undefined';
  try {
    const s = JSON.stringify(value, null, 2);
    return s.length > 600 ? s.slice(0, 600) + '\n…' : s;
  } catch {
    return String(value);
  }
}

const STATUS_EMOJI: Record<SupportStatus, string> = {
  full: '✅',
  interactive: '🖱',
  partial: '🔑',
  unsupported: '❌',
};

const STATUS_LABEL: Record<SupportStatus, string> = {
  full: 'Full',
  interactive: 'Interactive',
  partial: 'Partial',
  unsupported: 'Unsupported',
};

function PluginCard(props: {
  entry: PluginEntry;
  result?: RunResult;
  onRun: (entry: PluginEntry, action: PluginAction) => void;
}): JSX.Element {
  const { entry, result, onRun } = props;
  return (
    <view className="card">
      <view className="card-head">
        <view className="card-title-row">
          <text className="card-name">{entry.name}</text>
          <view className={`status-badge status-${entry.supportStatus}`}>
            <text className="status-emoji">{STATUS_EMOJI[entry.supportStatus]}</text>
            <text className="status-text">{STATUS_LABEL[entry.supportStatus]}</text>
          </view>
        </view>
        <text className="card-pkg">{entry.pkg}</text>
      </view>
      <text className="card-desc">{entry.description}</text>
      <view className="actions">
        {entry.actions.map(action => (
          <view key={action.label} className="action-btn" bindtap={() => onRun(entry, action)}>
            <text className="action-label">{action.label}</text>
          </view>
        ))}
      </view>
      {result && (
        <view className={result.ok ? 'result result-ok' : 'result result-err'}>
          <text className="result-text">{result.text}</text>
        </view>
      )}
    </view>
  );
}

export function App(): JSX.Element {
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const platform = Capacitor.getPlatform();
  const isNative = Capacitor.isNativePlatform();

  const runAction = useCallback((entry: PluginEntry, action: PluginAction) => {
    const key = entry.name;
    // Native module calls run on the background thread; invoking from an event
    // handler or effect (not render) follows ReactLynx best practices.
    return action
      .run()
      .then(value => {
        setResults(prev => ({
          ...prev,
          [key]: { key, ok: true, text: `${action.label} →\n${stringify(value)}` },
        }));
      })
      .catch((err: unknown) => {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : stringify(err);
        setResults(prev => ({
          ...prev,
          [key]: { key, ok: false, text: `${action.label} ✗\n${message}` },
        }));
      });
  }, []);

  const onRun = useCallback(
    (entry: PluginEntry, action: PluginAction) => {
      void runAction(entry, action);
    },
    [runAction],
  );

  // Smoke test: on mount, invoke every plugin's designated read-only / non-modal
  // action so the gallery immediately shows live native results without any user
  // interaction. Modal actions (Dialog, Share, Camera) run on tap only.
  // Each call is independent (not chained) so one slow/async plugin can't stall
  // the rest — the native bridge guarantees every call settles.
  useEffect(() => {
    const smokeActions = PLUGINS.flatMap(entry =>
      entry.actions.filter(a => a.smoke).map(action => ({ entry, action })),
    );
    for (const { entry, action } of smokeActions) {
      void runAction(entry, action);
    }
  }, [runAction]);

  const total = PLUGINS.length;
  const smokeTotal = PLUGINS.reduce(
    (count, plugin) => count + plugin.actions.filter(action => action.smoke).length,
    0,
  );
  const interactiveTotal = total - smokeTotal;
  const okCount = Object.values(results).filter(r => r.ok).length;
  const ranCount = Object.keys(results).length;

  return (
    <view className="page">
      <scroll-view scroll-orientation="vertical" className="scroll">
        <view className="header">
          <text className="title">Capacitor on Lynx</text>
          <text className="subtitle">
            All {total} official Capacitor plugins, bridged via @lynx-capacitor/core
          </text>
          <view className="badges">
            <view className={isNative ? 'badge badge-on' : 'badge badge-off'}>
              <text className="badge-text">platform: {platform}</text>
            </view>
            <view className={isNative ? 'badge badge-on' : 'badge badge-off'}>
              <text className="badge-text">native: {isNative ? 'yes' : 'no'}</text>
            </view>
            <view className={okCount > 0 ? 'badge badge-on' : 'badge badge-off'}>
              <text className="badge-text">
                auto: {ranCount}/{smokeTotal} · ok: {okCount}
              </text>
            </view>
            <view className="badge badge-on">
              <text className="badge-text">interactive: {interactiveTotal}</text>
            </view>
          </view>

          <view className="legend">
            <view className="legend-item">
              <text className="legend-emoji">✅</text>
              <text className="legend-text">Full — Auto-test passes</text>
            </view>
            <view className="legend-item">
              <text className="legend-emoji">🖱</text>
              <text className="legend-text">Interactive — Tap to test</text>
            </view>
            <view className="legend-item">
              <text className="legend-emoji">🔑</text>
              <text className="legend-text">Partial — Needs config</text>
            </view>
          </view>
        </view>

        {CATEGORY_ORDER.map(category => {
          const entries = PLUGINS.filter(p => p.category === category);
          if (entries.length === 0) return null;
          return (
            <view key={category} className="section">
              <text className="section-title">{category}</text>
              {entries.map(entry => (
                <PluginCard
                  key={entry.name}
                  entry={entry}
                  result={results[entry.name]}
                  onRun={onRun}
                />
              ))}
            </view>
          );
        })}

        <view className="footer">
          <text className="footer-text">
            Tap any method to invoke the real @capacitor plugin through the Lynx
            NativeModule bridge. Errors shown in red are honest structured
            failures (e.g. hardware unavailable on the Simulator).
          </text>
        </view>
      </scroll-view>
    </view>
  );
}
