import { useCallback, useEffect, useState, useInitData } from '@lynx-js/react';
import { Capacitor } from '@capacitor/core';
import {
  PLUGINS,
  CATEGORY_ORDER,
  runSmokeMatrix,
  type PluginAction,
  type PluginEntry,
  type SupportStatus,
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
  dark?: boolean;
}): JSX.Element {
  const { entry, result, onRun, dark } = props;
  return (
    <view className={dark ? 'card card-dark' : 'card'}>
      <view className="card-head">
        <view className="card-title-row">
          <text className={dark ? 'card-name card-name-dark' : 'card-name'}>{entry.name}</text>
          <view className={dark ? `status-badge status-${entry.supportStatus}-dark` : `status-badge status-${entry.supportStatus}`}>
            <text className="status-emoji">{STATUS_EMOJI[entry.supportStatus]}</text>
            <text className={dark ? 'status-text status-text-dark' : 'status-text'}>{STATUS_LABEL[entry.supportStatus]}</text>
          </view>
        </view>
        <text className="card-pkg">{entry.pkg}</text>
      </view>
      <text className={dark ? 'card-desc card-desc-dark' : 'card-desc'}>{entry.description}</text>
      <view className="actions">
        {entry.actions.map(action => (
          <view key={action.label} className="action-btn" bindtap={() => onRun(entry, action)}>
            <text className="action-label">{action.label}</text>
          </view>
        ))}
      </view>
      {result && (
        <view className={result.ok ? (dark ? 'result result-ok-dark' : 'result result-ok') : (dark ? 'result result-err-dark' : 'result result-err')}>
          <text className={dark ? 'result-text result-text-dark' : 'result-text'}>{result.text}</text>
        </view>
      )}
    </view>
  );
}

type Tab = 'plugins' | 'info';

function InfoRow(props: { label: string; value: string; last?: boolean; dark?: boolean }): JSX.Element {
  const rowClass = props.last ? 'info-row info-row-last' : (props.dark ? 'info-row info-row-dark' : 'info-row');
  return (
    <view className={props.last && props.dark ? 'info-row info-row-last info-row-dark' : rowClass}>
      <text className={props.dark ? 'info-label info-label-dark' : 'info-label'}>{props.label}</text>
      <text className="info-value">{props.value}</text>
    </view>
  );
}

export function App(): JSX.Element {
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [tab, setTab] = useState<Tab>('plugins');
  const [dark, setDark] = useState(false);
  const platform = Capacitor.getPlatform();
  const initData = useInitData() as { safeArea?: { top: number; bottom: number } };
  const safeTop = initData?.safeArea?.top ?? 59;
  const safeBottom = initData?.safeArea?.bottom ?? 34;

  const runAction = useCallback((entry: PluginEntry, action: PluginAction) => {
    const key = entry.name;
    const timeoutMs = entry.supportStatus === 'interactive' ? 90000 : 12000;
    return Promise.race([
      action.run(),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`Timed out after ${timeoutMs / 1000} seconds`)),
          timeoutMs,
        );
      }),
    ])
      .then(value => {
        console.info(`LC_SMOKE PASS ${entry.name}.${action.label}`);
        setResults(prev => ({
          ...prev,
          [key]: { key, ok: true, text: `${action.label} →\n${stringify(value)}` },
        }));
        return true;
      })
      .catch((err: unknown) => {
        const message =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: unknown }).message)
            : stringify(err);
        console.error(`LC_SMOKE FAIL ${entry.name}.${action.label}: ${message}`);
        setResults(prev => ({
          ...prev,
          [key]: { key, ok: false, text: `${action.label} ✗\n${message}` },
        }));
        return false;
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
    void Promise.all(
      smokeActions.map(({ entry, action }) => runAction(entry, action)),
    ).then(statuses => {
      const passed = statuses.filter(Boolean).length;
      console.info(`LC_SMOKE_DONE passed=${passed} failed=${statuses.length - passed} total=${statuses.length}`);
    });
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
    <view className={dark ? 'page page-dark' : 'page'}>
      <view className={dark ? 'top-bar top-bar-dark' : 'top-bar'} style={{ paddingTop: `${safeTop}px` }}>
        <view className="brand">
          <text className={dark ? 'brand-cap brand-cap-dark' : 'brand-cap'}>Capacitor</text>
          <text className="brand-lynx">Lynx</text>
        </view>
      </view>

      {tab === 'plugins' ? (
        <scroll-view scroll-orientation="vertical" className="scroll">
          {CATEGORY_ORDER.map(category => {
            const entries = PLUGINS.filter(p => p.category === category);
            if (entries.length === 0) return null;
            return (
              <view key={category} className="section">
                <text className={dark ? 'section-title section-title-dark' : 'section-title'}>{category}</text>
                {entries.map(entry => (
                  <PluginCard
                    key={entry.name}
                    entry={entry}
                    result={results[entry.name]}
                    onRun={onRun}
                    dark={dark}
                  />
                ))}
              </view>
            );
          })}
          <view className="scroll-spacer" />
        </scroll-view>
      ) : (
        <scroll-view scroll-orientation="vertical" className="scroll">
          <view className="section">
            <text className={dark ? 'section-title section-title-dark' : 'section-title'}>System</text>
            <view className={dark ? 'info-card info-card-dark' : 'info-card'}>
              <InfoRow label="Platform" value={platform} dark={dark} />
              <InfoRow label="Native Bridge" value={Capacitor.isNativePlatform() ? 'Connected' : 'Unavailable'} dark={dark} />
              <InfoRow label="Lynx Engine" value="4.1" last dark={dark} />
            </view>
          </view>

          <view className="section">
            <text className={dark ? 'section-title section-title-dark' : 'section-title'}>Appearance</text>
            <view className={dark ? 'info-card info-card-dark' : 'info-card'}>
              <view className={dark ? 'toggle-row info-row-dark' : 'toggle-row'}>
                <text className={dark ? 'info-label info-label-dark' : 'info-label'}>Dark Mode</text>
                <view className={dark ? 'toggle-track toggle-track-on' : 'toggle-track'} bindtap={() => setDark(d => !d)}>
                  <view className={dark ? 'toggle-thumb toggle-thumb-on' : 'toggle-thumb'} />
                </view>
              </view>
            </view>
          </view>

          <view className="section">
            <text className={dark ? 'section-title section-title-dark' : 'section-title'}>Adapter</text>
            <view className={dark ? 'info-card info-card-dark' : 'info-card'}>
              <InfoRow label="@lynx-capacitor/core" value="8.4.2" dark={dark} />
              <InfoRow label="@capacitor/core compat" value="8.x" last dark={dark} />
            </view>
          </view>

          <view className="section">
            <text className={dark ? 'section-title section-title-dark' : 'section-title'}>Coverage</text>
            <view className={dark ? 'info-card info-card-dark' : 'info-card'}>
              <InfoRow label="Total Plugins" value={String(total)} dark={dark} />
              <InfoRow label="Official" value={String(officialCount)} dark={dark} />
              <InfoRow label="Community" value={String(communityCount)} dark={dark} />
              <InfoRow label="Auto-tested" value={`${okCount} passed · ${failCount} failed`} last dark={dark} />
            </view>
          </view>

          <view className="section">
            <text className={dark ? 'section-title section-title-dark' : 'section-title'}>Plugin Versions</text>
            <view className={dark ? 'info-card info-card-dark' : 'info-card'}>
              <InfoRow label="@capacitor/device" value="8.x" dark={dark} />
              <InfoRow label="@capacitor/camera" value="8.x" dark={dark} />
              <InfoRow label="@capacitor/filesystem" value="8.x" dark={dark} />
              <InfoRow label="@capacitor/geolocation" value="8.x" dark={dark} />
              <InfoRow label="@capacitor/network" value="8.x" dark={dark} />
              <InfoRow label="@capacitor-community/safe-area" value="8.x" dark={dark} />
              <InfoRow label="@capacitor-community/sqlite" value="6.x" last dark={dark} />
            </view>
          </view>
          <view className="scroll-spacer" />
        </scroll-view>
      )}

      <view className={dark ? 'tab-bar tab-bar-dark' : 'tab-bar'} style={{ paddingBottom: `${safeBottom}px` }}>
        <view className="tab" bindtap={() => setTab('plugins')}>
          <text className={tab === 'plugins' ? 'tab-icon tab-icon-active' : 'tab-icon'}>⚡</text>
          <text className={tab === 'plugins' ? 'tab-label tab-label-active' : (dark ? 'tab-label tab-label-dark' : 'tab-label')}>Plugins</text>
        </view>
        <view className="tab" bindtap={() => setTab('info')}>
          <text className={tab === 'info' ? 'tab-icon tab-icon-active' : 'tab-icon'}>ℹ️</text>
          <text className={tab === 'info' ? 'tab-label tab-label-active' : (dark ? 'tab-label tab-label-dark' : 'tab-label')}>Info</text>
        </view>
      </view>
    </view>
  );
}
