import type { Settings } from '../types';
import { Modal } from './Modal';

interface Props {
  settings: Settings;
  entryCount: number;
  onChange: (settings: Partial<Settings>) => void;
  onLoadSample: () => void;
  onErase: () => void;
  onClose: () => void;
}

export function SettingsDialog({ settings, entryCount, onChange, onLoadSample, onErase, onClose }: Props) {
  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="settings">
        <label className="field">
          <span>Birth date</span>
          <input
            type="date"
            value={settings.birthDate ?? ''}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => onChange({ birthDate: e.target.value || undefined })}
          />
          <small className="muted">Your timeline starts here. Each day shows your age and week of life.</small>
        </label>

        <div className="field">
          <span>Data</span>
          <small className="muted">
            {entryCount} {entryCount === 1 ? 'entry' : 'entries'}, stored only in this browser on this computer.
          </small>
          <div className="settings-actions">
            <button className="btn" onClick={onLoadSample}>Add sample entries</button>
            <button
              className="btn danger"
              onClick={() => confirm('Erase every entry? This cannot be undone.') && onErase()}
              disabled={entryCount === 0}
            >
              Erase everything
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
