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

type Tab = 'plugins' | 'info';

function InfoRow(props: { label: string; value: string }): JSX.Element {
  return (
    <view className="info-row">
      <text className="info-label">{props.label}</text>
      <text className="info-value">{props.value}</text>
    </view>
  );
}

export function App(): JSX.Element {
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [tab, setTab] = useState<Tab>('plugins');
  const platform = Capacitor.getPlatform();

  const runAction = useCallback((entry: PluginEntry, action: PluginAction) => {
    const key = entry.name;
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
  const okCount = Object.values(results).filter(r => r.ok).length;
  const failCount = Object.values(results).filter(r => !r.ok).length;

  const officialCount = PLUGINS.filter(p => p.category !== 'Community').length;
  const communityCount = PLUGINS.filter(p => p.category === 'Community').length;

  return (
    <view className="page">
      {tab === 'plugins' ? (
        <scroll-view scroll-orientation="vertical" className="scroll">
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
          <view className="scroll-bottom-spacer" />
        </scroll-view>
      ) : (
        <scroll-view scroll-orientation="vertical" className="scroll">
          <view className="section">
            <text className="section-title">System</text>
            <view className="info-card">
              <InfoRow label="Platform" value={platform} />
              <InfoRow label="Native Bridge" value={Capacitor.isNativePlatform() ? 'Connected' : 'Unavailable'} />
              <InfoRow label="Lynx SDK" value="1.4.0" />
            </view>
          </view>

          <view className="section">
            <text className="section-title">Adapter</text>
            <view className="info-card">
              <InfoRow label="@lynx-capacitor/core" value="1.0.0" />
              <InfoRow label="@capacitor/core compat" value="8.x" />
            </view>
          </view>

          <view className="section">
            <text className="section-title">Coverage</text>
            <view className="info-card">
              <InfoRow label="Total Plugins" value={String(total)} />
              <InfoRow label="Official" value={String(officialCount)} />
              <InfoRow label="Community" value={String(communityCount)} />
              <InfoRow label="Auto-tested" value={`${okCount} passed · ${failCount} failed`} />
            </view>
          </view>

          <view className="section">
            <text className="section-title">Plugin Versions</text>
            <view className="info-card">
              <InfoRow label="@capacitor/device" value="8.x" />
              <InfoRow label="@capacitor/camera" value="8.x" />
              <InfoRow label="@capacitor/filesystem" value="8.x" />
              <InfoRow label="@capacitor/geolocation" value="8.x" />
              <InfoRow label="@capacitor/network" value="8.x" />
              <InfoRow label="@capacitor-community/safe-area" value="8.x" />
              <InfoRow label="@capacitor-community/sqlite" value="6.x" />
            </view>
          </view>
          <view className="scroll-bottom-spacer" />
        </scroll-view>
      )}

      <view className="tab-bar">
        <view className={tab === 'plugins' ? 'tab tab-active' : 'tab'} bindtap={() => setTab('plugins')}>
          <text className={tab === 'plugins' ? 'tab-icon tab-icon-active' : 'tab-icon'}>⚡</text>
          <text className={tab === 'plugins' ? 'tab-label tab-label-active' : 'tab-label'}>Plugins</text>
        </view>
        <view className={tab === 'info' ? 'tab tab-active' : 'tab'} bindtap={() => setTab('info')}>
          <text className={tab === 'info' ? 'tab-icon tab-icon-active' : 'tab-icon'}>ℹ️</text>
          <text className={tab === 'info' ? 'tab-label tab-label-active' : 'tab-label'}>Info</text>
        </view>
      </view>
    </view>
  );
}
