import { GradingScaleType } from './types';

interface GradingSettingsProps {
  scaleType: GradingScaleType;
  onChangeScaleType: (type: GradingScaleType) => void;
}

export default function GradingSettings({ scaleType, onChangeScaleType }: GradingSettingsProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-foreground">Grading System</h3>
        <p className="text-sm text-muted-foreground">Select the grading scale used by your university.</p>
      </div>
      <div>
        <select
          value={scaleType}
          onChange={(e) => onChangeScaleType(e.target.value as GradingScaleType)}
          className="bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500/50 cursor-pointer font-medium"
        >
          <option value="4.00">4.00 Scale</option>
          <option value="5.00">5.00 Scale</option>
          <option value="custom" disabled>Custom (Coming Soon)</option>
        </select>
      </div>
    </div>
  );
}
