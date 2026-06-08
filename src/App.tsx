import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type Screen = 'title' | 'settings' | 'type' | 'targets' | 'motion' | 'effects' | 'roulette';
type RouletteType = 'standard1' | 'standard2' | 'casino' | 'double';
type Direction = 'clockwise' | 'counterclockwise' | 'random';
type Speed = 'slow' | 'normal' | 'fast' | 'high' | 'random';

type AppSettings = {
  rouletteType: RouletteType;
  targets: string[];
  direction: Direction;
  speed: Speed;
  spinSound: string;
  stopSound: string;
  effect: string;
};

type SpinState = 'idle' | 'spinning' | 'stopping';

const presets = {
  omikuji: ['大吉', '中吉', '小吉', '吉'],
  lunch: ['ラーメン', 'カレー', '定食', 'パスタ'],
  party: ['ビール', 'ハイボール', 'レモンサワー', '日本酒'],
};

const palette = ['#ff6b6b', '#ffd166', '#06d6a0', '#4dabf7', '#b197fc', '#ff922b', '#63e6be', '#f06595'];

const initialSettings: AppSettings = {
  rouletteType: 'standard1',
  targets: presets.lunch,
  direction: 'clockwise',
  speed: 'normal',
  spinSound: 'ドラム風',
  stopSound: '電子音',
  effect: 'テロップあり',
};

function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [settings, setSettings] = useState<AppSettings>(initialSettings);

  const canPlay = settings.targets.filter(Boolean).length >= 2;

  return (
    <main className="appShell">
      {screen === 'title' && <TitleScreen onPlay={() => setScreen('roulette')} onSettings={() => setScreen('settings')} />}
      {screen === 'settings' && <SettingsScreen onBack={() => setScreen('title')} onPlay={() => setScreen('roulette')} onGo={setScreen} />}
      {screen === 'type' && (
        <RouletteTypeScreen
          value={settings.rouletteType}
          onChange={(rouletteType) => setSettings((current) => ({ ...current, rouletteType }))}
          onBack={() => setScreen('settings')}
        />
      )}
      {screen === 'targets' && (
        <TargetsScreen
          targets={settings.targets}
          onChange={(targets) => setSettings((current) => ({ ...current, targets }))}
          onBack={() => setScreen('settings')}
        />
      )}
      {screen === 'motion' && (
        <MotionScreen
          direction={settings.direction}
          speed={settings.speed}
          targets={settings.targets}
          onChange={(patch) => setSettings((current) => ({ ...current, ...patch }))}
          onBack={() => setScreen('settings')}
        />
      )}
      {screen === 'effects' && (
        <EffectsScreen
          settings={settings}
          onChange={(patch) => setSettings((current) => ({ ...current, ...patch }))}
          onBack={() => setScreen('settings')}
        />
      )}
      {screen === 'roulette' && (
        <RouletteScreen settings={settings} canPlay={canPlay} onBack={() => setScreen('title')} onSettings={() => setScreen('settings')} />
      )}
    </main>
  );
}

function TitleScreen({ onPlay, onSettings }: { onPlay: () => void; onSettings: () => void }) {
  return (
    <section className="screen titleScreen">
      <div className="brandMark">?</div>
      <p className="eyebrow">迷ったら回そう</p>
      <h1>なんでもルーレット</h1>
      <div className="titlePreview">
        <MiniWheel labels={presets.lunch} rotation={26} />
      </div>
      <div className="buttonStack">
        <button className="primaryButton" onClick={onPlay}>遊ぶ</button>
        <button className="secondaryButton" onClick={onSettings}>設定</button>
      </div>
    </section>
  );
}

function SettingsScreen({ onBack, onPlay, onGo }: { onBack: () => void; onPlay: () => void; onGo: (screen: Screen) => void }) {
  return (
    <section className="screen">
      <Header title="設定" onBack={onBack} />
      <div className="menuList">
        <button onClick={() => onGo('type')}>ルーレットを決める<span>スタンダード1</span></button>
        <button onClick={() => onGo('targets')}>的を決める<span>候補を編集</span></button>
        <button onClick={() => onGo('motion')}>スピード・回転を決める<span>回転を調整</span></button>
        <button onClick={() => onGo('effects')}>音・演出を決める<span>UIのみ</span></button>
      </div>
      <button className="primaryButton bottomAction" onClick={onPlay}>遊ぶ</button>
    </section>
  );
}

function RouletteTypeScreen({ value, onChange, onBack }: { value: RouletteType; onChange: (value: RouletteType) => void; onBack: () => void }) {
  const options: { value: RouletteType; label: string; available: boolean }[] = [
    { value: 'standard1', label: 'スタンダード1', available: true },
    { value: 'standard2', label: 'スタンダード2', available: false },
    { value: 'casino', label: 'カジノ風', available: false },
    { value: 'double', label: 'ダブルルーレット', available: false },
  ];

  return (
    <section className="screen">
      <Header title="ルーレット" onBack={onBack} />
      <div className="optionGrid">
        {options.map((option) => (
          <button
            className={`optionTile ${value === option.value ? 'selected' : ''}`}
            key={option.value}
            onClick={() => onChange(option.value)}
          >
            <span>{option.label}</span>
            <small>{option.available ? 'MVP対応' : '未実装'}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function TargetsScreen({ targets, onChange, onBack }: { targets: string[]; onChange: (targets: string[]) => void; onBack: () => void }) {
  const normalizedTargets = targets.length ? targets : ['', ''];

  const updateTarget = (index: number, value: string) => {
    onChange(normalizedTargets.map((target, currentIndex) => (currentIndex === index ? value : target)));
  };

  const addTarget = () => {
    if (normalizedTargets.length < 20) {
      onChange([...normalizedTargets, '']);
    }
  };

  const removeTarget = (index: number) => {
    if (normalizedTargets.length > 2) {
      onChange(normalizedTargets.filter((_, currentIndex) => currentIndex !== index));
    }
  };

  return (
    <section className="screen">
      <Header title="的を決める" onBack={onBack} />
      <div className="presetRow">
        <button onClick={() => onChange(presets.omikuji)}>おみくじ</button>
        <button onClick={() => onChange(presets.lunch)}>ランチ</button>
        <button onClick={() => onChange(presets.party)}>飲み会</button>
      </div>
      <div className="targetList">
        {normalizedTargets.map((target, index) => (
          <label className="targetInput" key={`${index}-${normalizedTargets.length}`}>
            <span>{index + 1}</span>
            <input value={target} maxLength={24} onChange={(event) => updateTarget(index, event.target.value)} />
            <button aria-label={`${index + 1}件目を削除`} disabled={normalizedTargets.length <= 2} onClick={() => removeTarget(index)}>
              -
            </button>
          </label>
        ))}
      </div>
      <button className="secondaryButton" disabled={normalizedTargets.length >= 20} onClick={addTarget}>+ 的を追加</button>
    </section>
  );
}

function MotionScreen({
  direction,
  speed,
  targets,
  onChange,
  onBack,
}: {
  direction: Direction;
  speed: Speed;
  targets: string[];
  onChange: (patch: Pick<AppSettings, 'direction' | 'speed'>) => void;
  onBack: () => void;
}) {
  const [previewRotation, setPreviewRotation] = useState(0);

  return (
    <section className="screen">
      <Header title="スピード・回転" onBack={onBack} />
      <SettingGroup title="回転方向">
        <SegmentedControl
          value={direction}
          options={[
            { value: 'clockwise', label: '右回り' },
            { value: 'counterclockwise', label: '左回り' },
            { value: 'random', label: 'ランダム' },
          ]}
          onChange={(nextDirection) => onChange({ direction: nextDirection as Direction, speed })}
        />
      </SettingGroup>
      <SettingGroup title="スピード">
        <SegmentedControl
          value={speed}
          options={[
            { value: 'slow', label: 'ゆっくり' },
            { value: 'normal', label: 'ふつう' },
            { value: 'fast', label: 'はやい' },
            { value: 'high', label: 'ハイスピード' },
            { value: 'random', label: 'ランダム' },
          ]}
          onChange={(nextSpeed) => onChange({ direction, speed: nextSpeed as Speed })}
        />
      </SettingGroup>
      <div className="previewPanel">
        <MiniWheel labels={targets.filter(Boolean)} rotation={previewRotation} />
        <button className="secondaryButton" onClick={() => setPreviewRotation((current) => current + 720)}>試す</button>
      </div>
    </section>
  );
}

function EffectsScreen({
  settings,
  onChange,
  onBack,
}: {
  settings: AppSettings;
  onChange: (patch: Pick<AppSettings, 'spinSound' | 'stopSound' | 'effect'>) => void;
  onBack: () => void;
}) {
  return (
    <section className="screen">
      <Header title="音・演出" onBack={onBack} />
      <SettingGroup title="回転音">
        <SegmentedControl
          value={settings.spinSound}
          options={[
            { value: 'ドラム風', label: 'ドラム風' },
            { value: '電子音', label: '電子音' },
          ]}
          onChange={(spinSound) => onChange({ spinSound, stopSound: settings.stopSound, effect: settings.effect })}
        />
      </SettingGroup>
      <SettingGroup title="停止音">
        <SegmentedControl
          value={settings.stopSound}
          options={[
            { value: '電子音', label: '電子音' },
            { value: '大当たり風', label: '大当たり風' },
            { value: '残念風', label: '残念風' },
          ]}
          onChange={(stopSound) => onChange({ spinSound: settings.spinSound, stopSound, effect: settings.effect })}
        />
      </SettingGroup>
      <SettingGroup title="演出">
        <SegmentedControl
          value={settings.effect}
          options={[
            { value: '紙吹雪あり', label: '紙吹雪' },
            { value: 'テロップあり', label: 'テロップ' },
            { value: 'ランダム', label: 'ランダム' },
            { value: 'なし', label: 'なし' },
          ]}
          onChange={(effect) => onChange({ spinSound: settings.spinSound, stopSound: settings.stopSound, effect })}
        />
      </SettingGroup>
      <p className="note">MVPでは音と演出の設定UIのみ実装しています。</p>
    </section>
  );
}

function RouletteScreen({
  settings,
  canPlay,
  onBack,
  onSettings,
}: {
  settings: AppSettings;
  canPlay: boolean;
  onBack: () => void;
  onSettings: () => void;
}) {
  const targets = useMemo(() => settings.targets.map((target) => target.trim()).filter(Boolean).slice(0, 20), [settings.targets]);
  const [spinState, setSpinState] = useState<SpinState>('idle');
  const [rotation, setRotation] = useState(0);
  const [transition, setTransition] = useState('none');
  const [result, setResult] = useState('');
  const [autoStop, setAutoStop] = useState(true);
  const autoStopTimer = useRef<number | null>(null);
  const stopCompleteTimer = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);
  const spinVelocity = useRef(0);
  const spinStateRef = useRef<SpinState>('idle');
  const rotationRef = useRef(0);
  const targetsRef = useRef<string[]>(targets);
  const resolvedDirection = useRef<Direction>('clockwise');
  const resolvedSpeed = useRef<Speed>('normal');

  useEffect(() => {
    return () => {
      if (autoStopTimer.current) {
        window.clearTimeout(autoStopTimer.current);
      }
      if (stopCompleteTimer.current) {
        window.clearTimeout(stopCompleteTimer.current);
      }
      if (animationFrame.current) {
        window.cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  useEffect(() => {
    spinStateRef.current = spinState;
  }, [spinState]);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    targetsRef.current = targets;
  }, [targets]);

  const clearSpinAnimation = () => {
    if (animationFrame.current) {
      window.cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }
    lastFrameTime.current = null;
  };

  const spinFrame = (timestamp: number) => {
    if (spinStateRef.current !== 'spinning') {
      clearSpinAnimation();
      return;
    }

    if (lastFrameTime.current === null) {
      lastFrameTime.current = timestamp;
    }

    const elapsedSeconds = Math.min((timestamp - lastFrameTime.current) / 1000, 0.05);
    lastFrameTime.current = timestamp;
    const nextRotation = rotationRef.current + spinVelocity.current * elapsedSeconds;

    rotationRef.current = nextRotation;
    setRotation(nextRotation);
    animationFrame.current = window.requestAnimationFrame(spinFrame);
  };

  const start = () => {
    if (!canPlay || spinStateRef.current !== 'idle') return;

    if (autoStopTimer.current) {
      window.clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }
    if (stopCompleteTimer.current) {
      window.clearTimeout(stopCompleteTimer.current);
      stopCompleteTimer.current = null;
    }

    resolvedDirection.current = settings.direction === 'random' ? (Math.random() > 0.5 ? 'clockwise' : 'counterclockwise') : settings.direction;
    resolvedSpeed.current = settings.speed === 'random' ? randomFrom(['slow', 'normal', 'fast', 'high']) : settings.speed;

    const directionSign = resolvedDirection.current === 'clockwise' ? 1 : -1;
    const speedDegreesPerSecond = { slow: 220, normal: 380, fast: 560, high: 820 }[resolvedSpeed.current];

    clearSpinAnimation();
    spinStateRef.current = 'spinning';
    spinVelocity.current = directionSign * speedDegreesPerSecond;
    setResult('');
    setSpinState('spinning');
    setTransition('none');
    animationFrame.current = window.requestAnimationFrame(spinFrame);

    if (autoStop) {
      autoStopTimer.current = window.setTimeout(() => stop(), 1800 + Math.random() * 2400);
    }
  };

  const stop = () => {
    if (spinStateRef.current !== 'spinning') return;

    if (autoStopTimer.current) {
      window.clearTimeout(autoStopTimer.current);
      autoStopTimer.current = null;
    }

    clearSpinAnimation();
    const directionSign = resolvedDirection.current === 'clockwise' ? 1 : -1;
    const extraTurns = 2 + Math.floor(Math.random() * 3);
    const randomOffset = Math.random() * 360;
    const finalRotation = rotationRef.current + directionSign * (extraTurns * 360 + randomOffset);

    spinStateRef.current = 'stopping';
    setSpinState('stopping');
    setTransition('transform 2600ms cubic-bezier(.12,.78,.18,1)');
    setRotation(finalRotation);
    rotationRef.current = finalRotation;

    stopCompleteTimer.current = window.setTimeout(() => {
      spinStateRef.current = 'idle';
      setSpinState('idle');
      setResult(getWinner(targetsRef.current, finalRotation));
      stopCompleteTimer.current = null;
    }, 2650);
  };

  return (
    <section className="screen rouletteScreen">
      <Header title="ルーレット" onBack={onBack} actionLabel="設定" onAction={onSettings} />
      <div className="wheelStage">
        <div className="pointer" />
        <MiniWheel labels={targets} rotation={rotation} transition={transition} large />
      </div>
      <div className="resultPanel" aria-live="polite">
        <span>結果</span>
        <strong>{result || (canPlay ? '停止すると表示されます' : '的を2件以上入力してください')}</strong>
      </div>
      <label className="toggleRow">
        <input type="checkbox" checked={autoStop} onChange={(event) => setAutoStop(event.target.checked)} />
        自動停止ON/OFF
      </label>
      <div className="actionRow">
        <button className="primaryButton" disabled={!canPlay || spinState !== 'idle'} onClick={start}>スタート</button>
        <button className="secondaryButton" disabled={spinState !== 'spinning'} onClick={stop}>ストップ</button>
      </div>
    </section>
  );
}

function Header({
  title,
  onBack,
  actionLabel,
  onAction,
}: {
  title: string;
  onBack: () => void;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <header className="screenHeader">
      <button className="iconButton" aria-label="戻る" onClick={onBack}>‹</button>
      <h2>{title}</h2>
      {actionLabel && onAction ? <button className="headerAction" onClick={onAction}>{actionLabel}</button> : <span />}
    </header>
  );
}

function SettingGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settingGroup">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="segmentedControl">
      {options.map((option) => (
        <button key={option.value} className={value === option.value ? 'active' : ''} onClick={() => onChange(option.value)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function MiniWheel({
  labels,
  rotation,
  transition = 'transform 500ms ease',
  large = false,
}: {
  labels: string[];
  rotation: number;
  transition?: string;
  large?: boolean;
}) {
  const displayLabels = labels.length >= 2 ? labels : ['A', 'B'];
  const background = createWheelGradient(displayLabels.length);
  const slice = 360 / displayLabels.length;

  return (
    <div className={large ? 'wheel largeWheel' : 'wheel'} style={{ background, transform: `rotate(${rotation}deg)`, transition }}>
      {displayLabels.map((label, index) => (
        <span
          className="wheelLabel"
          key={`${label}-${index}`}
          style={{
            transform: `rotate(${index * slice + slice / 2}deg) translateY(-42%) rotate(90deg)`,
          }}
        >
          {label}
        </span>
      ))}
      <div className="wheelHub" />
    </div>
  );
}

function createWheelGradient(count: number) {
  const slice = 360 / count;
  return `conic-gradient(${Array.from({ length: count }, (_, index) => {
    const start = index * slice;
    const end = (index + 1) * slice;
    return `${palette[index % palette.length]} ${start}deg ${end}deg`;
  }).join(', ')})`;
}

function getWinner(targets: string[], rotation: number) {
  const normalized = ((rotation % 360) + 360) % 360;
  const pointerAngle = (360 - normalized + 270) % 360;
  const index = Math.floor(pointerAngle / (360 / targets.length)) % targets.length;
  return targets[index] ?? '';
}

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export default App;
